import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, XCircle, Send, Package } from 'lucide-react';
import dayjs from 'dayjs';

interface PurchaseOrderTableActionsProps {
    onReceive: (po: PurchaseOrder) => void;
    onSend: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
}

const statusConfig: Record<PurchaseOrderStatus, { bg: string; text: string; dot: string; label: string }> = {
    DRAFT: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500',
        label: 'Draft',
    },
    PENDING: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        dot: 'bg-yellow-500',
        label: 'Pending',
    },
    SENT: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        text: 'text-indigo-800 dark:text-indigo-400',
        dot: 'bg-indigo-500',
        label: 'Sent',
    },
    SHIPPED: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-400',
        dot: 'bg-purple-500',
        label: 'Shipped',
    },
    PARTIALLY_RECEIVED: {
        bg: 'bg-sky-100 dark:bg-sky-900/30',
        text: 'text-sky-800 dark:text-sky-400',
        dot: 'bg-sky-500',
        label: 'Partial',
    },
    RECEIVED: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Received',
    },
    CANCELLED: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'Cancelled',
    },
};

export { statusConfig as poStatusConfig };

export const getPurchaseOrderTableColumns = ({
    onReceive,
    onSend,
    onCancel,
    onView,
}: PurchaseOrderTableActionsProps): TableColumn<PurchaseOrder>[] => [
        {
            name: 'PO Number',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-sky-500 dark:text-sky-400">
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
        },
        {
            name: 'Items',
            cell: (row) => {
                const totalOrdered = row.items?.reduce((s, i) => s + i.orderedQuantity, 0) || 0;
                const totalReceived = row.items?.reduce((s, i) => s + (i.receivedQuantity || 0), 0) || 0;
                const isPartial = row.status === 'PARTIALLY_RECEIVED';
                const isReceived = row.status === 'RECEIVED';
                const progress = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;

                return (
                    <div className="min-w-[100px]">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                            <Package className="w-3.5 h-3.5 text-gray-400" />
                            <span>{row.items?.length || 0} item{(row.items?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                        {(isPartial || isReceived) && totalOrdered > 0 && (
                            <div className="mt-1">
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${isReceived ? 'bg-green-500' : 'bg-sky-500'}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {totalReceived}/{totalOrdered} received
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
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
                        className="p-2 text-sky-500 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="View details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {(row.status === 'DRAFT' || row.status === 'PENDING') && (
                        <button
                            onClick={() => onSend(row)}
                            className="p-2 text-indigo-500 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Send to supplier"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    )}
                    {(row.status === 'SENT' || row.status === 'SHIPPED' || row.status === 'PARTIALLY_RECEIVED') && (
                        <button
                            onClick={() => onReceive(row)}
                            className="p-2 text-green-500 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                            title="Quick receive"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {(row.status === 'DRAFT' || row.status === 'PENDING' || row.status === 'SENT') && (
                        <button
                            onClick={() => onCancel(row)}
                            className="p-2 text-red-500 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
