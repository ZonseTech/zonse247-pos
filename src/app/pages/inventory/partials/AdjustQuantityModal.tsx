import React, { useState } from 'react';
import { Minus, Plus, Hash, Package } from 'lucide-react';
import { Button, Modal, ModalFooter } from '../../../components';
import { Input, Label } from '../../../components';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import type { AdjustInventoryPayload } from '../../../services/inventory.service';

interface AdjustQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem | null;
    onSuccess: () => void;
}

const AdjustQuantityModal: React.FC<AdjustQuantityModalProps> = ({
    isOpen,
    onClose,
    item,
    onSuccess
}) => {
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');

    const { adjustInventory, updateQuantity, isLoading } = useInventoryActions();

    const handleClose = () => {
        setAdjustmentType('add');
        setAdjustmentValue('');
        setAdjustmentReason('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!item) return;

        const value = parseInt(adjustmentValue);
        if (isNaN(value) || value < 0) return;

        try {
            if (adjustmentType === 'set') {
                // Use direct quantity update for 'set' operation
                await updateQuantity(item.productId, value);
            } else {
                // Use adjust endpoint for add/subtract
                const payload: AdjustInventoryPayload = {
                    adjustment: value,
                    type: adjustmentType,
                    reason: adjustmentReason || undefined
                };
                await adjustInventory(item.productId, payload);
            }

            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Failed to adjust quantity:', error);
        }
    };

    const currentQuantity = parseInt((item?.quantity || '0').toString());

    const getNewQuantity = () => {
        const value = parseInt(adjustmentValue) || 0;
        switch (adjustmentType) {
            case 'add':
                return currentQuantity + value;
            case 'subtract':
                return Math.max(0, currentQuantity - value);
            case 'set':
                return value;
            default:
                return currentQuantity;
        }
    };

    if (!isOpen || !item) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Adjust Inventory Quantity"
        >
            <div className="p-4 space-y-4">
                {/* Item Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Current Stock: <span className="font-semibold">{currentQuantity}</span>
                        </p>
                    </div>
                </div>

                {/* Adjustment Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Adjustment Type
                    </label>
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
                </div>

                {/* Quantity Input */}
                <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        value={adjustmentValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentValue(e.target.value)}
                        placeholder="Enter quantity"
                    />
                </div>

                {/* Reason Input */}
                <div>
                    <Label htmlFor="reason">Reason (optional)</Label>
                    <Input
                        id="reason"
                        name="reason"
                        value={adjustmentReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentReason(e.target.value)}
                        placeholder="e.g., Stock count adjustment, Damaged goods"
                    />
                </div>

                {/* Preview */}
                {adjustmentValue && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            New quantity will be: <span className="font-bold">{getNewQuantity()}</span>
                        </p>
                    </div>
                )}
            </div>

            <ModalFooter>
                <div className="flex justify-end gap-2 w-full">
                    <Button theme="neutral" layout="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!adjustmentValue || isLoading}
                        loading={isLoading}
                    >
                        Apply Adjustment
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default AdjustQuantityModal;
