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
            "border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0 bg-white dark:bg-gray-900",
            isEBN ? "p-2" : "p-3 md:p-4"
        )}>
            <div className={classNames("flex items-center", isEBN ? "gap-2" : "gap-2 md:gap-3")}>
                <div className={classNames(
                    "bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center",
                    isEBN ? "w-8 h-8" : "w-8 h-8 md:w-10 md:h-10"
                )}>
                    <CreditCard className={classNames(
                        "text-gray-700 dark:text-gray-300",
                        isEBN ? "w-4 h-4" : "w-4 h-4 md:w-5 md:h-5"
                    )} />
                </div>
                <div>
                    <h2 className={classNames(
                        "font-bold text-gray-900 dark:text-white",
                        isEBN ? "text-sm" : "text-base md:text-lg"
                    )}>Split Payment</h2>
                    <p className={classNames(
                        "text-gray-500 dark:text-gray-400 hidden sm:block",
                        isEBN ? "text-xs" : "text-xs md:text-sm"
                    )}>Pay with multiple methods</p>
                </div>
            </div>
            <button
                onClick={onClose}
                disabled={processing}
                className={classNames(
                    "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400",
                    isEBN ? "p-1.5" : "p-1.5 md:p-2"
                )}
            >
                <X className={isEBN ? "w-5 h-5" : "w-5 h-5 md:w-6 md:h-6"} />
            </button>
        </div>
    );
};

export default ModalHeader;
