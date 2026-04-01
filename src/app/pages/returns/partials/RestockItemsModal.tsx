import { FunctionComponent, useState, useCallback, useMemo } from 'react';
import { Notify } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import {
    X, Package, PackageCheck, AlertTriangle, CheckCircle, Minus, Plus, Info,
} from 'lucide-react';
import { Button, Flex, Text, Box, ScrollArea, Theme, IconButton } from '@radix-ui/themes';
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

const CONDITION_STYLES: Record<ReturnCondition, { bg: string; text: string }> = {
    excellent: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
    good: { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300' },
    fair: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300' },
    damaged: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300' },
    defective: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300' },
};

const RESTOCKABLE_CONDITIONS: ReturnCondition[] = ['excellent', 'good', 'fair'];

const parseQuantity = (val: number | string): number =>
    typeof val === 'string' ? parseInt(val, 10) || 0 : val;

const RestockItemsModal: FunctionComponent<RestockItemsModalProps> = ({
    isOpen,
    onClose,
    returnDetails,
    onSuccess,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getProductName = useCallback((item: ReturnItem): string => {
        if (item.product?.name) return item.product.name;
        const originalSale = returnDetails.originalSale;
        if (originalSale?.items) {
            const saleItem = (originalSale.items as any[]).find(
                (si: any) => si.id === item.originalOrderId || si.productId === item.productId
            );
            if (saleItem?.product?.name) return saleItem.product.name;
        }
        return `Product #${item.productId.slice(0, 8)}`;
    }, [returnDetails]);

    const pendingItems = useMemo(
        () => returnDetails.returnItems.filter((item) => item.restockStatus === 'pending'),
        [returnDetails.returnItems],
    );

    const [selectedItems, setSelectedItems] = useState<RestockItemForm[]>(() =>
        pendingItems
            .filter((item) => RESTOCKABLE_CONDITIONS.includes(item.condition))
            .map((item) => {
                const qty = parseQuantity(item.returnedQuantity);
                return {
                    returnItemId: item.returnItemId,
                    returnedQuantity: qty,
                    restockedQuantity: qty,
                    maxQuantity: qty,
                    productId: item.productId,
                    condition: item.condition,
                    restockStatus: item.restockStatus,
                };
            }),
    );

    const isSelected = useCallback(
        (id: string) => selectedItems.some((i) => i.returnItemId === id),
        [selectedItems],
    );

    const getSelected = useCallback(
        (id: string) => selectedItems.find((i) => i.returnItemId === id),
        [selectedItems],
    );

    const handleToggleItem = useCallback((returnItemId: string) => {
        setSelectedItems((prev) => {
            if (prev.some((i) => i.returnItemId === returnItemId)) {
                return prev.filter((i) => i.returnItemId !== returnItemId);
            }
            const originalItem = pendingItems.find((i) => i.returnItemId === returnItemId);
            if (!originalItem || !RESTOCKABLE_CONDITIONS.includes(originalItem.condition)) return prev;
            const qty = parseQuantity(originalItem.returnedQuantity);
            return [
                ...prev,
                {
                    returnItemId: originalItem.returnItemId,
                    returnedQuantity: qty,
                    restockedQuantity: qty,
                    maxQuantity: qty,
                    productId: originalItem.productId,
                    condition: originalItem.condition,
                    restockStatus: originalItem.restockStatus,
                },
            ];
        });
    }, [pendingItems]);

    const handleQuantityChange = useCallback((returnItemId: string, delta: number) => {
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.returnItemId !== returnItemId) return item;
                const next = Math.max(1, Math.min(item.maxQuantity, item.restockedQuantity + delta));
                return { ...item, restockedQuantity: next };
            }),
        );
    }, []);

    const handleQuantityInput = useCallback((returnItemId: string, value: string) => {
        const num = parseInt(value, 10);
        if (isNaN(num)) return;
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.returnItemId !== returnItemId) return item;
                const clamped = Math.max(1, Math.min(item.maxQuantity, num));
                return { ...item, restockedQuantity: clamped };
            }),
        );
    }, []);

    const handleSelectAll = useCallback(() => {
        const restockable = pendingItems.filter((item) => RESTOCKABLE_CONDITIONS.includes(item.condition));
        const allSelected = restockable.every((item) => isSelected(item.returnItemId));
        if (allSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(
                restockable.map((item) => {
                    const qty = parseQuantity(item.returnedQuantity);
                    return {
                        returnItemId: item.returnItemId,
                        returnedQuantity: qty,
                        restockedQuantity: qty,
                        maxQuantity: qty,
                        productId: item.productId,
                        condition: item.condition,
                        restockStatus: item.restockStatus,
                    };
                }),
            );
        }
    }, [pendingItems, isSelected]);

    const totalUnits = useMemo(
        () => selectedItems.reduce((sum, item) => sum + item.restockedQuantity, 0),
        [selectedItems],
    );

    const restockableCount = useMemo(
        () => pendingItems.filter((item) => RESTOCKABLE_CONDITIONS.includes(item.condition)).length,
        [pendingItems],
    );

    const allRestockableSelected = restockableCount > 0 && selectedItems.length === restockableCount;

    const handleSubmit = useCallback(async () => {
        if (selectedItems.length === 0) {
            Notify.warning('Please select at least one item to restock');
            return;
        }

        const invalidItems = selectedItems.filter(
            (item) => item.restockedQuantity <= 0 || item.restockedQuantity > item.maxQuantity,
        );
        if (invalidItems.length > 0) {
            Notify.warning('Please enter valid restock quantities for all items');
            return;
        }

        setIsSubmitting(true);
        try {
            const data: RestockItemsRequest = {
                restockItems: selectedItems.map((item) => ({
                    returnItemId: item.returnItemId,
                    restockQuantity: item.restockedQuantity,
                })),
            };

            const returnTransactionId = returnDetails.returnId || returnDetails.returnTransaction?.transactionId;
            if (!returnTransactionId) {
                throw new Error('Return transaction ID not found');
            }

            await returnsService.restockItems(returnTransactionId, data);
            Notify.success('Items restocked successfully');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            Notify.failure(error?.message || 'Failed to restock items');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedItems, returnDetails, onSuccess, onClose]);

    const returnRef = returnDetails.returnNumber || returnDetails.returnTransaction?.refNumber || '';
    const originalRef = returnDetails.originalSale?.saleNumber || returnDetails.originalTransaction?.refNumber || '';

    // Empty state: no pending items
    if (pendingItems.length === 0) {
        return (
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Portal>
                    <Theme appearance="inherit" accentColor="cyan">
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                            <div className="py-4 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                                    <PackageCheck className="h-7 w-7 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <Dialog.Title asChild>
                                    <Text as="p" size="3" weight="bold" className="text-gray-900 dark:text-gray-100 mb-1">
                                        All Items Processed
                                    </Text>
                                </Dialog.Title>
                                <Text as="p" size="2" className="text-gray-500 dark:text-gray-400 mb-6">
                                    Every item from this return has been restocked or marked as damaged.
                                </Text>
                                <Dialog.Close asChild>
                                    <Button size="2" variant="soft" color="gray">
                                        Close
                                    </Button>
                                </Dialog.Close>
                            </div>
                        </Dialog.Content>
                    </Theme>
                </Dialog.Portal>
            </Dialog.Root>
        );
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2.5">
                                <div>
                                    <Dialog.Title asChild>
                                        <Text as="p" size="2" weight="bold" className="text-gray-900 dark:text-gray-100 leading-tight">
                                            Restock Items
                                        </Text>
                                    </Dialog.Title>
                                    {returnRef && (
                                        <Text as="p" size="1" className="text-gray-500 dark:text-gray-400 leading-tight">
                                            Return {returnRef}
                                        </Text>
                                    )}
                                </div>
                            </div>
                            <Dialog.Close asChild>
                                <IconButton size="1" variant="ghost" color="gray" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </IconButton>
                            </Dialog.Close>
                        </div>

                        {/* Scrollable body */}
                        <ScrollArea scrollbars="vertical" className="flex-1 px-5 py-4">
                            {/* Return context bar */}
                            <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 mb-4">
                                <Info className="h-4 w-4 text-sky-500 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <span>Select items to return to inventory. </span>
                                    {originalRef && (
                                        <span>
                                            Original sale <span className="font-medium text-gray-800 dark:text-gray-200">{originalRef}</span>.
                                        </span>
                                    )}
                                    <span className="block mt-0.5 text-gray-400 dark:text-gray-500">
                                        Damaged or defective items cannot be restocked.
                                    </span>
                                </div>
                            </div>

                            {/* Select all toggle */}
                            {restockableCount > 1 && (
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                        Pending Items ({pendingItems.length})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSelectAll}
                                        className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors"
                                    >
                                        {allRestockableSelected ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            )}

                            {/* Items list */}
                            <div className="space-y-2">
                                {pendingItems.map((item) => {
                                    const canRestock = RESTOCKABLE_CONDITIONS.includes(item.condition);
                                    const checked = isSelected(item.returnItemId);
                                    const selected = getSelected(item.returnItemId);
                                    const qty = parseQuantity(item.returnedQuantity);
                                    const condStyle = CONDITION_STYLES[item.condition] || CONDITION_STYLES.good;

                                    return (
                                        <div
                                            key={item.returnItemId}
                                            className={`rounded-lg border transition-all ${checked
                                                ? 'border-sky-300 dark:border-sky-600 bg-sky-50/50 dark:bg-sky-900/10 ring-1 ring-sky-200 dark:ring-sky-800'
                                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                } ${!canRestock ? 'opacity-50' : ''}`}
                                        >
                                            {/* Item row */}
                                            <label
                                                className={`flex items-start gap-3 p-3 ${canRestock ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => handleToggleItem(item.returnItemId)}
                                                    disabled={!canRestock}
                                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-0 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    {/* Product name + condition badge */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {getProductName(item)}
                                                        </span>
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${condStyle.bg} ${condStyle.text}`}>
                                                            {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                                                        </span>
                                                    </div>

                                                    {/* Meta row */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>Qty returned: <span className="font-medium text-gray-700 dark:text-gray-300">{qty}</span></span>
                                                        <span className="hidden sm:inline text-gray-300 dark:text-gray-600">·</span>
                                                        <span className="capitalize">{item.returnReason.replace(/_/g, ' ')}</span>
                                                    </div>

                                                    {item.notes && (
                                                        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 italic">
                                                            {item.notes}
                                                        </p>
                                                    )}

                                                    {!canRestock && (
                                                        <div className="flex items-center gap-1 mt-1.5">
                                                            <AlertTriangle className="h-3 w-3 text-red-400" />
                                                            <span className="text-[11px] text-red-500 dark:text-red-400">
                                                                Cannot restock — item is {item.condition}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </label>

                                            {/* Inline quantity stepper — shown when selected */}
                                            {checked && canRestock && selected && (
                                                <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2.5 ml-7 mr-3 flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Restock quantity
                                                    </span>
                                                    <div className="flex items-center gap-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.returnItemId, -1)}
                                                            disabled={selected.restockedQuantity <= 1}
                                                            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={selected.restockedQuantity}
                                                            onChange={(e) => handleQuantityInput(item.returnItemId, e.target.value)}
                                                            className="h-7 w-10 text-center text-sm font-medium rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(item.returnItemId, 1)}
                                                            disabled={selected.restockedQuantity >= selected.maxQuantity}
                                                            className="h-7 w-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1.5">
                                                            / {selected.maxQuantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Sticky footer */}
                        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex-shrink-0">
                            {/* Summary strip */}
                            {selectedItems.length > 0 && (
                                <div className="flex items-center gap-4 mb-3 px-1">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-semibold">{selectedItems.length}</span>
                                            <span className="text-gray-500 dark:text-gray-400"> product{selectedItems.length !== 1 ? 's' : ''}</span>
                                        </span>
                                    </div>
                                    <div className="h-3.5 w-px bg-gray-200 dark:bg-gray-700" />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold">{totalUnits}</span>
                                        <span className="text-gray-500 dark:text-gray-400"> unit{totalUnits !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            )}

                            {/* Action buttons */}
                            <Flex gap="3" justify="end">
                                <Dialog.Close asChild>
                                    <Button
                                        size="2"
                                        variant="soft"
                                        color="gray"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </Dialog.Close>
                                <Button
                                    size="2"
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                    disabled={selectedItems.length === 0 || isSubmitting}
                                >
                                    {selectedItems.length > 0
                                        ? `Restock ${totalUnits} Item${totalUnits !== 1 ? 's' : ''}`
                                        : 'Restock Items'}
                                </Button>
                            </Flex>
                        </div>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default RestockItemsModal;
