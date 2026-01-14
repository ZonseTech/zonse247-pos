import React from 'react';
import { HiOutlineClock, HiOutlineEye } from 'react-icons/hi2';
import { RotateCcw, User, CreditCard, Monitor } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';
import returnsService from '../../../services/returns.service';

interface TransactionMobileCardProps {
    transaction: Transaction;
    onViewDetails: (transaction: Transaction) => void;
    onInitiateReturn: (transaction: Transaction) => void;
}

const getStatusStyles = (status: TransactionStatus | undefined) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'failed':
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        case 'cancelled':
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        case 'refunded':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
};

const TransactionMobileCard: React.FC<TransactionMobileCardProps> = ({
    transaction,
    onViewDetails,
    onInitiateReturn,
}) => {
    const canReturn = returnsService.canReturn(transaction);
    const refundSummary = returnsService.getRefundSummary(transaction);
    const isRefunded = transaction.status === 'refunded';
    const hasRefundInProgress = transaction.refunds?.some(r => r.status === 'pending');
    const showReturnButton = canReturn && !refundSummary.isFullyRefunded && !isRefunded && !hasRefundInProgress;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            {/* Header - Invoice & Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {transaction.refNumber || transaction.transactionId || '-'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusStyles(transaction.status)}`}>
                        {transaction.status || 'unknown'}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    <span>{transaction.date ? dayjs(transaction.date).format('DD MMM YYYY') : '-'}</span>
                </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Total</p>
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                        {formatCurrency(transaction.total || 0)}
                    </p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Paid</p>
                    <p className="font-semibold text-blue-600 dark:text-blue-400 text-sm">
                        {formatCurrency(transaction.paid || 0)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Change</p>
                    <p className="font-medium text-orange-600 dark:text-orange-400 text-sm">
                        {formatCurrency(transaction.changeAmount || 0)}
                    </p>
                </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{transaction.paymentMethod?.name || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Monitor className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{transaction.terminal?.terminalLabel || transaction.terminalId || '-'}</span>
                </div>
            </div>

            {/* Cashier */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {transaction.user?.fullname || transaction.user?.email || 'Unknown Cashier'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onViewDetails(transaction)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
                >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>View Details</span>
                </button>
                {showReturnButton && (
                    <button
                        onClick={() => onInitiateReturn(transaction)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 rounded-lg transition-colors duration-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Return</span>
                    </button>
                )}
            </div>
        </div>
    );
};

interface TransactionMobileListProps {
    transactions: Transaction[];
    onViewDetails: (transaction: Transaction) => void;
    onInitiateReturn: (transaction: Transaction) => void;
    isLoading?: boolean;
}

export const TransactionMobileList: React.FC<TransactionMobileListProps> = ({
    transactions,
    onViewDetails,
    onInitiateReturn,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
                    >
                        <div className="flex justify-between mb-3">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                            <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (transactions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3 p-4">
            {transactions.map((transaction) => (
                <TransactionMobileCard
                    key={transaction.transactionId}
                    transaction={transaction}
                    onViewDetails={onViewDetails}
                    onInitiateReturn={onInitiateReturn}
                />
            ))}
        </div>
    );
};

export default TransactionMobileCard;
