import { FunctionComponent } from 'react';
import { Trash2, Hash } from 'lucide-react';
import classNames from 'classnames';
import { formatCurrency } from '../../../../utils';
import { QUICK_AMOUNTS } from './constants';
import { PaymentEntryCardProps, PAYMENT_METHODS } from './types';
import { getPaymentMethodIcon, getPaymentMethodLabel, getPaymentMethodColor } from './utils';
import { usePaymentServiceProviders } from '../../../../hooks/usePaymentServiceProviders';

const PaymentEntryCard: FunctionComponent<PaymentEntryCardProps> = ({
    payment,
    index,
    remaining,
    processing,
    isEBN,
    onUpdate,
    onRemove,
}) => {
    const quickAmounts = [remaining, ...QUICK_AMOUNTS].filter(v => v > 0).slice(0, 5);
    const { providers } = usePaymentServiceProviders(
        payment.paymentMethodId !== PAYMENT_METHODS.CASH ? payment.paymentMethodId : undefined
    );

    return (
        <div className={classNames(
            "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow",
            isEBN ? "p-3" : "p-3 sm:p-4"
        )}>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={classNames(
                        "rounded-xl text-white shadow-md",
                        getPaymentMethodColor(payment.paymentMethodId),
                        isEBN ? "p-2" : "p-2 sm:p-2.5"
                    )}>
                        {getPaymentMethodIcon(payment.paymentMethodId)}
                    </div>
                    <div>
                        <p className={classNames(
                            "font-semibold text-gray-900 dark:text-white",
                            isEBN ? "text-sm" : "text-sm sm:text-base"
                        )}>
                            {getPaymentMethodLabel(payment.paymentMethodId)}
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                            <Hash className="w-3 h-3" />
                            <span className="text-xs">{index + 1}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => onRemove(payment.id)}
                    disabled={processing}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-50 active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
                {/* Amount - Full Width on Mobile */}
                <div>
                    <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5">
                        Amount
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">K</span>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            value={payment.amount}
                            onChange={(e) => onUpdate(payment.id, 'amount', e.target.value)}
                            disabled={processing}
                            placeholder="0.00"
                            className={classNames(
                                "w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all font-semibold pl-8",
                                isEBN ? "py-2.5 text-base" : "py-3 text-lg sm:text-xl"
                            )}
                        />
                    </div>
                </div>

                {/* Quick Amount Pills for Cash */}
                {payment.paymentMethodId === PAYMENT_METHODS.CASH && quickAmounts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {quickAmounts.map((amount, i) => (
                            <button
                                key={amount}
                                type="button"
                                onClick={() => onUpdate(payment.id, 'amount', amount.toString())}
                                disabled={processing}
                                className={classNames(
                                    "px-2.5 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 active:scale-95",
                                    parseFloat(payment.amount) === amount
                                        ? "bg-cyan-500 text-white shadow-sm"
                                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
                                    i === 0 && "ring-1 ring-cyan-200 dark:ring-cyan-800"
                                )}
                            >
                                {i === 0 ? 'Exact' : formatCurrency(amount)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Provider (bank / mobile money network, for non-cash) */}
                {payment.paymentMethodId !== PAYMENT_METHODS.CASH && providers.length > 0 && (
                    <div>
                        <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5">
                            {payment.paymentMethodId === PAYMENT_METHODS.MOBILE_MONEY ? 'Network' : 'Bank'}
                        </label>
                        <select
                            value={payment.providerId || ''}
                            onChange={(e) => onUpdate(payment.id, 'providerId', e.target.value)}
                            disabled={processing}
                            className={classNames(
                                "w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all",
                                isEBN ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm"
                            )}
                        >
                            <option value="">Select...</option>
                            {providers.map(provider => (
                                <option key={provider.providerId} value={provider.providerId}>{provider.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Reference (for non-cash) */}
                {payment.paymentMethodId !== PAYMENT_METHODS.CASH && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5">
                                Reference / Auth Code
                            </label>
                            <input
                                type="text"
                                value={payment.reference || ''}
                                onChange={(e) => onUpdate(payment.id, 'reference', e.target.value)}
                                disabled={processing}
                                placeholder="Enter reference"
                                className={classNames(
                                    "w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all",
                                    isEBN ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm"
                                )}
                            />
                        </div>

                        {/* Phone Number (for mobile money) */}
                        {payment.paymentMethodId === PAYMENT_METHODS.MOBILE_MONEY && (
                            <div>
                                <label className="block text-gray-500 dark:text-gray-400 text-xs font-medium mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    value={payment.phoneNumber || ''}
                                    onChange={(e) => onUpdate(payment.id, 'phoneNumber', e.target.value)}
                                    disabled={processing}
                                    placeholder="e.g., 0999123456"
                                    className={classNames(
                                        "w-full border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-700 disabled:opacity-50 transition-all",
                                        isEBN ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm"
                                    )}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentEntryCard;
