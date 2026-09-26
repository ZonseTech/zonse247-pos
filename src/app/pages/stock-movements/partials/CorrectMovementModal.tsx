import { useState, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import dayjs from 'dayjs';
import { X, Undo2 } from 'lucide-react';
import { Button, Label } from '../../../components';

interface CorrectMovementModalProps {
    movement: StockMovement | null;
    label: string;
    onClose: () => void;
    onSubmit: (originalMovementId: string, reason: string) => Promise<any>;
}

// The API requires at least 5 characters
const MIN_REASON_LENGTH = 5;

const CorrectMovementModal: FC<CorrectMovementModalProps> = ({ movement, label, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!movement) return;
        const handleEscape = (e: KeyboardEvent) => e.key === 'Escape' && handleClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [movement]);

    const handleClose = () => {
        setReason('');
        onClose();
    };

    if (!movement) return null;

    const delta = movement.newQuantity - movement.previousQuantity;
    const reversal = -delta;
    const isValid = reason.trim().length >= MIN_REASON_LENGTH;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsSubmitting(true);
        try {
            await onSubmit(movement.id, reason.trim());
            handleClose();
        } catch {
            // Error handled by hook (Notify.failure)
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                            <Undo2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Correct Movement</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Records a reversing movement; the original stays in the history
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
                    <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {label} · {delta > 0 ? `+${delta}` : delta}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {movement.product?.name ?? ''} · {dayjs(movement.movementDate).format('MMM D, YYYY HH:mm')}
                        </p>
                        {movement.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">{movement.notes}</p>
                        )}
                    </div>

                    <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-200 dark:border-violet-800/50">
                        <p className="text-xs text-violet-800 dark:text-violet-300">
                            Stock will change by <span className="font-bold">{reversal > 0 ? `+${reversal}` : reversal}</span> to reverse this movement.
                        </p>
                    </div>

                    <div>
                        <Label>
                            Reason <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why is this being corrected?"
                            rows={3}
                            className="mt-1.5 w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                        />
                        {reason.length > 0 && !isValid && (
                            <p className="mt-1 text-xs text-red-500">At least {MIN_REASON_LENGTH} characters</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
                    <Button theme="neutral" layout="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isValid || isSubmitting} loading={isSubmitting}>
                        Record Correction
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CorrectMovementModal;
