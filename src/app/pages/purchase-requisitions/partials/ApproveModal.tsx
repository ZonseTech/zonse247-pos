import { FunctionComponent, useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Flex, Text, Button, Checkbox, TextField, Theme } from '@radix-ui/themes';
import { X } from 'lucide-react';

interface ApproveModalProps {
    requisition: PurchaseRequisitionWithItems;
    onClose: () => void;
    onApprove: (requisitionId: string, payload?: ApproveRequisitionInput) => Promise<any>;
}

const ApproveModal: FunctionComponent<ApproveModalProps> = ({
    requisition,
    onClose,
    onApprove,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPartial, setIsPartial] = useState(false);
    const [items, setItems] = useState<{
        variantId: string;
        variantName: string;
        productName: string;
        requestedQuantity: number;
        approvedQuantity: number;
    }[]>([]);

    useEffect(() => {
        setItems(
            requisition.items.map((item) => ({
                variantId: item.variantId,
                variantName: item.variant?.variantName || 'Unknown Variant',
                productName: item.variant?.product?.name || '',
                requestedQuantity: item.requestedQuantity,
                approvedQuantity: item.requestedQuantity,
            }))
        );
    }, [requisition]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (isPartial) {
                await onApprove(requisition.id, {
                    items: items.map((item) => ({
                        variantId: item.variantId,
                        approvedQuantity: item.approvedQuantity,
                    })),
                });
            } else {
                await onApprove(requisition.id);
            }
            onClose();
        } catch (error) {
            console.error('Approve error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasReducedQuantity = items.some(
        (item) => item.approvedQuantity < item.requestedQuantity
    );

    return (
        <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                        <Flex justify="between" align="center" mb="4" pb="4" className="border-b border-gray-200 dark:border-gray-700">
                            <Dialog.Title asChild>
                                <Text size="4" weight="bold">
                                    Approve: {requisition.requisitionNumber}
                                </Text>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <Flex direction="column" gap="4">
                            {/* Toggle partial approval */}
                            <Box className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg" p="3">
                                <Flex asChild align="center" gap="2">
                                    <label className="cursor-pointer">
                                        <Checkbox
                                            checked={isPartial}
                                            onCheckedChange={(checked) => setIsPartial(checked === true)}

                                        />
                                        <Text size="2" weight="medium" className="text-sky-900 dark:text-sky-100">
                                            Partial Approval
                                        </Text>
                                        <Text size="1" className="text-sky-600 dark:text-sky-400">
                                            Adjust approved quantities per item
                                        </Text>
                                    </label>
                                </Flex>
                            </Box>

                            {/* Items list */}
                            {items.map((item, index) => (
                                <Box key={index} className="border dark:border-gray-700 rounded-lg" p="4">
                                    <Text as="p" size="2" weight="medium" mb="1">
                                        {item.productName ? `${item.productName} — ` : ''}{item.variantName}
                                    </Text>
                                    <Text as="p" size="2" color="gray" mb="3">
                                        Requested: <Text as="span" weight="medium">{item.requestedQuantity}</Text>
                                    </Text>

                                    {isPartial ? (
                                        <Box>
                                            <Text as="label" size="2" weight="medium" color="gray" mb="1">
                                                Approved Quantity
                                            </Text>
                                            <TextField.Root
                                                type="number"
                                                value={String(item.approvedQuantity)}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    const val = parseInt(e.target.value) || 0;
                                                    newItems[index].approvedQuantity = Math.min(
                                                        Math.max(0, val),
                                                        item.requestedQuantity
                                                    );
                                                    setItems(newItems);
                                                }}
                                                min={0}
                                                max={item.requestedQuantity}
                                                size="2"
                                            />
                                            {item.approvedQuantity < item.requestedQuantity && (
                                                <Text as="p" size="1" className="text-amber-600 dark:text-amber-400 mt-1">
                                                    Approving {item.approvedQuantity} of {item.requestedQuantity} requested
                                                </Text>
                                            )}
                                        </Box>
                                    ) : (
                                        <Text as="p" size="2" className="text-green-600 dark:text-green-400">
                                            Will approve full quantity: {item.requestedQuantity}
                                        </Text>
                                    )}
                                </Box>
                            ))}

                            {/* Warning for partial */}
                            {isPartial && hasReducedQuantity && (
                                <Box className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg" p="3">
                                    <Text size="2" className="text-amber-800 dark:text-amber-300">
                                        Some items have reduced quantities. This will result in a <strong>Partially Approved</strong> status.
                                    </Text>
                                </Box>
                            )}

                            {/* Actions */}
                            <Flex gap="3" justify="end" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                                <Button variant="soft" color="gray" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="green"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    loading={isSubmitting}
                                >
                                    {isPartial && hasReducedQuantity
                                        ? 'Partially Approve'
                                        : 'Approve Requisition'}
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default ApproveModal;
