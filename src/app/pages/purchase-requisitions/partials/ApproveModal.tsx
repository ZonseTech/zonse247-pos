import { FunctionComponent, useState, useEffect } from 'react';
import { Modal, Button } from '../../../components';

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
                approvedQuantity: item.requestedQuantity, // Default: approve all
            }))
        );
    }, [requisition]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (isPartial) {
                // Partial approval — send item-level approved quantities
                await onApprove(requisition.id, {
                    items: items.map((item) => ({
                        variantId: item.variantId,
                        approvedQuantity: item.approvedQuantity,
                    })),
                });
            } else {
                // Full approval — no payload needed (API approves all at requested qty)
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
        <Modal isOpen={true} onClose={onClose} title={`Approve: ${requisition.requisitionNumber}`} size="lg">
            <div className="space-y-4">
                {/* Toggle partial approval */}
                <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isPartial}
                            onChange={(e) => setIsPartial(e.target.checked)}
                            className="w-4 h-4 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm font-medium text-sky-900 dark:text-sky-100">
                            Partial Approval
                        </span>
                    </label>
                    <span className="text-xs text-sky-600 dark:text-sky-400">
                        Adjust approved quantities per item
                    </span>
                </div>

                {/* Items list */}
                {items.map((item, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="font-medium mb-1 text-gray-900 dark:text-gray-100">
                            {item.productName ? `${item.productName} — ` : ''}{item.variantName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Requested: <span className="font-medium">{item.requestedQuantity}</span>
                        </div>

                        {isPartial ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Approved Quantity
                                </label>
                                <input
                                    type="number"
                                    value={item.approvedQuantity}
                                    onChange={(e) => {
                                        const newItems = [...items];
                                        const val = parseInt(e.target.value) || 0;
                                        newItems[index].approvedQuantity = Math.min(
                                            Math.max(0, val),
                                            item.requestedQuantity
                                        );
                                        setItems(newItems);
                                    }}
                                    min="0"
                                    max={item.requestedQuantity}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                />
                                {item.approvedQuantity < item.requestedQuantity && (
                                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                        Approving {item.approvedQuantity} of {item.requestedQuantity} requested
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Will approve full quantity: {item.requestedQuantity}
                            </div>
                        )}
                    </div>
                ))}

                {/* Warning for partial */}
                {isPartial && hasReducedQuantity && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Some items have reduced quantities. This will result in a <strong>Partially Approved</strong> status.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose} theme="danger">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        theme="success"
                    >
                        {isSubmitting
                            ? 'Approving...'
                            : isPartial && hasReducedQuantity
                                ? 'Partially Approve'
                                : 'Approve Requisition'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ApproveModal;
