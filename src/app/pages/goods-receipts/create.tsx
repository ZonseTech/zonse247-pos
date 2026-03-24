import * as Yup from 'yup';
import { Form, Formik, useFormikContext, type FormikHelpers } from 'formik';
import { FunctionComponent, FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Package, Eye, X, Loader2, CheckCircle2, FileCheck, Ban,
    CheckCircle, AlertTriangle,
} from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import SupplierSearchSelect from '../../components/SupplierSearchSelect';
import { ROUTES } from '../../utils/constants';
import { useGoodsReceipts } from '../../hooks/useGoodsReceipts';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import { grnStatusConfig } from './partials/GoodsReceiptTableColumns';
import { getErrorMessage } from '../../utils/api-error-handler';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface GRNFormItem {
    purchaseOrderItemId: string;
    variantId: string;
    displayName: string;
    sku: string;
    orderedQuantity: number;
    alreadyReceived: number;
    receivedQuantity: number;
    rejectedQuantity: number;
    rejectionReason: string;
    unitCost: number;
    notes: string;
}

interface GRNFormValues {
    purchaseOrderId: string;
    _supplierFilter: string;
    notes: string;
    items: GRNFormItem[];
}

// ─── Supplier Field Watcher ──────────────────────────────────────────────────
// Watches the _supplierFilter Formik field and triggers onChange callback.

const SupplierFieldWatcher: FC<{
    onChange: (supplierId: string) => void;
}> = ({ onChange }) => {
    const { values } = useFormikContext<GRNFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        const id = values._supplierFilter || '';
        if (id !== lastId) {
            setLastId(id);
            onChange(id);
        }
    }, [values._supplierFilter]);

    return null;
};

// ─── PO Field Watcher ───────────────────────────────────────────────────────
// Watches Formik's purchaseOrderId value and loads PO details when changed.

const POFieldWatcher: FC<{
    onPOSelected: (poId: string) => void;
    currentPOId: string | null;
}> = ({ onPOSelected, currentPOId }) => {
    const { values } = useFormikContext<GRNFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        if (values.purchaseOrderId && values.purchaseOrderId !== lastId) {
            setLastId(values.purchaseOrderId);
            if (values.purchaseOrderId !== currentPOId) {
                onPOSelected(values.purchaseOrderId);
            }
        }
    }, [values.purchaseOrderId]);

    return null;
};

// ─── Component ──────────────────────────────────────────────────────────────

const GoodsReceiptForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createGoodsReceipt,
        verifyGoodsReceipt,
        postGoodsReceipt,
        cancelGoodsReceipt,
        getGoodsReceipt,
    } = useGoodsReceipts();
    const {
        purchaseOrders,
        getPurchaseOrder,
        setSupplierFilter,
        setPerPage,
    } = usePurchaseOrders();

    // ── Routing state ───────────────────────────────────────────────────
    const goodsReceiptId = (location.state as any)?.goodsReceiptId;
    const preSelectedPOId = (location.state as any)?.purchaseOrderId;
    const isViewMode = !!goodsReceiptId;

    // ── Local state ─────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [goodsReceipt, setGoodsReceipt] = useState<GoodsReceiptWithItems | null>(null);
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [loadingPO, setLoadingPO] = useState(false);

    // ── Load existing GRN (view mode) ───────────────────────────────────
    useEffect(() => {
        if (goodsReceiptId) {
            (async () => {
                setLoading(true);
                try {
                    const grn = await getGoodsReceipt(goodsReceiptId);
                    if (grn) setGoodsReceipt(grn);
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load goods receipt'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [goodsReceiptId]);

    // ── Pre-load PO if provided ─────────────────────────────────────────
    useEffect(() => {
        if (preSelectedPOId && !isViewMode) {
            handlePOSelected(preSelectedPOId);
        }
    }, [preSelectedPOId]);

    // ── Load more POs and apply supplier filter ─────────────────────────
    useEffect(() => {
        setPerPage(100);
    }, []);

    const handleSupplierChange = useCallback((supplierId: string) => {
        setSelectedSupplierId(supplierId);
        setSupplierFilter(supplierId);
        setSelectedPO(null);
    }, [setSupplierFilter]);

    // ── PO options (only show receivable POs) ───────────────────────────
    const poOptions = useMemo(
        () => purchaseOrders
            .filter(po => ['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED'].includes(po.status))
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown Supplier'}`,
                value: po.id,
            })),
        [purchaseOrders],
    );

    // ── When user selects a PO, load its full details ───────────────────
    const handlePOSelected = useCallback(async (poId: string) => {
        if (!poId) {
            setSelectedPO(null);
            return;
        }
        setLoadingPO(true);
        try {
            const po = await getPurchaseOrder(poId);
            if (po) setSelectedPO(po);
        } catch (err: any) {
            Notify.failure('Failed to load purchase order details');
        } finally {
            setLoadingPO(false);
        }
    }, [getPurchaseOrder]);

    // ── Build form items from selected PO ───────────────────────────────
    const buildItemsFromPO = useCallback((po: PurchaseOrder): GRNFormItem[] => {
        return po.items.map(item => {
            const vName = item.variant?.variantName || '';
            const pName = item.variant?.product?.name || '';
            const displayName = pName
                ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                : vName || item.product?.name || 'Unknown';
            const sku = item.variant?.sku || item.product?.sku || '';
            const remaining = Math.max(0, item.orderedQuantity - (item.receivedQuantity || 0));

            return {
                purchaseOrderItemId: item.id,
                variantId: item.variantId,
                displayName,
                sku,
                orderedQuantity: item.orderedQuantity,
                alreadyReceived: item.receivedQuantity || 0,
                receivedQuantity: remaining,
                rejectedQuantity: 0,
                rejectionReason: '',
                unitCost: item.unitPrice,
                notes: '',
            };
        });
    }, []);

    // ── Formik values ───────────────────────────────────────────────────
    const defaultValues: GRNFormValues = {
        purchaseOrderId: preSelectedPOId || '',
        _supplierFilter: '',
        notes: '',
        items: [],
    };

    const initialValues: GRNFormValues = useMemo(() => {
        if (isViewMode && goodsReceipt) {
            return {
                purchaseOrderId: goodsReceipt.purchaseOrderId,
                _supplierFilter: selectedSupplierId,
                notes: goodsReceipt.notes || '',
                items: goodsReceipt.items.map(item => {
                    const vName = item.variant?.variantName || '';
                    const pName = item.variant?.product?.name || '';
                    const displayName = pName
                        ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                        : vName || 'Unknown';
                    return {
                        purchaseOrderItemId: item.purchaseOrderItemId,
                        variantId: item.variantId,
                        displayName,
                        sku: item.variant?.sku || '',
                        orderedQuantity: item.purchaseOrderItem?.orderedQuantity || 0,
                        alreadyReceived: 0,
                        receivedQuantity: item.receivedQuantity,
                        rejectedQuantity: item.rejectedQuantity,
                        rejectionReason: item.rejectionReason || '',
                        unitCost: item.unitCost,
                        notes: item.notes || '',
                    };
                }),
            };
        }

        if (selectedPO) {
            return {
                purchaseOrderId: selectedPO.id,
                _supplierFilter: selectedSupplierId,
                notes: '',
                items: buildItemsFromPO(selectedPO),
            };
        }

        return defaultValues;
    }, [isViewMode, goodsReceipt, selectedPO, selectedSupplierId]);

    // ── Validation ──────────────────────────────────────────────────────
    const validationSchema = Yup.object().shape({
        purchaseOrderId: Yup.string().required('Purchase order is required'),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    receivedQuantity: Yup.number()
                        .required('Required')
                        .min(0, 'Cannot be negative'),
                    rejectedQuantity: Yup.number()
                        .min(0, 'Cannot be negative'),
                    unitCost: Yup.number()
                        .required('Required')
                        .min(0, 'Cannot be negative'),
                }),
            )
            .min(1, 'At least one item is required'),
    });

    const calculateTotalCost = (items: GRNFormItem[]) =>
        items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitCost), 0);

    // ── Submit ──────────────────────────────────────────────────────────
    const handleSubmit = async (values: GRNFormValues, { resetForm }: FormikHelpers<GRNFormValues>) => {
        if (isViewMode) return;
        setLoading(true);
        try {
            const payload: CreateGoodsReceiptInput = {
                purchaseOrderId: values.purchaseOrderId,
                notes: values.notes || undefined,
                items: values.items.map(item => ({
                    purchaseOrderItemId: item.purchaseOrderItemId,
                    variantId: item.variantId,
                    receivedQuantity: Number(item.receivedQuantity),
                    rejectedQuantity: Number(item.rejectedQuantity) || 0,
                    rejectionReason: item.rejectionReason || undefined,
                    unitCost: Number(item.unitCost),
                    notes: item.notes || undefined,
                })),
            };

            const grn = await createGoodsReceipt(payload);
            Confirm.show(
                'GRN Created',
                `${grn?.receiptNumber || 'Goods receipt'} created in DRAFT status. What would you like to do?`,
                'View GRN',
                'Go to List',
                () => {
                    if (grn?.id) {
                        navigate(ROUTES.GOODS_RECEIPT_FORM, { state: { goodsReceiptId: grn.id } });
                    }
                },
                () => navigate(ROUTES.PROCUREMENT_GOODS_RECEIPTS),
            );
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Failed to create goods receipt');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // ── View-mode actions ───────────────────────────────────────────────
    const handleVerify = useCallback(() => {
        if (!goodsReceipt) return;
        Confirm.show(
            'Verify Goods Receipt',
            `Verify ${goodsReceipt.receiptNumber}? This confirms the received quantities are correct.`,
            'Yes, Verify',
            'Cancel',
            async () => {
                await verifyGoodsReceipt(goodsReceipt.id);
                const grn = await getGoodsReceipt(goodsReceipt.id);
                if (grn) setGoodsReceipt(grn);
            },
        );
    }, [goodsReceipt, verifyGoodsReceipt, getGoodsReceipt]);

    const handlePost = useCallback(() => {
        if (!goodsReceipt) return;
        Confirm.show(
            'Post Goods Receipt — Stock Update',
            `Post ${goodsReceipt.receiptNumber}?\n\nThis will:\n• Increase inventory for all received items\n• Update average cost and last purchase cost\n• Create stock movement records\n\nThis action cannot be undone.`,
            'Yes, Post & Update Stock',
            'Cancel',
            async () => {
                await postGoodsReceipt(goodsReceipt.id);
                const grn = await getGoodsReceipt(goodsReceipt.id);
                if (grn) setGoodsReceipt(grn);
            },
        );
    }, [goodsReceipt, postGoodsReceipt, getGoodsReceipt]);

    const handleCancelGRN = useCallback(() => {
        if (!goodsReceipt) return;
        Confirm.show(
            'Cancel Goods Receipt',
            `Are you sure you want to cancel ${goodsReceipt.receiptNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelGoodsReceipt(goodsReceipt.id);
                const grn = await getGoodsReceipt(goodsReceipt.id);
                if (grn) setGoodsReceipt(grn);
            },
        );
    }, [goodsReceipt, cancelGoodsReceipt, getGoodsReceipt]);

    // ── Helpers ─────────────────────────────────────────────────────────
    const statusCfg = goodsReceipt?.status ? grnStatusConfig[goodsReceipt.status] : null;

    // ── Loading skeleton ────────────────────────────────────────────────
    if (loading && !goodsReceipt && goodsReceiptId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={2} fieldsPerSection={3} />
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
                    validationSchema={!isViewMode ? validationSchema : undefined}
                >
                    {({ isSubmitting, values, setFieldValue, setValues }) => (
                        <Form>
                            <PageHeader
                                title={
                                    isViewMode
                                        ? `Goods Receipt${goodsReceipt?.receiptNumber ? ` — ${goodsReceipt.receiptNumber}` : ''}`
                                        : 'New Goods Receipt (GRN)'
                                }
                                description={
                                    isViewMode
                                        ? 'View goods receipt details'
                                        : 'Record received goods against a purchase order'
                                }
                                icon={
                                    isViewMode
                                        ? <Eye className="w-8 h-8 text-teal-500" />
                                        : <Package className="w-8 h-8 text-teal-500" />
                                }
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status Badge & Info (View Mode) ─────────── */}
                                {isViewMode && goodsReceipt && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {statusCfg && (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {goodsReceipt.receiptNumber}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Verify — for DRAFT */}
                                                {goodsReceipt.status === 'DRAFT' && (
                                                    <Button type="button" theme="primary" onClick={handleVerify}>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Verify
                                                    </Button>
                                                )}
                                                {/* Post — for VERIFIED */}
                                                {goodsReceipt.status === 'VERIFIED' && (
                                                    <Button type="button" theme="success" onClick={handlePost}>
                                                        <FileCheck className="w-4 h-4 mr-2" />
                                                        Post (Update Stock)
                                                    </Button>
                                                )}
                                                {/* Cancel — for DRAFT or VERIFIED */}
                                                {['DRAFT', 'VERIFIED'].includes(goodsReceipt.status) && (
                                                    <Button type="button" theme="danger" layout="outline" onClick={handleCancelGRN}>
                                                        <Ban className="w-4 h-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">PO Reference</p>
                                                <p className="text-sm font-medium text-sky-600 dark:text-sky-400 mt-0.5">
                                                    {goodsReceipt.purchaseOrder?.poNumber || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {goodsReceipt.purchaseOrder?.supplier?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Received At</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(goodsReceipt.receivedAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatCurrency(calculateTotalCost(values.items))}
                                                </p>
                                            </div>
                                            {goodsReceipt.receivedByUser && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Received By</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                        {goodsReceipt.receivedByUser.firstName} {goodsReceipt.receivedByUser.lastName}
                                                    </p>
                                                </div>
                                            )}
                                            {goodsReceipt.notes && (
                                                <div className="col-span-2 sm:col-span-3">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {goodsReceipt.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Posted banner */}
                                        {goodsReceipt.status === 'POSTED' && (
                                            <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                                                    This receipt has been posted. Inventory has been updated with the received quantities.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── PO Selection (Create Mode) ─────────────── */}
                                {!isViewMode && (
                                    <FormFieldCard title="Purchase Order">
                                        <div className="space-y-4">
                                            <SupplierSearchSelect
                                                name="_supplierFilter"
                                                label="Filter by Supplier"
                                                placeholder="Search supplier to filter POs..."
                                            />
                                            <SupplierFieldWatcher onChange={handleSupplierChange} />

                                            <FormSearchableSelect
                                                label="Select Purchase Order"
                                                name="purchaseOrderId"
                                                options={poOptions}
                                                placeholder={selectedSupplierId ? 'Select a PO from this supplier...' : 'Select a supplier first or search all POs...'}
                                                required
                                            />
                                            <POFieldWatcher
                                                onPOSelected={handlePOSelected}
                                                currentPOId={selectedPO?.id || null}
                                            />

                                            {loadingPO && (
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Loading PO items...
                                                </div>
                                            )}

                                            {selectedPO && (
                                                <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                                    <Package className="w-5 h-5 text-sky-500 flex-shrink-0" />
                                                    <div className="text-sm text-sky-800 dark:text-sky-300">
                                                        <span className="font-semibold">{selectedPO.poNumber}</span>
                                                        {selectedPO.supplier?.name && (
                                                            <> from <span className="font-medium">{selectedPO.supplier.name}</span></>
                                                        )}
                                                        {' — '}
                                                        <span>{selectedPO.items?.length || 0} items</span>
                                                    </div>
                                                </div>
                                            )}

                                            <FormInput
                                                label="Notes"
                                                name="notes"
                                                placeholder="Additional notes for this receipt..."
                                            />
                                        </div>
                                    </FormFieldCard>
                                )}

                                {/* ── Items Card ─────────────────────────────── */}
                                {(values.items.length > 0 || isViewMode) && (
                                    <FormFieldCard title={isViewMode ? 'Received Items' : 'Items — Enter Received Quantities'}>
                                        {isViewMode && goodsReceipt ? (
                                            /* ── View-mode items ─────── */
                                            <div className="space-y-3">
                                                {values.items.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {item.displayName}
                                                                </p>
                                                                {item.sku && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {item.sku}</p>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(item.receivedQuantity * item.unitCost)}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Ordered</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.orderedQuantity}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Received</span>
                                                                <p className="font-medium text-green-600 dark:text-green-400">{item.receivedQuantity}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Rejected</span>
                                                                <p className={`font-medium ${item.rejectedQuantity > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                                                    {item.rejectedQuantity}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Unit Cost</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.unitCost)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Line Total</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {formatCurrency(item.receivedQuantity * item.unitCost)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {item.rejectionReason && (
                                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                                Rejection reason: {item.rejectionReason}
                                                            </div>
                                                        )}
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 italic">{item.notes}</p>
                                                        )}
                                                    </div>
                                                ))}

                                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                    <div className="text-lg">
                                                        <span className="text-gray-600 dark:text-gray-400">Total Cost: </span>
                                                        <span className="font-bold text-gray-900 dark:text-white">
                                                            {formatCurrency(calculateTotalCost(values.items))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── Create-mode items ─────── */
                                            <div className="space-y-4">
                                                {values.items.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                        <Package className="w-12 h-12 mb-2 opacity-50" />
                                                        <p>Select a purchase order above to load items</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {values.items.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                            >
                                                                {/* Item Header */}
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                            {item.displayName}
                                                                        </p>
                                                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            {item.sku && <span>SKU: {item.sku}</span>}
                                                                            <span>Ordered: <span className="font-medium">{item.orderedQuantity}</span></span>
                                                                            {item.alreadyReceived > 0 && (
                                                                                <span>Already received: <span className="font-medium text-green-600 dark:text-green-400">{item.alreadyReceived}</span></span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                        {formatCurrency((values.items[index]?.receivedQuantity || 0) * (values.items[index]?.unitCost || 0))}
                                                                    </span>
                                                                </div>

                                                                {/* Input fields */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                    <FormInput
                                                                        label="Received Qty"
                                                                        name={`items.${index}.receivedQuantity`}
                                                                        type="number"
                                                                        min="0"
                                                                        required
                                                                    />
                                                                    <FormInput
                                                                        label="Rejected Qty"
                                                                        name={`items.${index}.rejectedQuantity`}
                                                                        type="number"
                                                                        min="0"
                                                                    />
                                                                    <FormInput
                                                                        label="Unit Cost (MWK)"
                                                                        name={`items.${index}.unitCost`}
                                                                        type="number"
                                                                        step="0.01"
                                                                        min="0"
                                                                        required
                                                                    />
                                                                    <FormInput
                                                                        label="Rejection Reason"
                                                                        name={`items.${index}.rejectionReason`}
                                                                        placeholder="If rejected..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {values.items.length > 0 && (
                                                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                        <div className="text-lg">
                                                            <span className="text-gray-600 dark:text-gray-400">Total Cost: </span>
                                                            <span className="font-bold text-gray-900 dark:text-white">
                                                                {formatCurrency(calculateTotalCost(values.items))}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </FormFieldCard>
                                )}

                                {/* ── Footer Actions ─────────────────────────── */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div />
                                    {!isViewMode && (
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading || values.items.length === 0}
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Create GRN
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default GoodsReceiptForm;
