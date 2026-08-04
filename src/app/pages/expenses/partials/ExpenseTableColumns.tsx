import { TableColumn } from 'react-data-table-component';
import { Check, X, Ban, Clock as ClockIcon, Tag, User, Eye } from 'lucide-react';
import { formatCurrency } from '../../../utils';
import dayjs from 'dayjs';

interface ExpenseColumnOptions {
    onView: (expense: Expense) => void;
    onApprove: (expense: Expense) => void;
    onReject: (expense: Expense) => void;
    onVoid: (expense: Expense) => void;
    canApprove?: boolean;
    canReject?: boolean;
    canVoid?: boolean;
}

export const expenseStatusConfig: Record<ExpenseStatusType, { label: string; bgColor: string; textColor: string }> = {
    PENDING_APPROVAL: {
        label: 'Pending Approval',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-400',
    },
    APPROVED: {
        label: 'Approved',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        textColor: 'text-green-700 dark:text-green-400',
    },
    REJECTED: {
        label: 'Rejected',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-400',
    },
    VOIDED: {
        label: 'Voided',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        textColor: 'text-gray-600 dark:text-gray-400',
    },
};

export const getExpenseTableColumns = ({
    onView,
    onApprove,
    onReject,
    onVoid,
    canApprove = true,
    canReject = true,
    canVoid = true,
}: ExpenseColumnOptions): TableColumn<Expense>[] => [
        {
            name: 'Expense #',
            selector: (row) => row.expenseNumber,
            sortable: true,
            cell: (row) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {row.expenseNumber}
                </div>
            ),
            minWidth: '160px',
            grow: 1,
        },
        {
            name: 'Category',
            selector: (row) => row.category?.name || '',
            sortable: true,
            cell: (row) => (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium truncate max-w-[160px]">
                    <Tag className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{row.category?.name || '—'}</span>
                </span>
            ),
            minWidth: '150px',
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = expenseStatusConfig[row.status];
                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}>
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            name: 'Amount',
            selector: (row) => row.amount,
            sortable: true,
            cell: (row) => (
                <span className="font-semibold text-green-500 dark:text-green-400">
                    {formatCurrency(row.amount)}
                </span>
            ),
            grow: 1,
            minWidth: '130px',
        },
        {
            name: 'Recorded By',
            selector: (row) => row.recordedByUser?.fullname || '',
            cell: (row) => (
                <div className="flex items-center gap-1.5 min-w-0 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{row.recordedByUser?.fullname || '—'}</span>
                </div>
            ),
            minWidth: '200px',
            grow: 1,
        },
        {
            name: 'Date',
            selector: (row) => row.expenseDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                    {row.expenseDate ? dayjs(row.expenseDate).format('DD-MM-YYYY') : '—'}
                </span>
            ),
            minWidth: '130px',
            grow: 1,
        },
        {
            name: '-',
            cell: (row) => (
                <div className="flex gap-1">
                    <button
                        onClick={() => onView(row)}
                        className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/50 rounded-md transition-colors duration-200"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {row.status === 'PENDING_APPROVAL' && (canApprove || canReject) && (
                        <>
                            {canApprove && (
                                <button
                                    onClick={() => onApprove(row)}
                                    className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-md transition-colors duration-200"
                                    title="Approve"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            {canReject && (
                                <button
                                    onClick={() => onReject(row)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
                                    title="Reject"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                    {row.status === 'APPROVED' && canVoid && (
                        <button
                            onClick={() => onVoid(row)}
                            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                            title="Void Expense"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ),
            ignoreRowClick: true,
        },
    ];
