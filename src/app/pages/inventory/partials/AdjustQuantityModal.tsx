import { useState, useEffect, FC, useMemo } from 'react';
import { Dialog, Select, Flex, Grid, Text, TextField, IconButton } from '@radix-ui/themes';
import { Minus, Plus, ClipboardCheck, Package, X, ArrowRight } from 'lucide-react';
import { Notify } from 'notiflix';
import { Button } from '../../../components';
import stockMovementService from '../../../services/stock-movement.service';
import { getErrorMessage } from '../../../utils/api-error-handler';
import { buildStockCountNote, buildStockRemovalNote } from '../../../utils/stock-movement.helper';

interface AdjustQuantityModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ApiProduct | null;
    onSuccess: () => void;
}

const ADJUSTMENT_TYPES = [
    { type: 'add' as const, icon: Plus, label: 'Add Stock', hint: 'Found stock, received items', active: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
    { type: 'subtract' as const, icon: Minus, label: 'Remove', hint: 'Loss, theft, breakage', active: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
    { type: 'set' as const, icon: ClipboardCheck, label: 'Stock Count', hint: 'Set to actual count', active: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400' }
];

const AdjustQuantityModal: FC<AdjustQuantityModalProps> = ({ isOpen, onClose, item, onSuccess }) => {
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
    const [adjustmentValue, setAdjustmentValue] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const variants = useMemo(() => item?.variants || [], [item]);
    const hasMultipleVariants = variants.length > 1;

    const selectedVariant = useMemo(() => {
        if (!selectedVariantId) {
            return variants.find(v => v.isDefault) || variants[0];
        }
        return variants.find(v => v.id === selectedVariantId);
    }, [variants, selectedVariantId]);

    useEffect(() => {
        if (item && variants.length > 0) {
            const defaultVariant = variants.find(v => v.isDefault) || variants[0];
            setSelectedVariantId(defaultVariant?.id || null);
        }
    }, [item, variants]);

    const resetAndClose = () => {
        setAdjustmentType('add');
        setAdjustmentValue('');
        setAdjustmentReason('');
        setSelectedVariantId(null);
        onClose();
    };

    const handleSubmit = async () => {
        if (!item || !selectedVariant) return;
        const value = parseInt(adjustmentValue);
        if (isNaN(value) || value < 0) return;
        // Reason is required for add/subtract (audit trail)
        if (adjustmentType !== 'set' && !adjustmentReason.trim()) return;

        setIsLoading(true);
        try {
            const invId = selectedVariant.inventory?.inventoryId;
            if (!invId) {
                Notify.failure('No inventory record found for this variant. Try selling or restocking it first.');
                setIsLoading(false);
                return;
            }

            if (adjustmentType === 'set') {
                // Use stock-count endpoint — backend computes variance and creates a movement
                await stockMovementService.performStockCount({
                    inventoryId: invId,
                    actualQuantity: value,
                    notes: buildStockCountNote(value, adjustmentReason),
                });
            } else {
                // Use stock-adjustment endpoint — quantity sign determines direction
                const signedQty = adjustmentType === 'add' ? value : -value;
                await stockMovementService.adjustStock({
                    inventoryId: invId,
                    quantity: signedQty,
                    notes: adjustmentType === 'subtract'
                        ? buildStockRemovalNote(adjustmentReason)
                        : adjustmentReason || 'Manual adjustment from inventory page',
                });
            }
            const actionText = adjustmentType === 'add' ? 'added' : adjustmentType === 'subtract' ? 'subtracted' : 'set';
            Notify.success(`Quantity ${actionText} successfully`);
            onSuccess();
            resetAndClose();
        } catch (error: any) {
            const msg = getErrorMessage(error, 'Failed to adjust quantity');
            Notify.failure(msg);
        } finally {
            setIsLoading(false);
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
    const change = newQuantity - currentQuantity;
    const isReasonRequired = adjustmentType !== 'set';
    const isValid = !!adjustmentValue && !!selectedVariant && value >= 0
        && (!isReasonRequired || adjustmentReason.trim().length > 0);

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <Dialog.Content maxWidth="420px">
                {/* Header */}
                <Flex justify="between" align="start" mb="4">
                    <Dialog.Title mb="0">Adjust Stock</Dialog.Title>
                    <Dialog.Close>
                        <IconButton type="button" variant="ghost" color="gray" size="1" aria-label="Close">
                            <X className="w-5 h-5" />
                        </IconButton>
                    </Dialog.Close>
                </Flex>
                <Dialog.Description size="2" color="gray" mb="4">
                    Creates an audited stock movement record
                </Dialog.Description>

                {/* Content */}
                <Flex direction="column" gap="4">
                    {/* Product Info */}
                    <Flex align="center" gap="3" p="3" className="bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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
                    </Flex>

                    {/* Variant Selector (only if multiple variants) */}
                    {hasMultipleVariants && (
                        <div>
                            <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                Select Variant
                            </Text>
                            <Select.Root
                                value={selectedVariantId ?? undefined}
                                onValueChange={(value) => setSelectedVariantId(value)}
                            >
                                <Select.Trigger variant="surface" placeholder="Select a variant..." className="w-full mt-1.5" />
                                <Select.Content position="popper">
                                    {variants.map((variant) => {
                                        const qty = variant.inventory?.availableQuantity ?? 0;
                                        return (
                                            <Select.Item key={variant.id} value={variant.id}>
                                                <Flex direction="column">
                                                    <Text size="2">
                                                        {variant.variantName}
                                                        {variant.isDefault && (
                                                            <Text size="1" color="gray"> (Default)</Text>
                                                        )}
                                                    </Text>
                                                    <Text size="1" color="gray">
                                                        Stock: {qty}{variant.sku && ` • SKU: ${variant.sku}`}
                                                    </Text>
                                                </Flex>
                                            </Select.Item>
                                        );
                                    })}
                                </Select.Content>
                            </Select.Root>

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
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            Movement Type
                        </Text>
                        <Grid columns="3" gap="2" mt="1">
                            {ADJUSTMENT_TYPES.map(({ type, icon: Icon, label, hint, active }) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setAdjustmentType(type)}
                                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 transition-colors ${adjustmentType === type ? active : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{label}</span>
                                    </div>
                                    <span className="text-[9px] opacity-60 leading-tight text-center px-1">{hint}</span>
                                </button>
                            ))}
                        </Grid>
                    </div>

                    {/* Quantity Input */}
                    <div>
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            {adjustmentType === 'set' ? 'Actual Quantity on Hand' : 'Quantity'}
                        </Text>
                        <TextField.Root
                            type="number"
                            min="0"
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                            placeholder={adjustmentType === 'set' ? 'Enter counted quantity' : 'Enter quantity'}
                            className="mt-1.5 w-full"
                        />
                    </div>

                    {/* Reason Input */}
                    <div>
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            Reason {isReasonRequired ? <Text color="red">*</Text> : '(optional)'}
                        </Text>
                        <TextField.Root
                            type="text"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            placeholder={adjustmentType === 'add' ? 'e.g., Found stock, received donation'
                                : adjustmentType === 'subtract' ? 'e.g., Theft, breakage, expired'
                                    : 'e.g., Physical stock count'}
                            className="mt-1.5 w-full"
                        />
                    </div>

                    {/* Preview */}
                    {adjustmentValue && selectedVariant && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Current</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{currentQuantity}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400" />
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">New</p>
                                    <p className={`text-lg font-bold ${change > 0 ? 'text-green-600 dark:text-green-400'
                                        : change < 0 ? 'text-red-600 dark:text-red-400'
                                            : 'text-sky-600 dark:text-sky-400'
                                        }`}>
                                        {newQuantity}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Change</p>
                                    <p className={`text-lg font-bold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {change >= 0 ? '+' : ''}{change}
                                    </p>
                                </div>
                            </div>
                            {hasMultipleVariants && (
                                <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                                    Variant: {selectedVariant.variantName}
                                </p>
                            )}
                        </div>
                    )}
                </Flex>

                {/* Footer */}
                <Flex justify="end" gap="2" mt="4">
                    <Button theme="neutral" layout="outline" onClick={resetAndClose}>
                        Cancel
                    </Button>
                    <Button
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!isValid || isLoading}
                        loading={isLoading}
                    >
                        {adjustmentType === 'set' ? 'Record Count' : 'Apply Adjustment'}
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default AdjustQuantityModal;
