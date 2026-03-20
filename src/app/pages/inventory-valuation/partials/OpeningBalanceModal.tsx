import { useState, useEffect, FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, FileSpreadsheet } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from '../../stock-movements/partials/ProductVariantPicker';
import { formatCurrency } from '../../../utils';

interface OpeningBalanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        inventoryId: string;
        quantity: number;
        unitCost: number;
        openingDate?: string;
        notes?: string;
    }) => Promise<any>;
}

const OpeningBalanceModal: FC<OpeningBalanceModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [openingDate, setOpeningDate] = useState('');
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
        setUnitCost('');
        setOpeningDate('');
        setNotes('');
        onClose();
    };

    const qty = parseFloat(quantity) || 0;
    const cost = parseFloat(unitCost) || 0;
    const totalValue = useMemo(() => qty * cost, [qty, cost]);
    const isValid = selected && qty > 0 && cost > 0;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                inventoryId: selected.id,
                quantity: qty,
                unitCost: cost,
                openingDate: openingDate || undefined,
                notes: notes.trim() || undefined,
            });
            handleClose();
        } catch {
            // Error handled by hook (Notify.failure)
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Opening Balance</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Record initial stock with unit cost
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
                    <ProductVariantPicker selected={selected} onSelect={setSelected} label="Product / Variant" />

                    {selected && (
                        <>
                            {/* Quantity */}
                            <div>
                                <Label>
                                    Quantity <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    value={quantity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                                    placeholder="Enter opening quantity"
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Unit Cost */}
                            <div>
                                <Label>
                                    Unit Cost (MK) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    value={unitCost}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnitCost(e.target.value)}
                                    placeholder="Cost per unit"
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Opening Date */}
                            <div>
                                <Label>Opening Date (optional)</Label>
                                <Input
                                    type="date"
                                    value={openingDate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpeningDate(e.target.value)}
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional details about the opening balance..."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Live Preview – Total Value */}
                            {qty > 0 && cost > 0 && (
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-emerald-500 dark:text-emerald-400 font-medium">
                                                Total Value
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {qty.toLocaleString()} × {formatCurrency(cost, true)}
                                            </p>
                                        </div>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                            {formatCurrency(totalValue, true)}
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
                        Record Balance
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OpeningBalanceModal;
