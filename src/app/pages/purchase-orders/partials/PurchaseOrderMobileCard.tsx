import React, { useState, useRef, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Send, Package, Calendar, Truck, MoreVertical } from 'lucide-react';
import dayjs from 'dayjs';
import { poStatusColorMap, poStatusLabelMap } from './PurchaseOrderTableColumns';

interface PurchaseOrderMobileCardProps {
    purchaseOrder: PurchaseOrder;
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const statusBgMap: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    SENT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    SHIPPED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    PARTIALLY_RECEIVED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    RECEIVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 0 }).format(value);

const PurchaseOrderMobileCard: React.FC<PurchaseOrderMobileCardProps> = ({
    purchaseOrder,
    onReceive,
    onSend,
    onCancel,
    onView,
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const label = poStatusLabelMap[purchaseOrder.status] || purchaseOrder.status;
    const total = purchaseOrder.totalAmount || purchaseOrder.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    const statusStyle = statusBgMap[purchaseOrder.status] || statusBgMap.DRAFT;

    const canSend = purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'PENDING';
    const canReceive = purchaseOrder.status === 'SENT' || purchaseOrder.status === 'SHIPPED' || purchaseOrder.status === 'PARTIALLY_RECEIVED';
    const canCancel = purchaseOrder.status === 'DRAFT' || purchaseOrder.status === 'PENDING' || purchaseOrder.status === 'SENT';
    const hasActions = canSend || canReceive || canCancel;

    // Received progress
    const totalOrdered = purchaseOrder.items?.reduce((s, i) => s + i.orderedQuantity, 0) || 0;
    const totalReceived = purchaseOrder.items?.reduce((s, i) => s + (i.receivedQuantity || 0), 0) || 0;
    const showProgress = (purchaseOrder.status === 'PARTIALLY_RECEIVED' || purchaseOrder.status === 'RECEIVED') && totalOrdered > 0;
    const progress = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

    useEffect(() => {
        if (!showActions) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActions]);

    return (
        <div
            className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                       active:scale-[0.99] transition-transform touch-manipulation"
            onClick={() => onView(purchaseOrder)}
        >
            <div className="p-3.5">
                {/* Header row: PO#, Status, Date, Actions */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {purchaseOrder.poNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${statusStyle}`}>
                            {label}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {purchaseOrder.orderDate ? dayjs(purchaseOrder.orderDate).format('DD MMM, HH:mm') : '-'}
                        </span>
                        {hasActions && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowActions(prev => !prev); }}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors -mr-1"
                                aria-label="Actions"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Financial row: Total prominent, items + supplier secondary */}
                <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(total)}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            <span className="font-medium text-sky-600 dark:text-sky-400">{purchaseOrder.items?.length || 0}</span> item{(purchaseOrder.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Progress bar for partial/received */}
                {showProgress && (
                    <div className="mb-2.5">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">Received</span>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{totalReceived}/{totalOrdered} ({progress}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${purchaseOrder.status === 'RECEIVED' ? 'bg-green-500' : 'bg-sky-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Meta row: Supplier, Expected delivery */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">{purchaseOrder.supplier?.name || 'N/A'}</span>
                    </div>
                    {purchaseOrder.expectedDeliveryDate && (
                        <div className="flex items-center gap-1 ml-auto">
                            <Truck className="w-3 h-3 text-gray-400" />
                            <span className="truncate">ETA {dayjs(purchaseOrder.expectedDeliveryDate).format('DD MMM')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Context menu */}
            {showActions && (
                <div
                    ref={actionsRef}
                    className="absolute top-10 right-3 z-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                             shadow-lg min-w-[150px] py-1 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActions(false); onView(purchaseOrder); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <Eye className="w-4 h-4 text-sky-500" />
                        View Details
                    </button>
                    {canSend && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); onSend(purchaseOrder); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-indigo-600 dark:text-indigo-400
                                     hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Send to Supplier
                        </button>
                    )}
                    {canReceive && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); onReceive(purchaseOrder); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-green-600 dark:text-green-400
                                     hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Receive Items
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); onCancel(purchaseOrder); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400
                                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Order
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

interface PurchaseOrderMobileListProps {
    purchaseOrders: PurchaseOrder[];
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
    isLoading?: boolean;
}

/** Skeleton card for loading state */
const PurchaseOrderMobileCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 animate-pulse">
        <div className="flex justify-between mb-2.5">
            <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="flex justify-between mb-2.5">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="flex gap-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
        </div>
    </div>
);

export const PurchaseOrderMobileList: React.FC<PurchaseOrderMobileListProps> = ({
    purchaseOrders,
    onReceive,
    onSend,
    onCancel,
    onView,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-2 px-3 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <PurchaseOrderMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (purchaseOrders.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 px-3 py-2">
            {purchaseOrders.map((po) => (
                <PurchaseOrderMobileCard
                    key={po.id}
                    purchaseOrder={po}
                    onReceive={onReceive}
                    onSend={onSend}
                    onCancel={onCancel}
                    onView={onView}
                />
            ))}
        </div>
    );
};

export { PurchaseOrderMobileCardSkeleton };
export default PurchaseOrderMobileCard;
