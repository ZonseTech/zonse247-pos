import { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import { X, ClipboardCheck, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Equal, RotateCcw } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from './ProductVariantPicker';

interface StockCountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: {
        inventoryId: string;
        actualQuantity: number;
        unitCost?: number;
        notes?: string;
    }) => Promise<{
        movementId: string;
        previousQuantity: number;
        newQuantity: number;
        variance: number;
    }>;
}

interface CountResult {
    movementId: string;
    previousQuantity: number;
    newQuantity: number;
    variance: number;
}

const StockCountModal: FC<StockCountModalProps> = ({
    isOpen, onClose, onSubmit,
}) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
    const [actualCount, setActualCount] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countResult, setCountResult] = useState<CountResult | null>(null);

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
        setActualCount('');
        setNotes('');
        setCountResult(null);
        onClose();
    };

    const handleCountAnother = () => {
        setSelected(null);
        setActualCount('');
        setNotes('');
        setCountResult(null);
    };

    const handleSubmit = async () => {
        if (!selected || actualCount === '') return;
        setIsSubmitting(true);
        try {
            const result = await onSubmit({
                inventoryId: selected.inventoryId,
                actualQuantity: parseInt(actualCount),
                notes: notes.trim() || undefined,
            });
            setCountResult(result);
        } catch {
            // Error handled by hook
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const actual = parseInt(actualCount);
    const hasValidCount = !isNaN(actual) && actual >= 0;
    const systemQty = selected?.availableQuantity ?? 0;
    const variance = hasValidCount ? actual - systemQty : 0;
    const isValid = selected && hasValidCount;

    // --- Result Screen ---
    if (countResult) {
        const isMatch = countResult.variance === 0;
        const isOver = countResult.variance > 0;

        return createPortal(
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={(e) => e.target === e.currentTarget && handleClose()}
            >
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-xl shadow-2xl">
                    {/* Result Header */}
                    <div className="p-6 text-center">
                        {isMatch ? (
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                        ) : (
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isOver
                                ? 'bg-sky-100 dark:bg-sky-900/30'
                                : 'bg-amber-100 dark:bg-amber-900/30'
                                }`}>
                                <AlertTriangle className={`w-8 h-8 ${isOver
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                    }`} />
                            </div>
                        )}

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {isMatch ? 'Stock Matches!' : 'Variance Detected'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isMatch
                                ? 'Physical count matches the system quantity.'
                                : 'An adjustment has been automatically created.'}
                        </p>
                    </div>

                    {/* Result Details */}
                    <div className="px-6 pb-4">
                        <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">System</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{countResult.previousQuantity}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Actual</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{countResult.newQuantity}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Variance</p>
                                <p className={`text-xl font-bold mt-1 ${countResult.variance === 0
                                    ? 'text-green-600 dark:text-green-400'
                                    : countResult.variance > 0
                                        ? 'text-sky-600 dark:text-sky-400'
                                        : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {countResult.variance >= 0 ? '+' : ''}{countResult.variance}
                                </p>
                            </div>
                        </div>

                        {selected && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                                {selected.name} — {selected.variantName}
                            </p>
                        )}
                    </div>

                    {/* Result Actions */}
                    <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                        <Button theme="neutral" layout="outline" onClick={handleCountAnother} className="flex-1">
                            <RotateCcw className="w-4 h-4 mr-1.5" />
                            Count Another
                        </Button>
                        <Button theme="primary" onClick={handleClose} className="flex-1">
                            Done
                        </Button>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // --- Form Screen ---
    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <ClipboardCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Stock Count</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {selected
                                    ? <>{selected.name} — <span className="font-semibold">{selected.variantName}</span></>
                                    : 'Reconcile physical count with system records'}
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
                            {/* System Quantity (read-only) */}
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">System Quantity</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{systemQty}</span>
                                </div>
                            </div>

                            {/* Actual Count */}
                            <div>
                                <Label>Actual Physical Count</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={actualCount}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualCount(e.target.value)}
                                    placeholder="Enter the physical count"
                                    className="mt-1.5 w-full"
                                />
                            </div>

                            {/* Live Variance Display */}
                            {hasValidCount && (
                                <div className={`p-3 rounded-lg border ${variance === 0
                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                                    : variance > 0
                                        ? 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800/50'
                                        : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {variance === 0 ? (
                                                <Equal className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            ) : variance > 0 ? (
                                                <TrendingUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {variance === 0
                                                    ? 'Quantities match'
                                                    : variance > 0
                                                        ? 'Overage detected'
                                                        : 'Shortage detected'}
                                            </span>
                                        </div>
                                        <span className={`text-lg font-bold ${variance === 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : variance > 0
                                                ? 'text-sky-600 dark:text-sky-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {variance >= 0 ? '+' : ''}{variance}
                                        </span>
                                    </div>
                                    {variance !== 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                            An adjustment movement will be created to reconcile.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Counter name, location, observations..."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Button theme="neutral" layout="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        theme="success"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Submit Count
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StockCountModal;
