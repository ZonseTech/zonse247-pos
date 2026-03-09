import { useState, useEffect, FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, Hash, Package, X, ChevronDown, Check } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import { useInventoryActions } from '../../../hooks/useInventoryActions';
import type { AdjustInventoryPayload } from '../../../services/inventory.service';

interface AdjustQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ApiProduct | null;
    onSuccess: () => void;
}

const ADJUSTMENT_TYPES = [
    { type: 'add' as const, icon: Plus, label: 'Add', active: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    { type: 'subtract' as const, icon: Minus, label: 'Sub', active: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
    { type: 'set' as const, icon: Hash, label: 'Set', active: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' }
];

const AdjustQuantityModal: FC<AdjustQuantityModalProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isVariantDropdownOpen, setIsVariantDropdownOpen] = useState(false);

    const { adjustInventory, updateQuantity, isLoading } = useInventoryActions();

    const variants = useMemo(() => item?.variants || [], [item]);
    const hasMultipleVariants = variants.length > 1;

    const selectedVariant = useMemo(() => {
        if (!selectedVariantId) {
            return variants.find(v => v.isDefault) || variants[0];
        }
        return variants.find(v => v.id === selectedVariantId);
    }, [variants, selectedVariantId]);

    // Set default variant when item changes
    useEffect(() => {
        if (item && variants.length > 0) {
            const defaultVariant = variants.find(v => v.isDefault) || variants[0];
            setSelectedVariantId(defaultVariant?.id || null);
        }
    }, [item, variants]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const resetAndClose = () => {
        setAdjustmentType('add');
        setAdjustmentValue('');
        setAdjustmentReason('');
        setSelectedVariantId(null);
        setIsVariantDropdownOpen(false);
        onClose();
    };

    const handleSubmit = async () => {
        if (!item || !selectedVariant) return;
        const value = parseInt(adjustmentValue);
        if (isNaN(value) || value < 0) return;

        try {
            // Use variant ID for the API call
            const variantId = selectedVariant.id;

            if (adjustmentType === 'set') {
                await updateQuantity(variantId, value);
            } else {
                const payload: AdjustInventoryPayload = {
                    adjustment: value,
                    type: adjustmentType,
                    reason: adjustmentReason || undefined
                };
                await adjustInventory(variantId, payload);
            }
            onSuccess();
            resetAndClose();
        } catch (error) {
            console.error('Failed to adjust quantity:', error);
        }
    };

    if (!isOpen || !item) return null;

    const currentQuantity = selectedVariant?.inventory?.availableQuantity ?? 0;
    const value = parseInt(adjustmentValue) || 0;
    const newQuantity = adjustmentType === 'add'
        ? currentQuantity + value
        : adjustmentType === 'subtract'
            ? Math.max(0, currentQuantity - value)
            : value;

    const getVariantLabel = (variant: ProductVariant) => {
        const parts = [variant.variantName];
        if (variant.sku) parts.push(`SKU: ${variant.sku}`);
        return parts.join(' • ');
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && resetAndClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Adjust Quantity
                    </h2>
                    <button
                        onClick={resetAndClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                            <Package className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                            {!hasMultipleVariants && selectedVariant && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Current: <span className="font-semibold">{currentQuantity}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Variant Selector (only if multiple variants) */}
                    {hasMultipleVariants && (
                        <div>
                            <Label>Select Variant</Label>
                            <div className="relative mt-1.5">
                                <button
                                    type="button"
                                    onClick={() => setIsVariantDropdownOpen(!isVariantDropdownOpen)}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        {selectedVariant ? (
                                            <>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {selectedVariant.variantName}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Stock: {selectedVariant.inventory?.availableQuantity ?? 0}
                                                    {selectedVariant.sku && ` • SKU: ${selectedVariant.sku}`}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-500">Select a variant...</p>
                                        )}
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isVariantDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isVariantDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {variants.map((variant) => {
                                            const isSelected = selectedVariantId === variant.id;
                                            const qty = variant.inventory?.availableQuantity ?? 0;

                                            return (
                                                <button
                                                    key={variant.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedVariantId(variant.id);
                                                        setIsVariantDropdownOpen(false);
                                                    }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${isSelected ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                                                        }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-gray-900 dark:text-gray-100'
                                                            }`}>
                                                            {variant.variantName}
                                                            {variant.isDefault && (
                                                                <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Stock: {qty}
                                                            {variant.sku && ` • SKU: ${variant.sku}`}
                                                        </p>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Show current quantity for selected variant */}
                            {selectedVariant && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    Current quantity: <span className="font-semibold text-gray-900 dark:text-gray-100">{currentQuantity}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Adjustment Type */}
                    <div>
                        <Label>Adjustment Type</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1.5">
                            {ADJUSTMENT_TYPES.map(({ type, icon: Icon, label, active }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAdjustmentType(type)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 text-sm transition-colors ${adjustmentType === type ? active : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <Label>Quantity</Label>
                        <Input
                            type="number"
                            min="0"
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                            placeholder="Enter quantity"
                            className="mt-1.5 w-full"
                        />
                    </div>

                    {/* Reason Input */}
                    <div>
                        <Label>Reason (optional)</Label>
                        <Input
                            type="text"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            placeholder="e.g., Stock count adjustment"
                            className="mt-1.5 w-full"
                        />
                    </div>

                    {/* Preview */}
                    {adjustmentValue && selectedVariant && (
                        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                            <p className="text-sm text-sky-800 dark:text-sky-200">
                                {hasMultipleVariants && (
                                    <span className="font-medium">{selectedVariant.variantName}: </span>
                                )}
                                New quantity: <span className="font-bold">{newQuantity}</span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <Button theme="neutral" layout="outline" onClick={resetAndClose}>
                        Cancel
                    </Button>
                    <Button
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!adjustmentValue || !selectedVariant || isLoading}
                        loading={isLoading}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AdjustQuantityModal;
