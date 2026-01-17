import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { HiOutlineEye, HiOutlineTrash, HiOutlineMenuAlt4 } from 'react-icons/hi';
import { RotateCcw, Eye, Trash2, Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils';

interface ReturnActionsProps {
    returnData: ReturnDetails;
    onViewDetails: (returnData: ReturnDetails) => void;
    onRestock: (returnData: ReturnDetails) => void;
    onCancel: (returnTransactionId: string, refNumber: string) => void;
    compact?: boolean;
}

export const ReturnActions: React.FC<ReturnActionsProps> = ({
    returnData,
    onViewDetails,
    onRestock,
    onCancel,
    compact = false
}) => {
    const hasPendingRestock = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );

    const iconClass = compact ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5";
    const buttonClass = compact
        ? "p-1 rounded transition-colors"
        : "p-2 rounded-lg transition-colors";

    return (
        <div className="flex items-center justify-end gap-0.5">
            <button
                onClick={() => onViewDetails(returnData)}
                className={`${buttonClass} text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                title="View Details"
            >
                <HiOutlineEye className={iconClass} />
            </button>

            {hasPendingRestock && (
                <button
                    onClick={() => onRestock(returnData)}
                    className={`${buttonClass} text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}
                    title="Restock Items"
                >
                    <RotateCcw className={iconClass} />
                </button>
            )}

            <button
                onClick={() =>
                    onCancel(
                        returnData.returnTransaction.transactionId,
                        returnData.returnTransaction.refNumber
                    )
                }
                className={`${buttonClass} text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20`}
                title="Cancel Return"
            >
                <HiOutlineTrash className={iconClass} />
            </button>
        </div>
    );
};

const getRestockStatusBadge = (returnData: ReturnDetails, compact: boolean = false) => {
    const allRestocked = returnData.returnItems.every(
        (item) => item.restockStatus === 'restocked'
    );
    const anyPending = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );
    const anyDamaged = returnData.returnItems.some(
        (item) => item.restockStatus === 'damaged'
    );

    const badgeClass = compact
        ? "px-1.5 py-0.5 rounded-full text-[10px] font-medium"
        : "px-2 py-1 rounded-full text-xs font-medium";

    if (allRestocked) {
        return (
            <span className={`${badgeClass} bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300`}>
                {compact ? 'Restocked' : 'Fully Restocked'}
            </span>
        );
    } else if (anyPending) {
        return (
            <span className={`${badgeClass} bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300`}>
                {compact ? 'Pending' : 'Pending Restock'}
            </span>
        );
    } else if (anyDamaged) {
        return (
            <span className={`${badgeClass} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`}>
                Damaged
            </span>
        );
    }

    return (
        <span className={`${badgeClass} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
            Unknown
        </span>
    );
};

export const getReturnColumns = (
    onViewDetails: (returnData: ReturnDetails) => void,
    onRestock: (returnData: ReturnDetails) => void,
    onCancel: (returnTransactionId: string, refNumber: string) => void,
    compact: boolean = false
): TableColumn<ReturnDetails>[] => {
    const textClass = compact ? 'text-xs' : 'text-sm';

    const baseColumns: TableColumn<ReturnDetails>[] = [
        {
            name: 'Return ID',
            cell: (row) => (
                <Fragment>
                    <div className={`${textClass} font-medium text-gray-900 dark:text-white`}>
                        {row.returnTransaction.refNumber}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnTransaction.refNumber,
            minWidth: compact ? '120px' : undefined,
            grow: compact ? 1 : undefined,
        },
        {
            name: 'Customer',
            cell: (row) => (
                <Fragment>
                    <div className={`${textClass} text-gray-900 dark:text-white`}>
                        {row.originalTransaction.customer?.name || 'Walk-in'}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.originalTransaction.customer?.name || 'Walk-in',
            minWidth: compact ? '140px' : undefined,
            grow: compact ? 1.5 : undefined,
        },
        {
            name: 'Date',
            cell: (row) => (
                <Fragment>
                    <div className={`${textClass} text-gray-600 dark:text-gray-400`}>
                        {formatDate(row.returnTransaction.date)}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnTransaction.date,
            minWidth: compact ? '100px' : undefined,
            grow: compact ? 1 : undefined,
            omit: compact,
        },
        {
            name: 'Refund',
            cell: (row) => (
                <Fragment>
                    <div className={`${textClass} font-medium text-blue-600 dark:text-blue-400`}>
                        {formatCurrency(row.refundAmount)}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.refundAmount,
            right: true,
            minWidth: compact ? '100px' : undefined,
            grow: compact ? 1 : undefined,
        },
        {
            name: 'Items',
            cell: (row) => (
                <Fragment>
                    <div className={`${textClass} text-gray-900 dark:text-white`}>
                        {row.returnItems.length}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnItems.length,
            center: true,
            minWidth: compact ? '60px' : undefined,
            grow: compact ? 0.5 : undefined,
            omit: compact,
        },
        {
            name: 'Status',
            cell: (row) => (
                <Fragment>
                    {getRestockStatusBadge(row, compact)}
                </Fragment>
            ),
            center: true,
            minWidth: compact ? '95px' : undefined,
            grow: compact ? 1 : undefined,
        },
        {
            name: <HiOutlineMenuAlt4 className={compact ? 'w-3.5 h-3.5 text-gray-500' : 'w-5 h-5 text-gray-500'} />,
            cell: (row) => (
                <ReturnActions
                    returnData={row}
                    onViewDetails={onViewDetails}
                    onRestock={onRestock}
                    onCancel={onCancel}
                    compact={compact}
                />
            ),
            right: true,
            width: compact ? '90px' : undefined,
        }
    ];

    // For non-compact mode, add the Original Transaction column
    if (!compact) {
        baseColumns.splice(1, 0, {
            name: 'Original Transaction',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {row.originalTransaction.refNumber}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.originalTransaction.refNumber,
        });
    }

    return baseColumns;
};

// Mobile-optimized columns
export const getMobileReturnColumns = (
    onViewDetails: (returnData: ReturnDetails) => void,
    onRestock: (returnData: ReturnDetails) => void,
    onCancel: (returnTransactionId: string, refNumber: string) => void
): TableColumn<ReturnDetails>[] => [
        {
            name: 'Return',
            selector: (row) => row.returnTransaction.refNumber,
            sortable: true,
            grow: 2,
            cell: (row) => {
                const hasPendingRestock = row.returnItems.some(
                    (item) => item.restockStatus === 'pending'
                );
                const allRestocked = row.returnItems.every(
                    (item) => item.restockStatus === 'restocked'
                );

                return (
                    <div className="flex items-center gap-3 py-2">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                            <RotateCcw className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {row.returnTransaction.refNumber}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {formatCurrency(row.refundAmount)}
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    {row.returnItems.length}
                                </span>
                                <span>•</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${allRestocked
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                    : hasPendingRestock
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {allRestocked ? 'Restocked' : hasPendingRestock ? 'Pending' : 'N/A'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {row.originalTransaction?.customer?.name || 'Walk-in'} • {formatDate(row.returnTransaction.date)}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            name: '',
            width: '80px',
            right: true,
            cell: (row) => {
                const hasPendingRestock = row.returnItems.some(
                    (item) => item.restockStatus === 'pending'
                );

                return (
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => onViewDetails(row)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        {hasPendingRestock ? (
                            <button
                                onClick={() => onRestock(row)}
                                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={() => onCancel(row.returnTransaction.transactionId, row.returnTransaction.refNumber)}
                                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];
