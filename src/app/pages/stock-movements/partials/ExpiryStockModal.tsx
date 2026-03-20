import { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, ArrowRight } from 'lucide-react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from './ProductVariantPicker';
import { formatCurrency } from '../../../utils';

interface ExpiryStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        inventoryId: string;
        quantity: number;
        unitCost?: number;
        expiryDate?: string;
        notes?: string;
    }) => Promise<any>;
}

const ExpiryStockModal: FC<ExpiryStockModalProps> = ({
    isOpen, onClose, onSubmit,
}) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState<Date | null>(null);
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
        setExpiryDate(null);
        setNotes('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!selected || !quantity) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                inventoryId: selected.inventoryId,
                quantity: parseInt(quantity),
                expiryDate: expiryDate ? dayjs(expiryDate).format('YYYY-MM-DD') : undefined,
                notes: notes.trim() || undefined,
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
    const avgCost = selected?.averageCost ?? 0;
    const newAvailable = Math.max(0, currentAvailable - qty);
    const lossValue = qty * avgCost;
    const isOverQuantity = qty > currentAvailable;
    const isValid = selected && qty > 0 && !isOverQuantity;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Expiry</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Write off expired stock from inventory
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
                            {/* Expired Quantity */}
                            <div>
                                <Label>Expired Quantity</Label>
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
                                        <Clock className="w-3 h-3" />
                                        Cannot exceed available stock ({currentAvailable})
                                    </p>
                                )}
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <Label>Expiry Date (optional)</Label>
                                <div className="mt-1.5">
                                    <DatePicker
                                        selected={expiryDate}
                                        onChange={(date: Date | null) => setExpiryDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        placeholderText="Select expiry date"
                                        isClearable
                                        maxDate={new Date()}
                                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                        portalId="datepicker-portal"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Batch number, storage conditions, etc."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Impact Preview */}
                            {qty > 0 && !isOverQuantity && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800/50">
                                    <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-2">Impact Preview</p>
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
                                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Loss Value</p>
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                                                {formatCurrency(lossValue)}
                                            </p>
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
                        theme="danger"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Record Expiry
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ExpiryStockModal;
