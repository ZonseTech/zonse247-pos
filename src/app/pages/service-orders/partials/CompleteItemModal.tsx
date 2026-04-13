import { FC, useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Theme, ScrollArea, Text, Flex } from '@radix-ui/themes';
import { CheckCircle, Plus, Trash2, Package, X } from 'lucide-react';
import { Button } from '../../../components';
import ProductVariantPicker, {
    SelectedVariant,
} from '../../stock-movements/partials/ProductVariantPicker';
import { formatCurrency } from '../../../utils';

interface ConsumptionRow {
    variant: SelectedVariant;
    quantity: number;
}

interface CompleteItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    onConfirm: (consumptions: ConsumptionInput[]) => void;
    busy?: boolean;
}

const CompleteItemModal: FC<CompleteItemModalProps> = ({
    open,
    onOpenChange,
    itemName,
    onConfirm,
    busy = false,
}) => {
    const [rows, setRows] = useState<ConsumptionRow[]>([]);
    const [pickerKey, setPickerKey] = useState(0);

    const handleAddRow = useCallback((variant: SelectedVariant | null) => {
        if (!variant) return;
        // Don't add duplicates
        if (rows.some((r) => r.variant.id === variant.id)) return;
        setRows((prev) => [...prev, { variant, quantity: 1 }]);
        setPickerKey((k) => k + 1);
    }, [rows]);

    const handleRemoveRow = useCallback((variantId: string) => {
        setRows((prev) => prev.filter((r) => r.variant.id !== variantId));
    }, []);

    const handleQtyChange = useCallback((variantId: string, qty: number) => {
        setRows((prev) =>
            prev.map((r) =>
                r.variant.id === variantId ? { ...r, quantity: Math.max(1, qty) } : r,
            ),
        );
    }, []);

    const handleConfirm = useCallback(() => {
        const consumptions: ConsumptionInput[] = rows.map((r) => ({
            productVariantId: r.variant.id,
            quantity: r.quantity,
        }));
        onConfirm(consumptions);
        setRows([]);
    }, [rows, onConfirm]);

    const handleOpenChange = useCallback(
        (value: boolean) => {
            if (!value) setRows([]);
            onOpenChange(value);
        },
        [onOpenChange],
    );

    const totalCost = rows.reduce(
        (sum, r) => sum + r.variant.averageCost * r.quantity,
        0,
    );

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                    <Dialog.Content
                        className="fixed z-50 bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden
                                   bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
                                   sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                                   sm:rounded-2xl sm:w-[calc(100%-2rem)] sm:max-w-xl sm:max-h-[85vh]
                                   data-[state=open]:animate-in data-[state=closed]:animate-out
                                   data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                                   data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
                                   data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95
                                   duration-200"
                    >
                        {/* Mobile drag handle */}
                        <div className="flex justify-center sm:hidden pt-2">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <Dialog.Title className="text-base font-semibold text-gray-900 dark:text-white">
                                        Complete Item
                                    </Dialog.Title>
                                    <Dialog.Description className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {itemName}
                                    </Dialog.Description>
                                </div>
                            </div>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </div>

                        {/* Body */}
                        <ScrollArea type="auto" scrollbars="vertical" style={{ flex: 1 }}>
                            <div className="p-5 space-y-4">
                                {/* Info */}
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Add any materials or consumable products used for this service.
                                    Stock will be automatically deducted.
                                </p>

                                {/* Variant picker */}
                                <ProductVariantPicker
                                    key={pickerKey}
                                    selected={null}
                                    onSelect={handleAddRow}
                                    label="Add Consumable"
                                    placeholder="Search product by name or SKU…"
                                />

                                {/* Rows */}
                                {rows.length > 0 && (
                                    <div className="space-y-2">
                                        <Text size="1" weight="medium" className="text-gray-500 dark:text-gray-400">
                                            Consumables ({rows.length})
                                        </Text>
                                        {rows.map((row) => (
                                            <div
                                                key={row.variant.id}
                                                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg"
                                            >
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                                                    <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {row.variant.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {row.variant.variantName}
                                                        {row.variant.sku && ` · ${row.variant.sku}`}
                                                        {' · Stock: '}
                                                        <span className={row.variant.availableQuantity < row.quantity ? 'text-red-500 font-medium' : ''}>
                                                            {row.variant.availableQuantity}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={row.variant.availableQuantity}
                                                        value={row.quantity}
                                                        onChange={(e) =>
                                                            handleQtyChange(row.variant.id, parseInt(e.target.value) || 1)
                                                        }
                                                        className="w-16 text-center text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white py-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(row.variant.id)}
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Estimated cost */}
                                        <div className="flex justify-between items-center pt-2 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Est. material cost</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(totalCost)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {rows.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500">
                                        <Package className="w-10 h-10 mb-2 opacity-50" />
                                        <p className="text-sm">No consumables added</p>
                                        <p className="text-xs mt-0.5">You can skip this if no materials were used</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Footer */}
                        <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex gap-3">
                                <Dialog.Close asChild>
                                    <Button type="button" layout="outline" theme="neutral" className="flex-1">
                                        Cancel
                                    </Button>
                                </Dialog.Close>
                                <Button
                                    type="button"
                                    theme="success"
                                    disabled={busy}
                                    onClick={handleConfirm}
                                    className="flex-[2]"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    {rows.length > 0
                                        ? `Complete with ${rows.length} consumable${rows.length > 1 ? 's' : ''}`
                                        : 'Complete without consumables'}
                                </Button>
                            </div>
                        </div>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default CompleteItemModal;
