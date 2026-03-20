import { FunctionComponent, useState } from 'react';
import { Modal, Button } from '../../../components';

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
        <Modal isOpen={true} onClose={onClose} title={`Reject: ${requisition.requisitionNumber}`}>
            <div className="space-y-4">
                {/* Requisition summary */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Items:</span> {requisition.items?.length || 0}
                        <span className="mx-2">|</span>
                        <span className="font-medium">Total Qty:</span>{' '}
                        {requisition.items?.reduce((sum, item) => sum + item.requestedQuantity, 0) || 0}
                    </div>
                    {requisition.requestedByUser && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Requested by:</span>{' '}
                            {requisition.requestedByUser.fullname}
                        </div>
                    )}
                </div>

                {/* Rejection reason */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rejection Reason <span className="text-gray-400">(optional)</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Provide a reason for rejecting this requisition..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400 resize-none"
                        maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-400 text-right">{reason.length}/500</p>
                </div>

                {/* Warning */}
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">
                        This action cannot be undone. The requisition will be marked as <strong>Rejected</strong>.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        theme="danger"
                    >
                        {isSubmitting ? 'Rejecting...' : 'Reject Requisition'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default RejectModal;
