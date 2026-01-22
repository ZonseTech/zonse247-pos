import { FunctionComponent, useMemo } from 'react';
import { Modal } from '../../../components';
import { formatCurrency, formatDate } from '../../../utils';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
import { useIsEBN } from '../../../hooks/useMediaQuery';

interface ReturnDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnDetails: ReturnDetails | null;
}

const getRestockStatusBadge = (status: RestockStatus) => {
    const badges = {
        pending: {
            icon: HiOutlineClock,
            className:
                'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-800/50',
            label: 'Pending',
        },
        restocked: {
            icon: HiOutlineCheckCircle,
            className:
                'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-800/50',
            label: 'Restocked',
        },
        damaged: {
            icon: HiOutlineExclamationCircle,
            className:
                'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950/50 dark:border-red-800/50',
            label: 'Damaged',
        },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}
        >
            <Icon className="w-4 h-4" />
            {badge.label}
        </span>
    );
};

const getConditionBadge = (condition: ReturnCondition) => {
    const colors = {
        excellent: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30',
        good: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-900/30',
        fair: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30',
        damaged: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/30',
        defective: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[condition]}`}>
            {condition.charAt(0).toUpperCase() + condition.slice(1)}
        </span>
    );
};

const ReturnDetailsModal: FunctionComponent<ReturnDetailsModalProps> = ({
    isOpen,
    onClose,
    returnDetails,
}) => {
    const isEBN = useIsEBN();

    // Helper to safely parse numeric values (API may return strings)
    const parseNumber = (val: number | string | undefined): number => {
        if (val === undefined || val === null) return 0;
        return typeof val === 'string' ? parseFloat(val) || 0 : val;
    };

    // Helper to convert date to string for formatDate
    const toDateString = (val: string | Date | undefined): string => {
        if (!val) return '';
        return typeof val === 'string' ? val : val.toISOString();
    };

    // Helper to get product name from originalSale items or return item itself
    const getProductName = (item: ReturnItem): string => {
        // First check if product info is directly on the item
        if (item.product?.name) return item.product.name;

        // Look up from originalSale.items by matching originalOrderId to item id
        const originalSale = returnDetails?.originalSale;
        if (originalSale?.items) {
            const saleItem = originalSale.items.find(
                (si: any) => si.id === item.originalOrderId || si.productId === item.productId
            );
            if (saleItem?.product?.name) return saleItem.product.name;
        }

        return `Product #${item.productId.slice(0, 8)}...`;
    };

    const returnData = useMemo(() => {
        if (!returnDetails) return null;

        // Support both new API format (originalSale, returnNumber) and legacy format (returnTransaction, originalTransaction)
        const originalSale = returnDetails.originalSale;
        const returnTransaction = returnDetails.returnTransaction;
        const originalTransaction = returnDetails.originalTransaction;

        return {
            returnRefNumber: returnDetails.returnNumber || returnTransaction?.refNumber || 'N/A',
            originalRefNumber: originalSale?.saleNumber || originalTransaction?.refNumber || 'N/A',
            customerName:
                originalSale?.customer?.name ||
                originalTransaction?.customer?.name ||
                'Walk-in Customer',
            cashierName:
                originalSale?.user?.fullname ||
                originalSale?.user?.username ||
                returnTransaction?.user?.fullname ||
                returnTransaction?.user?.username ||
                'Administrator',
            returnDate: formatDate(toDateString(returnDetails.createdAt || returnTransaction?.date)),
            originalDate: formatDate(toDateString(originalSale?.saleDate || originalTransaction?.date)),
            refundAmount: returnDetails.refundAmount || 0,
            paymentMethod: originalSale?.paymentMethod?.name || returnTransaction?.paymentMethod?.name || 'Original Method',
            hasItems: Array.isArray(returnDetails.returnItems) && returnDetails.returnItems.length > 0,
        };
    }, [returnDetails]);

    if (!returnDetails || !returnData) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            title="Return Details"
            onClose={onClose}
            size="full"
            className={isEBN ? "max-w-3xl w-full mx-2" : "max-w-5xl w-full mx-4 sm:mx-auto"}
        >
            <div className={`${isEBN ? 'max-h-[70vh]' : 'max-h-[80vh] sm:max-h-[75vh]'} overflow-y-auto px-1 sm:pr-2`}>
                {/* Return Header */}
                <div className={`bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/20 dark:to-indigo-900/20 rounded-xl ${isEBN ? 'p-2 mb-2' : 'p-4 sm:p-6 mb-4 sm:mb-6'} border border-sky-100 dark:border-sky-800`}>
                    <div className={`grid grid-cols-2 ${isEBN ? 'gap-2' : 'gap-4 sm:gap-6'}`}>
                        <div>
                            <h3 className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} font-medium text-gray-600 dark:text-gray-400 mb-0.5`}>
                                Return Transaction
                            </h3>
                            <p className={`${isEBN ? 'text-sm' : 'text-xl sm:text-2xl'} font-bold text-gray-900 dark:text-white break-all`}>
                                {returnData.returnRefNumber}
                            </p>
                            <p className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-600 dark:text-gray-400 mt-0.5`}>
                                {returnData.returnDate}
                            </p>
                        </div>
                        <div>
                            <h3 className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} font-medium text-gray-600 dark:text-gray-400 mb-0.5`}>
                                Original Transaction
                            </h3>
                            <p className={`${isEBN ? 'text-xs' : 'text-lg sm:text-xl'} font-semibold text-gray-900 dark:text-white break-all`}>
                                {returnData.originalRefNumber}
                            </p>
                            <p className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-600 dark:text-gray-400 mt-0.5`}>
                                {returnData.originalDate}
                            </p>
                        </div>
                    </div>

                    <div className={`grid grid-cols-3 ${isEBN ? 'gap-2 mt-2 pt-2' : 'gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6'} border-t border-sky-200 dark:border-sky-800`}>
                        <div>
                            <p className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-600 dark:text-gray-400`}>Customer</p>
                            <p className={`font-medium ${isEBN ? 'text-[11px]' : 'text-sm sm:text-base'} text-gray-900 dark:text-white truncate`}>
                                {returnData.customerName}
                            </p>
                        </div>
                        <div>
                            <p className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-600 dark:text-gray-400`}>Processed By</p>
                            <p className={`font-medium ${isEBN ? 'text-[11px]' : 'text-sm sm:text-base'} text-gray-900 dark:text-white truncate`}>
                                {returnData.cashierName}
                            </p>
                        </div>
                        <div>
                            <p className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} text-gray-600 dark:text-gray-400`}>Refund Method</p>
                            <p className={`font-medium ${isEBN ? 'text-[11px]' : 'text-sm sm:text-base'} text-gray-900 dark:text-white`}>
                                {returnData.paymentMethod}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Returned Items */}
                {returnData.hasItems && (
                    <div className={isEBN ? 'mb-2' : 'mb-4 sm:mb-6'}>
                        <h3 className={`${isEBN ? 'text-xs mb-1' : 'text-base sm:text-lg mb-3 sm:mb-4'} font-semibold flex items-center gap-2`}>
                            <span>Returned Items</span>
                            <span className={`${isEBN ? 'text-[10px]' : 'text-xs sm:text-sm'} font-normal text-gray-500 dark:text-gray-400`}>
                                ({returnDetails.returnItems.length} items)
                            </span>
                        </h3>

                        {/* Mobile Card View */}
                        <div className={`${isEBN ? 'hidden' : 'block sm:hidden'} space-y-3`}>
                            {returnDetails.returnItems.map((item) => (
                                <div
                                    key={item.returnItemId}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                {getProductName(item)}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                    {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm text-sky-600 dark:text-sky-400 ml-2">
                                            {formatCurrency(parseNumber(item.returnPrice))}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Qty: <span className="font-medium">{parseNumber(item.returnedQuantity)}</span>/{parseNumber(item.originalQuantity)}
                                        </span>
                                        {getConditionBadge(item.condition)}
                                        {getRestockStatusBadge(item.restockStatus)}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Reason: {item.returnReason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className={`${isEBN ? 'block' : 'hidden sm:block'} overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700`}>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className={`${isEBN ? 'px-2 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'} text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                                            Product
                                        </th>
                                        <th className={`${isEBN ? 'px-2 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'} text-center font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                                            Qty
                                        </th>
                                        <th className={`${isEBN ? 'px-2 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'} text-right font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                                            Price
                                        </th>
                                        <th className={`${isEBN ? 'px-2 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'} text-center font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                                            Condition
                                        </th>
                                        <th className={`${isEBN ? 'px-2 py-1.5 text-[10px]' : 'px-4 py-3 text-xs'} text-center font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider`}>
                                            Status
                                        </th>
                                        {!isEBN && (
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Reason
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {returnDetails.returnItems.map((item) => (
                                        <tr
                                            key={item.returnItemId}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className={isEBN ? 'px-2 py-1.5' : 'px-4 py-4'}>
                                                <div>
                                                    <p className={`font-medium text-gray-900 dark:text-white ${isEBN ? 'text-[11px]' : ''}`}>
                                                        {getProductName(item)}
                                                    </p>
                                                    {item.notes && !isEBN && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`${isEBN ? 'px-2 py-1.5 text-[11px]' : 'px-4 py-4'} text-center`}>
                                                <span className="font-medium">
                                                    {parseNumber(item.returnedQuantity)}
                                                </span>
                                                <span className={`text-gray-400 ${isEBN ? 'text-[10px]' : 'text-sm'}`}>
                                                    /{parseNumber(item.originalQuantity)}
                                                </span>
                                            </td>
                                            <td className={`${isEBN ? 'px-2 py-1.5 text-[11px]' : 'px-4 py-4'} text-right font-medium`}>
                                                {formatCurrency(parseNumber(item.returnPrice))}
                                            </td>
                                            <td className={`${isEBN ? 'px-2 py-1.5' : 'px-4 py-4'} text-center`}>
                                                {getConditionBadge(item.condition)}
                                            </td>
                                            <td className={`${isEBN ? 'px-2 py-1.5' : 'px-4 py-4'} text-center`}>
                                                <div className="flex flex-col items-center gap-0.5">
                                                    {getRestockStatusBadge(item.restockStatus)}
                                                    {item.restockStatus === 'restocked' &&
                                                        parseNumber(item.restockedQuantity) > 0 && !isEBN && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                Qty: {parseNumber(item.restockedQuantity)}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            {!isEBN && (
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {item.returnReason
                                                            .replace(/_/g, ' ')
                                                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Refund Summary */}
                <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg ${isEBN ? 'p-2' : 'p-4 sm:p-6'} border border-gray-200 dark:border-gray-700`}>
                    <h3 className={`${isEBN ? 'text-xs mb-1' : 'text-base sm:text-lg mb-3 sm:mb-4'} font-semibold`}>Refund Summary</h3>
                    <div className={isEBN ? 'space-y-1' : 'space-y-2 sm:space-y-3'}>
                        <div className={`flex justify-between items-center ${isEBN ? 'pb-1' : 'pb-2 sm:pb-3'} border-b border-gray-200 dark:border-gray-700`}>
                            <span className={`${isEBN ? 'text-[11px]' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                                Items Returned:
                            </span>
                            <span className={`font-medium ${isEBN ? 'text-[11px]' : 'text-sm sm:text-base'}`}>
                                {returnDetails.returnItems.reduce(
                                    (sum, item) => sum + parseNumber(item.returnedQuantity),
                                    0
                                )}
                            </span>
                        </div>

                        <div className={`flex justify-between items-center ${isEBN ? 'pb-1' : 'pb-2 sm:pb-3'} border-b border-gray-200 dark:border-gray-700`}>
                            <span className={`${isEBN ? 'text-[11px]' : 'text-sm'} text-gray-600 dark:text-gray-400`}>Subtotal:</span>
                            <span className={`font-medium ${isEBN ? 'text-[11px]' : 'text-sm sm:text-base'}`}>
                                {formatCurrency(returnData.refundAmount)}
                            </span>
                        </div>

                        <div className={`flex justify-between items-center ${isEBN ? 'pt-1' : 'pt-2 sm:pt-3'} border-t-2 border-gray-300 dark:border-gray-600`}>
                            <span className={`${isEBN ? 'text-xs' : 'text-base sm:text-lg'} font-semibold`}>Total Refund:</span>
                            <span className={`${isEBN ? 'text-sm' : 'text-xl sm:text-2xl'} font-bold text-sky-600 dark:text-sky-400`}>
                                {formatCurrency(returnData.refundAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ReturnDetailsModal;
