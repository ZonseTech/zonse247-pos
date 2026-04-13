import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import serviceOrderService from '../services/service-order.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { useDebouncedSearch } from './useDebouncedSearch';

const getToday = () => new Date().toISOString().slice(0, 10);

export const useServiceOrders = () => {
    const [orders, setOrders] = useState<ServiceOrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { searchTerm, debouncedTerm, setSearchTerm, clearSearch } = useDebouncedSearch(300);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | ''>('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState(getToday);
    const [dateTo, setDateTo] = useState(getToday);

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await serviceOrderService.list({
                page,
                limit: perPage,
                search: debouncedTerm || undefined,
                status: statusFilter || undefined,
                paymentMethodId: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
                from: dateFrom || undefined,
                to: dateTo || undefined,
            });
            setOrders(result.orders || []);
            setTotalRows(result.pagination?.totalItems || 0);
            setTotalPages(result.pagination?.totalPages || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load service orders'));
            setOrders([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedTerm, statusFilter, paymentMethodFilter, dateFrom, dateTo]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    const getById = useCallback(async (id: string): Promise<ServiceOrderWithItems | null> => {
        try {
            return await serviceOrderService.get(id);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load service order'));
            return null;
        }
    }, []);

    const createOrder = useCallback(async (payload: CreateServiceOrderInput): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.create(payload);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const updateOrder = useCallback(async (id: string, payload: UpdateServiceOrderInput): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.update(id, payload);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const startOrder = useCallback(async (id: string): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.startOrder(id);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const cancelOrder = useCallback(async (id: string): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.cancelOrder(id);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const startItem = useCallback(async (orderId: string, itemId: string): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.startItem(orderId, itemId);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const completeItem = useCallback(async (orderId: string, itemId: string, data?: CompleteItemInput): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.completeItem(orderId, itemId, data);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const cancelItem = useCallback(async (orderId: string, itemId: string): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.cancelItem(orderId, itemId);
        await loadOrders();
        return order;
    }, [loadOrders]);

    const recordPayment = useCallback(async (orderId: string, payments: ServiceOrderPaymentInput[]): Promise<ServiceOrderWithItems> => {
        const order = await serviceOrderService.recordPayment(orderId, payments);
        await loadOrders();
        return order;
    }, [loadOrders]);

    return {
        orders,
        isLoading,
        searchTerm,
        setSearchTerm,
        clearSearch,
        statusFilter,
        setStatusFilter,
        paymentMethodFilter,
        setPaymentMethodFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        totalPages,
        loadOrders,
        getById,
        createOrder,
        updateOrder,
        startOrder,
        cancelOrder,
        startItem,
        completeItem,
        cancelItem,
        recordPayment,
    };
};
