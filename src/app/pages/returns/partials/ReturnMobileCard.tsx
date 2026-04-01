import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineClock, HiOutlineEye } from 'react-icons/hi2';
import { RotateCcw, Trash2, User, Package, CheckCircle, Clock, AlertTriangle, MoreVertical } from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '../../../utils';

interface ReturnMobileCardProps {
    returnData: ReturnDetails;
    onViewDetails: (returnData: ReturnDetails) => void;
    onRestock: (returnData: ReturnDetails) => void;
    onCancel: (returnTransactionId: string, refNumber: string) => void;
}

const getRestockStatus = (returnData: ReturnDetails) => {
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
        return {
            label: 'Restocked',
            color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            icon: CheckCircle,
        };
    } else if (anyPending) {
        return {
            label: 'Pending',
            color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
            icon: Clock,
        };
    } else if (anyDamaged) {
        return {
            label: 'Damaged',
            color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
            icon: AlertTriangle,
        };
    }

    return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: Package,
    };
};

const ReturnMobileCard: React.FC<ReturnMobileCardProps> = ({
    returnData,
    onViewDetails,
    onRestock,
    onCancel,
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const hasPendingRestock = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );
    const hasRestockedItems = returnData.returnItems.some(
        (item) => item.restockStatus === 'restocked'
    );
    const isCancelled = returnData.status === 'CANCELLED';
    const canCancel = !hasRestockedItems && !isCancelled;
    const restockStatus = getRestockStatus(returnData);
    const StatusIcon = restockStatus.icon;

    const hasContextActions = hasPendingRestock || canCancel;

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
            onClick={() => onViewDetails(returnData)}
        >
            <div className="p-3.5">
                {/* Header row: Return ID, Status, Time, Actions */}
                <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {returnData.returnNumber || returnData.returnTransaction?.refNumber || '-'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0 ${restockStatus.color}`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {restockStatus.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {(returnData.createdAt || returnData.returnTransaction?.date) ? dayjs(returnData.createdAt || returnData.returnTransaction?.date).format('DD MMM, HH:mm') : '-'}
                        </span>
                        {hasContextActions && (
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

                {/* Financial row: Refund prominent, Items + Qty secondary */}
                <div className="flex items-baseline justify-between mb-2.5">
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                        {formatCurrency(returnData.refundAmount || 0)}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                            Items <span className="font-medium text-gray-700 dark:text-gray-300">{returnData.returnItems?.length || 0}</span>
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            Qty <span className="font-medium text-gray-700 dark:text-gray-300">
                                {returnData.returnItems?.reduce((sum, item) => sum + (typeof item.returnedQuantity === 'string' ? parseInt(item.returnedQuantity, 10) : item.returnedQuantity), 0) || 0}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Meta row: Original sale, Customer */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[120px]">{returnData.originalSale?.saleNumber || returnData.originalTransaction?.refNumber || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1 ml-auto">
                        <div className="w-4 h-4 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-2.5 h-2.5 text-sky-500 dark:text-sky-300" />
                        </div>
                        <span className="truncate max-w-[90px]">
                            {returnData.originalSale?.customer?.name || returnData.originalTransaction?.customer?.name || 'Walk-in'}
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
                        onClick={(e) => { e.stopPropagation(); setShowActions(false); onViewDetails(returnData); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <HiOutlineEye className="w-4 h-4 text-sky-500" />
                        View Details
                    </button>
                    {hasPendingRestock && !isCancelled && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowActions(false); onRestock(returnData); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-emerald-600 dark:text-emerald-400
                                     hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restock Items
                        </button>
                    )}
                    {canCancel && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActions(false);
                                onCancel(
                                    returnData.returnId || returnData.returnTransaction?.transactionId || '',
                                    returnData.returnNumber || returnData.returnTransaction?.refNumber || ''
                                );
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400
                                     hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Cancel Return
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

interface ReturnMobileListProps {
    returns: ReturnDetails[];
    onViewDetails: (returnData: ReturnDetails) => void;
    onRestock: (returnData: ReturnDetails) => void;
    onCancel: (returnTransactionId: string, refNumber: string) => void;
    isLoading?: boolean;
}

/** Skeleton card for loading state */
const ReturnMobileCardSkeleton: React.FC = () => (
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
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
        </div>
    </div>
);

export const ReturnMobileList: React.FC<ReturnMobileListProps> = ({
    returns,
    onViewDetails,
    onRestock,
    onCancel,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-2 px-3 py-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <ReturnMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (returns.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2 px-3 py-2">
            {returns.map((returnData) => (
                <ReturnMobileCard
                    key={returnData.returnId || returnData.returnTransaction?.transactionId}
                    returnData={returnData}
                    onViewDetails={onViewDetails}
                    onRestock={onRestock}
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
};

export { ReturnMobileCardSkeleton };
export default ReturnMobileCard;
