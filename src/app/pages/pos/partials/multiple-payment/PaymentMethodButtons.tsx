import { FunctionComponent } from 'react';
import { Plus } from 'lucide-react';
import classNames from 'classnames';
import { PaymentMethodButtonsProps, PAYMENT_METHODS } from './types';
import { getPaymentMethodIcon, getPaymentMethodLabel, getPaymentMethodColor } from './utils';

const PaymentMethodButtons: FunctionComponent<PaymentMethodButtonsProps> = ({
    onAddPayment,
    processing,
    isEBN,
}) => {
    return (
        <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className={classNames(
                    "font-semibold text-gray-700 dark:text-gray-300",
                    isEBN ? "text-sm" : "text-sm sm:text-base"
                )}>Add Payment</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {Object.values(PAYMENT_METHODS).map(method => (
                    <button
                        key={method}
                        onClick={() => onAddPayment(method)}
                        disabled={processing}
                        className={classNames(
                            "group relative flex flex-col items-center justify-center text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl overflow-hidden shadow-md hover:shadow-lg",
                            getPaymentMethodColor(method),
                            isEBN ? "p-3 gap-1.5" : "p-3 sm:p-4 gap-1.5 sm:gap-2"
                        )}
                    >
                        {/* Subtle shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className={classNames(
                                "mb-1 opacity-90",
                                isEBN ? "[&>svg]:w-5 [&>svg]:h-5" : "[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6"
                            )}>
                                {getPaymentMethodIcon(method)}
                            </div>
                            <span className={classNames(
                                "font-semibold text-center leading-tight",
                                isEBN ? "text-xs" : "text-xs sm:text-sm"
                            )}>{getPaymentMethodLabel(method)}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodButtons;
