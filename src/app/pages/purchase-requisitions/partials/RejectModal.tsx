import { FunctionComponent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Box, Flex, Text, Button, TextArea, Theme } from '@radix-ui/themes';
import { X } from 'lucide-react';

interface RejectModalProps {
    requisition: PurchaseRequisitionWithItems;
    onClose: () => void;
    onReject: (requisitionId: string, payload?: RejectRequisitionInput) => Promise<any>;
}

const RejectModal: FunctionComponent<RejectModalProps> = ({
    requisition,
    onClose,
    onReject,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reason, setReason] = useState('');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onReject(requisition.id, {
                rejectedReason: reason || undefined,
            });
            onClose();
        } catch (error) {
            console.error('Reject error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6">
                        <Flex justify="between" align="center" mb="4" pb="4" className="border-b border-gray-200 dark:border-gray-700">
                            <Dialog.Title asChild>
                                <Text size="4" weight="bold">
                                    Reject: {requisition.requisitionNumber}
                                </Text>
                            </Dialog.Title>
                            <Dialog.Close asChild>
                                <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <Flex direction="column" gap="4">
                            {/* Requisition summary */}
                            <Box className="bg-gray-50 dark:bg-gray-700/50 rounded-lg" p="3">
                                <Text as="p" size="2" color="gray">
                                    <Text as="span" weight="medium">Items:</Text> {requisition.items?.length || 0}
                                    <Text as="span" mx="2">|</Text>
                                    <Text as="span" weight="medium">Total Qty:</Text>{' '}
                                    {requisition.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0}
                                </Text>
                                {requisition.requestedByUser && (
                                    <Text as="p" size="2" color="gray" mt="1">
                                        <Text as="span" weight="medium">Requested by:</Text>{' '}
                                        {requisition.requestedByUser.fullname}
                                    </Text>
                                )}
                            </Box>

                            {/* Rejection reason */}
                            <Box>
                                <Text as="label" size="2" weight="medium" color="gray" mb="1">
                                    Rejection Reason <Text as="span" color="gray">(optional)</Text>
                                </Text>
                                <TextArea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Provide a reason for rejecting this requisition..."
                                    rows={3}
                                    size="2"
                                    resize="none"
                                    maxLength={500}
                                />
                                <Text as="p" size="1" color="gray" align="right" mt="1">
                                    {reason.length}/500
                                </Text>
                            </Box>

                            {/* Warning */}
                            <Box className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg" p="3">
                                <Text size="2" className="text-red-800 dark:text-red-300">
                                    This action cannot be undone. The requisition will be marked as <strong>Rejected</strong>.
                                </Text>
                            </Box>

                            {/* Actions */}
                            <Flex gap="3" justify="end" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                                <Button variant="soft" color="gray" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    color="red"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    loading={isSubmitting}
                                >
                                    Reject Requisition
                                </Button>
                            </Flex>
                        </Flex>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default RejectModal;
