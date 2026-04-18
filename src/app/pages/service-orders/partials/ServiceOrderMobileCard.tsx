import { FC } from 'react';
import { Eye, Play, XCircle, DollarSign, User, Clock } from 'lucide-react';

interface Props {
    orders: ServiceOrderWithItems[];
    onView: (id: string) => void;
    onStart: (id: string) => void;
    onCancel: (id: string) => void;
    onPay: (id: string) => void;
    isLoading?: boolean;
}

const statusBadge = (status: ServiceOrderStatus): { label: string; cls: string } => {
    switch (status) {
        case 'PENDING': return { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        case 'IN_PROGRESS': return { label: 'In Progress', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' };
        case 'COMPLETED': return { label: 'Completed', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        case 'CANCELLED': return { label: 'Cancelled', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
        case 'PARTIALLY_PAID': return { label: 'Partial', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
        case 'PAID': return { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
        default: return { label: status, cls: 'bg-gray-100 text-gray-600' };
    }
};

const OrderCard: FC<{ order: ServiceOrderWithItems; onView: (id: string) => void; onStart: (id: string) => void; onCancel: (id: string) => void; onPay: (id: string) => void }> = ({
    order, onView, onStart, onCancel, onPay,
}) => {
    const badge = statusBadge(order.status);
    return (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0" onClick={() => onView(order.id)}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{order.orderNumber}</h3>
                        <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-full ${badge.cls}`}>{badge.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                        {order.customer && (
                            <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {order.customer?.name || 'Customer'}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                        <span>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            MK {Number(order.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {order.balanceDue > 0 && (
                            <span className="text-xs text-red-500">
                                Due: MK {Number(order.balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => onView(order.id)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-sky-600 transition-colors">
                        <Eye className="w-4 h-4" />
                    </button>
                    {order.status === 'PENDING' && (
                        <button onClick={() => onStart(order.id)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600 transition-colors">
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    {(order.status === 'COMPLETED' || order.status === 'PARTIALLY_PAID') && (
                        <button onClick={() => onPay(order.id)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-emerald-600 transition-colors">
                            <DollarSign className="w-4 h-4" />
                        </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                        <button onClick={() => onCancel(order.id)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors">
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ServiceOrderMobileList: FC<Props> = ({ orders, onView, onStart, onCancel, onPay, isLoading }) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} onView={onView} onStart={onStart} onCancel={onCancel} onPay={onPay} />
            ))}
        </div>
    );
};
