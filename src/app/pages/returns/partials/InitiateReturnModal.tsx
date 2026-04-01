import { FunctionComponent, useState, useCallback, useMemo } from 'react';
import { Notify } from 'notiflix';
import * as Dialog from '@radix-ui/react-dialog';
import {
    Box, Flex, Text, Button, Select, TextArea, TextField, Theme, ScrollArea,
} from '@radix-ui/themes';
import { Trash2, Plus, X, RotateCcw, ShoppingBag, CreditCard } from 'lucide-react';
import returnsService from '../../../services/returns.service';
import { formatCurrency } from '../../../utils';

interface InitiateReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction?: Transaction;
    sale?: Sale;
    onSuccess?: () => void;
}

interface ReturnItemForm {
    orderItemId: string;
    productId: string;
    productName: string;
    returnQuantity: number;
    maxQuantity: number;
    returnReason: string;
    condition: ReturnCondition;
    notes: string;
    price: number;
}

const returnReasonOptions = [
    { value: 'defective', label: 'Defective/Damaged' },
    { value: 'wrong_item', label: 'Wrong Item' },
    { value: 'not_as_described', label: 'Not As Described' },
    { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other' },
];

const conditionOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'defective', label: 'Defective' },
];

const refundMethodOptions = [
    { value: 'original', label: 'Original Payment Method' },
    { value: 'cash', label: 'Cash' },
    { value: 'store_credit', label: 'Store Credit' },
];

const InitiateReturnModal: FunctionComponent<InitiateReturnModalProps> = ({
    isOpen,
    onClose,
    transaction,
    sale,
    onSuccess,
}) => {
    const [selectedItems, setSelectedItems] = useState<ReturnItemForm[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [refundMethod, setRefundMethod] = useState<'original' | 'cash' | 'store_credit'>('original');

    const saleOrTransaction = sale || transaction;

    const canReturn = returnsService.canReturn(saleOrTransaction as Transaction);
    const remainingRefundable = returnsService.getRemainingRefundableAmount(saleOrTransaction as Transaction);

    const transactionRef = useMemo(() =>
        (saleOrTransaction as Sale)?.saleNumber
        || (saleOrTransaction as Transaction)?.refNumber
        || saleOrTransaction?.id
        || '',
    [saleOrTransaction]);

    const originalAmount = useMemo(() => {
        const s = saleOrTransaction as Sale;
        const t = saleOrTransaction as Transaction;
        return s?.totalAmount || (typeof t?.total === 'string' ? parseFloat(t.total as unknown as string) : t?.total) || 0;
    }, [saleOrTransaction]);

    const refundedAmount = useMemo(() => {
        const t = saleOrTransaction as Transaction;
        return typeof t?.refundedAmount === 'string' ? parseFloat(t.refundedAmount as unknown as string) : (t?.refundedAmount || 0);
    }, [saleOrTransaction]);

    const handleAddItem = useCallback((item: any) => {
        const orderItemId = item.orderId;
        setSelectedItems((prev) => {
            if (prev.some((i) => i.orderItemId === orderItemId)) {
                Notify.warning('Item already added to return list');
                return prev;
            }
            return [
                ...prev,
                {
                    orderItemId,
                    productId: item.productId,
                    productName: item.productDetails?.name || item.name || 'Unknown Product',
                    returnQuantity: parseInt(item.quantity) || 1,
                    maxQuantity: parseInt(item.quantity) || 1,
                    returnReason: '',
                    condition: 'good',
                    notes: '',
                    price: typeof item.sellingPrice === 'string' ? parseFloat(item.sellingPrice) : item.sellingPrice,
                },
            ];
        });
    }, []);

    const handleRemoveItem = useCallback((orderItemId: string) => {
        setSelectedItems((prev) => prev.filter((item) => item.orderItemId !== orderItemId));
    }, []);

    const handleItemChange = useCallback((orderItemId: string, field: keyof ReturnItemForm, value: any) => {
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.orderItemId === orderItemId ? { ...item, [field]: value } : item
            ),
        );
    }, []);

    const refundAmount = useMemo(
        () => selectedItems.reduce((sum, item) => sum + item.price * item.returnQuantity, 0),
        [selectedItems],
    );

    const handleSubmit = useCallback(async () => {
        if (selectedItems.length === 0) {
            Notify.warning('Please select at least one item to return');
            return;
        }

        const invalidItems = selectedItems.filter(
            (item) => !item.returnReason || item.returnQuantity <= 0,
        );
        if (invalidItems.length > 0) {
            Notify.warning('Please fill in all required fields for each item');
            return;
        }

        setIsSubmitting(true);
        try {
            const transactionId =
                sale?.id
                || (saleOrTransaction as Sale)?.id
                || (saleOrTransaction as Transaction)?.transactionId
                || '';

            const data: InitiateReturnRequest = {
                originalSaleId: transactionId,
                items: selectedItems.map((item) => ({
                    saleItemId: item.orderItemId,
                    productId: item.productId,
                    returnQuantity: item.returnQuantity,
                    returnReason: item.returnReason,
                    condition: item.condition,
                    notes: item.notes,
                })),
                refundReason: refundReason.trim() || 'NA',
                refundMethod,
                partialRefund: false,
            };

            await returnsService.initiateReturn(data);
            Notify.success('Return initiated successfully');
            setSelectedItems([]);
            setRefundReason('');
            setRefundMethod('original');
            onSuccess?.();
            onClose();
        } catch (error: any) {
            Notify.failure(error?.message || 'Failed to initiate return');
        } finally {
            setIsSubmitting(false);
        }
    }, [selectedItems, refundReason, refundMethod, sale, saleOrTransaction, onSuccess, onClose]);

    // Cannot return — restricted modal
    if (!canReturn) {
        return (
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Portal>
                    <Theme appearance="inherit" accentColor="cyan">
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                            <div className="text-center py-4">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
                                    <RotateCcw className="h-7 w-7 text-red-500 dark:text-red-400" />
                                </div>
                                <Dialog.Title asChild>
                                    <Text size="4" weight="bold" as="p" mb="2">
                                        Cannot Process Return
                                    </Text>
                                </Dialog.Title>
                                <Text size="2" color="gray" as="p" mb="5">
                                    This transaction cannot be returned. It may already be refunded, cancelled, or void.
                                </Text>
                                <Button size="2" variant="soft" color="gray" onClick={onClose}>
                                    Close
                                </Button>
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
                        <Flex
                            justify="between"
                            align="center"
                            p="4"
                            className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Flex align="center" gap="3">
                                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                    <RotateCcw className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                </div>
                                <div>
                                    <Dialog.Title asChild>
                                        <Text size="3" weight="bold" as="p" className="leading-tight">
                                            Initiate Return
                                        </Text>
                                    </Dialog.Title>
                                    <Text size="1" color="gray" as="p" className="leading-tight">
                                        {transactionRef}
                                    </Text>
                                </div>
                            </Flex>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        {/* Scrollable body */}
                        <ScrollArea scrollbars="vertical" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                            <Flex direction="column" gap="4" p="4">
                                {/* Transaction summary */}
                                <Box className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg" p="3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Text size="1" color="gray" as="p">Original Amount</Text>
                                            <Text size="2" weight="medium" as="p">{formatCurrency(originalAmount)}</Text>
                                        </div>
                                        <div>
                                            <Text size="1" color="gray" as="p">Already Refunded</Text>
                                            <Text size="2" weight="medium" as="p">{formatCurrency(refundedAmount)}</Text>
                                        </div>
                                        <div className="col-span-2">
                                            <Text size="1" color="gray" as="p">Remaining Refundable</Text>
                                            <Text size="3" weight="bold" as="p" color="cyan">
                                                {formatCurrency(remainingRefundable)}
                                            </Text>
                                        </div>
                                    </div>
                                </Box>

                                {/* Available items */}
                                <Box>
                                    <Flex align="center" gap="2" mb="2">
                                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                                        <Text size="2" weight="medium">Available Items</Text>
                                    </Flex>
                                    <Flex direction="column" gap="2" className="max-h-48 overflow-y-auto">
                                        {saleOrTransaction?.items?.map((item: any) => {
                                            const orderItemId = item.id || item.orderId;
                                            const isAdded = selectedItems.some((i) => i.orderItemId === orderItemId);
                                            const itemName = item.product?.name || item.productDetails?.name || item.name || 'Unknown Product';
                                            const itemPrice = item.unitPrice || item.sellingPrice || 0;

                                            return (
                                                <Flex
                                                    key={orderItemId}
                                                    align="center"
                                                    justify="between"
                                                    gap="3"
                                                    p="3"
                                                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                                                >
                                                    <Box className="flex-1 min-w-0">
                                                        <Text size="2" weight="medium" as="p" className="truncate">
                                                            {itemName}
                                                        </Text>
                                                        <Text size="1" color="gray" as="p">
                                                            Qty: {item.quantity} × {formatCurrency(typeof itemPrice === 'string' ? parseFloat(itemPrice) : itemPrice)}
                                                        </Text>
                                                    </Box>
                                                    <Button
                                                        size="1"
                                                        variant={isAdded ? 'soft' : 'solid'}
                                                        color={isAdded ? 'gray' : 'cyan'}
                                                        onClick={() =>
                                                            handleAddItem({
                                                                ...item,
                                                                orderId: orderItemId,
                                                                sellingPrice: itemPrice,
                                                                productDetails: { name: itemName },
                                                            })
                                                        }
                                                        disabled={isAdded}
                                                    >
                                                        {isAdded ? 'Added' : <><Plus className="w-3.5 h-3.5" /> Add</>}
                                                    </Button>
                                                </Flex>
                                            );
                                        })}
                                    </Flex>
                                </Box>

                                {/* Selected items */}
                                {selectedItems.length > 0 && (
                                    <Box>
                                        <Text size="2" weight="medium" mb="2" as="p">
                                            Items to Return ({selectedItems.length})
                                        </Text>
                                        <Flex direction="column" gap="3">
                                            {selectedItems.map((item) => (
                                                <Box
                                                    key={item.orderItemId}
                                                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                                                    p="3"
                                                >
                                                    {/* Item header */}
                                                    <Flex justify="between" align="start" mb="3">
                                                        <Box className="flex-1 min-w-0">
                                                            <Text size="2" weight="medium" as="p" className="truncate">
                                                                {item.productName}
                                                            </Text>
                                                            <Text size="1" color="gray" as="p">
                                                                {formatCurrency(item.price)} × {item.returnQuantity} = {formatCurrency(item.price * item.returnQuantity)}
                                                            </Text>
                                                        </Box>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(item.orderItemId)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </Flex>

                                                    {/* Item fields — 3 columns on desktop */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <div>
                                                            <Text as="label" size="1" weight="medium" color="gray">
                                                                Quantity <span className="text-red-500">*</span>
                                                            </Text>
                                                            <TextField.Root
                                                                type="number"
                                                                min={1}
                                                                max={item.maxQuantity}
                                                                size="2"
                                                                mt="1"
                                                                value={String(item.returnQuantity)}
                                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                                    const val = parseInt(e.target.value) || 1;
                                                                    handleItemChange(
                                                                        item.orderItemId,
                                                                        'returnQuantity',
                                                                        Math.min(Math.max(1, val), item.maxQuantity),
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div>
                                                            <Text as="label" size="1" weight="medium" color="gray">
                                                                Reason <span className="text-red-500">*</span>
                                                            </Text>
                                                            <Select.Root
                                                                size="2"
                                                                value={item.returnReason || '__none__'}
                                                                onValueChange={(val) =>
                                                                    handleItemChange(
                                                                        item.orderItemId,
                                                                        'returnReason',
                                                                        val === '__none__' ? '' : val,
                                                                    )
                                                                }
                                                            >
                                                                <Select.Trigger
                                                                    placeholder="Select reason"
                                                                    mt="1"
                                                                    className="w-full"
                                                                />
                                                                <Select.Content position="popper" className="z-[60]">
                                                                    <Select.Item value="__none__" disabled>Select reason</Select.Item>
                                                                    {returnReasonOptions.map((opt) => (
                                                                        <Select.Item key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </Select.Item>
                                                                    ))}
                                                                </Select.Content>
                                                            </Select.Root>
                                                        </div>

                                                        <div>
                                                            <Text as="label" size="1" weight="medium" color="gray">
                                                                Condition <span className="text-red-500">*</span>
                                                            </Text>
                                                            <Select.Root
                                                                size="2"
                                                                value={item.condition}
                                                                onValueChange={(val) =>
                                                                    handleItemChange(
                                                                        item.orderItemId,
                                                                        'condition',
                                                                        val as ReturnCondition,
                                                                    )
                                                                }
                                                            >
                                                                <Select.Trigger mt="1" className="w-full" />
                                                                <Select.Content position="popper" className="z-[60]">
                                                                    {conditionOptions.map((opt) => (
                                                                        <Select.Item key={opt.value} value={opt.value}>
                                                                            {opt.label}
                                                                        </Select.Item>
                                                                    ))}
                                                                </Select.Content>
                                                            </Select.Root>
                                                        </div>

                                                        <div className="sm:col-span-3">
                                                            <Text as="label" size="1" weight="medium" color="gray">
                                                                Notes
                                                            </Text>
                                                            <TextArea
                                                                rows={2}
                                                                size="2"
                                                                mt="1"
                                                                resize="none"
                                                                value={item.notes}
                                                                placeholder="Additional notes..."
                                                                onChange={(e) =>
                                                                    handleItemChange(item.orderItemId, 'notes', e.target.value)
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </Box>
                                            ))}
                                        </Flex>
                                    </Box>
                                )}

                                {/* Refund details */}
                                {selectedItems.length > 0 && (
                                    <Box>
                                        <Flex align="center" gap="2" mb="2">
                                            <CreditCard className="w-4 h-4 text-gray-400" />
                                            <Text size="2" weight="medium">Refund Details</Text>
                                        </Flex>

                                        <Flex direction="column" gap="3">
                                            <div>
                                                <Text as="label" size="1" weight="medium" color="gray">
                                                    Refund Reason
                                                </Text>
                                                <TextArea
                                                    value={refundReason}
                                                    onChange={(e) => setRefundReason(e.target.value)}
                                                    placeholder="Explain the reason for this refund..."
                                                    rows={2}
                                                    size="2"
                                                    mt="1"
                                                    resize="none"
                                                />
                                            </div>

                                            <div>
                                                <Text as="label" size="1" weight="medium" color="gray">
                                                    Refund Method <span className="text-red-500">*</span>
                                                </Text>
                                                <Select.Root
                                                    size="2"
                                                    value={refundMethod}
                                                    onValueChange={(val) => setRefundMethod(val as typeof refundMethod)}
                                                >
                                                    <Select.Trigger mt="1" className="w-full" />
                                                    <Select.Content position="popper" className="z-[60]">
                                                        {refundMethodOptions.map((opt) => (
                                                            <Select.Item key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Root>
                                            </div>

                                            {/* Refund total */}
                                            <Box className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg" p="3">
                                                <Flex justify="between" align="center">
                                                    <Text size="3" weight="medium">Total Refund</Text>
                                                    <Text size="4" weight="bold" color="cyan">
                                                        {formatCurrency(refundAmount)}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                        </Flex>
                                    </Box>
                                )}
                            </Flex>
                        </ScrollArea>

                        {/* Footer */}
                        <Flex
                            gap="3"
                            justify="end"
                            p="4"
                            className="border-t border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Button variant="soft" color="gray" size="2" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                size="2"
                                onClick={handleSubmit}
                                loading={isSubmitting}
                                disabled={selectedItems.length === 0 || isSubmitting}
                            >
                                Process Return
                            </Button>
                        </Flex>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default InitiateReturnModal;
