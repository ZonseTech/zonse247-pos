import * as Yup from 'yup';
import { Form, Formik, FieldArray, type FormikHelpers } from 'formik';
import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    ShoppingCart, Plus, Trash2, Eye, X, Loader2, CheckCircle2, Package,
    Send, Ban, ClipboardList,
} from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { ROUTES } from '../../utils/constants';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { usePurchaseRequisitions } from '../../hooks/usePurchaseRequisitions';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useProducts } from '../../hooks/useProducts';
import FormSkeleton from '../../components/skeleton/FormSkeleton';
import ReceiveModal from './partials/ReceiveModal';
import { poStatusConfig } from './partials/PurchaseOrderTableColumns';
import { getErrorMessage } from '../../utils/api-error-handler';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const formatDate = (d?: Date | string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface POFormItem {
    variantId: string;
    orderedQuantity: number;
    unitPrice: number;
    notes: string;
}

interface POFormValues {
    supplierId: string;
    expectedDeliveryDate: string;
    notes: string;
    items: POFormItem[];
}

type FormMode = 'create-manual' | 'create-from-requisition' | 'view';

// ─── Component ──────────────────────────────────────────────────────────────

const PurchaseOrderForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createPurchaseOrder,
        createFromRequisition,
        sendPurchaseOrder,
        cancelPurchaseOrder,
        receivePurchaseOrder,
        getPurchaseOrder,
    } = usePurchaseOrders();
    const { getById: getRequisition } = usePurchaseRequisitions();
    const { suppliers } = useSuppliers();
    const { products } = useProducts();

    // ── Routing state ─────────────────────────────────────────────────────
    const purchaseOrderId = (location.state as any)?.purchaseOrderId;
    const requisitionIdFromState = (location.state as any)?.requisitionId;
    const isFromRequisition = !!requisitionIdFromState && !purchaseOrderId;

    const formMode: FormMode = purchaseOrderId
        ? 'view'
        : isFromRequisition
            ? 'create-from-requisition'
            : 'create-manual';

    // ── Local state ───────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
    const [requisition, setRequisition] = useState<PurchaseRequisitionWithItems | null>(null);
    const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

    // ── Load existing PO (view mode) ──────────────────────────────────────
    useEffect(() => {
        if (purchaseOrderId) {
            (async () => {
                setLoading(true);
                try {
                    const po = await getPurchaseOrder(purchaseOrderId);
                    if (po) setPurchaseOrder(po);
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load purchase order'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [purchaseOrderId]);

    // ── Load requisition (from-requisition mode) ──────────────────────────
    useEffect(() => {
        if (isFromRequisition && requisitionIdFromState) {
            (async () => {
                setLoading(true);
                try {
                    const req = await getRequisition(requisitionIdFromState);
                    if (req) setRequisition(req);
                } catch (err: any) {
                    Notify.failure(getErrorMessage(err, 'Failed to load requisition'));
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isFromRequisition, requisitionIdFromState]);

    // ── Options ───────────────────────────────────────────────────────────
    const supplierOptions = useMemo(
        () => suppliers.map(s => ({ label: s.name, value: s.id })),
        [suppliers],
    );

    const variantOptions = useMemo(
        () => products.map(p => ({
            label: `${p.name} - ${p.variantName} (${p.sku || 'No SKU'})`,
            value: p.id, // variant ID
        })),
        [products],
    );

    // Map of approved quantities per variantId (from requisition)
    const approvedQtyMap = useMemo(() => {
        if (!requisition) return new Map<string, number>();
        return new Map(
            requisition.items.map(item => [
                item.variantId,
                item.approvedQuantity ?? item.requestedQuantity,
            ])
        );
    }, [requisition]);

    // ── Formik values ─────────────────────────────────────────────────────
    const emptyItem: POFormItem = { variantId: '', orderedQuantity: 1, unitPrice: 0, notes: '' };

    const defaultValues: POFormValues = {
        supplierId: '',
        expectedDeliveryDate: '',
        notes: '',
        items: [{ ...emptyItem }],
    };

    const initialValues: POFormValues = useMemo(() => {
        if (formMode === 'view' && purchaseOrder) {
            return {
                supplierId: purchaseOrder.supplierId,
                expectedDeliveryDate: purchaseOrder.expectedDeliveryDate
                    ? new Date(purchaseOrder.expectedDeliveryDate).toISOString().split('T')[0]
                    : '',
                notes: purchaseOrder.notes || '',
                items: purchaseOrder.items.map(item => ({
                    variantId: item.variantId,
                    orderedQuantity: item.orderedQuantity,
                    unitPrice: item.unitPrice,
                    notes: item.notes || '',
                })),
            };
        }

        if (formMode === 'create-from-requisition' && requisition) {
            return {
                supplierId: '',
                expectedDeliveryDate: '',
                notes: requisition.notes
                    ? `From Requisition ${requisition.requisitionNumber}: ${requisition.notes}`
                    : `From Requisition ${requisition.requisitionNumber}`,
                items: requisition.items.map(item => ({
                    variantId: item.variantId,
                    orderedQuantity: item.approvedQuantity ?? item.requestedQuantity,
                    unitPrice: 0,
                    notes: item.notes || '',
                })),
            };
        }

        return defaultValues;
    }, [formMode, purchaseOrder, requisition]);

    // ── Validation ────────────────────────────────────────────────────────
    const validationSchema = Yup.object().shape({
        supplierId: Yup.string().required('Supplier is required'),
        expectedDeliveryDate: Yup.string(),
        notes: Yup.string().max(1000, 'Notes are too long'),
        items: Yup.array()
            .of(
                Yup.object().shape({
                    variantId: Yup.string().required('Product variant is required'),
                    orderedQuantity: Yup.number()
                        .required('Quantity is required')
                        .min(1, 'Quantity must be at least 1'),
                    unitPrice: Yup.number()
                        .required('Unit price is required')
                        .min(0, 'Unit price must be 0 or higher'),
                }),
            )
            .min(1, 'At least one item is required'),
    });

    const calculateTotal = (items: POFormItem[]) =>
        items.reduce((sum, item) => sum + (item.orderedQuantity * item.unitPrice), 0);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async (values: POFormValues, { resetForm }: FormikHelpers<POFormValues>) => {
        if (formMode === 'view') return;
        setLoading(true);
        try {
            if (formMode === 'create-from-requisition' && requisitionIdFromState) {
                const payload: CreatePOFromRequisitionInput = {
                    requisitionId: requisitionIdFromState,
                    supplierId: values.supplierId,
                    itemPrices: values.items.map(item => ({
                        variantId: item.variantId,
                        unitPrice: Number(item.unitPrice),
                    })),
                    expectedDeliveryDate: values.expectedDeliveryDate || undefined,
                    notes: values.notes || undefined,
                };
                await createFromRequisition(payload);
            } else {
                const payload: CreatePurchaseOrderInput = {
                    supplierId: values.supplierId,
                    createdBy: '', // API will use authenticated user
                    expectedDeliveryDate: values.expectedDeliveryDate || undefined,
                    notes: values.notes || undefined,
                    items: values.items.map(item => ({
                        variantId: item.variantId,
                        orderedQuantity: Number(item.orderedQuantity),
                        unitPrice: Number(item.unitPrice),
                        notes: item.notes || undefined,
                    })),
                };
                await createPurchaseOrder(payload);
            }

            Confirm.show(
                'Purchase Order Created',
                'Purchase order created successfully. What would you like to do?',
                'Add Another',
                'Go to Purchase Orders',
                () => resetForm(),
                () => navigate(ROUTES.PURCHASE_ORDERS),
            );
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'Failed to create purchase order');
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    // ── View-mode actions ─────────────────────────────────────────────────
    const handleSend = useCallback(() => {
        if (!purchaseOrder) return;
        Confirm.show(
            'Send Purchase Order',
            `Send ${purchaseOrder.poNumber} to ${purchaseOrder.supplier?.name || 'supplier'}?`,
            'Yes, Send',
            'Cancel',
            async () => {
                await sendPurchaseOrder(purchaseOrder.id);
                const po = await getPurchaseOrder(purchaseOrder.id);
                if (po) setPurchaseOrder(po);
            },
        );
    }, [purchaseOrder, sendPurchaseOrder, getPurchaseOrder]);

    const handleCancel = useCallback(() => {
        if (!purchaseOrder) return;
        Confirm.show(
            'Cancel Purchase Order',
            `Are you sure you want to cancel ${purchaseOrder.poNumber}?`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelPurchaseOrder(purchaseOrder.id);
                const po = await getPurchaseOrder(purchaseOrder.id);
                if (po) setPurchaseOrder(po);
            },
        );
    }, [purchaseOrder, cancelPurchaseOrder, getPurchaseOrder]);

    const handleReceiveComplete = useCallback(async () => {
        if (!purchaseOrder) return;
        const po = await getPurchaseOrder(purchaseOrder.id);
        if (po) setPurchaseOrder(po);
        setReceivingPO(null);
    }, [purchaseOrder, getPurchaseOrder]);

    // ── Helpers ────────────────────────────────────────────────────────────
    const getPageTitle = () => {
        if (formMode === 'view')
            return `Purchase Order${purchaseOrder?.poNumber ? ` — ${purchaseOrder.poNumber}` : ''}`;
        if (formMode === 'create-from-requisition')
            return `New PO from Requisition${requisition?.requisitionNumber ? ` ${requisition.requisitionNumber}` : ''}`;
        return 'New Purchase Order';
    };

    const getPageIcon = () => {
        if (formMode === 'view') return <Eye className="w-8 h-8 text-sky-500" />;
        if (formMode === 'create-from-requisition') return <ClipboardList className="w-8 h-8 text-indigo-500" />;
        return <ShoppingCart className="w-8 h-8 text-sky-500" />;
    };

    const isDisabled = formMode === 'view';
    const statusCfg = purchaseOrder?.status ? poStatusConfig[purchaseOrder.status] : null;

    // ── Loading skeleton ──────────────────────────────────────────────────
    if (loading && !purchaseOrder && !requisition && (purchaseOrderId || requisitionIdFromState)) {
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
                    validationSchema={formMode !== 'view' ? validationSchema : undefined}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            <PageHeader
                                title={getPageTitle()}
                                description={
                                    formMode === 'view'
                                        ? 'View purchase order details'
                                        : 'Required fields are marked with an asterisk (*)'
                                }
                                icon={getPageIcon()}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                {/* ── Status Badge & Info (View Mode) ──────────── */}
                                {formMode === 'view' && purchaseOrder && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                {statusCfg && (
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                )}
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                    {purchaseOrder.poNumber}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Send — for DRAFT & PENDING */}
                                                {['DRAFT', 'PENDING'].includes(purchaseOrder.status) && (
                                                    <Button type="button" theme="primary" onClick={handleSend}>
                                                        <Send className="w-4 h-4 mr-2" />
                                                        Send to Supplier
                                                    </Button>
                                                )}
                                                {/* Quick Receive — for SENT, SHIPPED, PARTIALLY_RECEIVED */}
                                                {['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED'].includes(purchaseOrder.status) && (
                                                    <Button type="button" theme="success" onClick={() => setReceivingPO(purchaseOrder)}>
                                                        <Package className="w-4 h-4 mr-2" />
                                                        Quick Receive
                                                    </Button>
                                                )}
                                                {/* Cancel — for DRAFT & SENT */}
                                                {['DRAFT', 'SENT'].includes(purchaseOrder.status) && (
                                                    <Button type="button" theme="danger" layout="outline" onClick={handleCancel}>
                                                        <Ban className="w-4 h-4 mr-2" />
                                                        Cancel Order
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Info grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {purchaseOrder.supplier?.name || '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(purchaseOrder.orderDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Expected Delivery</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatDate(purchaseOrder.expectedDeliveryDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                                                    {formatCurrency(purchaseOrder.totalAmount ?? 0)}
                                                </p>
                                            </div>
                                            {purchaseOrder.requisition && (
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">From Requisition</p>
                                                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                        {purchaseOrder.requisition.requisitionNumber}
                                                    </p>
                                                </div>
                                            )}
                                            {purchaseOrder.notes && (
                                                <div className="col-span-2 sm:col-span-4">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                                                        {purchaseOrder.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── From-Requisition Banner ──────────────────── */}
                                {formMode === 'create-from-requisition' && requisition && (
                                    <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        <ClipboardList className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                                        <div className="text-sm text-indigo-800 dark:text-indigo-300">
                                            Creating PO from approved requisition{' '}
                                            <span className="font-semibold">{requisition.requisitionNumber}</span>.
                                            Items are pre-filled with approved quantities. Please select a supplier and set unit prices.
                                        </div>
                                    </div>
                                )}

                                {/* ── Order Details Card ───────────────────────── */}
                                {formMode !== 'view' && (
                                    <FormFieldCard title="Order Details">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormSearchableSelect
                                                label="Supplier"
                                                name="supplierId"
                                                options={supplierOptions}
                                                placeholder="Search and select supplier..."
                                                required
                                                disabled={isDisabled}
                                            />

                                            <FormInput
                                                label="Expected Delivery Date"
                                                name="expectedDeliveryDate"
                                                type="date"
                                                disabled={isDisabled}
                                            />

                                            <div className="md:col-span-2">
                                                <FormInput
                                                    label="Notes"
                                                    name="notes"
                                                    placeholder="Additional order notes..."
                                                    disabled={isDisabled}
                                                />
                                            </div>
                                        </div>
                                    </FormFieldCard>
                                )}

                                {/* ── Items Card ───────────────────────────────── */}
                                <FormFieldCard title={formMode === 'view' ? 'Order Items' : 'Items'}>
                                    {formMode === 'view' && purchaseOrder ? (
                                        /* ── View-mode items table ─────── */
                                        <div className="space-y-3">
                                            {purchaseOrder.items.map((item, index) => {
                                                const vName = item.variant?.variantName || '';
                                                const pName = item.variant?.product?.name || '';
                                                const displayName = pName
                                                    ? `${pName}${vName && vName !== 'Default' ? ` — ${vName}` : ''}`
                                                    : vName || item.product?.name || 'Unknown';
                                                const sku = item.variant?.sku || item.product?.sku || '';

                                                return (
                                                    <div
                                                        key={item.id || index}
                                                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {displayName}
                                                                </p>
                                                                {sku && (
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        SKU: {sku}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                {formatCurrency(item.totalPrice || item.orderedQuantity * item.unitPrice)}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Ordered</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.orderedQuantity}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Unit Price</span>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.unitPrice)}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Received</span>
                                                                <p className="font-medium text-green-600 dark:text-green-400">{item.receivedQuantity || 0}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 dark:text-gray-400">Damaged</span>
                                                                <p className="font-medium text-red-600 dark:text-red-400">{item.damagedQuantity || 0}</p>
                                                            </div>
                                                        </div>

                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{item.notes}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {/* View-mode total */}
                                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                <div className="text-lg">
                                                    <span className="text-gray-600 dark:text-gray-400">Total: </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(purchaseOrder.totalAmount ?? calculateTotal(values.items))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── Create-mode items (FieldArray) ─────── */
                                        <FieldArray name="items">
                                            {({ push, remove }) => (
                                                <div className="space-y-4">
                                                    <Button
                                                        type="button"
                                                        onClick={() => push({ ...emptyItem })}
                                                        theme="primary"
                                                        layout="outline"
                                                        disabled={formMode === 'create-from-requisition'}
                                                    >
                                                        <Plus className="w-4 h-4 mr-2" />
                                                        Add Item
                                                    </Button>

                                                    {values.items.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                                            <Package className="w-12 h-12 mb-2 opacity-50" />
                                                            <p>No items added yet</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {values.items.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                                                                >
                                                                    <div className="flex justify-between items-center mb-3">
                                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                            Item #{index + 1}
                                                                        </span>
                                                                        {formMode === 'create-manual' && values.items.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => remove(index)}
                                                                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                                title="Remove item"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                        <div className="md:col-span-2">
                                                                            <FormSearchableSelect
                                                                                label="Product Variant"
                                                                                name={`items.${index}.variantId`}
                                                                                options={variantOptions}
                                                                                placeholder="Search product..."
                                                                                required
                                                                                disabled={formMode === 'create-from-requisition'}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <FormInput
                                                                                label="Quantity"
                                                                                name={`items.${index}.orderedQuantity`}
                                                                                type="number"
                                                                                min="1"
                                                                                max={formMode === 'create-from-requisition' ? approvedQtyMap.get(item.variantId) : undefined}
                                                                                required
                                                                                disabled={formMode === 'create-from-requisition'}
                                                                            />
                                                                            {formMode === 'create-from-requisition' && approvedQtyMap.has(item.variantId) && (
                                                                                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                                                    Approved qty: {approvedQtyMap.get(item.variantId)} (locked)
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <FormInput
                                                                            label="Unit Cost (MWK)"
                                                                            name={`items.${index}.unitPrice`}
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <div className="mt-2 text-right text-sm text-gray-600 dark:text-gray-400">
                                                                        Subtotal:{' '}
                                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                                            {formatCurrency((item.orderedQuantity || 0) * (item.unitPrice || 0))}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {values.items.length > 0 && (
                                                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                                            <div className="text-lg">
                                                                <span className="text-gray-600 dark:text-gray-400">Total: </span>
                                                                <span className="font-bold text-gray-900 dark:text-white">
                                                                    {formatCurrency(calculateTotal(values.items))}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </FieldArray>
                                    )}
                                </FormFieldCard>

                                {/* ── Actions ──────────────────────────────────── */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme={formMode === 'view' ? 'primary' : 'danger'}
                                        onClick={() => navigate(ROUTES.PURCHASE_ORDERS)}
                                        disabled={isSubmitting || loading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        {formMode === 'view' ? 'Back to List' : 'Cancel'}
                                    </Button>
                                    {formMode !== 'view' && (
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Create Purchase Order
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

            {/* ── Receive Modal ─────────────────────────────────────────── */}
            {receivingPO && (
                <ReceiveModal
                    purchaseOrder={receivingPO}
                    onClose={() => setReceivingPO(null)}
                    onReceive={async (poId, payload) => {
                        await receivePurchaseOrder(poId, payload);
                        await handleReceiveComplete();
                    }}
                />
            )}
        </AppLayout>
    );
};

export default PurchaseOrderForm;
