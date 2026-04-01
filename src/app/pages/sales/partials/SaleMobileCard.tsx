import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineClock, HiOutlineEye } from 'react-icons/hi2';
import { RotateCcw, User, CreditCard, Monitor, MoreVertical } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import returnsService from '../../../services/returns.service';

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
};

interface SaleMobileCardProps {
    transaction: SaleOrTransaction;
    onViewDetails: (transaction: SaleOrTransaction) => void;
    onInitiateReturn: (transaction: SaleOrTransaction) => void;
}

/**
 * Get status styles (supports both SaleStatus and TransactionStatus)
 */
const getStatusStyles = (status: SaleStatus | TransactionStatus | undefined) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
        case 'completed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'failed':
        case 'voided':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        case 'cancelled':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        case 'refunded':
        case 'returned':
            return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
};

// Helpers for handling both data shapes
const getSaleRef = (t: SaleOrTransaction) => t.saleNumber || t.refNumber || t.transactionId || t.id || '-';
const getSaleDate = (t: SaleOrTransaction) => t.saleDate || t.date || t.createdAt;
const getSaleTotal = (t: SaleOrTransaction) => t.totalAmount || t.total || 0;
const getAmountPaid = (t: SaleOrTransaction) => t.amountPaid || t.paid || 0;

const SaleMobileCard: React.FC<SaleMobileCardProps> = ({
    transaction,
    onViewDetails,
    onInitiateReturn,
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const canReturn = returnsService.canReturn(transaction as Transaction);
    const refundSummary = returnsService.getRefundSummary(transaction as Transaction);
    const isVoided = transaction.status === 'VOIDED' || transaction.status === 'void' || !!(transaction as Sale).voidedAt;
    const isRefunded = transaction.status === 'refunded' || transaction.status === 'RETURNED';
    const hasRefundInProgress = (transaction as Transaction).refunds?.some(r => r.status === 'pending');
    const showReturnButton = canReturn && !refundSummary.isFullyRefunded && !isRefunded && !isVoided && !hasRefundInProgress;

    const total = getSaleTotal(transaction);
    const paid = getAmountPaid(transaction);
    const change = transaction.changeAmount || 0;

    // Close actions when tapping outside
    useEffect(() => {
        if (!showActions) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActions]);

    return (
        <div
            className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                       active:scale-[0.99] transition-transform touch-manipulation"
            onClick={() => onViewDetails(transaction)}
        >
            <div className="p-3.5">
                {/* Header row: Invoice, Status, Time, Actions */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {getSaleRef(transaction)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize flex-shrink-0 ${getStatusStyles(transaction.status)}`}>
                            {transaction.status || 'unknown'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {getSaleDate(transaction) ? dayjs(getSaleDate(transaction)).format('DD MMM, HH:mm') : '-'}
                        </span>
                        {showReturnButton && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowActions(prev => !prev); }}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                         hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors -mr-1"
                                aria-label="Actions"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Financial row: Total prominent, Paid + Change secondary */}
                <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(total)}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            Paid <span className="font-medium text-sky-600 dark:text-sky-400">{formatCurrency(paid)}</span>
                        </span>
                        {change > 0 && (
                            <span className="text-gray-500 dark:text-gray-400">
                                Change <span className="font-medium text-orange-500 dark:text-orange-400">{formatCurrency(change)}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Meta row: Payment, Terminal, Cashier */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[80px]">{transaction.paymentMethod?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[80px]">{transaction.terminal?.terminalLabel || transaction.terminalId || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <div className="w-4 h-4 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-2.5 h-2.5 text-sky-500 dark:text-sky-300" />
                        </div>
                        <span className="truncate max-w-[90px]">
                            {transaction.user?.fullname || transaction.user?.email || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Context menu */}
            {showActions && (
                <div
                    ref={actionsRef}
                    className="absolute top-10 right-3 z-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                             shadow-lg min-w-[150px] py-1 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActions(false); onViewDetails(transaction); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <HiOutlineEye className="w-4 h-4 text-sky-500" />
                        View Details
                    </button>
                    {showReturnButton && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); onInitiateReturn(transaction); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-orange-600 dark:text-orange-400
                                     hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Initiate Return
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

interface SaleMobileListProps {
    transactions: SaleOrTransaction[];
    onViewDetails: (transaction: SaleOrTransaction) => void;
    onInitiateReturn: (transaction: SaleOrTransaction) => void;
    isLoading?: boolean;
}

/** Skeleton card for loading state */
const SaleMobileCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 animate-pulse">
        <div className="flex justify-between mb-2.5">
            <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <div className="flex justify-between mb-2.5">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <div className="flex gap-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
        </div>
    </div>
);

export const SaleMobileList: React.FC<SaleMobileListProps> = ({
    transactions,
    onViewDetails,
    onInitiateReturn,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-2 px-3 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <SaleMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 px-3 py-2">
            {transactions.map((transaction) => (
                <SaleMobileCard
                    key={transaction.id || (transaction as Transaction).transactionId}
                    transaction={transaction}
                    onViewDetails={onViewDetails}
                    onInitiateReturn={onInitiateReturn}
                />
            ))}
        </div>
    );
};

export { SaleMobileCardSkeleton };
export default SaleMobileCard;
