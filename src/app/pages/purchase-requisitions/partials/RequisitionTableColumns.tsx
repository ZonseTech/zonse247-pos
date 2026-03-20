import { TableColumn } from 'react-data-table-component';
import { Eye, CheckCircle, XCircle, Ban, Package, ShoppingCart } from 'lucide-react';
import dayjs from 'dayjs';

interface RequisitionTableActionsProps {
    onApprove: (req: PurchaseRequisitionWithItems) => void;
    onReject: (req: PurchaseRequisitionWithItems) => void;
    onCancel: (req: PurchaseRequisitionWithItems) => void;
    onView: (req: PurchaseRequisitionWithItems) => void;
    onCreatePO?: (req: PurchaseRequisitionWithItems) => void;
}

const statusConfig: Record<RequisitionStatusType, { bg: string; text: string; dot: string; label: string }> = {
    PENDING: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400',
        dot: 'bg-yellow-500',
        label: 'Pending',
    },
    APPROVED: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400',
        dot: 'bg-green-500',
        label: 'Approved',
    },
    PARTIALLY_APPROVED: {
        bg: 'bg-sky-100 dark:bg-sky-900/30',
        text: 'text-sky-800 dark:text-sky-400',
        dot: 'bg-sky-500',
        label: 'Partial',
    },
    REJECTED: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400',
        dot: 'bg-red-500',
        label: 'Rejected',
    },
    CANCELLED: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        dot: 'bg-gray-500',
        label: 'Cancelled',
    },
};

export const getRequisitionTableColumns = ({
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
}: RequisitionTableActionsProps): TableColumn<PurchaseRequisitionWithItems>[] => [
        {
            name: 'Requisition #',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-semibold text-sky-500 dark:text-sky-400">
                        {row.requisitionNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {dayjs(row.createdAt).format('MMM D, YYYY')}
                    </div>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Requested By',
            cell: (row) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                        {row.requestedByUser
                            ? row.requestedByUser.fullname
                            : 'N/A'}
                    </div>
                </div>
            ),
            sortable: true,
            grow: 2,
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
            name: 'Total Qty',
            cell: (row) => {
                const totalRequested = row.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0;
                const isPartiallyApproved = row.status === 'PARTIALLY_APPROVED';
                const isApproved = row.status === 'APPROVED' || isPartiallyApproved;
                const totalApproved = isApproved
                    ? row.items?.reduce((sum, item) => sum + (item.approvedQuantity ?? item.requestedQuantity), 0) || 0
                    : 0;
                const approvalPercent = isPartiallyApproved && totalRequested > 0
                    ? Math.round((totalApproved / totalRequested) * 100)
                    : 0;

                return (
                    <div className="text-right min-w-[70px]">
                        {isPartiallyApproved ? (
                            <>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    <span className="text-sky-600 dark:text-sky-400">{totalApproved}</span>
                                    <span className="text-gray-400 dark:text-gray-500"> / {totalRequested}</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                                    <div className="h-full rounded-full bg-sky-500" style={{ width: `${approvalPercent}%` }} />
                                </div>
                                <span className="text-[10px] text-gray-500 dark:text-gray-400">{approvalPercent}% approved</span>
                            </>
                        ) : (
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {totalRequested}
                            </div>
                        )}
                    </div>
                );
            },
            sortable: true,
            right: true,
        },
        {
            name: 'Status',
            cell: (row) => {
                const config = statusConfig[row.status] || statusConfig.PENDING;
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
                    {row.status === 'PENDING' && (
                        <>
                            <button
                                onClick={() => onApprove(row)}
                                className="p-2 text-green-500 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Approve requisition"
                            >
                                <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onReject(row)}
                                className="p-2 text-red-500 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Reject requisition"
                            >
                                <XCircle className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onCancel(row)}
                                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                                title="Cancel requisition"
                            >
                                <Ban className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {(row.status === 'APPROVED' || row.status === 'PARTIALLY_APPROVED') && onCreatePO && (
                        <button
                            onClick={() => onCreatePO(row)}
                            className="p-2 text-indigo-500 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Create Purchase Order"
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            right: true,
        },
    ];
