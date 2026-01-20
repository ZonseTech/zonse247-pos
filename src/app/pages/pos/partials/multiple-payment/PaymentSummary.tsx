import { FunctionComponent } from 'react';
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
}) => {
    const progressPercent = Math.min(100, (totalPaid / total) * 100);

    return (
        <div className={classNames(
            "bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-sm border border-gray-200 dark:border-gray-600 sticky top-0",
            isEBN ? "p-3" : "p-4 md:p-6"
        )}>
            <h3 className={classNames(
                "font-bold text-gray-900 dark:text-white mb-4",
                isEBN ? "text-sm" : "text-lg"
            )}>Payment Summary</h3>

            {/* Total Due */}
            <div className={classNames(
                "bg-white dark:bg-gray-600 rounded-lg shadow-sm mb-4",
                isEBN ? "p-3" : "p-4"
            )}>
                <p className={classNames(
                    "text-gray-500 dark:text-gray-400 mb-1",
                    isEBN ? "text-xs" : "text-sm"
                )}>Total Due</p>
                <p className={classNames(
                    "font-bold text-gray-900 dark:text-white",
                    isEBN ? "text-xl" : "text-3xl"
                )}>
                    {formatCurrency(total)}
                </p>
            </div>

            {/* Amount Paid */}
            <div className={classNames(
                "bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 mb-4",
                isEBN ? "p-3" : "p-4"
            )}>
                <p className={classNames(
                    "text-green-700 dark:text-green-300 mb-1",
                    isEBN ? "text-xs" : "text-sm"
                )}>Amount Paid</p>
                <p className={classNames(
                    "font-bold text-green-600 dark:text-green-400",
                    isEBN ? "text-xl" : "text-3xl"
                )}>
                    {formatCurrency(totalPaid)}
                </p>
            </div>

            {/* Remaining */}
            {remaining > 0 && (
                <div className={classNames(
                    "bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 mb-4",
                    isEBN ? "p-3" : "p-4"
                )}>
                    <p className={classNames(
                        "text-red-700 dark:text-red-300 mb-1",
                        isEBN ? "text-xs" : "text-sm"
                    )}>Remaining</p>
                    <p className={classNames(
                        "font-bold text-red-600 dark:text-red-400",
                        isEBN ? "text-xl" : "text-3xl"
                    )}>
                        {formatCurrency(remaining)}
                    </p>
                </div>
            )}

            {/* Change */}
            {change > 0 && (
                <div className={classNames(
                    "bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800",
                    isEBN ? "p-3" : "p-4"
                )}>
                    <p className={classNames(
                        "text-yellow-700 dark:text-yellow-300 mb-1",
                        isEBN ? "text-xs" : "text-sm"
                    )}>Change Due</p>
                    <p className={classNames(
                        "font-bold text-yellow-600 dark:text-yellow-400",
                        isEBN ? "text-xl" : "text-3xl"
                    )}>
                        {formatCurrency(change)}
                    </p>
                </div>
            )}

            {/* Payment Progress Bar */}
            <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Payment Progress</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                        className={classNames(
                            "h-full transition-all duration-300",
                            isFullyPaid ? "bg-green-500" : "bg-blue-500"
                        )}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaymentSummary;
