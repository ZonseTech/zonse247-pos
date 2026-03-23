import { useState, useEffect, useCallback, FC } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRightLeft, Building2, Loader2 } from 'lucide-react';
import { Button, Input, Label } from '../../../components';
import ProductVariantPicker, { type SelectedVariant } from './ProductVariantPicker';
import branchService from '../../../services/branch.service';

interface StockTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: TransferStockPayload) => Promise<any>;
    tenantId: string;
    branchId: string;
    userId: string;
}

const StockTransferModal: FC<StockTransferModalProps> = ({
    isOpen, onClose, onSubmit, tenantId, branchId, userId,
}) => {
    const [selected, setSelected] = useState<SelectedVariant | null>(null);
    const [toBranchId, setToBranchId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);

    // Load destination branches (exclude current branch)
    const loadBranches = useCallback(async () => {
        if (!tenantId || !branchId) return;
        setLoadingBranches(true);
        try {
            const allBranches = await branchService.getByTenant(tenantId);
            setBranches(
                allBranches.filter(
                    (b) => b.branchId !== branchId && b.isActive && b.status === 'active'
                )
            );
        } catch {
            setBranches([]);
        } finally {
            setLoadingBranches(false);
        }
    }, [tenantId, branchId]);

    useEffect(() => {
        if (isOpen) loadBranches();
    }, [isOpen, loadBranches]);

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
        setToBranchId('');
        setQuantity('');
        setNotes('');
        onClose();
    };

    const qty = parseInt(quantity) || 0;
    const available = selected?.availableQuantity ?? 0;
    const destinationBranch = branches.find((b) => b.branchId === toBranchId);
    const isValid = selected && toBranchId && qty > 0 && qty <= available;

    const handleSubmit = async () => {
        if (!isValid || !selected) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                tenantId,
                fromBranchId: branchId,
                toBranchId,
                productId: selected.id,
                quantity: qty,
                notes: notes.trim() || undefined,
                performedBy: userId,
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
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <ArrowRightLeft className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Transfer Stock
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {selected
                                    ? <>{selected.name} — <span className="font-semibold">{selected.variantName}</span></>
                                    : 'Move inventory to another branch'}
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
                    {/* Product Picker */}
                    <ProductVariantPicker
                        selected={selected}
                        onSelect={setSelected}
                        label="Product / Variant"
                        placeholder="Search for product to transfer..."
                    />

                    {selected && (
                        <>
                            {/* Current Stock Info */}
                            <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                                <div className="flex-1">
                                    <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                                        Available at current branch
                                    </p>
                                    <p className="text-xl font-bold text-sky-700 dark:text-sky-300 mt-0.5">
                                        {available}
                                        <span className="text-xs font-normal ml-1 text-sky-500">units</span>
                                    </p>
                                </div>
                                {selected.sku && (
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-sky-500 dark:text-sky-400">SKU</p>
                                        <p className="text-xs font-mono text-sky-600 dark:text-sky-400">{selected.sku}</p>
                                    </div>
                                )}
                            </div>

                            {/* Destination Branch */}
                            <div>
                                <Label>
                                    Destination Branch <span className="text-red-500">*</span>
                                </Label>
                                {loadingBranches ? (
                                    <div className="flex items-center gap-2 mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading branches...
                                    </div>
                                ) : branches.length === 0 ? (
                                    <p className="mt-1.5 text-sm text-amber-600 dark:text-amber-400">
                                        No other active branches available for transfer.
                                    </p>
                                ) : (
                                    <select
                                        value={toBranchId}
                                        onChange={(e) => setToBranchId(e.target.value)}
                                        className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Select destination branch</option>
                                        {branches.map((b) => (
                                            <option key={b.branchId} value={b.branchId}>
                                                {b.branchName} ({b.branchCode})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <Label>
                                    Quantity <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max={available}
                                    value={quantity}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                                    placeholder={`Max ${available}`}
                                    className="mt-1.5 w-full"
                                />
                                {qty > available && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Cannot exceed available stock ({available})
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <Label>Notes (optional)</Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Reason for transfer, special instructions..."
                                    rows={2}
                                    className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            {/* Transfer Preview */}
                            {toBranchId && qty > 0 && qty <= available && (
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                    <p className="text-[10px] uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-medium mb-2">
                                        Transfer Preview
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 text-center">
                                            <Building2 className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Current Branch
                                            </p>
                                            <p className="text-xs text-red-500 font-medium mt-0.5">
                                                −{qty}
                                            </p>
                                        </div>
                                        <ArrowRightLeft className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                                        <div className="flex-1 text-center">
                                            <Building2 className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
                                            <p className="text-xs text-gray-500 dark:text-gray-400">To</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {destinationBranch?.branchName || '—'}
                                            </p>
                                            <p className="text-xs text-green-500 font-medium mt-0.5">
                                                +{qty}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-700/50">
                                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                            <span>Remaining at source</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {available - qty}
                                            </span>
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
                        theme="primary"
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        loading={isSubmitting}
                    >
                        Transfer Stock
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default StockTransferModal;
