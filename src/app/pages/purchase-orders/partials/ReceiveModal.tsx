import { FunctionComponent, useState, useEffect } from 'react';
import { Modal, Button, FormInput } from '../../../components';

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
        productId: string;
        productName: string;
        orderedQuantity: number;
        receivedQuantity: number;
        damagedQuantity: number;
    }[]>([]);

    useEffect(() => {
        setItems(
            purchaseOrder.items.map((item) => ({
                productId: item.productId,
                productName: item.product?.name || 'Unknown Product',
                orderedQuantity: item.orderedQuantity,
                receivedQuantity: item.orderedQuantity - (item.receivedQuantity || 0),
                damagedQuantity: 0,
            }))
        );
    }, [purchaseOrder]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Use id field for the API call
            await onReceive(purchaseOrder.id, {
                items: items.map((item) => ({
                    productId: item.productId,
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

    return (
        <Modal isOpen={true} onClose={onClose} title={`Receive PO: ${purchaseOrder.poNumber}`}>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-4">
                        <div className="font-medium mb-3">{item.productName}</div>
                        <div className="text-sm text-gray-500 mb-3">
                            Ordered: {item.orderedQuantity}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                label="Received (Good)"
                                type="number"
                                value={item.receivedQuantity.toString()}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].receivedQuantity = parseInt(e.target.value) || 0;
                                    setItems(newItems);
                                }}
                                min="0"
                                max={item.orderedQuantity}
                            />
                            <FormInput
                                label="Damaged"
                                type="number"
                                value={item.damagedQuantity.toString()}
                                onChange={(e) => {
                                    const newItems = [...items];
                                    newItems[index].damagedQuantity = parseInt(e.target.value) || 0;
                                    setItems(newItems);
                                }}
                                min="0"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex gap-4 justify-end pt-4">
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Receiving...' : 'Receive Purchase Order'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReceiveModal;
