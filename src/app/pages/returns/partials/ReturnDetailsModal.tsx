import { FunctionComponent, useMemo } from 'react';
import { Modal, FormFieldCard } from '../../../components';
import { formatCurrency, formatDate } from '../../../utils';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle } from 'react-icons/hi';
import { X } from 'lucide-react';

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
            className="max-w-4xl w-full mx-4 sm:mx-auto"
            header={
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        Return Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            }
        >
            <div className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto space-y-4">
                {/* Transaction Info */}
                <FormFieldCard title="Transaction Information">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                Return Transaction
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white break-all">
                                {returnData.returnRefNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {returnData.returnDate}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                Original Transaction
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-white break-all">
                                {returnData.originalRefNumber}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {returnData.originalDate}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {returnData.customerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Processed By</p>
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {returnData.cashierName}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Refund Method</p>
                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                {returnData.paymentMethod}
                            </p>
                        </div>
                    </div>
                </FormFieldCard>

                {/* Returned Items */}
                {returnData.hasItems && (
                    <FormFieldCard title={`Returned Items (${returnDetails.returnItems.length})`}>
                        <div className="space-y-3">
                            {returnDetails.returnItems.map((item) => (
                                <div
                                    key={item.returnItemId}
                                    className="p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                {getProductName(item)}
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
                    </FormFieldCard>
                )}

                {/* Refund Summary */}
                <FormFieldCard title="Refund Summary">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Items Returned:
                            </span>
                            <span className="font-medium">
                                {returnDetails.returnItems.reduce(
                                    (sum, item) => sum + parseNumber(item.returnedQuantity),
                                    0
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium">
                                {formatCurrency(returnData.refundAmount)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-base font-semibold">Total Refund:</span>
                            <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                                {formatCurrency(returnData.refundAmount)}
                            </span>
                        </div>
                    </div>
                </FormFieldCard>
            </div>
        </Modal>
    );
};

export default ReturnDetailsModal;
