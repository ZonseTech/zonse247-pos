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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            {/* Header - Return ID & Status */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {returnData.returnTransaction?.refNumber || '-'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${restockStatus.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {restockStatus.label}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    <span>{returnData.returnTransaction?.date ? dayjs(returnData.returnTransaction.date).format('DD MMM YYYY') : '-'}</span>
                </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Refund</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {formatCurrency(returnData.refundAmount || 0)}
                    </p>
                </div>
                <div className="text-center border-x border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Items</p>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {returnData.returnItems?.length || 0}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Qty</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {returnData.returnItems?.reduce((sum, item) => sum + item.returnedQuantity, 0) || 0}
                    </p>
                </div>
            </div>

            {/* Meta Information */}
            <div className="grid grid-cols-1 gap-2 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">Original: {returnData.originalTransaction?.refNumber || '-'}</span>
                </div>
            </div>

            {/* Customer */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-300 truncate">
                    {returnData.originalTransaction?.customer?.name || 'Walk-in Customer'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onViewDetails(returnData)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors duration-200"
                >
                    <HiOutlineEye className="w-4 h-4" />
                    <span>View</span>
                </button>
                {hasPendingRestock && (
                    <button
                        onClick={() => onRestock(returnData)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors duration-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restock</span>
                    </button>
                )}
                <button
                    onClick={() => onCancel(returnData.returnTransaction.transactionId, returnData.returnTransaction.refNumber)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors duration-200"
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
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-3" />
                        <div className="flex gap-2">
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
                            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {returns.map((returnData) => (
                <ReturnMobileCard
                    key={returnData.returnTransaction?.transactionId}
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
