import * as Yup from 'yup';
import { Form, Formik, FieldArray, useFormikContext, type FormikHelpers } from 'formik';
import { FunctionComponent, FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    RotateCcw, Eye, Loader2, Plus, Trash2,
    CheckCircle, Truck, PackageCheck, Ban, FileText,
} from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { useSupplierReturns } from '../../hooks/useSupplierReturns';
import { useSuppliers } from '../../hooks/useSuppliers';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { useGoodsReceipts } from '../../hooks/useGoodsReceipts';
import { useProducts } from '../../hooks/useProducts';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { returnStatusConfig } from './partials/SupplierReturnTableColumns';
import { getErrorMessage } from '../../utils/api-error-handler';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface ReturnFormItem {
    goodsReceiptItemId: string;
    variantId: string;
    displayName: string;
    returnQuantity: number;
    unitCost: number;
    reason: string;
    notes: string;
}

interface ReturnFormValues {
    supplierId: string;
    purchaseOrderId: string;
    goodsReceiptId: string;
    reason: string;
    notes: string;
    items: ReturnFormItem[];
}

type FormMode = 'create' | 'view';

const RETURN_REASONS = [
    { label: 'Damaged goods', value: 'Damaged goods' },
    { label: 'Wrong items received', value: 'Wrong items received' },
    { label: 'Excess quantity', value: 'Excess quantity' },
    { label: 'Quality issue', value: 'Quality issue' },
    { label: 'Expired products', value: 'Expired products' },
    { label: 'Not as ordered', value: 'Not as ordered' },
    { label: 'Other', value: 'Other' },
];

// ─── GRN Field Watcher ──────────────────────────────────────────────────────
// Watches goodsReceiptId and auto-populates items from the GRN

interface GRNFieldWatcherProps {
    onGRNSelected: (grnId: string) => void;
}

const GRNFieldWatcher: FC<GRNFieldWatcherProps> = ({ onGRNSelected }) => {
    const { values } = useFormikContext<ReturnFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        if (values.goodsReceiptId && values.goodsReceiptId !== lastId) {
            setLastId(values.goodsReceiptId);
            onGRNSelected(values.goodsReceiptId);
        }
    }, [values.goodsReceiptId, lastId, onGRNSelected]);

    return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const SupplierReturnForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createReturn,
        approveReturn,
        shipReturn,
        completeReturn,
        cancelReturn,
        deleteReturn,
        getReturn,
    } = useSupplierReturns();
    const { suppliers } = useSuppliers();
    const { purchaseOrders } = usePurchaseOrders();
    const { goodsReceipts } = useGoodsReceipts();
    const { products } = useProducts();

    // ── Routing state ─────────────────────────────────────────────────────
    const returnId = (location.state as any)?.returnId;
    const formMode: FormMode = returnId ? 'view' : 'create';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [returnData, setReturnData] = useState<SupplierReturnWithItems | null>(null);

    // ── Load existing return (view mode) ──────────────────────────────────
    useEffect(() => {
        if (returnId) {
            (async () => {
                setLoading(true);
                try {
                    const r = await getReturn(returnId);
                    if (r) setReturnData(r);
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load return'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [returnId]);

    // ── Options ───────────────────────────────────────────────────────────
    const supplierOptions = useMemo(
        () => suppliers.map(s => ({ label: s.name, value: s.id })),
        [suppliers],
    );

    // PO options — show RECEIVED/PARTIALLY_RECEIVED POs
    const poOptions = useMemo(
        () => purchaseOrders
            .filter(po => ['RECEIVED', 'PARTIALLY_RECEIVED', 'SHIPPED', 'SENT'].includes(po.status))
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown'}`,
                value: po.id,
            })),
        [purchaseOrders],
    );

    // GRN options — show POSTED GRNs
    const grnOptions = useMemo(
        () => goodsReceipts
            .filter(g => g.status === 'POSTED')
            .map(g => ({
                label: `${g.receiptNumber} — ${g.purchaseOrder?.poNumber || 'No PO'}`,
                value: g.id,
            })),
        [goodsReceipts],
    );

    const variantOptions = useMemo(
        () => products.map(p => ({
            label: `${p.name} - ${p.variantName} (${p.sku || 'No SKU'})`,
            value: p.id,
        })),
        [products],
    );

    // ── Handle GRN selected — auto-populate items ─────────────────────────
    const handleGRNSelected = useCallback(async (grnId: string) => {
        const grn = goodsReceipts.find(g => g.id === grnId);
        if (!grn) return;
        // Items will be populated by the setFieldValue in the watcher callback
    }, [goodsReceipts]);

    // ── Formik values ─────────────────────────────────────────────────────
    const emptyItem: ReturnFormItem = {
        goodsReceiptItemId: '',
        variantId: '',
        displayName: '',
        returnQuantity: 1,
        unitCost: 0,
        reason: '',
        notes: '',
    };

    const defaultValues: ReturnFormValues = {
        supplierId: '',
        purchaseOrderId: '',
        goodsReceiptId: '',
        reason: '',
        notes: '',
        items: [{ ...emptyItem }],
    };

    const initialValues: ReturnFormValues = useMemo(() => {
        if (formMode === 'view' && returnData) {
            return {
                supplierId: returnData.supplierId,
                purchaseOrderId: returnData.purchaseOrderId || '',
                goodsReceiptId: returnData.goodsReceiptId || '',
                reason: returnData.reason || '',
                notes: returnData.notes || '',
                items: returnData.items.map(item => ({
                    goodsReceiptItemId: item.goodsReceiptItemId || '',
                    variantId: item.variantId,
                    displayName: item.variant
                        ? `${item.variant.product?.name || ''} - ${item.variant.variantName} (${item.variant.sku || 'No SKU'})`
                        : item.variantId,
                    returnQuantity: item.returnQuantity,
                    unitCost: item.unitCost,
                    reason: item.reason || '',
                    notes: item.notes || '',
                })),
            };
        }
        return defaultValues;
    }, [formMode, returnData]);

    // ── Validation ────────────────────────────────────────────────────────
    const validationSchema = Yup.object().shape({
        supplierId: Yup.string().required('Supplier is required'),
        reason: Yup.string().max(500, 'Reason is too long'),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    variantId: Yup.string().required('Product variant is required'),
                    returnQuantity: Yup.number()
                        .required('Return quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    unitCost: Yup.number()
                        .required('Unit cost is required')
                        .min(0, 'Cost must be 0 or higher'),
                }),
            )
            .min(1, 'At least one item is required'),
    });

    const calculateTotal = (items: ReturnFormItem[]) =>
        items.reduce((sum, item) => sum + (item.returnQuantity * item.unitCost), 0);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (values: ReturnFormValues, { resetForm }: FormikHelpers<ReturnFormValues>) => {
        if (formMode === 'view') return;
        setLoading(true);
        try {
            const payload: CreateSupplierReturnInput = {
                supplierId: values.supplierId,
                purchaseOrderId: values.purchaseOrderId || undefined,
                goodsReceiptId: values.goodsReceiptId || undefined,
                reason: values.reason || undefined,
                notes: values.notes || undefined,
                items: values.items.map(item => ({
                    goodsReceiptItemId: item.goodsReceiptItemId || undefined,
                    variantId: item.variantId,
                    returnQuantity: Number(item.returnQuantity),
                    unitCost: Number(item.unitCost),
                    reason: item.reason || undefined,
                    notes: item.notes || undefined,
                })),
            };

            await createReturn(payload);

            Confirm.show(
                'Return Created',
                'Supplier return created as draft. What would you like to do?',
                'Add Another',
                'Go to Returns',
                () => resetForm(),
                () => navigate(ROUTES.SUPPLIER_RETURNS),
            );
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Failed to create return');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // ── View-mode actions ─────────────────────────────────────────────────
    const reloadReturn = useCallback(async () => {
        if (!returnId) return;
        const r = await getReturn(returnId);
        if (r) setReturnData(r);
    }, [returnId, getReturn]);

    const handleApprove = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Approve Return',
            `Approve return ${returnData.returnNumber}?`,
            'Yes, Approve',
            'Cancel',
            async () => { await approveReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, approveReturn, reloadReturn]);

    const handleShip = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Ship Return',
            `Mark return ${returnData.returnNumber} as shipped?`,
            'Yes, Ship',
            'Cancel',
            async () => { await shipReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, shipReturn, reloadReturn]);

    const handleComplete = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Complete Return',
            `Complete return ${returnData.returnNumber}? Inventory will be reduced and a credit note generated.`,
            'Yes, Complete',
            'Cancel',
            async () => { await completeReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, completeReturn, reloadReturn]);

    const handleCancel = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Cancel Return',
            `Cancel return ${returnData.returnNumber}?`,
            'Yes, Cancel',
            'No',
            async () => { await cancelReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, cancelReturn, reloadReturn]);

    const handleDelete = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Delete Return',
            `Permanently delete draft return ${returnData.returnNumber}?`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteReturn(returnData.id);
                navigate(ROUTES.SUPPLIER_RETURNS);
            },
        );
    }, [returnData, deleteReturn, navigate]);

    // ── Page helpers ──────────────────────────────────────────────────────
    const getPageTitle = () => {
        if (formMode === 'view')
            return `Return${returnData?.returnNumber ? ` — ${returnData.returnNumber}` : ''}`;
        return 'New Supplier Return';
    };

    const getPageIcon = () => {
        if (formMode === 'view') return <Eye className="w-8 h-8 text-orange-500" />;
        return <RotateCcw className="w-8 h-8 text-orange-500" />;
    };

    const statusCfg = returnData?.status ? returnStatusConfig[returnData.status] : null;

    const creditNoteStatusCfg: Record<CreditNoteStatusType, { label: string; bg: string; text: string }> = {
        PENDING: { label: 'Pending', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
        APPLIED: { label: 'Applied', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
        CANCELLED: { label: 'Cancelled', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
    };

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading && !returnData && returnId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={4} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={formMode !== 'view' ? validationSchema : undefined}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            {/* GRN Watcher for auto-populating items */}
                            {formMode === 'create' && (
                                <GRNFieldWatcher
                                    onGRNSelected={(grnId) => {
                                        const grn = goodsReceipts.find(g => g.id === grnId);
                                        if (!grn) return;
                                        // Set supplier from GRN's PO
                                        if (grn.purchaseOrder) {
                                            const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
                                            if (po?.supplierId) {
                                                setFieldValue('supplierId', po.supplierId);
                                            }
                                            setFieldValue('purchaseOrderId', grn.purchaseOrderId);
                                        }
                                        // Populate items from GRN items
                                        if (grn.items && grn.items.length > 0) {
                                            const newItems: ReturnFormItem[] = grn.items.map(item => ({
                                                goodsReceiptItemId: item.id,
                                                variantId: item.variantId,
                                                displayName: item.variant
                                                    ? `${item.variant.product?.name || ''} - ${item.variant.variantName}`
                                                    : item.variantId,
                                                returnQuantity: item.receivedQuantity,
                                                unitCost: item.unitCost,
                                                reason: '',
                                                notes: '',
                                            }));
                                            setFieldValue('items', newItems);
                                        }
                                    }}
                                />
                            )}

                            <PageHeader
                                title={getPageTitle()}
                                description={
                                    formMode === 'view'
                                        ? 'View return details, items, and credit notes'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={getPageIcon()}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status Badge & Info (View Mode) ──────────── */}
                                {formMode === 'view' && returnData && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {statusCfg && (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {returnData.returnNumber}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {returnData.status === 'DRAFT' && (
                                                    <>
                                                        <Button type="button" theme="primary" layout="outline" onClick={handleApprove}>
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button type="button" theme="danger" layout="outline" onClick={handleCancel}>
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                        <Button type="button" theme="danger" layout="outline" onClick={handleDelete}>
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                                {returnData.status === 'APPROVED' && (
                                                    <>
                                                        <Button type="button" theme="primary" layout="outline" onClick={handleShip}>
                                                            <Truck className="w-4 h-4 mr-2" />
                                                            Ship
                                                        </Button>
                                                        <Button type="button" theme="danger" layout="outline" onClick={handleCancel}>
                                                            <Ban className="w-4 h-4 mr-2" />
                                                            Cancel
                                                        </Button>
                                                    </>
                                                )}
                                                {returnData.status === 'SHIPPED' && (
                                                    <Button type="button" theme="success" layout="outline" onClick={handleComplete}>
                                                        <PackageCheck className="w-4 h-4 mr-2" />
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {returnData.supplier?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Return Date</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(returnData.returnDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatCurrency(returnData.totalAmount)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {returnData.items?.length || 0} item(s)
                                                </p>
                                            </div>
                                            {returnData.purchaseOrder && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Linked PO</p>
                                                    <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-0.5">
                                                        {returnData.purchaseOrder.poNumber}
                                                    </p>
                                                </div>
                                            )}
                                            {returnData.goodsReceipt && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Linked GRN</p>
                                                    <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mt-0.5">
                                                        {returnData.goodsReceipt.receiptNumber}
                                                    </p>
                                                </div>
                                            )}
                                            {returnData.returnedByUser && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Returned By</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                        {returnData.returnedByUser.firstName} {returnData.returnedByUser.lastName}
                                                    </p>
                                                </div>
                                            )}
                                            {returnData.reason && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {returnData.reason}
                                                    </p>
                                                </div>
                                            )}
                                            {returnData.notes && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {returnData.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Items Table (View Mode) ──────────────────── */}
                                {formMode === 'view' && returnData && returnData.items?.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4 text-orange-500" />
                                                Return Items
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Product</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Qty</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Unit Cost</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Total</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {returnData.items.map((item) => (
                                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                            <td className="px-5 py-3">
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {item.variant?.product?.name || '—'}
                                                                    </span>
                                                                    {item.variant && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            {item.variant.variantName} {item.variant.sku ? `(${item.variant.sku})` : ''}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {item.returnQuantity}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {formatCurrency(item.unitCost)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3 text-right">
                                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                    {formatCurrency(item.totalCost)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {item.reason || '—'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100" colSpan={3}>
                                                            Total
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(returnData.totalAmount)}
                                                            </span>
                                                        </td>
                                                        <td />
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ── Credit Notes (View Mode) ─────────────────── */}
                                {formMode === 'view' && returnData && returnData.creditNotes && returnData.creditNotes.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                Credit Notes
                                            </h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-gray-50 dark:bg-gray-700/50">
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Credit Note #</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase text-right">Amount</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                                                        <th className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Applied To</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                    {returnData.creditNotes.map((cn) => {
                                                        const cnCfg = creditNoteStatusCfg[cn.status];
                                                        return (
                                                            <tr key={cn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                                                <td className="px-5 py-3">
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {cn.creditNoteNumber}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-3">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {formatDate(cn.creditNoteDate)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-3 text-right">
                                                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                                        {formatCurrency(cn.amount)}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-3">
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cnCfg.bg} ${cnCfg.text}`}>
                                                                        {cnCfg.label}
                                                                    </span>
                                                                </td>
                                                                <td className="px-5 py-3">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                        {cn.appliedToInvoice?.invoiceNumber || '—'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* ───────── CREATE MODE FORM ───────── */}
                                {formMode === 'create' && (
                                    <>
                                        {/* ── Return Details Card ─────────────── */}
                                        <FormFieldCard title="Return Details">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-5">
                                                <FormSearchableSelect
                                                    label="Supplier"
                                                    name="supplierId"
                                                    options={supplierOptions}
                                                    placeholder="Select supplier..."
                                                    required
                                                />
                                                <FormSearchableSelect
                                                    label="Goods Receipt (optional)"
                                                    name="goodsReceiptId"
                                                    options={grnOptions}
                                                    placeholder="Link to GRN..."
                                                    isClearable
                                                />
                                                <FormSearchableSelect
                                                    label="Purchase Order (optional)"
                                                    name="purchaseOrderId"
                                                    options={poOptions}
                                                    placeholder="Link to PO..."
                                                    isClearable
                                                />
                                                <FormSearchableSelect
                                                    label="Reason"
                                                    name="reason"
                                                    options={RETURN_REASONS}
                                                    placeholder="Select reason..."
                                                    isClearable
                                                />
                                                <div className="sm:col-span-2">
                                                    <FormInput
                                                        label="Notes"
                                                        name="notes"
                                                        placeholder="Additional notes..."
                                                    />
                                                </div>
                                            </div>
                                        </FormFieldCard>

                                        {/* ── Return Items Card ────────────────── */}
                                        <FormFieldCard title="Return Items">
                                            <div className="p-5">
                                                <FieldArray name="items">
                                                    {({ push, remove }) => (
                                                        <div className="space-y-4">
                                                            {values.items.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30"
                                                                >
                                                                    <div className="sm:col-span-4">
                                                                        <FormSearchableSelect
                                                                            label="Product Variant"
                                                                            name={`items.${index}.variantId`}
                                                                            options={variantOptions}
                                                                            placeholder="Select product..."
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="sm:col-span-2">
                                                                        <FormInput
                                                                            label="Return Qty"
                                                                            name={`items.${index}.returnQuantity`}
                                                                            type="number"
                                                                            placeholder="1"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="sm:col-span-2">
                                                                        <FormInput
                                                                            label="Unit Cost"
                                                                            name={`items.${index}.unitCost`}
                                                                            type="number"
                                                                            placeholder="0.00"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="sm:col-span-3">
                                                                        <FormSearchableSelect
                                                                            label="Reason"
                                                                            name={`items.${index}.reason`}
                                                                            options={RETURN_REASONS}
                                                                            placeholder="Reason..."
                                                                            isClearable
                                                                        />
                                                                    </div>
                                                                    <div className="sm:col-span-1 flex items-end justify-center pb-1">
                                                                        {values.items.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => remove(index)}
                                                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <button
                                                                type="button"
                                                                onClick={() => push({ ...emptyItem })}
                                                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg border border-dashed border-orange-300 dark:border-orange-600 transition-colors w-full justify-center"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                Add Item
                                                            </button>
                                                        </div>
                                                    )}
                                                </FieldArray>

                                                {/* Total */}
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {values.items.length} item(s)
                                                    </span>
                                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        Total: {formatCurrency(calculateTotal(values.items))}
                                                    </span>
                                                </div>
                                            </div>
                                        </FormFieldCard>

                                        {/* ── Submit ────────────────────────────── */}
                                        <div className="flex items-center justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                theme="neutral"
                                                layout="outline"
                                                onClick={() => navigate(ROUTES.SUPPLIER_RETURNS)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                theme="primary"
                                                disabled={isSubmitting || loading}
                                            >
                                                {(isSubmitting || loading) && (
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                )}
                                                Create Return (Draft)
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default SupplierReturnForm;
