import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { HiOutlineEye, HiOutlineClock } from 'react-icons/hi2';
import { RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import returnsService from '../../../services/returns.service';

interface TransactionTableColumnsProps {
    onViewDetails: (transaction: Transaction) => void;
    onInitiateReturn: (transaction: Transaction) => void;
    compact?: boolean;
}

export const getTransactionTableColumns = ({
    onViewDetails,
    onInitiateReturn,
    compact = false,
}: TransactionTableColumnsProps): TableColumn<Transaction>[] => {
    // For compact mode (EBN) - optimized columns with better visibility
    if (compact) {
        return [
            {
                name: "Invoice",
                selector: (row) => row.refNumber || row.transactionId || '-',
                cell: (row) => (
                    <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {row.refNumber || row.transactionId || '-'}
                    </div>
                ),
                sortable: true,
                minWidth: '110px',
                grow: 1,
            },
            {
                name: "Date/Time",
                selector: (row) => row.date ? dayjs(row.date).format('DD/MM HH:mm') : '-',
                cell: (row) => (
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-900 dark:text-gray-100">
                            {row.date ? dayjs(row.date).format('DD/MM/YY') : '-'}
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            {row.date ? dayjs(row.date).format('HH:mm') : ''}
                        </span>
                    </div>
                ),
                sortable: true,
                minWidth: '90px',
                grow: 1,
            },
            {
                name: "Total",
                selector: (row) => row.total || 0,
                cell: (row) => (
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(row.total || 0)}
                    </span>
                ),
                sortable: true,
                minWidth: '100px',
                grow: 1,
            },
            {
                name: "Paid",
                selector: (row) => row.paid || 0,
                cell: (row) => (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {formatCurrency(row.paid || 0)}
                    </span>
                ),
                sortable: true,
                minWidth: '100px',
                grow: 1,
            },
            {
                name: "Change",
                selector: (row) => row.changeAmount || 0,
                cell: (row) => (
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                        {formatCurrency(row.changeAmount || 0)}
                    </span>
                ),
                sortable: true,
                minWidth: '90px',
                grow: 1,
            },
            {
                name: "Method",
                selector: (row) => row.paymentMethod?.name || '-',
                cell: (row) => (
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium">
                        {row.paymentMethod?.name || '-'}
                    </span>
                ),
                minWidth: '85px',
                grow: 1,
            },
            {
                name: "Cashier",
                selector: (row) => row.user?.fullname || row.user?.email || '-',
                cell: (row) => (
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                        {row.user?.fullname || row.user?.email || '-'}
                    </span>
                ),
                minWidth: '90px',
                grow: 1,
            },
            {
                width: "75px",
                name: "Actions",
                cell: (row) => {
                    const canReturn = returnsService.canReturn(row);
                    const refundSummary = returnsService.getRefundSummary(row);
                    const isRefunded = row.status === 'refunded';
                    const hasRefundInProgress = row.refunds?.some(r => r.status === 'pending');
                    const showReturnButton = canReturn && !refundSummary.isFullyRefunded && !isRefunded && !hasRefundInProgress;

                    return (
                        <div className="flex gap-0.5">
                            <button
                                onClick={() => onViewDetails(row)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded transition-colors duration-200"
                                title="View Details"
                            >
                                <HiOutlineEye className='w-3.5 h-3.5' />
                            </button>
                            {showReturnButton && (
                                <button
                                    onClick={() => onInitiateReturn(row)}
                                    className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/50 rounded transition-colors duration-200"
                                    title="Initiate Return/Refund"
                                >
                                    <RotateCcw className='w-3.5 h-3.5' />
                                </button>
                            )}
                        </div>
                    );
                },
                ignoreRowClick: true,
            },
        ];
    }

    // Default (non-compact) columns
    return [
        {
            name: "Invoice",
            selector: (row) => row.refNumber || row.transactionId || '-',
            cell: (row) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {row.refNumber || row.transactionId || '-'}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Date",
            selector: (row) => row.date ? dayjs(row.date).format('DD-MM-YYYY') : '-',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {row.date ? dayjs(row.date).format('DD-MM-YYYY') : '-'}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Total",
            selector: (row) => row.total || 0,
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(row.total || 0)}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Paid",
            selector: (row) => row.paid || 0,
            cell: (row) => (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {formatCurrency(row.paid || 0)}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Change",
            selector: (row) => row.changeAmount || 0,
            cell: (row) => (
                <span className="text-orange-600 dark:text-orange-400">
                    {formatCurrency(row.changeAmount || 0)}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Method",
            selector: (row) => row.paymentMethod?.name || '-',
            cell: (row) => (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {row.paymentMethod?.name || '-'}
                </span>
            ),
        },
        {
            name: "Terminal",
            selector: (row) => row.terminal?.terminalLabel || row.terminalId || '-',
            cell: (row) => (
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {row.terminal?.terminalLabel || row.terminalId || '-'}
                </span>
            ),
        },
        {
            name: "Cashier",
            selector: (row) => row.user?.fullname || row.user?.email || '-',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-300">
                            {(row.user?.fullname || row.user?.email || '-').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {row.user?.fullname || row.user?.email || '-'}
                    </span>
                </div>
            ),
        },
        {
            width: "120px",
            name: "Actions",
            cell: (row) => {
                const canReturn = returnsService.canReturn(row);
                const refundSummary = returnsService.getRefundSummary(row);
                const isRefunded = row.status === 'refunded';
                const hasRefundInProgress = row.refunds?.some(r => r.status === 'pending');
                const showReturnButton = canReturn && !refundSummary.isFullyRefunded && !isRefunded && !hasRefundInProgress;

                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onViewDetails(row)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-md transition-colors duration-200"
                            title="View Details"
                        >
                            <HiOutlineEye className='w-4 h-4' />
                        </button>
                        {showReturnButton && (
                            <button
                                onClick={() => onInitiateReturn(row)}
                                className="p-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/50 rounded-md transition-colors duration-200"
                                title="Initiate Return/Refund"
                            >
                                <RotateCcw className='w-4 h-4' />
                            </button>
                        )}
                    </div>
                );
            },
            ignoreRowClick: true,
        },
    ];
};
