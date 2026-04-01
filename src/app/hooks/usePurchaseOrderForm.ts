import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report, Confirm } from 'notiflix';
import type { FormikHelpers } from 'formik';
import { usePurchaseOrders } from './usePurchaseOrders';
import { usePurchaseRequisitions } from './usePurchaseRequisitions';
import { formatProductLabel } from '../components/ProductSearchSelect';
import { formatSupplierLabel } from '../components/SupplierSearchSelect';
import { ROUTES } from '../utils/constants';
import { getErrorMessage } from '../utils/api-error-handler';
import type { POFormItem, POFormValues, FormMode } from '../pages/purchase-orders/partials/types';

const emptyItem: POFormItem = { variantId: '', orderedQuantity: 1, unitPrice: 0, notes: '' };

export const usePurchaseOrderForm = () => {
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

    // ── Derived data ──────────────────────────────────────────────────────
    const approvedQtyMap = useMemo(() => {
        if (!requisition) return new Map<string, number>();
        return new Map(
            requisition.items.map(item => [
                item.variantId,
                item.approvedQuantity ?? item.requestedQuantity,
            ])
        );
    }, [requisition]);

    const requisitionOptionMap = useMemo(() => {
        if (!requisition) return new Map<string, { label: string; value: string }>();
        return new Map(
            requisition.items
                .filter(item => item.variant)
                .map(item => [
                    item.variantId,
                    {
                        label: formatProductLabel({
                            name: item.variant!.product?.name || 'Unknown',
                            variantName: item.variant!.variantName,
                            sku: item.variant!.sku,
                        }),
                        value: item.variantId,
                    },
                ])
        );
    }, [requisition]);

    // ── Form values ───────────────────────────────────────────────────────
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
                supplierId: requisition.supplierId || '',
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

        return { supplierId: '', expectedDeliveryDate: '', notes: '', items: [{ ...emptyItem }] };
    }, [formMode, purchaseOrder, requisition]);

    const supplierInitialOption = useMemo(() => {
        if (formMode === 'create-from-requisition' && requisition?.supplier) {
            return { label: formatSupplierLabel(requisition.supplier), value: requisition.supplierId! };
        }
        if (formMode === 'view' && purchaseOrder?.supplier) {
            return { label: formatSupplierLabel(purchaseOrder.supplier), value: purchaseOrder.supplierId };
        }
        return null;
    }, [formMode, requisition, purchaseOrder]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (values: POFormValues, { resetForm }: FormikHelpers<POFormValues>) => {
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
                    createdBy: '',
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
                () => navigate(ROUTES.PROCUREMENT_PURCHASE_ORDERS),
            );
        } catch (error: any) {
            Report.failure('Error', getErrorMessage(error, 'Failed to create purchase order'), 'Okay');
        } finally {
            setLoading(false);
        }
    }, [formMode, requisitionIdFromState, createFromRequisition, createPurchaseOrder, navigate]);

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

    return {
        formMode,
        purchaseOrderId,
        requisitionIdFromState,
        loading,
        purchaseOrder,
        requisition,
        receivingPO,
        setReceivingPO,
        approvedQtyMap,
        requisitionOptionMap,
        initialValues,
        supplierInitialOption,
        handleSubmit,
        handleSend,
        handleCancel,
        handleReceiveComplete,
        receivePurchaseOrder,
    };
};
