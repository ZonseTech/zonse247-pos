import { FC } from 'react';
import { Eye, CheckCircle, XCircle, Ban, Package, Calendar, User, ShoppingCart } from 'lucide-react';
import dayjs from 'dayjs';

interface RequisitionMobileCardProps {
    requisition: PurchaseRequisitionWithItems;
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

const RequisitionMobileCard: FC<RequisitionMobileCardProps> = ({
    requisition,
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
}) => {
    const config = statusConfig[requisition.status] || statusConfig.PENDING;
    const totalQty = requisition.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0;
    const isPartiallyApproved = requisition.status === 'PARTIALLY_APPROVED';
    const isApproved = requisition.status === 'APPROVED' || isPartiallyApproved;
    const totalApproved = isApproved
        ? requisition.items?.reduce((sum, item) => sum + (item.approvedQuantity ?? item.requestedQuantity), 0) || 0
        : 0;
    const approvalPercent = isPartiallyApproved && totalQty > 0 ? Math.round((totalApproved / totalQty) * 100) : 0;

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-sky-500 dark:text-sky-400">
                            {requisition.requisitionNumber}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${config.dot}`}></span>
                            {config.label}
                        </span>
                    </div>
                    {requisition.requestedByUser && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {requisition.requestedByUser.fullname}
                        </p>
                    )}
                </div>

                {/* Total quantity */}
                <div className="text-right flex-shrink-0">
                    {isPartiallyApproved ? (
                        <div>
                            <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                                {totalApproved} <span className="text-sm font-normal text-gray-400">/ {totalQty}</span>
                            </p>
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-0.5 ml-auto">
                                <div className="h-full rounded-full bg-sky-500" style={{ width: `${approvalPercent}%` }} />
                            </div>
                            <span className="text-[9px] text-gray-500 dark:text-gray-400">{approvalPercent}% approved</span>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {totalQty} <span className="text-sm font-normal text-gray-500">units</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Info row */}
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dayjs(requisition.createdAt).format('MMM D, YYYY')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    <span>{requisition.items?.length || 0} item{(requisition.items?.length || 0) !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {/* Notes */}
            {requisition.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {requisition.notes}
                </p>
            )}

            {/* Rejection reason */}
            {requisition.status === 'REJECTED' && requisition.rejectedReason && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 mb-3">
                    <span className="font-medium">Reason: </span>{requisition.rejectedReason}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => onView(requisition)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-sky-500 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                </button>
                {requisition.status === 'PENDING' && (
                    <>
                        <button
                            onClick={() => onApprove(requisition)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-green-500 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                        </button>
                        <button
                            onClick={() => onReject(requisition)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                        </button>
                        <button
                            onClick={() => onCancel(requisition)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors ml-auto"
                        >
                            <Ban className="w-4 h-4" />
                            <span>Cancel</span>
                        </button>
                    </>
                )}
                {(requisition.status === 'APPROVED' || requisition.status === 'PARTIALLY_APPROVED') && onCreatePO && (
                    <button
                        onClick={() => onCreatePO(requisition)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Create PO</span>
                    </button>
                )}
            </div>
        </div>
    );
};

interface RequisitionMobileListProps {
    requisitions: PurchaseRequisitionWithItems[];
    onApprove: (req: PurchaseRequisitionWithItems) => void;
    onReject: (req: PurchaseRequisitionWithItems) => void;
    onCancel: (req: PurchaseRequisitionWithItems) => void;
    onView: (req: PurchaseRequisitionWithItems) => void;
    onCreatePO?: (req: PurchaseRequisitionWithItems) => void;
    isLoading?: boolean;
}

export const RequisitionMobileList: FC<RequisitionMobileListProps> = ({
    requisitions,
    onApprove,
    onReject,
    onCancel,
    onView,
    onCreatePO,
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
            {requisitions.map((req) => (
                <RequisitionMobileCard
                    key={req.id}
                    requisition={req}
                    onApprove={onApprove}
                    onReject={onReject}
                    onCancel={onCancel}
                    onView={onView}
                    onCreatePO={onCreatePO}
                />
            ))}
        </div>
    );
};

export default RequisitionMobileCard;
