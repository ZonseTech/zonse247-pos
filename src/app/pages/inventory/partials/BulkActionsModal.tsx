import React, { useState, Fragment } from 'react';
import { X, Package, FolderInput, Edit3, Minus, Plus, Hash } from 'lucide-react';
import { Button, Modal, ModalFooter, Select, Label } from '../../../components';
import FormInput from '../../../components/FormInput';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import { useIsEBN } from '../../../hooks/useMediaQuery';
import type { AdjustInventoryPayload } from '../../../services/inventory.service';

interface BulkActionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItems: InventoryItem[];
    categories: Category[];
    onSuccess: () => void;
}

type ActionType = 'move-category' | 'bulk-update' | 'adjust-quantity';

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({
    isOpen,
    onClose,
    selectedItems,
    categories,
    onSuccess
}) => {
    const isEBN = useIsEBN();
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [bulkStatus, setBulkStatus] = useState('');

    const { moveToCategory, bulkUpdate, adjustInventory, isLoading } = useInventoryActions();

    const handleClose = () => {
        setActionType(null);
        setSelectedCategoryId('');
        setAdjustmentType('add');
        setAdjustmentValue('');
        setAdjustmentReason('');
        setBulkStatus('');
        onClose();
    };

    const handleMoveToCategory = async () => {
        if (!selectedCategoryId) return;

        try {
            await moveToCategory({
                itemIds: selectedItems.map(item => item.productId),
                categoryId: selectedCategoryId
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to move items:', error);
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus) return;

        try {
            await bulkUpdate({
                itemIds: selectedItems.map(item => item.productId),
                updates: { status: bulkStatus }
            });
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to bulk update:', error);
        }
    };

    const handleAdjustQuantity = async () => {
        const value = parseInt(adjustmentValue);
        if (isNaN(value) || value < 0) return;

        try {
            const payload: AdjustInventoryPayload = {
                adjustment: value,
                type: adjustmentType,
                reason: adjustmentReason || undefined
            };

            // Adjust each item sequentially
            for (const item of selectedItems) {
                await adjustInventory(item.productId, payload);
            }

            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to adjust quantities:', error);
        }
    };

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Discontinued', value: 'discontinued' },
        { label: 'Out of Stock', value: 'out_of_stock' }
    ];

    const renderActionContent = () => {
        switch (actionType) {
            case 'move-category':
                return (
                    <div className={isEBN ? "space-y-2" : "space-y-4"}>
                        <p className={isEBN
                            ? "text-[10px] text-gray-600 dark:text-gray-400"
                            : "text-sm text-gray-600 dark:text-gray-400"
                        }>
                            Move {selectedItems.length} item(s) to a different category.
                        </p>
                        <div>
                            <Label className={isEBN ? "text-[10px]" : ""}>Select Category</Label>
                            <Select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className={isEBN
                                    ? "mt-1 p-2 form-select block w-full text-xs"
                                    : "mt-1 p-3 form-select block w-full"
                                }
                            >
                                <option value="">Select category...</option>
                                {categories.map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId?.toString()}>
                                        {cat.name as string}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                );

            case 'bulk-update':
                return (
                    <div className={isEBN ? "space-y-2" : "space-y-4"}>
                        <p className={isEBN
                            ? "text-[10px] text-gray-600 dark:text-gray-400"
                            : "text-sm text-gray-600 dark:text-gray-400"
                        }>
                            Update status for {selectedItems.length} item(s).
                        </p>
                        <div>
                            <Label className={isEBN ? "text-[10px]" : ""}>Select Status</Label>
                            <Select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className={isEBN
                                    ? "mt-1 p-2 form-select block w-full text-xs"
                                    : "mt-1 p-3 form-select block w-full"
                                }
                            >
                                <option value="">Select status...</option>
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </Select>
                        </div>
                    </div>
                );

            case 'adjust-quantity':
                return (
                    <div className={isEBN ? "space-y-2" : "space-y-4"}>
                        <p className={isEBN
                            ? "text-[10px] text-gray-600 dark:text-gray-400"
                            : "text-sm text-gray-600 dark:text-gray-400"
                        }>
                            Adjust quantity for {selectedItems.length} item(s).
                        </p>

                        <div className={isEBN ? "flex gap-1" : "flex gap-2"}>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('add')}
                                className={isEBN
                                    ? `flex-1 p-2 rounded border-2 flex items-center justify-center gap-1 transition-colors text-xs ${adjustmentType === 'add'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                    : `flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'add'
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                }
                            >
                                <Plus className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('subtract')}
                                className={isEBN
                                    ? `flex-1 p-2 rounded border-2 flex items-center justify-center gap-1 transition-colors text-xs ${adjustmentType === 'subtract'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                    : `flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'subtract'
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                }
                            >
                                <Minus className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                Sub
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('set')}
                                className={isEBN
                                    ? `flex-1 p-2 rounded border-2 flex items-center justify-center gap-1 transition-colors text-xs ${adjustmentType === 'set'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                    : `flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'set'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`
                                }
                            >
                                <Hash className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                Set
                            </button>
                        </div>

                        <FormInput
                            label="Quantity"
                            name="quantity"
                            type="number"
                            min="0"
                            value={adjustmentValue}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentValue(e.target.value)}
                            placeholder="Enter quantity"
                            className={isEBN ? "h-7 text-xs" : ""}
                        />

                        <FormInput
                            label="Reason (optional)"
                            name="reason"
                            value={adjustmentReason}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentReason(e.target.value)}
                            placeholder={isEBN ? "Reason" : "e.g., Stock count adjustment"}
                            className={isEBN ? "h-7 text-xs" : ""}
                        />
                    </div>
                );

            default:
                return (
                    <div className={isEBN
                        ? "grid grid-cols-3 gap-2"
                        : "grid grid-cols-1 sm:grid-cols-3 gap-3"
                    }>
                        <button
                            onClick={() => setActionType('move-category')}
                            className={isEBN
                                ? "p-2 rounded border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center gap-1"
                                : "p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center gap-2"
                            }
                        >
                            <FolderInput className={isEBN ? "w-5 h-5 text-blue-600 dark:text-blue-400" : "w-8 h-8 text-blue-600 dark:text-blue-400"} />
                            <span className={isEBN
                                ? "text-[10px] font-medium text-gray-900 dark:text-gray-100"
                                : "font-medium text-gray-900 dark:text-gray-100"
                            }>Move Category</span>
                            {!isEBN && <span className="text-xs text-gray-500 dark:text-gray-400">Change category for selected items</span>}
                        </button>

                        <button
                            onClick={() => setActionType('bulk-update')}
                            className={isEBN
                                ? "p-2 rounded border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex flex-col items-center gap-1"
                                : "p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex flex-col items-center gap-2"
                            }
                        >
                            <Edit3 className={isEBN ? "w-5 h-5 text-purple-600 dark:text-purple-400" : "w-8 h-8 text-purple-600 dark:text-purple-400"} />
                            <span className={isEBN
                                ? "text-[10px] font-medium text-gray-900 dark:text-gray-100"
                                : "font-medium text-gray-900 dark:text-gray-100"
                            }>Update Status</span>
                            {!isEBN && <span className="text-xs text-gray-500 dark:text-gray-400">Change status for selected items</span>}
                        </button>

                        <button
                            onClick={() => setActionType('adjust-quantity')}
                            className={isEBN
                                ? "p-2 rounded border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex flex-col items-center gap-1"
                                : "p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex flex-col items-center gap-2"
                            }
                        >
                            <Package className={isEBN ? "w-5 h-5 text-green-600 dark:text-green-400" : "w-8 h-8 text-green-600 dark:text-green-400"} />
                            <span className={isEBN
                                ? "text-[10px] font-medium text-gray-900 dark:text-gray-100"
                                : "font-medium text-gray-900 dark:text-gray-100"
                            }>Adjust Qty</span>
                            {!isEBN && <span className="text-xs text-gray-500 dark:text-gray-400">Add, subtract, or set quantity</span>}
                        </button>
                    </div>
                );
        }
    };

    const getActionButton = () => {
        switch (actionType) {
            case 'move-category':
                return (
                    <Button
                        theme="primary"
                        onClick={handleMoveToCategory}
                        disabled={!selectedCategoryId || isLoading}
                        loading={isLoading}
                        size={isEBN ? "small" : "regular"}
                    >
                        Move
                    </Button>
                );
            case 'bulk-update':
                return (
                    <Button
                        theme="primary"
                        onClick={handleBulkUpdate}
                        disabled={!bulkStatus || isLoading}
                        loading={isLoading}
                        size={isEBN ? "small" : "regular"}
                    >
                        Update
                    </Button>
                );
            case 'adjust-quantity':
                return (
                    <Button
                        theme="primary"
                        onClick={handleAdjustQuantity}
                        disabled={!adjustmentValue || isLoading}
                        loading={isLoading}
                        size={isEBN ? "small" : "regular"}
                    >
                        Adjust
                    </Button>
                );
            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEBN
                ? `Bulk Actions (${selectedItems.length})`
                : `Bulk Actions (${selectedItems.length} items selected)`
            }
            className={isEBN ? "max-w-md" : ""}
        >
            <div className={isEBN ? "p-2" : "p-4"}>
                {renderActionContent()}
            </div>

            <ModalFooter className={isEBN ? "py-2 px-2" : ""}>
                <div className={isEBN ? "flex justify-between w-full gap-1" : "flex justify-between w-full"}>
                    <div>
                        {actionType && (
                            <Button
                                theme="neutral"
                                layout="outline"
                                onClick={() => setActionType(null)}
                                size={isEBN ? "small" : "regular"}
                            >
                                ← Back
                            </Button>
                        )}
                    </div>
                    <div className={isEBN ? "flex gap-1" : "flex gap-2"}>
                        <Button theme="neutral" layout="outline" onClick={handleClose} size={isEBN ? "small" : "regular"}>
                            Cancel
                        </Button>
                        {getActionButton()}
                    </div>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default BulkActionsModal;
