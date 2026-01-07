import { Fragment } from 'react';
import { TableColumn } from 'react-data-table-component';
import { HiOutlineEye, HiOutlineTrash, HiOutlineMenuAlt4 } from 'react-icons/hi';
import { RotateCcw } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils';

interface ReturnActionsProps {
    returnData: ReturnDetails;
    onViewDetails: (returnData: ReturnDetails) => void;
    onRestock: (returnData: ReturnDetails) => void;
    onCancel: (returnTransactionId: string, refNumber: string) => void;
}

export const ReturnActions: React.FC<ReturnActionsProps> = ({
    returnData,
    onViewDetails,
    onRestock,
    onCancel
}) => {
    const hasPendingRestock = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );

    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={() => onViewDetails(returnData)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="View Details"
            >
                <HiOutlineEye className="w-5 h-5" />
            </button>

            {hasPendingRestock && (
                <button
                    onClick={() => onRestock(returnData)}
                    className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title="Restock Items"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            )}

            <button
                onClick={() =>
                    onCancel(
                        returnData.returnTransaction.transactionId,
                        returnData.returnTransaction.refNumber
                    )
                }
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Cancel Return"
            >
                <HiOutlineTrash className="w-5 h-5" />
            </button>
        </div>
    );
};

const getRestockStatusBadge = (returnData: ReturnDetails) => {
    const allRestocked = returnData.returnItems.every(
        (item) => item.restockStatus === 'restocked'
    );
    const anyPending = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );
    const anyDamaged = returnData.returnItems.some(
        (item) => item.restockStatus === 'damaged'
    );

    if (allRestocked) {
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                Fully Restocked
            </span>
        );
    } else if (anyPending) {
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                Pending Restock
            </span>
        );
    } else if (anyDamaged) {
        return (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                Damaged
            </span>
        );
    }

    return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Unknown
        </span>
    );
};

export const getReturnColumns = (
    onViewDetails: (returnData: ReturnDetails) => void,
    onRestock: (returnData: ReturnDetails) => void,
    onCancel: (returnTransactionId: string, refNumber: string) => void
): TableColumn<ReturnDetails>[] => [
        {
            name: 'Return ID',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {row.returnTransaction.refNumber}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnTransaction.refNumber,
        },
        {
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
        },
        {
            name: 'Customer',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-900 dark:text-white">
                        {row.originalTransaction.customer?.name || 'Walk-in Customer'}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.originalTransaction.customer?.name || 'Walk-in',
        },
        {
            name: 'Date',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(row.returnTransaction.date)}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnTransaction.date,
        },
        {
            name: 'Refund Amount',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(row.refundAmount)}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.refundAmount,
            right: true,
        },
        {
            name: 'Items',
            cell: (row) => (
                <Fragment>
                    <div className="text-sm text-gray-900 dark:text-white">
                        {row.returnItems.length}
                    </div>
                </Fragment>
            ),
            sortable: true,
            selector: (row) => row.returnItems.length,
            center: true,
        },
        {
            name: 'Restock Status',
            cell: (row) => (
                <Fragment>
                    {getRestockStatusBadge(row)}
                </Fragment>
            ),
            center: true,
        },
        {
            name: <HiOutlineMenuAlt4 className='w-5 h-5 text-gray-500' />,
            cell: (row) => (
                <ReturnActions
                    returnData={row}
                    onViewDetails={onViewDetails}
                    onRestock={onRestock}
                    onCancel={onCancel}
                />
            ),
            right: true,
        }
    ];
