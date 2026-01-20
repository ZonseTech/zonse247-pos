import { FunctionComponent } from 'react';
import { Trash2 } from 'lucide-react';
import classNames from 'classnames';
import { formatCurrency } from '../../../../utils';
import { QUICK_AMOUNTS } from './constants';
import { PaymentEntryCardProps, PAYMENT_METHODS } from './types';
import { getPaymentMethodIcon, getPaymentMethodLabel, getPaymentMethodColor } from './utils';

const PaymentEntryCard: FunctionComponent<PaymentEntryCardProps> = ({
    payment,
    index,
    remaining,
    processing,
    isEBN,
    onUpdate,
    onRemove,
}) => {
    const quickAmounts = [remaining, ...QUICK_AMOUNTS].filter(v => v > 0).slice(0, 6);

    return (
        <div className={classNames(
            "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm",
            isEBN ? "p-3" : "p-4"
        )}>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={classNames(
                        "rounded-lg p-2 text-white",
                        getPaymentMethodColor(payment.paymentMethodId)
                    )}>
                        {getPaymentMethodIcon(payment.paymentMethodId)}
                    </div>
                    <div>
                        <p className={classNames(
                            "font-semibold text-gray-900 dark:text-white",
                            isEBN ? "text-sm" : "text-base"
                        )}>
                            {getPaymentMethodLabel(payment.paymentMethodId)}
                        </p>
                        <p className={classNames(
                            "text-gray-500 dark:text-gray-400",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            Payment #{index + 1}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onRemove(payment.id)}
                    disabled={processing}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                    <label className={classNames(
                        "block text-gray-600 dark:text-gray-400 mb-1",
                        isEBN ? "text-xs" : "text-sm"
                    )}>
                        Amount *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={payment.amount}
                        onChange={(e) => onUpdate(payment.id, 'amount', e.target.value)}
                        disabled={processing}
                        placeholder="0.00"
                        className={classNames(
                            "w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50",
                            isEBN ? "px-3 py-2 text-sm" : "px-4 py-3"
                        )}
                    />
                </div>

                {/* Reference (for non-cash) */}
                {payment.paymentMethodId !== PAYMENT_METHODS.CASH && (
                    <div>
                        <label className={classNames(
                            "block text-gray-600 dark:text-gray-400 mb-1",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            Reference
                        </label>
                        <input
                            type="text"
                            value={payment.reference || ''}
                            onChange={(e) => onUpdate(payment.id, 'reference', e.target.value)}
                            disabled={processing}
                            placeholder="Transaction reference"
                            className={classNames(
                                "w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50",
                                isEBN ? "px-3 py-2 text-sm" : "px-4 py-3"
                            )}
                        />
                    </div>
                )}

                {/* Phone Number (for mobile money) */}
                {payment.paymentMethodId === PAYMENT_METHODS.MOBILE_MONEY && (
                    <div>
                        <label className={classNames(
                            "block text-gray-600 dark:text-gray-400 mb-1",
                            isEBN ? "text-xs" : "text-sm"
                        )}>
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={payment.phoneNumber || ''}
                            onChange={(e) => onUpdate(payment.id, 'phoneNumber', e.target.value)}
                            disabled={processing}
                            placeholder="e.g., 0999123456"
                            className={classNames(
                                "w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50",
                                isEBN ? "px-3 py-2 text-sm" : "px-4 py-3"
                            )}
                        />
                    </div>
                )}
            </div>

            {/* Quick amount buttons for cash */}
            {payment.paymentMethodId === PAYMENT_METHODS.CASH && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {quickAmounts.map(amount => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => onUpdate(payment.id, 'amount', amount.toString())}
                            disabled={processing}
                            className={classNames(
                                "px-3 py-1 rounded-full text-sm font-medium transition-colors disabled:opacity-50",
                                parseFloat(payment.amount) === amount
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            )}
                        >
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentEntryCard;
