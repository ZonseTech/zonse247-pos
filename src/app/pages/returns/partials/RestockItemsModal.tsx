import { FunctionComponent, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Button, Modal } from '../../../components';
import returnsService from '../../../services/returns.service';

interface RestockItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    returnDetails: ReturnDetails;
    onSuccess?: () => void;
}

interface RestockItemForm {
    returnItemId: string;
    returnedQuantity: number;
    restockedQuantity: number;
    maxQuantity: number;
    productId: string;
    condition: ReturnCondition;
    restockStatus: RestockStatus;
}

const RestockItemsModal: FunctionComponent<RestockItemsModalProps> = ({
    isOpen,
    onClose,
    returnDetails,
    onSuccess,
}) => {
    // Helper to get product name from originalSale items
    const getProductName = (item: ReturnItem): string => {
        if (item.product?.name) return item.product.name;

        const originalSale = returnDetails.originalSale;
        if (originalSale?.items) {
            const saleItem = (originalSale.items as any[]).find(
                (si: any) => si.id === item.originalOrderId || si.productId === item.productId
            );
            if (saleItem?.product?.name) return saleItem.product.name;
        }

        return `Product #${item.productId.slice(0, 8)}...`;
    };

    // Helper to safely parse quantity (API returns strings)
    const parseQuantity = (val: number | string): number => {
        return typeof val === 'string' ? parseInt(val, 10) || 0 : val;
    };

    const [selectedItems, setSelectedItems] = useState<RestockItemForm[]>(() => {
        // Initialize with items that are pending restock and in good condition
        return returnDetails.returnItems
            .filter(
                (item) =>
                    item.restockStatus === 'pending' &&
                    (item.condition === 'excellent' || item.condition === 'good' || item.condition === 'fair')
            )
            .map((item) => {
                const qty = parseQuantity(item.returnedQuantity);
                return {
                    returnItemId: item.returnItemId,
                    returnedQuantity: qty,
                    restockedQuantity: qty, // Default to full quantity
                    maxQuantity: qty,
                    productId: item.productId,
                    condition: item.condition,
                    restockStatus: item.restockStatus,
                };
            });
    });

    const handleItemChange = (returnItemId: string, restockQuantity: number) => {
        setSelectedItems(
            selectedItems.map((item) =>
                item.returnItemId === returnItemId
                    ? { ...item, restockedQuantity: restockQuantity }
                    : item
            )
        );
    };

    const handleToggleItem = (returnItemId: string) => {
        const item = selectedItems.find((i) => i.returnItemId === returnItemId);
        if (item) {
            setSelectedItems(selectedItems.filter((i) => i.returnItemId !== returnItemId));
        } else {
            const originalItem = returnDetails.returnItems.find(
                (i) => i.returnItemId === returnItemId
            );
            if (originalItem && originalItem.restockStatus === 'pending') {
                const qty = parseQuantity(originalItem.returnedQuantity);
                setSelectedItems([
                    ...selectedItems,
                    {
                        returnItemId: originalItem.returnItemId,
                        returnedQuantity: qty,
                        restockedQuantity: qty,
                        maxQuantity: qty,
                        productId: originalItem.productId,
                        condition: originalItem.condition,
                        restockStatus: originalItem.restockStatus,
                    },
                ]);
            }
        }
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0) {
            Notify.warning('Please select at least one item to restock');
            return;
        }

        // Validate quantities
        const invalidItems = selectedItems.filter(
            (item) => item.restockedQuantity <= 0 || item.restockedQuantity > item.maxQuantity
        );
        if (invalidItems.length > 0) {
            Notify.warning('Please enter valid restock quantities for all items');
            return;
        }

        try {
            const data: RestockItemsRequest = {
                restockItems: selectedItems.map((item) => ({
                    returnItemId: item.returnItemId,
                    restockQuantity: item.restockedQuantity,
                })),
            };

            // Support both new API format (returnId) and legacy format (returnTransaction.transactionId)
            const returnTransactionId = returnDetails.returnId || returnDetails.returnTransaction?.transactionId;
            if (!returnTransactionId) {
                throw new Error('Return transaction ID not found');
            }
            await returnsService.restockItems(
                returnTransactionId,
                data
            );

            Notify.success('Items restocked successfully');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            Notify.failure(error?.message || 'Failed to restock items');
        }
    };

    const totalItemsToRestock = selectedItems.reduce(
        (sum, item) => sum + item.restockedQuantity,
        0
    );

    const pendingItems = returnDetails.returnItems.filter(
        (item) => item.restockStatus === 'pending'
    );

    if (pendingItems.length === 0) {
        return (
            <Modal
                title="Restock Items"
                isOpen={isOpen}
                onClose={onClose}
                size="sm"
            >
                <div className="p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        All items from this return have already been restocked or marked as damaged.
                    </p>
                    <Button onClick={onClose} className="mt-4">
                        Close
                    </Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            title="Restock Returned Items"
            isOpen={isOpen}
            onClose={onClose}
            size="full"
            className="max-w-4xl w-full mx-4 sm:mx-auto"
        >
            <div className="flex flex-col max-h-[80vh] sm:max-h-[75vh]">
                <div className="flex-1 overflow-y-auto px-1 sm:pr-2">
                    {/* Info Banner */}
                    <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <p className="text-xs sm:text-sm text-sky-800 dark:text-sky-200">
                            Select items to restock and specify quantity. Damaged or defective items cannot be restocked.
                        </p>
                    </div>

                    {/* Return Info */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="font-semibold mb-2 text-sm sm:text-base">Return Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    Return Transaction:
                                </span>
                                <span className="font-medium text-sm sm:ml-2 break-all">
                                    {returnDetails.returnNumber || returnDetails.returnTransaction?.refNumber}
                                </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                                    Original Transaction:
                                </span>
                                <span className="font-medium text-sm sm:ml-2 break-all">
                                    {returnDetails.originalSale?.saleNumber || returnDetails.originalTransaction?.refNumber}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="font-semibold text-sm sm:text-base">
                            Items Pending Restock ({pendingItems.length})
                        </h3>

                        {pendingItems.map((item) => {
                            const isSelected = selectedItems.some(
                                (i) => i.returnItemId === item.returnItemId
                            );
                            const selectedItem = selectedItems.find(
                                (i) => i.returnItemId === item.returnItemId
                            );

                            const canRestock =
                                item.condition === 'excellent' ||
                                item.condition === 'good' ||
                                item.condition === 'fair';

                            return (
                                <div
                                    key={item.returnItemId}
                                    className={`p-3 sm:p-4 border rounded-lg transition-all ${isSelected
                                        ? 'border-sky-500 dark:border-sky-400 bg-sky-50 dark:bg-sky-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                        } ${!canRestock ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                                        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleToggleItem(item.returnItemId)}
                                                disabled={!canRestock}
                                                className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 dark:border-gray-600 text-sky-500 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm sm:text-base truncate">{getProductName(item)}</h4>
                                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    <span>Returned: {parseQuantity(item.returnedQuantity)}</span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-xs ${item.condition === 'excellent'
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : item.condition === 'good'
                                                                ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
                                                                : item.condition === 'fair'
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {item.condition.charAt(0).toUpperCase() +
                                                            item.condition.slice(1)}
                                                    </span>
                                                </div>
                                                {item.notes && (
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 line-clamp-2">
                                                        {item.notes}
                                                    </p>
                                                )}
                                                {!canRestock && (
                                                    <p className="text-xs sm:text-sm text-red-500 dark:text-red-400 mt-1 sm:mt-2">
                                                        Cannot restock damaged or defective items
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && canRestock && (
                                        <div className="ml-6 sm:ml-8 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                                                Quantity to Restock
                                            </label>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.returnedQuantity}
                                                    value={selectedItem?.restockedQuantity || 1}
                                                    onChange={(e) =>
                                                        handleItemChange(
                                                            item.returnItemId,
                                                            parseInt(e.target.value) || 1
                                                        )
                                                    }
                                                    className="w-full sm:w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-sky-500 text-sm"
                                                />
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                                    of {item.returnedQuantity} available
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary */}
                    {selectedItems.length > 0 && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                                        Total Items Selected
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                                        {totalItemsToRestock}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-200">
                                        Products
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                                        {selectedItems.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6 pt-3 sm:pt-4 flex-shrink-0">
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                        <Button type="button" layout="outline" onClick={onClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={selectedItems.length === 0}
                            className="w-full sm:w-auto"
                        >
                            Restock {selectedItems.length > 0 ? `(${totalItemsToRestock})` : ''} Items
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default RestockItemsModal;
