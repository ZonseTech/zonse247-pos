import { FunctionComponent } from 'react';
import classNames from 'classnames';
import { PaymentMethodButtonsProps, PAYMENT_METHODS } from './types';
import { getPaymentMethodIcon, getPaymentMethodLabel, getPaymentMethodColor } from './utils';

const PaymentMethodButtons: FunctionComponent<PaymentMethodButtonsProps> = ({
    onAddPayment,
    processing,
    isEBN,
}) => {
    return (
        <div className="mb-6">
            <h3 className={classNames(
                "font-semibold text-gray-700 dark:text-gray-300 mb-3",
                isEBN ? "text-sm" : "text-base"
            )}>Add Payment Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                {Object.values(PAYMENT_METHODS).map(method => (
                    <button
                        key={method}
                        onClick={() => onAddPayment(method)}
                        disabled={processing}
                        className={classNames(
                            "flex flex-col items-center justify-center text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                            getPaymentMethodColor(method),
                            isEBN ? "p-3 gap-1" : "p-4 gap-2"
                        )}
                    >
                        {getPaymentMethodIcon(method)}
                        <span className={classNames(
                            "font-medium",
                            isEBN ? "text-xs" : "text-sm"
                        )}>{getPaymentMethodLabel(method)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodButtons;
