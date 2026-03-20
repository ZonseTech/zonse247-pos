import { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from './ProductVariantPicker';

interface DamageStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: DamageStockPayload) => Promise<any>;
}

const DAMAGE_REASONS = [
    'Physical damage (broken/cracked)',
    'Water or moisture damage',
    'Pest or vermin damage',
    'Spoilage (expired perishable)',
    'Manufacturing defect',
    'Shipping/transit damage',
    'Electrical/power fault',
];

const DamageStockModal: FC<DamageStockModalProps> = ({
    isOpen, onClose, onSubmit,
}) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
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
        setQuantity('');
        setReason('');
        setNotes('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!selected || !quantity || !reason.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                inventoryId: selected.inventoryId,
                quantity: parseInt(quantity),
                notes: [reason.trim(), notes.trim()].filter(Boolean).join(' — ') || undefined,
            });
            handleClose();
        } catch {
            // Error handled by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const qty = parseInt(quantity) || 0;
    const currentAvailable = selected?.availableQuantity ?? 0;
    const currentDamaged = selected?.damagedQuantity ?? 0;
    const newAvailable = Math.max(0, currentAvailable - qty);
    const newDamaged = currentDamaged + qty;
    const isOverQuantity = qty > currentAvailable;
    const isValid = selected && qty > 0 && reason.trim().length > 0 && !isOverQuantity;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Damage</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Mark stock as damaged and remove from available
                            </p>
                        </div>
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
                            {/* Damaged Quantity */}
                            <div>
                                <Label>Damaged Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={currentAvailable}
                                    value={quantity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                                    placeholder={`Max: ${currentAvailable}`}
                                    className="mt-1.5 w-full"
                                />
                                {isOverQuantity && (
                                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Cannot exceed available stock ({currentAvailable})
                                    </p>
                                )}
                            </div>

                            {/* Damage Reason — quick-select chips */}
                            <div>
                                <Label>
                                    Damage Reason <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {DAMAGE_REASONS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setReason(preset)}
                                            className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${reason === preset
                                                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-medium'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="text"
                                    value={reason}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                                    placeholder="Or type a custom reason..."
                                    className="mt-2 w-full"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Describe the extent of damage, location, etc."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Impact Preview */}
                            {qty > 0 && !isOverQuantity && (
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/50">
                                    <p className="text-xs font-medium text-orange-800 dark:text-orange-300 mb-2">Impact Preview</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Available After</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{currentAvailable}</span>
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">{newAvailable}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Damaged</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">{currentDamaged}</span>
                                                <ArrowRight className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{newDamaged}</span>
                                            </div>
                                        </div>
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
                        theme="warning"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Record Damage
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DamageStockModal;
