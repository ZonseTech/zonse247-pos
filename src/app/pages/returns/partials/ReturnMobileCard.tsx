import React from 'react';
import { HiOutlineClock, HiOutlineEye } from 'react-icons/hi2';
import { RotateCcw, Trash2, User, Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
    const hasPendingRestock = returnData.returnItems.some(
        (item) => item.restockStatus === 'pending'
    );
    const restockStatus = getRestockStatus(returnData);
    const StatusIcon = restockStatus.icon;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm active:scale-[0.99] transition-transform">
            {/* Header - Return ID & Status */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-xs truncate">
                        {returnData.returnNumber || returnData.returnTransaction?.refNumber || '-'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0 ${restockStatus.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" />
                        {restockStatus.label}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1">
                    <HiOutlineClock className="w-3 h-3" />
                    <span>{(returnData.createdAt || returnData.returnTransaction?.date) ? dayjs(returnData.createdAt || returnData.returnTransaction?.date).format('DD MMM') : '-'}</span>
                </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-1.5 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">Refund</p>
                    <p className="font-bold text-sky-500 dark:text-sky-400 text-xs">
                        {formatCurrency(returnData.refundAmount || 0)}
                    </p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">Items</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                        {returnData.returnItems?.length || 0}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">Qty</p>
                    <p className="font-medium text-gray-900 dark:text-white text-xs">
                        {returnData.returnItems?.reduce((sum, item) => sum + (typeof item.returnedQuantity === 'string' ? parseInt(item.returnedQuantity, 10) : item.returnedQuantity), 0) || 0}
                    </p>
                </div>
            </div>

            {/* Meta Information & Customer - Combined Row */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-600 dark:text-gray-300 min-w-0">
                    <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{returnData.originalSale?.saleNumber || returnData.originalTransaction?.refNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-5 h-5 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center">
                        <User className="w-2.5 h-2.5 text-sky-500 dark:text-sky-300" />
                    </div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-300 max-w-[80px] truncate">
                        {returnData.originalSale?.customer?.name || returnData.originalTransaction?.customer?.name || 'Walk-in'}
                    </span>
                </div>
            </div>

            {/* Actions - Touch Friendly */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onViewDetails(returnData)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 hover:bg-sky-100 dark:hover:bg-sky-900/50 active:bg-sky-200 dark:active:bg-sky-900/70 rounded-lg transition-colors duration-150"
                >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>View</span>
                </button>
                {hasPendingRestock && (
                    <button
                        onClick={() => onRestock(returnData)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:bg-emerald-200 dark:active:bg-emerald-900/70 rounded-lg transition-colors duration-150"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restock</span>
                    </button>
                )}
                <button
                    onClick={() => onCancel(
                        returnData.returnId || returnData.returnTransaction?.transactionId || '',
                        returnData.returnNumber || returnData.returnTransaction?.refNumber || ''
                    )}
                    className="flex items-center justify-center p-2.5 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 active:bg-red-200 dark:active:bg-red-900/70 rounded-lg transition-colors duration-150"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
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

export const ReturnMobileList: React.FC<ReturnMobileListProps> = ({
    returns,
    onViewDetails,
    onRestock,
    onCancel,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-3 p-3">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 animate-pulse"
                    >
                        <div className="flex justify-between mb-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14" />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2" />
                        <div className="flex gap-1.5">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-3">
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

export default ReturnMobileCard;
