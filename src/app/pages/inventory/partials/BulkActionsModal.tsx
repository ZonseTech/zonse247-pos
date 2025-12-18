import React, { useState, Fragment } from 'react';
import { X, Package, FolderInput, Edit3, Minus, Plus, Hash } from 'lucide-react';
import { Button, Modal, ModalFooter, Select, Label } from '../../../components';
import FormInput from '../../../components/FormInput';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
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
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Move {selectedItems.length} item(s) to a different category.
                        </p>
                        <div>
                            <Label>Select Category</Label>
                            <Select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="mt-1 p-3 form-select block w-full"
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
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Update status for {selectedItems.length} item(s).
                        </p>
                        <div>
                            <Label>Select Status</Label>
                            <Select
                                value={bulkStatus}
                                onChange={(e) => setBulkStatus(e.target.value)}
                                className="mt-1 p-3 form-select block w-full"
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
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Adjust quantity for {selectedItems.length} item(s).
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('add')}
                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'add'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <Plus className="w-4 h-4" />
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('subtract')}
                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'subtract'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <Minus className="w-4 h-4" />
                                Subtract
                            </button>
                            <button
                                type="button"
                                onClick={() => setAdjustmentType('set')}
                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'set'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                    }`}
                            >
                                <Hash className="w-4 h-4" />
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
                        />

                        <FormInput
                            label="Reason (optional)"
                            name="reason"
                            value={adjustmentReason}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentReason(e.target.value)}
                            placeholder="e.g., Stock count adjustment"
                        />
                    </div>
                );

            default:
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            onClick={() => setActionType('move-category')}
                            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center gap-2"
                        >
                            <FolderInput className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Move to Category</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Change category for selected items</span>
                        </button>

                        <button
                            onClick={() => setActionType('bulk-update')}
                            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all flex flex-col items-center gap-2"
                        >
                            <Edit3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Update Status</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Change status for selected items</span>
                        </button>

                        <button
                            onClick={() => setActionType('adjust-quantity')}
                            className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex flex-col items-center gap-2"
                        >
                            <Package className="w-8 h-8 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">Adjust Quantity</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Add, subtract, or set quantity</span>
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
                    >
                        Move Items
                    </Button>
                );
            case 'bulk-update':
                return (
                    <Button
                        theme="primary"
                        onClick={handleBulkUpdate}
                        disabled={!bulkStatus || isLoading}
                        loading={isLoading}
                    >
                        Update Items
                    </Button>
                );
            case 'adjust-quantity':
                return (
                    <Button
                        theme="primary"
                        onClick={handleAdjustQuantity}
                        disabled={!adjustmentValue || isLoading}
                        loading={isLoading}
                    >
                        Adjust Quantity
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
            title={`Bulk Actions (${selectedItems.length} items selected)`}
        >
            <div className="p-4">
                {renderActionContent()}
            </div>

            <ModalFooter>
                <div className="flex justify-between w-full">
                    <div>
                        {actionType && (
                            <Button
                                theme="neutral"
                                layout="outline"
                                onClick={() => setActionType(null)}
                            >
                                ← Back
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button theme="neutral" layout="outline" onClick={handleClose}>
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
