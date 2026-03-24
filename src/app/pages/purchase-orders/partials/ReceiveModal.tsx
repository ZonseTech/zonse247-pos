import { FunctionComponent, useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Flex, Text, TextField, Button, Theme } from '@radix-ui/themes';
import { Package, AlertTriangle, X } from 'lucide-react';

interface ReceiveModalProps {
    purchaseOrder: PurchaseOrder;
    onClose: () => void;
    onReceive: (poId: string, payload: ReceivePurchaseOrderInput) => Promise<any>;
}

const ReceiveModal: FunctionComponent<ReceiveModalProps> = ({
    purchaseOrder,
    onClose,
    onReceive,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [items, setItems] = useState<{
        variantId: string;
        displayName: string;
        orderedQuantity: number;
        previouslyReceived: number;
        receivedQuantity: number;
        damagedQuantity: number;
    }[]>([]);

    useEffect(() => {
        setItems(
            purchaseOrder.items.map((item) => {
                const variantName = item.variant?.variantName || '';
                const productName = item.variant?.product?.name || '';
                const displayName = productName
                    ? `${productName}${variantName && variantName !== 'Default' ? ` — ${variantName}` : ''}`
                    : variantName || 'Unknown Product';
                const remaining = item.orderedQuantity - (item.receivedQuantity || 0);

                return {
                    variantId: item.variantId,
                    displayName,
                    orderedQuantity: item.orderedQuantity,
                    previouslyReceived: item.receivedQuantity || 0,
                    receivedQuantity: Math.max(0, remaining),
                    damagedQuantity: 0,
                };
            })
        );
    }, [purchaseOrder]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onReceive(purchaseOrder.id, {
                receivedBy: '', // API will use authenticated user
                items: items.map((item) => ({
                    variantId: item.variantId,
                    receivedQuantity: item.receivedQuantity,
                    damagedQuantity: item.damagedQuantity,
                })),
            });
            onClose();
        } catch (error) {
            console.error('Receive error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalReceiving = items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    const totalDamaged = items.reduce((sum, item) => sum + item.damagedQuantity, 0);
    const totalOrdered = items.reduce((sum, item) => sum + item.orderedQuantity, 0);
    const totalPrevReceived = items.reduce((sum, item) => sum + item.previouslyReceived, 0);
    const overallProgress = totalOrdered > 0 ? Math.round(((totalPrevReceived + totalReceiving) / totalOrdered) * 100) : 0;

    // Check for over-receive warnings
    const hasOverReceive = items.some(item => {
        const remaining = item.orderedQuantity - item.previouslyReceived;
        return (item.receivedQuantity + item.damagedQuantity) > remaining;
    });

    return (
        <Dialog.Root open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-50 p-6 focus:outline-none">
                        <Flex justify="between" align="center" mb="4">
                            <Dialog.Title asChild>
                                <Text size="5" weight="bold" className="text-gray-900 dark:text-white">
                                    Quick Receive: {purchaseOrder.poNumber}
                                </Text>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <Flex direction="column" gap="4">
                            {/* Summary header with progress */}
                            <Box className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <Flex align="center" gap="3" mb="2">
                                    <Package className="w-5 h-5 text-green-500" />
                                    <Text size="2" className="text-green-800 dark:text-green-300">
                                        <Text weight="medium">{purchaseOrder.items?.length || 0}</Text> items to receive
                                        {purchaseOrder.supplier?.name && (
                                            <> from <Text weight="medium">{purchaseOrder.supplier.name}</Text></>
                                        )}
                                    </Text>
                                </Flex>
                                <Box mt="2">
                                    <Flex justify="between" mb="1">
                                        <Text size="1" className="text-green-700 dark:text-green-400">Overall progress</Text>
                                        <Text size="1" weight="medium" className="text-green-700 dark:text-green-400">{Math.min(overallProgress, 100)}%</Text>
                                    </Flex>
                                    <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${overallProgress > 100 ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(overallProgress, 100)}%` }}
                                        />
                                    </div>
                                    <Flex justify="between" mt="1">
                                        <Text size="1" className="text-green-600 dark:text-green-500">Previously: {totalPrevReceived} / {totalOrdered}</Text>
                                        <Text size="1" className="text-green-600 dark:text-green-500">This batch: +{totalReceiving} good{totalDamaged > 0 ? `, +${totalDamaged} damaged` : ''}</Text>
                                    </Flex>
                                </Box>
                            </Box>

                            {/* Over-receive warning */}
                            {hasOverReceive && (
                                <Flex align="center" gap="2" className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <Text size="2" className="text-amber-800 dark:text-amber-300">
                                        Some items exceed the remaining ordered quantity. Verify before submitting.
                                    </Text>
                                </Flex>
                            )}

                            {/* Items list */}
                            {items.map((item, index) => {
                                const remaining = item.orderedQuantity - item.previouslyReceived;
                                const isOverReceive = (item.receivedQuantity + item.damagedQuantity) > remaining;
                                const itemProgress = item.orderedQuantity > 0 ? Math.round(((item.previouslyReceived + item.receivedQuantity) / item.orderedQuantity) * 100) : 0;

                                return (
                                    <Box key={index} className={`border rounded-lg p-4 ${isOverReceive ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : 'dark:border-gray-700'}`}>
                                        <Text as="p" weight="medium" mb="1" className="text-gray-900 dark:text-gray-100">
                                            {item.displayName}
                                        </Text>
                                        <Flex align="center" gap="4" mb="2">
                                            <Text size="2" color="gray">Ordered: <Text weight="medium">{item.orderedQuantity}</Text></Text>
                                            {item.previouslyReceived > 0 && (
                                                <Text size="2" color="gray">Already received: <Text weight="medium" className="text-green-600 dark:text-green-400">{item.previouslyReceived}</Text></Text>
                                            )}
                                            <Text size="2" color="gray">Remaining: <Text weight="medium" className="text-sky-600 dark:text-sky-400">{Math.max(0, remaining)}</Text></Text>
                                        </Flex>
                                        {item.previouslyReceived > 0 && (
                                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className={`h-full rounded-full transition-all ${itemProgress > 100 ? 'bg-amber-400' : 'bg-green-400'}`}
                                                    style={{ width: `${Math.min(itemProgress, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-4">
                                            <Box>
                                                <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                                    Received (Good)
                                                </Text>
                                                <TextField.Root
                                                    type="number"
                                                    value={String(item.receivedQuantity)}
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[index].receivedQuantity = Math.max(0, parseInt(e.target.value) || 0);
                                                        setItems(newItems);
                                                    }}
                                                    min={0}
                                                    max={Math.max(0, remaining)}
                                                    color={isOverReceive ? 'orange' : 'green'}
                                                />
                                                {isOverReceive && (
                                                    <Text size="1" mt="1" className="text-amber-600 dark:text-amber-400">
                                                        Exceeds remaining qty ({Math.max(0, remaining)})
                                                    </Text>
                                                )}
                                            </Box>
                                            <Box>
                                                <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                                    Damaged
                                                </Text>
                                                <TextField.Root
                                                    type="number"
                                                    value={String(item.damagedQuantity)}
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[index].damagedQuantity = Math.max(0, parseInt(e.target.value) || 0);
                                                        setItems(newItems);
                                                    }}
                                                    min={0}
                                                    max={Math.max(0, remaining)}
                                                    color="red"
                                                />
                                            </Box>
                                        </div>
                                    </Box>
                                );
                            })}

                            {/* Totals */}
                            <Box className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <Flex justify="between" align="center">
                                    <Text size="2" color="gray">Total receiving:</Text>
                                    <Text size="2" weight="medium" className="text-green-600 dark:text-green-400">{totalReceiving} good</Text>
                                </Flex>
                                {totalDamaged > 0 && (
                                    <Flex justify="between" align="center" mt="1">
                                        <Text size="2" color="gray">Total damaged:</Text>
                                        <Text size="2" weight="medium" className="text-red-600 dark:text-red-400">{totalDamaged}</Text>
                                    </Flex>
                                )}
                            </Box>

                            {/* Actions */}
                            <Flex gap="4" justify="end" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                                <Button variant="soft" color="gray" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="green"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || totalReceiving === 0}
                                    loading={isSubmitting}
                                >
                                    Receive Items
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ReceiveModal;
