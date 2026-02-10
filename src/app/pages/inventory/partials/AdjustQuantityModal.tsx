import React, { useState } from 'react';
import { Minus, Plus, Hash, Package } from 'lucide-react';
import { Button, Modal, ModalFooter } from '../../../components';
import { Input, Label } from '../../../components';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import { useIsEBN } from '../../../hooks/useMediaQuery';
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
    const isEBN = useIsEBN();

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
            className={isEBN ? "max-w-md" : ""}
        >
            <div className={isEBN ? "p-2 space-y-2" : "p-4 space-y-4"}>
                {/* Item Info */}
                <div className={isEBN
                    ? "flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    : "flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                }>
                    <div className={isEBN
                        ? "p-1.5 bg-sky-100 dark:bg-sky-900/30 rounded"
                        : "p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg"
                    }>
                        <Package className={isEBN ? "w-4 h-4 text-sky-500 dark:text-sky-400" : "w-5 h-5 text-sky-500 dark:text-sky-400"} />
                    </div>
                    <div>
                        <p className={isEBN
                            ? "text-xs font-medium text-gray-900 dark:text-gray-100"
                            : "font-medium text-gray-900 dark:text-gray-100"
                        }>{item.name}</p>
                        <p className={isEBN
                            ? "text-[10px] text-gray-500 dark:text-gray-400"
                            : "text-sm text-gray-500 dark:text-gray-400"
                        }>
                            Current Stock: <span className="font-semibold">{currentQuantity}</span>
                        </p>
                    </div>
                </div>

                {/* Adjustment Type */}
                <div>
                    <label className={isEBN
                        ? "block text-[10px] font-medium text-gray-700 dark:text-gray-300 mb-1"
                        : "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    }>
                        Adjustment Type
                    </label>
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
                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`
                                : `flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors ${adjustmentType === 'set'
                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                }`
                            }
                        >
                            <Hash className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                            Set
                        </button>
                    </div>
                </div>

                {/* Quantity Input */}
                <div>
                    <Label htmlFor="quantity" className={isEBN ? "text-[10px]" : ""}>Quantity</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="0"
                        value={adjustmentValue}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentValue(e.target.value)}
                        placeholder="Enter quantity"
                        className={isEBN ? "h-7 text-xs" : ""}
                    />
                </div>

                {/* Reason Input */}
                <div>
                    <Label htmlFor="reason" className={isEBN ? "text-[10px]" : ""}>Reason (optional)</Label>
                    <Input
                        id="reason"
                        name="reason"
                        value={adjustmentReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdjustmentReason(e.target.value)}
                        placeholder={isEBN ? "Reason" : "e.g., Stock count adjustment, Damaged goods"}
                        className={isEBN ? "h-7 text-xs" : ""}
                    />
                </div>

                {/* Preview */}
                {adjustmentValue && (
                    <div className={isEBN
                        ? "p-2 bg-sky-50 dark:bg-sky-900/20 rounded border border-sky-200 dark:border-sky-800"
                        : "p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800"
                    }>
                        <p className={isEBN
                            ? "text-[10px] text-sky-800 dark:text-sky-200"
                            : "text-sm text-sky-800 dark:text-sky-200"
                        }>
                            New quantity will be: <span className="font-bold">{getNewQuantity()}</span>
                        </p>
                    </div>
                )}
            </div>

            <ModalFooter className={isEBN ? "py-2 px-2" : ""}>
                <div className={isEBN ? "flex justify-end gap-1 w-full" : "flex justify-end gap-2 w-full"}>
                    <Button theme="neutral" layout="outline" onClick={handleClose} size={isEBN ? "small" : "regular"}>
                        Cancel
                    </Button>
                    <Button
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!adjustmentValue || isLoading}
                        loading={isLoading}
                        size={isEBN ? "small" : "regular"}
                    >
                        Apply
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default AdjustQuantityModal;
