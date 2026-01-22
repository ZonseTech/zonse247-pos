import { FC } from 'react';
import { Eye, CheckCircle, XCircle, Package, Calendar, Truck, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';

interface PurchaseOrderMobileCardProps {
    purchaseOrder: PurchaseOrder;
    onReceive: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const statusConfig: Record<PurchaseOrderStatus, { bg: string; text: string; dot: string; label: string }> = {
    DRAFT: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500',
        label: 'Draft'
    },
    PENDING: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        dot: 'bg-yellow-500',
        label: 'Pending'
    },
    PARTIALLY_RECEIVED: {
        bg: 'bg-sky-100 dark:bg-sky-900/30',
        text: 'text-sky-800 dark:text-sky-400',
        dot: 'bg-sky-500',
        label: 'Partial'
    },
    RECEIVED: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Received'
    },
    CANCELLED: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'Cancelled'
    },
    LOCKED: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400',
        dot: 'bg-purple-500',
        label: 'Locked'
    },
};

const PurchaseOrderMobileCard: FC<PurchaseOrderMobileCardProps> = ({
    purchaseOrder,
    onReceive,
    onCancel,
    onView,
}) => {
    const config = statusConfig[purchaseOrder.status] || statusConfig.DRAFT;
    const total = purchaseOrder.totalAmount || purchaseOrder.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-sky-600 dark:text-sky-400">
                            {purchaseOrder.poNumber}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dot}`}></span>
                            {config.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {purchaseOrder.supplier?.name || 'N/A'}
                    </p>
                </div>

                {/* Total amount */}
                <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MWK',
                            minimumFractionDigits: 0,
                        }).format(total)}
                    </p>
                </div>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dayjs(purchaseOrder.orderDate).format('MMM D, YYYY')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{purchaseOrder.items?.length || 0} item{(purchaseOrder.items?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Expected delivery */}
            {purchaseOrder.expectedDeliveryDate && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Expected: {dayjs(purchaseOrder.expectedDeliveryDate).format('MMM D, YYYY')}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => onView(purchaseOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                </button>
                {(purchaseOrder.status === 'PENDING' || purchaseOrder.status === 'PARTIALLY_RECEIVED') && (
                    <button
                        onClick={() => onReceive(purchaseOrder)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" />
                        <span>Receive</span>
                    </button>
                )}
                {purchaseOrder.status === 'PENDING' && (
                    <button
                        onClick={() => onCancel(purchaseOrder)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-auto"
                    >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                    </button>
                )}
            </div>
        </div>
    );
};

interface PurchaseOrderMobileListProps {
    purchaseOrders: PurchaseOrder[];
    onReceive: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
    isLoading?: boolean;
}

export const PurchaseOrderMobileList: FC<PurchaseOrderMobileListProps> = ({
    purchaseOrders,
    onReceive,
    onCancel,
    onView,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            </div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                        <div className="flex gap-4 mb-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                        <div className="flex gap-2 pt-3">
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {purchaseOrders.map((po) => (
                <PurchaseOrderMobileCard
                    key={po.id}
                    purchaseOrder={po}
                    onReceive={onReceive}
                    onCancel={onCancel}
                    onView={onView}
                />
            ))}
        </div>
    );
};

export default PurchaseOrderMobileCard;
