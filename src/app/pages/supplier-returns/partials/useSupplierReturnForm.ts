import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report, Confirm } from 'notiflix';
import { useSupplierReturns } from '../../../hooks/useSupplierReturns';
import { usePurchaseOrders } from '../../../hooks/usePurchaseOrders';
import { useGoodsReceipts } from '../../../hooks/useGoodsReceipts';
import { ROUTES } from '../../../utils/constants';
import { getErrorMessage } from '../../../utils/api-error-handler';
import type { ReturnFormValues, ReturnFormItem, FormMode } from './types';
import { EMPTY_ITEM } from './types';

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
    const [selectedSupplierId, setSelectedSupplierId] = useState('');

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

    // ── Helper: resolve supplier for a GRN ────────────────────────────────
    const getGRNSupplierId = useCallback(
        (grn: GoodsReceiptWithItems) =>
            grn.purchaseOrder?.supplierId
            || purchaseOrders.find(p => p.id === grn.purchaseOrderId)?.supplierId
            || '',
        [purchaseOrders],
    );

    // ── PO options — filtered by selected supplier ────────────────────────
    const poOptions = useMemo(() => {
        if (!selectedSupplierId) return [];
        return purchaseOrders
            .filter(po =>
                po.supplierId === selectedSupplierId
                && ['RECEIVED', 'PARTIALLY_RECEIVED', 'SHIPPED', 'SENT'].includes(po.status),
            )
            .map(po => ({
                label: `${po.poNumber} — ${po.supplier?.name || 'Unknown'}`,
                value: po.id,
            }));
    }, [purchaseOrders, selectedSupplierId]);

    // ── GRN options — filtered by selected supplier ───────────────────────
    const grnOptions = useMemo(() => {
        if (!selectedSupplierId) return [];
        return goodsReceipts
            .filter(g =>
                g.status === 'POSTED'
                && getGRNSupplierId(g) === selectedSupplierId,
            )
            .map(g => ({
                label: `${g.receiptNumber} — ${g.purchaseOrder?.poNumber || 'No PO'}`,
                value: g.id,
            }));
    }, [goodsReceipts, selectedSupplierId, getGRNSupplierId]);

    // ── Supplier changed → reset dependent fields ─────────────────────────
    const handleSupplierChanged = useCallback(
        (supplierId: string, setFieldValue: (field: string, value: any) => void) => {
            setSelectedSupplierId(supplierId);
            // Clear all dependent fields to prevent stale cross-supplier data
            setFieldValue('goodsReceiptId', '');
            setFieldValue('purchaseOrderId', '');
            setFieldValue('items', [{ ...EMPTY_ITEM }]);
        },
        [],
    );

    // ── GRN selected → auto-populate PO & items ──────────────────────────
    const handleGRNSelected = useCallback(
        (grnId: string, setFieldValue: (field: string, value: any) => void) => {
            const grn = goodsReceipts.find(g => g.id === grnId);
            if (!grn) return;

            // Set PO from GRN (only if PO is in available options)
            if (grn.purchaseOrderId) {
                const poInList = purchaseOrders.find(p => p.id === grn.purchaseOrderId);
                if (poInList) {
                    setFieldValue('purchaseOrderId', grn.purchaseOrderId);
                }
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

    // ── GRN cleared → reset auto-populated PO & items ────────────────────
    const handleGRNCleared = useCallback(
        (setFieldValue: (field: string, value: any) => void) => {
            setFieldValue('purchaseOrderId', '');
            setFieldValue('items', [{ ...EMPTY_ITEM }]);
        },
        [],
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
                    () => navigate(ROUTES.PROCUREMENT_RETURNS),
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
            async () => { await deleteReturn(returnData.id); navigate(ROUTES.PROCUREMENT_RETURNS); },
        );
    }, [returnData, deleteReturn, navigate]);

    return {
        formMode,
        returnId,
        loading,
        returnData,
        selectedSupplierId,
        poOptions,
        grnOptions,
        initialValues,
        handleSubmit,
        handleSupplierChanged,
        handleGRNSelected,
        handleGRNCleared,
        handleApprove,
        handleShip,
        handleComplete,
        handleCancel,
        handleDelete,
    };
};
