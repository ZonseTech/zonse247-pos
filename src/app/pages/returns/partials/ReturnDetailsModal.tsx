import { FunctionComponent, useMemo } from 'react';
import { Modal } from '../../../components';
import { formatCurrency, formatDate } from '../../../utils';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';

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
        good: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30',
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
    const returnData = useMemo(() => {
        if (!returnDetails) return null;

        return {
            returnRefNumber: returnDetails.returnTransaction?.refNumber || 'N/A',
            originalRefNumber: returnDetails.originalTransaction?.refNumber || 'N/A',
            customerName:
                returnDetails.originalTransaction?.customer?.name || 'Walk-in Customer',
            cashierName:
                returnDetails.returnTransaction?.user?.fullname ||
                returnDetails.returnTransaction?.user?.username ||
                'Administrator',
            returnDate: formatDate(returnDetails.returnTransaction?.date),
            originalDate: formatDate(returnDetails.originalTransaction?.date),
            refundAmount: returnDetails.refundAmount || 0,
            paymentMethod: returnDetails.returnTransaction?.paymentMethod?.name || 'Original Method',
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
            className="max-w-5xl"
        >
            <div className="max-h-[75vh] overflow-y-auto pr-2">
                {/* Return Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-6 border border-blue-100 dark:border-blue-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Return Transaction
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {returnData.returnRefNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {returnData.returnDate}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Original Transaction
                            </h3>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {returnData.originalRefNumber}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {returnData.originalDate}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {returnData.customerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Processed By</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {returnData.cashierName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Refund Method</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {returnData.paymentMethod}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Returned Items */}
                {returnData.hasItems && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>Returned Items</span>
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                ({returnDetails.returnItems.length} items)
                            </span>
                        </h3>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Condition
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Restock Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Reason
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                    {returnDetails.returnItems.map((item) => (
                                        <tr
                                            key={item.returnItemId}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        Product #{item.productId}
                                                    </p>
                                                    {item.notes && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {item.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="font-medium">
                                                    {item.returnedQuantity}
                                                </span>
                                                <span className="text-gray-400 text-sm">
                                                    /{item.originalQuantity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-medium">
                                                {formatCurrency(item.returnPrice)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {getConditionBadge(item.condition)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {getRestockStatusBadge(item.restockStatus)}
                                                    {item.restockStatus === 'restocked' &&
                                                        item.restockedQuantity > 0 && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                Qty: {item.restockedQuantity}
                                                            </span>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {item.returnReason
                                                        .replace(/_/g, ' ')
                                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Refund Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Refund Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">
                                Items Returned:
                            </span>
                            <span className="font-medium">
                                {returnDetails.returnItems.reduce(
                                    (sum, item) => sum + item.returnedQuantity,
                                    0
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium">
                                {formatCurrency(returnData.refundAmount)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                            <span className="text-lg font-semibold">Total Refund:</span>
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
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
