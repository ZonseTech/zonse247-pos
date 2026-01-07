import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { purchaseOrderService } from '../services';
import { useSettings } from './useSettings';

export const usePurchaseOrders = () => {
    const { setup } = useSettings();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const userId = setup?.setupId || '';

    const loadPurchaseOrders = useCallback(async () => {

        setIsLoading(true);
        try {
            const result = await purchaseOrderService.listPurchaseOrders({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
                search: searchTerm || undefined,
            } as any);

            if (!result) {
                setPurchaseOrders([]);
                setTotalRows(0);
                return;
            }

            // Handle both 'orders' and 'purchaseOrders' field names from API
            const orders = (result as any).orders || result.purchaseOrders || [];
            const pagination = result.pagination || { total: 0 };

            setPurchaseOrders(orders);
            setTotalRows(pagination.total || pagination.totalItems || 0);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load purchase orders');
            console.error('Load purchase orders error:', error);
            // Reset state on error
            setPurchaseOrders([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter, searchTerm]);

    useEffect(() => {
        loadPurchaseOrders();
    }, [loadPurchaseOrders]);

    const createPurchaseOrder = useCallback(async (payload: CreatePurchaseOrderPayload) => {
        try {
            const po = await purchaseOrderService.createPurchaseOrder(payload);
            Notify.success('Purchase order created successfully');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to create purchase order');
            throw error;
        }
    }, [loadPurchaseOrders]);

    const receivePurchaseOrder = useCallback(async (
        poId: string,
        payload: ReceivePurchaseOrderPayload
    ) => {
        try {
            const po = await purchaseOrderService.receivePurchaseOrder(poId, payload);
            Notify.success('Purchase order received successfully. Inventory updated!');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to receive purchase order');
            throw error;
        }
    }, [loadPurchaseOrders]);

    const cancelPurchaseOrder = useCallback(async (
        poId: string,
        reason: string
    ) => {
        if (!userId) return;

        try {
            const po = await purchaseOrderService.cancelPurchaseOrder(poId, {
                cancelledBy: userId,
                cancelReason: reason,
            } as any);
            Notify.success('Purchase order cancelled successfully');
            loadPurchaseOrders();
            return po;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to cancel purchase order');
            throw error;
        }
    }, [userId, loadPurchaseOrders]);

    const getPurchaseOrder = useCallback(async (poId: string) => {
        try {
            return await purchaseOrderService.getPurchaseOrder(poId);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load purchase order');
            return null;
        }
    }, []);

    const getStats = useCallback(async () => {
        try {
            return await purchaseOrderService.getPurchaseOrderStats();
        } catch (error: any) {
            console.error('Load PO stats error:', error);
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
        searchTerm,
        setSearchTerm,
        loadPurchaseOrders,
        createPurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        getPurchaseOrder,
        getStats,
        // Aliases for form compatibility
        create: createPurchaseOrder,
        update: createPurchaseOrder, // Using create for update for now
        getById: getPurchaseOrder,
    };
};
