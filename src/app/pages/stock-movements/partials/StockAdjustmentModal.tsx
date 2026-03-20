import { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Minus, Hash, ArrowRight } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from './ProductVariantPicker';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: StockAdjustmentPayload) => Promise<any>;
}

const ADJUSTMENT_TYPES = [
    {
        type: 'ADD' as const,
        icon: Plus,
        label: 'Add Stock',
        color: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    },
    {
        type: 'SUBTRACT' as const,
        icon: Minus,
        label: 'Remove',
        color: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    },
    {
        type: 'SET' as const,
        icon: Hash,
        label: 'Set Exact',
        color: 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400',
    },
];

const StockAdjustmentModal: FC<StockAdjustmentModalProps> = ({
    isOpen, onClose, onSubmit,
}) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
    const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        setSelected(null);
        setAdjustmentType('ADD');
        setQuantity('');
        setReason('');
        setNotes('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!selected || !quantity || !reason.trim()) return;
        setIsSubmitting(true);
        try {
            const signedQty = adjustmentType === 'SUBTRACT' ? -parseInt(quantity) : parseInt(quantity);
            await onSubmit({
                inventoryId: selected.inventoryId,
                quantity: signedQty,
                notes: [reason.trim(), notes.trim()].filter(Boolean).join(' — ') || undefined,
            });
            handleClose();
        } catch {
            // Error handled by hook (Notify.failure)
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const qty = parseInt(quantity) || 0;
    const currentQty = selected?.availableQuantity ?? 0;
    const newQty =
        adjustmentType === 'ADD' ? currentQty + qty
            : adjustmentType === 'SUBTRACT' ? Math.max(0, currentQty - qty)
                : qty;
    const change = newQty - currentQty;
    const isValid = selected && qty > 0 && reason.trim().length > 0;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Adjust Stock</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Manual inventory adjustment with audit trail
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    <ProductVariantPicker selected={selected} onSelect={setSelected} />

                    {selected && (
                        <>
                            {/* Adjustment Type */}
                            <div>
                                <Label>Adjustment Type</Label>
                                <div className="grid grid-cols-3 gap-2 mt-1.5">
                                    {ADJUSTMENT_TYPES.map(({ type, icon: Icon, label, color }) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setAdjustmentType(type)}
                                            className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border-2 text-xs font-medium transition-all ${adjustmentType === type
                                                ? color
                                                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                                    placeholder="Enter quantity"
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Reason */}
                            <div>
                                <Label>
                                    Reason <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    value={reason}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                                    placeholder="e.g., Stock count correction, Received donation"
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional details..."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Live Preview */}
                            {qty > 0 && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Current</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{currentQty}</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">New</p>
                                        <p className={`text-lg font-bold ${newQty > currentQty ? 'text-green-600 dark:text-green-400'
                                            : newQty < currentQty ? 'text-red-600 dark:text-red-400'
                                                : 'text-sky-600 dark:text-sky-400'
                                            }`}>
                                            {newQty}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Change</p>
                                        <p className={`text-lg font-bold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {change >= 0 ? '+' : ''}{change}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Button theme="neutral" layout="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Apply Adjustment
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StockAdjustmentModal;
