import { TableColumn } from 'react-data-table-component';
import { Eye, Play, XCircle, DollarSign, Clock, User } from 'lucide-react';

interface ServiceOrderTableActionsProps {
    onView: (id: string) => void;
    onStart: (id: string) => void;
    onCancel: (id: string) => void;
    onPay: (id: string) => void;
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

export const getServiceOrderTableColumns = ({
    onView,
    onStart,
    onCancel,
    onPay,
}: ServiceOrderTableActionsProps): TableColumn<ServiceOrderWithItems>[] => [
        {
            name: 'Order #',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {row.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(row.createdAt).toLocaleDateString()}
                    </div>
                </div>
            ),
            sortable: true,
            minWidth: '150px',
        },
        {
            name: 'Customer',
            cell: (row) => (
                <div className="py-2">
                    {row.customer ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span>{row.customer?.name || 'Customer'}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400 italic">Walk-in</span>
                    )}
                </div>
            ),
            minWidth: '150px',
        },
        {
            name: 'Items',
            cell: (row) => (
                <div className="py-2 text-sm text-gray-700 dark:text-gray-300">
                    {row.items?.length || 0} service{(row.items?.length || 0) !== 1 ? 's' : ''}
                </div>
            ),
            width: '80px',
        },
        {
            name: 'Total',
            cell: (row) => (
                <div className="py-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                        MK {Number(row.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {row.balanceDue > 0 && (
                        <div className="text-xs text-red-500 mt-0.5">
                            Due: MK {Number(row.balanceDue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                </div>
            ),
            sortable: true,
            minWidth: '140px',
        },
        {
            name: 'Status',
            cell: (row) => {
                const badge = statusBadge(row.status);
                return (
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${badge.cls}`}>
                        {badge.label}
                    </span>
                );
            },
            minWidth: '110px',
        },
        {
            name: '',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(row.id)}
                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-sky-600 transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {row.status === 'PENDING' && (
                        <button
                            onClick={() => onStart(row.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600 transition-colors"
                            title="Start"
                        >
                            <Play className="w-4 h-4" />
                        </button>
                    )}
                    {(row.status === 'COMPLETED' || row.status === 'PARTIALLY_PAID') && (
                        <button
                            onClick={() => onPay(row.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-emerald-600 transition-colors"
                            title="Record Payment"
                        >
                            <DollarSign className="w-4 h-4" />
                        </button>
                    )}
                    {(row.status === 'PENDING' || row.status === 'IN_PROGRESS') && (
                        <button
                            onClick={() => onCancel(row.id)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 transition-colors"
                            title="Cancel"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            right: true,
            width: '130px',
        },
    ];
