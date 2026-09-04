import { useState, useEffect, useCallback, useRef } from 'react';
import { Notify } from 'notiflix';
import { purchaseOrderService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';

export const usePurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    // Guards against out-of-order responses: e.g. an unfiltered fetch kicked off on mount
    // resolving *after* a subsequent filtered fetch (once a supplierId is set), which would
    // otherwise silently overwrite the correct results with another supplier's orders.
    const requestIdRef = useRef(0);

    const loadPurchaseOrders = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
            const result = await purchaseOrderService.listPurchaseOrders({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });

            if (requestId !== requestIdRef.current) return;

            if (!result) {
                setPurchaseOrders([]);
                setTotalRows(0);
                return;
            }

            const orders = result.orders || [];
            const pagination = result.pagination || { totalItems: 0 };

            // Normalize data - ensure purchaseOrderId is set
            const normalizedOrders = orders.map(order => ({
                ...order,
                purchaseOrderId: order.purchaseOrderId || order.id,
                // Calculate totalAmount if not present
                totalAmount: order.totalAmount ?? order.items?.reduce(
                    (sum, item) => sum + (item.totalPrice || item.orderedQuantity * item.unitPrice),
                    0
                ) ?? 0,
            }));

            setPurchaseOrders(normalizedOrders);
            setTotalRows(pagination.totalItems || 0);
        } catch (error: any) {
            if (requestId !== requestIdRef.current) return;
            Notify.failure(getErrorMessage(error, 'Failed to load purchase orders'));
            console.error('Load purchase orders error:', error);
            setPurchaseOrders([]);
            setTotalRows(0);
        } finally {
            if (requestId === requestIdRef.current) setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter, dateFrom, dateTo]);

    useEffect(() => {
        loadPurchaseOrders();
    }, [loadPurchaseOrders]);

    const createPurchaseOrder = useCallback(async (payload: CreatePurchaseOrderInput) => {
        try {
            const po = await purchaseOrderService.createPurchaseOrder(payload);
            Notify.success('Purchase order created successfully');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const createFromRequisition = useCallback(async (payload: CreatePOFromRequisitionInput) => {
        try {
            const po = await purchaseOrderService.createFromRequisition(payload);
            Notify.success('Purchase order created from requisition');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create PO from requisition'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const updatePurchaseOrder = useCallback(async (
        poId: string,
        payload: UpdatePurchaseOrderInput
    ) => {
        try {
            const po = await purchaseOrderService.updatePurchaseOrder(poId, payload);
            Notify.success('Purchase order updated successfully');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const sendPurchaseOrder = useCallback(async (poId: string) => {
        try {
            const po = await purchaseOrderService.sendPurchaseOrder(poId);
            Notify.success('Purchase order sent to supplier');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to send purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const receivePurchaseOrder = useCallback(async (
        poId: string,
        payload: ReceivePurchaseOrderInput
    ) => {
        try {
            const po = await purchaseOrderService.receivePurchaseOrder(poId, payload);
            Notify.success('Purchase order received successfully. Inventory updated!');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to receive purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const cancelPurchaseOrder = useCallback(async (poId: string) => {
        try {
            await purchaseOrderService.cancelPurchaseOrder(poId);
            Notify.success('Purchase order cancelled successfully');
            loadPurchaseOrders();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to cancel purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const deletePurchaseOrder = useCallback(async (poId: string) => {
        try {
            await purchaseOrderService.deletePurchaseOrder(poId);
            Notify.success('Purchase order deleted');
            loadPurchaseOrders();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete purchase order'));
            throw error;
        }
    }, [loadPurchaseOrders]);

    const getPurchaseOrder = useCallback(async (poId: string) => {
        try {
            const po = await purchaseOrderService.getPurchaseOrder(poId);
            // Normalize the response
            return {
                ...po,
                purchaseOrderId: po.purchaseOrderId || po.id,
                totalAmount: po.totalAmount ?? po.items?.reduce(
                    (sum, item) => sum + (item.totalPrice || item.orderedQuantity * item.unitPrice),
                    0
                ) ?? 0,
            };
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load purchase order'));
            return null;
        }
    }, []);

    return {
        purchaseOrders,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        supplierFilter,
        setSupplierFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        loadPurchaseOrders,
        createPurchaseOrder,
        createFromRequisition,
        updatePurchaseOrder,
        sendPurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        deletePurchaseOrder,
        getPurchaseOrder,
        // Aliases for form compatibility
        create: createPurchaseOrder,
        getById: getPurchaseOrder,
    };
};
