import { FunctionComponent } from 'react';
import { TrendingUp, Wallet, AlertCircle, ArrowDownCircle } from 'lucide-react';
import classNames from 'classnames';
import { formatCurrency } from '../../../../utils';
import { PaymentSummaryProps } from './types';

const PaymentSummary: FunctionComponent<PaymentSummaryProps> = ({
    total,
    totalPaid,
    remaining,
    change,
    isFullyPaid,
    isEBN,
    isMobile = false,
}) => {
    const progressPercent = Math.min(100, (totalPaid / total) * 100);

    // Mobile: Compact sticky summary bar
    if (isMobile) {
        return (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 px-4 py-3 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                    {/* Total & Paid */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-400 text-xs">Total:</span>
                            <span className="text-white font-bold text-sm">{formatCurrency(total)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">Paid:</span>
                            <span className="text-emerald-400 font-bold text-sm">{formatCurrency(totalPaid)}</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className={classNames(
                        "flex-shrink-0 px-3 py-1.5 rounded-full font-semibold text-xs",
                        isFullyPaid
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : remaining > 0
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    )}>
                        {isFullyPaid ? (
                            <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Ready
                            </span>
                        ) : change > 0 ? (
                            <span className="flex items-center gap-1">
                                <ArrowDownCircle className="w-3 h-3" />
                                {formatCurrency(change)}
                            </span>
                        ) : remaining > 0 ? (
                            <span className="flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                -{formatCurrency(remaining)}
                            </span>
                        ) : (
                            'Pending'
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={classNames(
                                "h-full transition-all duration-500 ease-out rounded-full",
                                isFullyPaid ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-cyan-500 to-sky-500"
                            )}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Desktop/Tablet: Full summary panel
    return (
        <div className={classNames(
            "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-0",
            isEBN ? "p-3" : "p-4 md:p-5"
        )}>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                </div>
                <h3 className={classNames(
                    "font-bold text-gray-900 dark:text-white",
                    isEBN ? "text-sm" : "text-base"
                )}>Payment Summary</h3>
            </div>

            {/* Total Due - Highlighted */}
            <div className={classNames(
                "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl mb-3",
                isEBN ? "p-3" : "p-4"
            )}>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mb-1">Total Amount Due</p>
                <p className={classNames(
                    "font-bold text-gray-900 dark:text-white",
                    isEBN ? "text-xl" : "text-2xl md:text-3xl"
                )}>
                    {formatCurrency(total)}
                </p>
            </div>

            {/* Amount Paid */}
            <div className={classNames(
                "bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mb-3",
                isEBN ? "p-3" : "p-4"
            )}>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <p className="text-emerald-700 dark:text-emerald-300 text-xs font-medium">Amount Paid</p>
                </div>
                <p className={classNames(
                    "font-bold text-emerald-600 dark:text-emerald-400",
                    isEBN ? "text-xl" : "text-xl md:text-2xl"
                )}>
                    {formatCurrency(totalPaid)}
                </p>
            </div>

            {/* Remaining */}
            {remaining > 0 && (
                <div className={classNames(
                    "bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/50 mb-3",
                    isEBN ? "p-3" : "p-4"
                )}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <p className="text-red-700 dark:text-red-300 text-xs font-medium">Remaining</p>
                    </div>
                    <p className={classNames(
                        "font-bold text-red-600 dark:text-red-400",
                        isEBN ? "text-xl" : "text-xl md:text-2xl"
                    )}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            )}

            {/* Change */}
            {change > 0 && (
                <div className={classNames(
                    "bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/50 mb-3",
                    isEBN ? "p-3" : "p-4"
                )}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-amber-500 rounded-full" />
                        <p className="text-amber-700 dark:text-amber-300 text-xs font-medium">Change Due</p>
                    </div>
                    <p className={classNames(
                        "font-bold text-amber-600 dark:text-amber-400",
                        isEBN ? "text-xl" : "text-xl md:text-2xl"
                    )}>
                        {formatCurrency(change)}
                    </p>
                </div>
            )}

            {/* Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span className="font-medium">Progress</span>
                    <span className={classNames(
                        "font-semibold",
                        isFullyPaid ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-300"
                    )}>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={classNames(
                            "h-full transition-all duration-500 ease-out rounded-full",
                            isFullyPaid
                                ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                : "bg-gradient-to-r from-cyan-500 to-sky-500"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
