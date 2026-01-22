import { FunctionComponent } from 'react';
import { X, CreditCard } from 'lucide-react';
import classNames from 'classnames';
import { ModalHeaderProps } from './types';

const ModalHeader: FunctionComponent<ModalHeaderProps> = ({
    onClose,
    processing,
    isEBN,
}) => {
    return (
        <div className={classNames(
            "border-b border-gray-200 dark:border-gray-700/50 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-900",
            isEBN ? "p-2" : "px-4 py-3 sm:px-5 sm:py-4"
        )}>
            <div className="flex items-center gap-3">
                <div className={classNames(
                    "bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20",
                    isEBN ? "w-9 h-9" : "w-10 h-10 sm:w-11 sm:h-11"
                )}>
                    <CreditCard className={classNames(
                        "text-white",
                        isEBN ? "w-4 h-4" : "w-5 h-5 sm:w-5 sm:h-5"
                    )} />
                </div>
                <div>
                    <h2 className={classNames(
                        "font-bold text-gray-900 dark:text-white",
                        isEBN ? "text-sm" : "text-base sm:text-lg"
                    )}>Split Payment</h2>
                    <p className={classNames(
                        "text-gray-500 dark:text-gray-400",
                        isEBN ? "text-xs" : "text-xs sm:text-sm"
                    )}>Multiple payment methods</p>
                </div>
            </div>
            <button
                onClick={onClose}
                disabled={processing}
                className={classNames(
                    "hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 active:scale-95",
                    isEBN ? "p-2" : "p-2 sm:p-2.5"
                )}
            >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
        </div>
    );
};

export default ModalHeader;
