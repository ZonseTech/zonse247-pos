import { FunctionComponent, useState, useEffect } from 'react';
import { Modal, Button } from '../../../components';
import { Package, AlertTriangle } from 'lucide-react';

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
        <Modal isOpen={true} onClose={onClose} title={`Quick Receive: ${purchaseOrder.poNumber}`} size="lg">
            <div className="space-y-4">
                {/* Summary header with progress */}
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-green-500" />
                        <div className="text-sm text-green-800 dark:text-green-300">
                            <span className="font-medium">{purchaseOrder.items?.length || 0}</span> items to receive
                            {purchaseOrder.supplier?.name && (
                                <span> from <span className="font-medium">{purchaseOrder.supplier.name}</span></span>
                            )}
                        </div>
                    </div>
                    {/* Overall progress bar */}
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400 mb-1">
                            <span>Overall progress</span>
                            <span className="font-medium">{Math.min(overallProgress, 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${overallProgress > 100 ? 'bg-amber-500' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(overallProgress, 100)}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-green-600 dark:text-green-500 mt-0.5">
                            <span>Previously: {totalPrevReceived} / {totalOrdered}</span>
                            <span>This batch: +{totalReceiving} good{totalDamaged > 0 ? `, +${totalDamaged} damaged` : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Over-receive warning */}
                {hasOverReceive && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            Some items exceed the remaining ordered quantity. Verify before submitting.
                        </p>
                    </div>
                )}

                {/* Items list */}
                {items.map((item, index) => {
                    const remaining = item.orderedQuantity - item.previouslyReceived;
                    const isOverReceive = (item.receivedQuantity + item.damagedQuantity) > remaining;
                    const itemProgress = item.orderedQuantity > 0 ? Math.round(((item.previouslyReceived + item.receivedQuantity) / item.orderedQuantity) * 100) : 0;

                    return (
                        <div key={index} className={`border rounded-lg p-4 ${isOverReceive ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : 'dark:border-gray-700'}`}>
                            <div className="font-medium mb-1 text-gray-900 dark:text-gray-100">
                                {item.displayName}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>Ordered: <span className="font-medium">{item.orderedQuantity}</span></span>
                                {item.previouslyReceived > 0 && (
                                    <span>Already received: <span className="font-medium text-green-600 dark:text-green-400">{item.previouslyReceived}</span></span>
                                )}
                                <span>Remaining: <span className="font-medium text-sky-600 dark:text-sky-400">{Math.max(0, remaining)}</span></span>
                            </div>
                            {/* Per-item mini progress bar */}
                            {item.previouslyReceived > 0 && (
                                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full rounded-full transition-all ${itemProgress > 100 ? 'bg-amber-400' : 'bg-green-400'}`}
                                        style={{ width: `${Math.min(itemProgress, 100)}%` }}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Received (Good)
                                    </label>
                                    <input
                                        type="number"
                                        value={item.receivedQuantity}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[index].receivedQuantity = Math.max(0, parseInt(e.target.value) || 0);
                                            setItems(newItems);
                                        }}
                                        min="0"
                                        max={Math.max(0, remaining)}
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-green-500 ${isOverReceive
                                                ? 'border-amber-400 dark:border-amber-600 focus:ring-amber-500'
                                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                                            }`}
                                    />
                                    {isOverReceive && (
                                        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                            Exceeds remaining qty ({Math.max(0, remaining)})
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Damaged
                                    </label>
                                    <input
                                        type="number"
                                        value={item.damagedQuantity}
                                        onChange={(e) => {
                                            const newItems = [...items];
                                            newItems[index].damagedQuantity = Math.max(0, parseInt(e.target.value) || 0);
                                            setItems(newItems);
                                        }}
                                        min="0"
                                        max={Math.max(0, remaining)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Totals */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Total receiving:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">{totalReceiving} good</span>
                    </div>
                    {totalDamaged > 0 && (
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-600 dark:text-gray-400">Total damaged:</span>
                            <span className="font-medium text-red-600 dark:text-red-400">{totalDamaged}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || totalReceiving === 0}
                        theme="success"
                    >
                        {isSubmitting ? 'Receiving...' : 'Receive Items'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ReceiveModal;
