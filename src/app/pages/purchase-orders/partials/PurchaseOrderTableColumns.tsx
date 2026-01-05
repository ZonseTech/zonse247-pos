import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, XCircle, Package } from 'lucide-react';
import dayjs from 'dayjs';

interface PurchaseOrderTableActionsProps {
    onReceive: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

export const getPurchaseOrderTableColumns = ({
    onReceive,
    onCancel,
    onView,
}: PurchaseOrderTableActionsProps): TableColumn<PurchaseOrder>[] => [
        {
            name: 'PO Number',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {row.poNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {dayjs(row.orderDate).format('MMM D, YYYY')}
                    </div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Supplier',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {row.supplier?.name || 'N/A'}
                    </div>
                </div>
            ),
            sortable: true,
            grow: 2,
            minWidth: '200px',
        },
        {
            name: 'Items',
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span>{row.items?.length || 0} item{(row.items?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
            ),
        },
        {
            name: 'Total Amount',
            cell: (row) => {
                const total = row.totalAmount || row.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
                return (
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'MWK',
                        }).format(total)}
                    </div>
                );
            },
            sortable: true,
            right: true,
        },
        {
            name: 'Status',
            cell: (row) => {
                const statusConfig = {
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
                        bg: 'bg-blue-100 dark:bg-blue-900/30',
                        text: 'text-blue-800 dark:text-blue-400',
                        dot: 'bg-blue-500',
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
                const config = statusConfig[row.status] || statusConfig.DRAFT;
                return (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}></span>
                        {config.label}
                    </span>
                );
            },
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(row)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {(row.status === 'PENDING' || row.status === 'PARTIALLY_RECEIVED') && (
                        <button
                            onClick={() => onReceive(row)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Receive items"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {row.status === 'PENDING' && (
                        <button
                            onClick={() => onCancel(row)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Cancel order"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            right: true,
        },
    ];
