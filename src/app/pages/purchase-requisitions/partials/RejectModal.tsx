import { FunctionComponent, useState } from 'react';
import { Box, Flex, Text, Button, TextArea } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';

interface RejectModalProps {
    requisition: PurchaseRequisitionWithItems;
    onClose: () => void;
    onReject: (
        requisitionId: string,
        payload?: RejectRequisitionInput,
    ) => Promise<any>;
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
        <FormModal
            open
            onOpenChange={(open) => !open && onClose()}
            title={`Reject: ${requisition.requisitionNumber}`}
            size="sm"
            footer={
                <Flex gap="3" justify="end" width="100%">
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
            }
        >
            <Flex direction="column" gap="4">
                {/* Requisition summary */}
                <Box
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    p="3"
                >
                    <Text as="p" size="2" color="gray">
                        <Text as="span" weight="medium">
                            Items:
                        </Text>{' '}
                        {requisition.items?.length || 0}
                        <Text as="span" mx="2">
                            |
                        </Text>
                        <Text as="span" weight="medium">
                            Total Qty:
                        </Text>{' '}
                        {requisition.items?.reduce(
                            (sum, item) => sum + item.requestedQuantity,
                            0,
                        ) || 0}
                    </Text>
                    {requisition.requestedByUser && (
                        <Text as="p" size="2" color="gray" mt="1">
                            <Text as="span" weight="medium">
                                Requested by:
                            </Text>{' '}
                            {requisition.requestedByUser.fullname}
                        </Text>
                    )}
                </Box>

                {/* Rejection reason */}
                <Box>
                    <Text
                        as="label"
                        size="2"
                        weight="medium"
                        color="gray"
                        mb="1"
                    >
                        Rejection Reason{' '}
                        <Text as="span" color="gray">
                            (optional)
                        </Text>
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
                <Box
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    p="3"
                >
                    <Text size="2" className="text-red-800 dark:text-red-300">
                        This action cannot be undone. The requisition will be
                        marked as <strong>Rejected</strong>.
                    </Text>
                </Box>
            </Flex>
        </FormModal>
    );
};

export default RejectModal;
