import { FunctionComponent } from 'react';
import { Check, X } from 'lucide-react';
import classNames from 'classnames';
import { formatCurrency } from '../../../../utils';
import { ModalFooterProps } from './types';

const ModalFooter: FunctionComponent<ModalFooterProps> = ({
    onClose,
    onCompleteSale,
    isFullyPaid,
    processing,
    paymentsCount,
    isEBN,
    remaining = 0,
}) => {
    const canComplete = isFullyPaid && paymentsCount > 0 && !processing;

    return (
        <div className={classNames(
            "border-t border-gray-200 dark:border-gray-700/50 flex-shrink-0 bg-white dark:bg-gray-900",
            isEBN ? "p-2" : "p-3 sm:p-4 md:p-5"
        )}>
            {!isFullyPaid && remaining > 0 && (
                <div className="sm:hidden mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-300 text-xs font-medium">Amount remaining</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">{formatCurrency(remaining)}</span>
                </div>
            )}

            <div className={classNames(
                "flex items-center gap-2 sm:gap-3",
                isEBN ? "" : "flex-col xs:flex-row"
            )}>
                <button
                    type="button"
                    onClick={onCompleteSale}
                    disabled={!canComplete}
                    className={classNames(
                        "flex items-center justify-center gap-2 font-semibold transition-all rounded-xl shadow-lg active:scale-[0.98]",
                        isEBN
                            ? "flex-1 px-6 py-3 text-sm"
                            : "w-full xs:flex-1 px-5 py-3.5 sm:py-4 text-sm sm:text-base",
                        canComplete
                            ? 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 text-white shadow-cyan-500/25'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none'
                    )}
                >
                    {processing ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Complete Sale</span>
                        </>
                    )}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={processing}
                    className={classNames(
                        "flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]",
                        isEBN
                            ? "px-6 py-3 text-sm"
                            : "w-full xs:w-auto px-5 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base"
                    )}
                >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Cancel</span>
                </button>
            </div>
        </div>
    );
};

export default ModalFooter;
