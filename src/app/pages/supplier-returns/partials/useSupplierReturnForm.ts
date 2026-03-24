import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report, Confirm } from 'notiflix';
import { useSupplierReturns } from '../../../hooks/useSupplierReturns';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { useGoodsReceipts } from '../../../hooks/useGoodsReceipts';
import { ROUTES } from '../../../utils/constants';
import { getErrorMessage } from '../../../utils/api-error-handler';
import type { ReturnFormValues, ReturnFormItem, FormMode } from './types';

export const useSupplierReturnForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        createReturn, approveReturn, shipReturn, completeReturn,
        cancelReturn, deleteReturn, getReturn,
    } = useSupplierReturns();
    const { purchaseOrders } = usePurchaseOrders();
    const { goodsReceipts } = useGoodsReceipts();

    // ── Routing state ─────────────────────────────────────────────────────
    const returnId = (location.state as any)?.returnId as string | undefined;
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

    // ── PO options (RECEIVED / PARTIALLY_RECEIVED / SHIPPED / SENT) ──────
    const poOptions = useMemo(
        () => purchaseOrders
            .filter(po => ['RECEIVED', 'PARTIALLY_RECEIVED', 'SHIPPED', 'SENT'].includes(po.status))
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown'}`,
                value: po.id,
            })),
        [purchaseOrders],
    );

    // ── GRN options (POSTED) ──────────────────────────────────────────────
    const grnOptions = useMemo(
        () => goodsReceipts
            .filter(g => g.status === 'POSTED')
            .map(g => ({
                label: `${g.receiptNumber} — ${g.purchaseOrder?.poNumber || 'No PO'}`,
                value: g.id,
            })),
        [goodsReceipts],
    );

    // ── GRN selected → auto-populate supplier, PO, items ─────────────────
    const handleGRNSelected = useCallback(
        (grnId: string, setFieldValue: (field: string, value: any) => void) => {
            const grn = goodsReceipts.find(g => g.id === grnId);
            if (!grn) return;

            // Set supplier from GRN's PO
            if (grn.purchaseOrder) {
                const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
                if (po?.supplierId) setFieldValue('supplierId', po.supplierId);
                setFieldValue('purchaseOrderId', grn.purchaseOrderId);
            }

            // Populate items from GRN items
            if (grn.items?.length) {
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
        },
        [goodsReceipts, purchaseOrders],
    );

    // ── Formik values ─────────────────────────────────────────────────────
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
        return {
            supplierId: '',
            purchaseOrderId: '',
            goodsReceiptId: '',
            reason: '',
            notes: '',
            items: [{
                goodsReceiptItemId: '', variantId: '', displayName: '',
                returnQuantity: 1, unitCost: 0, reason: '', notes: '',
            }],
        };
    }, [formMode, returnData]);

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(
        async (values: ReturnFormValues, { resetForm }: { resetForm: () => void }) => {
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
                Report.failure('Error', getErrorMessage(error, 'Failed to create return'), 'Okay');
            } finally {
                setLoading(false);
            }
        },
        [formMode, createReturn, navigate],
    );

    // ── View-mode actions ─────────────────────────────────────────────────
    const reloadReturn = useCallback(async () => {
        if (!returnId) return;
        const r = await getReturn(returnId);
        if (r) setReturnData(r);
    }, [returnId, getReturn]);

    const handleApprove = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Approve Return', `Approve return ${returnData.returnNumber}?`,
            'Yes, Approve', 'Cancel',
            async () => { await approveReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, approveReturn, reloadReturn]);

    const handleShip = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Ship Return', `Mark return ${returnData.returnNumber} as shipped?`,
            'Yes, Ship', 'Cancel',
            async () => { await shipReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, shipReturn, reloadReturn]);

    const handleComplete = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Complete Return',
            `Complete return ${returnData.returnNumber}? Inventory will be reduced and a credit note generated.`,
            'Yes, Complete', 'Cancel',
            async () => { await completeReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, completeReturn, reloadReturn]);

    const handleCancel = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Cancel Return', `Cancel return ${returnData.returnNumber}?`,
            'Yes, Cancel', 'No',
            async () => { await cancelReturn(returnData.id); await reloadReturn(); },
        );
    }, [returnData, cancelReturn, reloadReturn]);

    const handleDelete = useCallback(() => {
        if (!returnData) return;
        Confirm.show(
            'Delete Return', `Permanently delete draft return ${returnData.returnNumber}?`,
            'Yes, Delete', 'Cancel',
            async () => { await deleteReturn(returnData.id); navigate(ROUTES.SUPPLIER_RETURNS); },
        );
    }, [returnData, deleteReturn, navigate]);

    return {
        formMode,
        returnId,
        loading,
        returnData,
        poOptions,
        grnOptions,
        initialValues,
        handleSubmit,
        handleGRNSelected,
        handleApprove,
        handleShip,
        handleComplete,
        handleCancel,
        handleDelete,
    };
};
