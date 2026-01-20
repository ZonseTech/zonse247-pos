import { FunctionComponent } from 'react';
import classNames from 'classnames';
import { ModalFooterProps } from './types';

const ModalFooter: FunctionComponent<ModalFooterProps> = ({
    onClose,
    onCompleteSale,
    isFullyPaid,
    processing,
    paymentsCount,
    isEBN,
}) => {
    const canComplete = isFullyPaid && paymentsCount > 0 && !processing;

    return (
        <div className={classNames(
            "flex flex-row justify-center items-center border-t flex-shrink-0",
            isEBN ? "space-x-2 p-2" : "space-x-3 md:space-x-4 p-3 md:p-6"
        )}>
            <button
                type="button"
                onClick={onCompleteSale}
                disabled={!canComplete}
                className={classNames(
                    "font-bold transition-colors rounded-none",
                    isEBN ? "px-8 py-3 text-sm" : "px-6 md:px-32 py-4 md:py-6 text-base md:text-lg",
                    canComplete
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                )}
            >
                {processing ? 'PROCESSING...' : (isEBN ? 'COMPLETE' : 'COMPLETE TRANSACTION')}
            </button>
            <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className={classNames(
                    "bg-red-500 text-white font-bold rounded-none hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed",
                    isEBN ? "px-8 py-3 text-sm" : "px-6 md:px-32 py-4 md:py-6 text-base md:text-lg"
                )}
            >
                CANCEL
            </button>
        </div>
    );
};

export default ModalFooter;
