import { useState, useEffect, useCallback, type FunctionComponent } from 'react';
import { Notify, Report } from 'notiflix';
import { ClipboardList, Search, RefreshCw, User, Clock, ShoppingCart, Play, X, ChevronLeft, ChevronRight, Wrench, Package, Layers } from 'lucide-react';
import { Modal } from '../../../components';
import { formatCurrency } from '../../../utils';
import { getErrorMessage } from '../../../utils/api-error-handler';
import { useInventory } from '../../../hooks/useInventory';
import { useAppSelector } from '../../../hooks/redux';
import { usePagination } from '../../../hooks/usePagination';
import serviceOrderService from '../../../services/service-order.service';
import classNames from 'classnames';

type StatusFilter = 'ALL' | ServiceOrderStatus;

interface ServiceOrdersListModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called when an order is selected (loaded into cart + linked for payment) */
    onSelectOrder?: (order: ServiceOrderWithItems) => void;
}

const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    IN_PROGRESS: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-700 dark:text-sky-400' },
    COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    PARTIALLY_PAID: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400' },
    PAID: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
};

const orderTypeConfig: Record<string, { icon: typeof Wrench; label: string; color: string }> = {
    SERVICE_ONLY: { icon: Wrench, label: 'Service', color: 'text-sky-500' },
    PRODUCT_ONLY: { icon: Package, label: 'Product', color: 'text-amber-500' },
    HYBRID: { icon: Layers, label: 'Hybrid', color: 'text-violet-500' },
};

const ServiceOrdersListModal: FunctionComponent<ServiceOrdersListModalProps> = ({
    isOpen,
    onClose,
    onSelectOrder,
}) => {
    const [orders, setOrders] = useState<ServiceOrderWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [startingOrderId, setStartingOrderId] = useState<string | null>(null);

    const { clearCart, addToCart, updateQuantity, cart, inventory } = useInventory();
    const serviceItems = useAppSelector((state) => state.services.items);
    const pagination = usePagination({ initialPerPage: 10 });

    const loadOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await serviceOrderService.list({
                page: pagination.page,
                limit: pagination.perPage,
                search: searchTerm || undefined,
                status: statusFilter !== 'ALL' ? statusFilter : undefined,
            });
            setOrders(result.orders || []);
            pagination.setTotalRows(result.pagination?.totalItems ?? result.orders?.length ?? 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load service orders'));
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, statusFilter, pagination.page, pagination.perPage]);

    useEffect(() => {
        if (isOpen) loadOrders();
    }, [isOpen, loadOrders]);

    // Reset to page 1 when filters change
    useEffect(() => {
        pagination.resetPage();
    }, [searchTerm, statusFilter]);

    /** Start a PENDING order (set to IN_PROGRESS) */
    const handleStartOrder = useCallback(async (order: ServiceOrderWithItems) => {
        try {
            setStartingOrderId(order.id);
            await serviceOrderService.startOrder(order.id);
            Notify.success(`Order ${order.orderNumber} started`);
            loadOrders();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to start order'));
        } finally {
            setStartingOrderId(null);
        }
    }, [loadOrders]);

    /** Fetch the full order by ID, update cart items to match order quantities */
    const handleSelectOrder = useCallback(async (order: ServiceOrderWithItems) => {
        try {
            const fullOrder = await serviceOrderService.get(order.id);

            // Update service items — look up from services store
            for (const item of fullOrder.items) {
                if (!item.service) continue;
                const svcItem = serviceItems.find(
                    s => s.id === item.serviceId || s.productId === item.serviceId
                );
                if (!svcItem) continue;
                const variantId = svcItem.id?.toString() || svcItem.productId.toString();
                const existing = cart.find(c => c.variantId === variantId);
                if (existing) {
                    updateQuantity(variantId, item.quantity);
                } else {
                    addToCart(svcItem);
                    if (item.quantity > 1) {
                        updateQuantity(variantId, item.quantity);
                    }
                }
            }

            // Update product items — look up from product inventory
            for (const pItem of fullOrder.productItems || []) {
                const invItem = inventory.find(
                    p => p.id === pItem.variantId || p.productId === pItem.productId
                );
                if (!invItem) continue;
                const variantId = invItem.id?.toString() || invItem.productId.toString();
                const existing = cart.find(c => c.variantId === variantId);
                if (existing) {
                    updateQuantity(variantId, pItem.quantity);
                } else {
                    addToCart(invItem);
                    if (pItem.quantity > 1) {
                        updateQuantity(variantId, pItem.quantity);
                    }
                }
            }

            onSelectOrder?.(fullOrder);
            onClose();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load order'));
        }
    }, [addToCart, updateQuantity, cart, inventory, serviceItems, onSelectOrder, onClose]);

    const handleClose = () => {
        setSearchTerm('');
        setStatusFilter('ALL');
        pagination.resetPage();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg" header={
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Service Orders</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {pagination.pageLabel}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={loadOrders}
                        disabled={isLoading}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        }>
            <div className="flex flex-col gap-4 p-2">
                {/* Status filter tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {([
                        { key: 'ALL' as StatusFilter, label: 'All' },
                        { key: 'PENDING' as StatusFilter, label: 'Pending' },
                        { key: 'IN_PROGRESS' as StatusFilter, label: 'In Progress' },
                        { key: 'COMPLETED' as StatusFilter, label: 'Completed' },
                        { key: 'PAID' as StatusFilter, label: 'Paid' },
                    ]).map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setStatusFilter(tab.key)}
                            className={classNames(
                                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                                statusFilter === tab.key
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order number or customer..."
                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                </div>

                {/* Orders list */}
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {isLoading && orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-sm text-gray-500">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <ClipboardList size={40} className="mb-3 opacity-50" />
                            <p className="text-sm">No service orders found</p>
                        </div>
                    ) : (
                        orders.map(order => {
                            const colors = statusColors[order.status] || statusColors.PENDING;
                            const staffNames = order.items
                                .flatMap(i => i.staffAssignments || [])
                                .map(a => a.staff?.user?.fullname || a.staff?.employeeCode || '')
                                .filter(Boolean);
                            const uniqueStaff = [...new Set(staffNames)];
                            const isStarting = startingOrderId === order.id;
                            const typeInfo = order.orderType ? orderTypeConfig[order.orderType] : null;
                            const TypeIcon = typeInfo?.icon;
                            const isProductOnly = order.orderType === 'PRODUCT_ONLY';
                            const allItems = [
                                ...order.items.map(i => ({ id: i.id, name: i.service?.name || 'Service', qty: i.quantity, type: 'service' as const })),
                                ...(order.productItems || []).map(p => ({ id: p.id, name: p.variant?.product?.name || p.variant?.variantName || 'Product', qty: p.quantity, type: 'product' as const })),
                            ];

                            return (
                                <div
                                    key={order.id}
                                    className="group border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {order.orderNumber}
                                                </span>
                                                <span className={classNames(
                                                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                                                    colors.bg, colors.text
                                                )}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                                {typeInfo && TypeIcon && (
                                                    <span className={classNames('flex items-center gap-0.5 text-[10px] font-medium', typeInfo.color)}>
                                                        <TypeIcon size={10} />
                                                        {typeInfo.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Customer */}
                                            {order.customer && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    {order.customer.name}
                                                    {order.customer.phone ? ` · ${order.customer.phone}` : ''}
                                                </p>
                                            )}

                                            {/* Items summary (services + products) */}
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {allItems.slice(0, 3).map(item => (
                                                    <span
                                                        key={item.id}
                                                        className={classNames(
                                                            'text-[10px] px-1.5 py-0.5 rounded',
                                                            item.type === 'product'
                                                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                        )}
                                                    >
                                                        {item.name} ×{item.qty}
                                                    </span>
                                                ))}
                                                {allItems.length > 3 && (
                                                    <span className="text-[10px] text-gray-400">
                                                        +{allItems.length - 3} more
                                                    </span>
                                                )}
                                            </div>

                                            {/* Staff & time */}
                                            <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                                {uniqueStaff.length > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <User size={10} />
                                                        {uniqueStaff.slice(0, 2).join(', ')}
                                                        {uniqueStaff.length > 2 && ` +${uniqueStaff.length - 2}`}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(order.createdAt).toLocaleString(undefined, {
                                                        month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(order.totalAmount)}
                                            </span>
                                            {order.balanceDue > 0 && (
                                                <span className="text-[10px] text-red-500">
                                                    Due: {formatCurrency(order.balanceDue)}
                                                </span>
                                            )}

                                            {/* Action buttons based on status + orderType */}
                                            <div className="flex gap-1.5 mt-1">
                                                {/* PRODUCT_ONLY: skip lifecycle, go straight to checkout */}
                                                {isProductOnly && order.status === 'PENDING' && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <ShoppingCart size={10} />
                                                        Pay
                                                    </button>
                                                )}
                                                {/* SERVICE_ONLY / HYBRID: start → complete → checkout */}
                                                {!isProductOnly && order.status === 'PENDING' && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleStartOrder(order); }}
                                                        disabled={isStarting}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 transition-colors"
                                                    >
                                                        <Play size={10} />
                                                        {isStarting ? 'Starting...' : 'Start'}
                                                    </button>
                                                )}
                                                {order.status === 'COMPLETED' && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                                                    >
                                                        <ShoppingCart size={10} />
                                                        Checkout
                                                    </button>
                                                )}
                                                {order.status === 'IN_PROGRESS' && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleSelectOrder(order); }}
                                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800/40 transition-colors"
                                                    >
                                                        <ShoppingCart size={10} />
                                                        Load
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={pagination.prevPage}
                                disabled={!pagination.hasPrevPage || isLoading}
                                className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                aria-label="Previous page"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={pagination.nextPage}
                                disabled={!pagination.hasNextPage || isLoading}
                                className="p-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                aria-label="Next page"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ServiceOrdersListModal;
