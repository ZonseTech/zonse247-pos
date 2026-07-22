import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { HiOutlineEye, HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock as HiOutlineClockSmall } from 'react-icons/hi2';
import { RotateCcw, Shield, ShieldOff, ShieldAlert, ShieldCheck, ShieldX, Monitor } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import returnsService from '../../../services/returns.service';
import { getPaymentMethodName } from '../../../utils/sale.helper';

// Union type for both Sale and Transaction
type SaleOrTransaction = (Sale | Transaction) & {
    saleNumber?: string;
    refNumber?: string;
    transactionId?: string;
    saleDate?: Date | string;
    date?: string;
    totalAmount?: number;
    total?: number;
    amountPaid?: number;
    paid?: number;
    isVoided?: boolean;
    mraSaleStatus?: MraSaleStatus;
    mraFiscalCode?: string | null;
};

interface TransactionTableColumnsProps {
    onViewDetails: (transaction: Transaction) => void;
    onInitiateReturn: (transaction: Transaction) => void;
    compact?: boolean;
    isMraEnabled?: boolean;  // Show MRA status column when true
}

// Helper to get sale identifier (supports both new and legacy format)
const getSaleRef = (row: SaleOrTransaction) =>
    row.saleNumber || row.refNumber || row.transactionId || row.id || '-';

// Helper to get sale date (supports both formats)
const getSaleDate = (row: SaleOrTransaction) =>
    row.saleDate || row.date || row.createdAt;

// Helper to get total amount (supports both formats)  
const getSaleTotal = (row: SaleOrTransaction) =>
    row.totalAmount || row.total || 0;

// Helper to get amount paid (supports both formats)
const getAmountPaid = (row: SaleOrTransaction) =>
    row.amountPaid || row.paid || 0;

/**
 * MRA Status Badge Component
 * Displays the MRA submission status with appropriate icon and color
 */
const MraStatusBadge: React.FC<{ status?: MraSaleStatus; fiscalCode?: string | null }> = ({
    status,
    fiscalCode,
}) => {
    if (!status || status === 'NOT_APPLICABLE') {
        return null;
    }

    const statusConfig: Record<Exclude<MraSaleStatus, 'NOT_APPLICABLE'>, {
        label: string;
        icon: React.ReactNode;
        bgColor: string;
        textColor: string;
    }> = {
        PENDING: {
            label: 'Pending',
            icon: <HiOutlineClockSmall className="w-3.5 h-3.5" />,
            bgColor: 'bg-amber-100 dark:bg-amber-900/30',
            textColor: 'text-amber-700 dark:text-amber-400',
        },
        SUBMITTED: {
            label: 'Submitted',
            icon: <Shield className="w-3.5 h-3.5" />,
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-700 dark:text-blue-400',
        },
        VERIFIED: {
            label: 'Verified',
            icon: <ShieldCheck className="w-3.5 h-3.5" />,
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            textColor: 'text-green-700 dark:text-green-400',
        },
        FAILED: {
            label: 'Failed',
            icon: <ShieldAlert className="w-3.5 h-3.5" />,
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-700 dark:text-red-400',
        },
        REJECTED: {
            label: 'Rejected',
            icon: <ShieldX className="w-3.5 h-3.5" />,
            bgColor: 'bg-orange-100 dark:bg-orange-900/30',
            textColor: 'text-orange-700 dark:text-orange-400',
        },
        CANCELLED: {
            label: 'Cancelled',
            icon: <ShieldOff className="w-3.5 h-3.5" />,
            bgColor: 'bg-gray-100 dark:bg-gray-700',
            textColor: 'text-gray-600 dark:text-gray-400',
        },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
        <div className="flex flex-col gap-0.5">
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                title={fiscalCode ? `Fiscal Code: ${fiscalCode}` : undefined}
            >
                {config.icon}
                {config.label}
            </span>
            {fiscalCode && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[100px]" title={fiscalCode}>
                    {fiscalCode}
                </span>
            )}
        </div>
    );
};

export const getSaleTableColumns = ({
    onViewDetails,
    onInitiateReturn,
    compact = false,
    isMraEnabled = false,
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
                    <span className="text-xs font-semibold text-green-500 dark:text-green-400">
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
                    <span className="text-xs text-sky-500 dark:text-sky-400 font-medium">
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
                selector: (row) => getPaymentMethodName(row),
                cell: (row) => (
                    <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-[10px] font-medium">
                        {getPaymentMethodName(row)}
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
                                className="p-1 text-sky-500 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/50 rounded transition-colors duration-200"
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
            selector: (row) => getSaleRef(row),
            cell: (row) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {getSaleRef(row)}
                </div>
            ),
            sortable: true,
        },
        {
            name: "Date",
            selector: (row) => getSaleDate(row) ? dayjs(getSaleDate(row)).format('DD-MM-YYYY') : '-',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <HiOutlineClock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        {getSaleDate(row) ? dayjs(getSaleDate(row)).format('DD-MM-YYYY') : '-'}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Total",
            selector: (row) => getSaleTotal(row),
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-green-500 dark:text-green-400">
                        {formatCurrency(getSaleTotal(row))}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Paid",
            selector: (row) => getAmountPaid(row),
            cell: (row) => (
                <span className="text-sky-500 dark:text-sky-400 font-medium">
                    {formatCurrency(getAmountPaid(row))}
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
            selector: (row) => getPaymentMethodName(row),
            cell: (row) => (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {getPaymentMethodName(row)}
                </span>
            ),
        },
        {
            name: "Cashier",
            selector: (row) => row.user?.fullname || row.user?.email || '-',
            cell: (row) => {
                const cashierName = row.user?.fullname || row.user?.email || '-';
                const terminalLabel = row.terminal?.terminalLabel || row.terminalId;

                return (
                    <div className="flex items-center gap-2 py-1 min-w-0">
                        <div className="min-w-0">
                            <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                {cashierName}
                            </div>
                            {terminalLabel && (
                                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 truncate">
                                    <Monitor className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{terminalLabel}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        // MRA Status column - only shown when MRA is enabled for the tenant
        ...(isMraEnabled ? [{
            name: "MRA Status",
            selector: (row: SaleOrTransaction) => (row as any).mraSaleStatus || 'NOT_APPLICABLE',
            cell: (row: SaleOrTransaction) => (
                <MraStatusBadge
                    status={(row as any).mraSaleStatus}
                    fiscalCode={(row as any).mraFiscalCode}
                />
            ),
            width: '130px',
        }] : []),
        {
            width: "120px",
            name: "Actions",
            cell: (row) => {
                const canReturn = returnsService.canReturn(row as Transaction);
                const refundSummary = returnsService.getRefundSummary(row as Transaction);
                const isVoided = row.isVoided || row.status === 'VOIDED' || row.status === 'void';
                const isRefunded = row.status === 'refunded' || row.status === 'RETURNED';
                const hasRefundInProgress = (row as Transaction).refunds?.some(r => r.status === 'pending');
                const showReturnButton = canReturn && !refundSummary.isFullyRefunded && !isRefunded && !isVoided && !hasRefundInProgress;

                return (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onViewDetails(row)}
                            className="p-1.5 text-sky-500 hover:text-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/50 rounded-md transition-colors duration-200"
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
