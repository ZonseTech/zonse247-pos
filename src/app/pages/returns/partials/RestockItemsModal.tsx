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
    const [selectedItems, setSelectedItems] = useState<RestockItemForm[]>(() => {
        // Initialize with items that are pending restock and in good condition
        return returnDetails.returnItems
            .filter(
                (item) =>
                    item.restockStatus === 'pending' &&
                    (item.condition === 'excellent' || item.condition === 'good' || item.condition === 'fair')
            )
            .map((item) => ({
                returnItemId: item.returnItemId,
                returnedQuantity: item.returnedQuantity,
                restockedQuantity: item.returnedQuantity, // Default to full quantity
                maxQuantity: item.returnedQuantity,
                productId: item.productId,
                condition: item.condition,
                restockStatus: item.restockStatus,
            }));
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
                setSelectedItems([
                    ...selectedItems,
                    {
                        returnItemId: originalItem.returnItemId,
                        returnedQuantity: originalItem.returnedQuantity,
                        restockedQuantity: originalItem.returnedQuantity,
                        maxQuantity: originalItem.returnedQuantity,
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

            await returnsService.restockItems(
                returnDetails.returnTransaction.transactionId,
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
            className="max-w-4xl"
        >
            <div className="flex flex-col max-h-[75vh]">
                <div className="flex-1 overflow-y-auto pr-2">
                {/* Info Banner */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Select the items you want to restock and specify the quantity for each item.
                        Items marked as damaged or defective cannot be restocked.
                    </p>
                </div>

                {/* Return Info */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Return Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">
                                Return Transaction:
                            </span>
                            <span className="ml-2 font-medium">
                                {returnDetails.returnTransaction?.refNumber}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">
                                Original Transaction:
                            </span>
                            <span className="ml-2 font-medium">
                                {returnDetails.originalTransaction?.refNumber}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <h3 className="font-semibold">
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
                                className={`p-4 border rounded-lg transition-all ${
                                    isSelected
                                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-700'
                                } ${!canRestock ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleItem(item.returnItemId)}
                                            disabled={!canRestock}
                                            className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium">Product #{item.productId}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                <span>Returned: {item.returnedQuantity}</span>
                                                <span>•</span>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full ${
                                                        item.condition === 'excellent'
                                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            : item.condition === 'good'
                                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
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
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                    {item.notes}
                                                </p>
                                            )}
                                            {!canRestock && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                                    Cannot restock damaged or defective items
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isSelected && canRestock && (
                                    <div className="ml-8 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <label className="block text-sm font-medium mb-2">
                                            Quantity to Restock
                                        </label>
                                        <div className="flex items-center gap-3">
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
                                                className="w-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
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
                    <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Total Items Selected
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {totalItemsToRestock}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                                    Products
                                </p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {selectedItems.length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 flex-shrink-0">
                    <div className="flex justify-end space-x-3">
                        <Button type="button" layout="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={selectedItems.length === 0}
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
