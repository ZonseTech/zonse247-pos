import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../../../../utils/api-error-handler';
import { useInventory } from '../../../../hooks/useInventory';
import { useAppSelector } from '../../../../hooks/redux';
import { usePagination } from '../../../../hooks/usePagination';
import { useDebouncedSearch } from '../../../../hooks/useDebouncedSearch';
import serviceOrderService from '../../../../services/service-order.service';
import { ACTIONABLE_STATUSES, type StatusFilter } from './config';

interface UseServiceOrdersListOptions {
    isOpen: boolean;
    onClose: () => void;
    onSelectOrder?: (order: ServiceOrderWithItems) => void;
}

export function useServiceOrdersList({ isOpen, onClose, onSelectOrder }: UseServiceOrdersListOptions) {
    const [orders, setOrders] = useState<ServiceOrderWithItems[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<StatusFilter>('ALL');
    const [busyId, setBusyId] = useState<string | null>(null);

    const { searchTerm, debouncedTerm, setSearchTerm, clearSearch } = useDebouncedSearch(300);
    const pagination = usePagination({ initialPerPage: 10 });
    const { addToCart, updateQuantity, cart, inventory } = useInventory();
    const services = useAppSelector(s => s.services.items);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await serviceOrderService.list({
                page: pagination.page,
                limit: pagination.perPage,
                search: debouncedTerm || undefined,
                status: filter !== 'ALL' ? filter : ACTIONABLE_STATUSES,
            });
            setOrders(res.orders || []);
            pagination.setTotalRows(res.pagination?.totalItems ?? res.orders?.length ?? 0);
        } catch (e) {
            Notify.failure(getErrorMessage(e, 'Failed to load orders'));
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [debouncedTerm, filter, pagination.page, pagination.perPage]);

    useEffect(() => {
        if (isOpen) loadOrders();
    }, [isOpen, loadOrders]);

    useEffect(() => {
        pagination.resetPage();
    }, [debouncedTerm, filter]);

    const handleClose = useCallback(() => {
        clearSearch();
        setFilter('ALL');
        pagination.resetPage();
        onClose();
    }, [clearSearch, pagination, onClose]);

    const handleStart = useCallback(async (order: ServiceOrderWithItems) => {
        setBusyId(order.id);
        try {
            await serviceOrderService.startOrder(order.id);
            Notify.success(`Order ${order.orderNumber} started`);
            loadOrders();
        } catch (e) {
            Notify.failure(getErrorMessage(e, 'Failed to start order'));
        } finally {
            setBusyId(null);
        }
    }, [loadOrders]);

    const handleSelect = useCallback(async (order: ServiceOrderWithItems) => {
        setBusyId(order.id);
        try {
            const fullOrder = await serviceOrderService.get(order.id);

            const addItemToCart = (
                item: { id?: string; productId?: string | number },
                quantity: number,
                catalog: typeof services | typeof inventory
            ) => {
                const found = catalog.find((c: any) =>
                    c.id === item.id || c.productId === item.productId || c.id === item.productId
                );
                if (!found) return;

                const variantId = found.id?.toString() || (found as any).productId?.toString();
                const existsInCart = cart.find(c => c.variantId === variantId);

                if (existsInCart) {
                    updateQuantity(variantId, quantity);
                } else {
                    addToCart(found);
                    if (quantity > 1) updateQuantity(variantId, quantity);
                }
            };

            fullOrder.items.forEach(item => {
                if (item.service) {
                    addItemToCart({ id: item.serviceId, productId: item.serviceId }, item.quantity, services);
                }
            });

            (fullOrder.productItems || []).forEach(pItem => {
                addItemToCart({ id: pItem.variantId, productId: pItem.productId }, pItem.quantity, inventory);
            });

            onSelectOrder?.(fullOrder);
            handleClose();
        } catch (e) {
            Notify.failure(getErrorMessage(e, 'Failed to load order'));
        } finally {
            setBusyId(null);
        }
    }, [services, inventory, cart, addToCart, updateQuantity, onSelectOrder, handleClose]);

    return {
        orders,
        loading,
        filter,
        busyId,
        searchTerm,
        pagination,
        setFilter,
        setSearchTerm,
        loadOrders,
        handleClose,
        handleStart,
        handleSelect,
    };
}
