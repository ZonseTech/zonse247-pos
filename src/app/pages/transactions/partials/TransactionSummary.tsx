import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";
import { Wallet, CreditCard, Receipt, Percent, Calculator, ArrowDownRight, Coins } from "lucide-react";

const SummaryRow: FunctionComponent<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    labelClassName?: string;
    valueClassName?: string;
    variant?: 'default' | 'highlight' | 'success' | 'warning';
    compact?: boolean;
}> = ({ label, value, icon, labelClassName = '', valueClassName = '', variant = 'default', compact = false }) => {
    const variantStyles = {
        default: '',
        highlight: compact
            ? 'bg-blue-50/50 dark:bg-blue-900/20 -mx-2 px-2 py-1 rounded'
            : 'bg-blue-50/50 dark:bg-blue-900/20 -mx-4 px-4 py-2 rounded-lg',
        success: '',
        warning: ''
    };

    return (
        <div className={`flex justify-between items-center ${variantStyles[variant]}`}>
            <span className={compact
                ? `text-[10px] text-gray-600 dark:text-gray-400 font-medium flex items-center gap-1 ${labelClassName}`
                : `text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ${labelClassName}`
            }>
                {icon}
                {label}
            </span>
            <span className={compact
                ? `text-[10px] text-gray-900 dark:text-gray-100 font-semibold ${valueClassName}`
                : `text-gray-900 dark:text-gray-100 font-semibold ${valueClassName}`
            }>
                {value}
            </span>
        </div>
    );
};

const TransactionSummary: FunctionComponent<{
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paid: number;
    changeAmount: number;
    paymentMethod: string;
    hasTax: boolean;
    hasDiscount: boolean;
    compact?: boolean;
}> = ({ subtotal, tax, discount, total, paid, changeAmount, paymentMethod, hasTax, hasDiscount, compact = false }) => (
    <div className={compact
        ? "bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-lg border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
        : "bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden"
    }>
        <div className={compact
            ? "px-2 py-1.5 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50"
            : "px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50"
        }>
            <h4 className={compact
                ? "text-[9px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1"
                : "text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"
            }>
                <span className={compact ? "w-0.5 h-3 bg-amber-500 rounded-full" : "w-1 h-4 bg-amber-500 rounded-full"}></span>
                <Wallet className={compact ? "w-3 h-3" : "w-4 h-4"} />
                Payment Summary
            </h4>
        </div>

        <div className={compact ? "p-2 space-y-2" : "p-5 space-y-4"}>
            {/* Order Breakdown */}
            <div className={compact
                ? "bg-white dark:bg-gray-800/50 rounded-lg p-2 space-y-1.5 border border-gray-100 dark:border-gray-700/50"
                : "bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700/50"
            }>
                <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(subtotal)}
                    icon={<Calculator className={compact ? "w-2.5 h-2.5 text-gray-400" : "w-4 h-4 text-gray-400"} />}
                    compact={compact}
                />

                {hasTax && (
                    <SummaryRow
                        label="Tax"
                        value={formatCurrency(tax)}
                        icon={<Receipt className={compact ? "w-2.5 h-2.5 text-amber-500" : "w-4 h-4 text-amber-500"} />}
                        valueClassName="text-amber-600 dark:text-amber-400"
                        compact={compact}
                    />
                )}

                {hasDiscount && (
                    <SummaryRow
                        label="Discount"
                        value={`-${formatCurrency(discount)}`}
                        icon={<Percent className={compact ? "w-2.5 h-2.5 text-emerald-500" : "w-4 h-4 text-emerald-500"} />}
                        valueClassName="text-emerald-600 dark:text-emerald-400"
                        compact={compact}
                    />
                )}
            </div>

            {/* Total Amount - Highlighted */}
            <div className={compact
                ? "border-t border-b border-gray-900 dark:border-gray-100 py-2"
                : "border-t-2 border-b-2 border-gray-900 dark:border-gray-100 py-4"
            }>
                <div className="flex justify-between items-center">
                    <span className={compact
                        ? "text-xs text-gray-900 dark:text-gray-100 font-semibold flex items-center gap-1"
                        : "text-gray-900 dark:text-gray-100 font-semibold text-lg flex items-center gap-2"
                    }>
                        <Coins className={compact ? "w-3 h-3" : "w-5 h-5"} />
                        Total
                    </span>
                    <span className={compact
                        ? "text-sm text-gray-900 dark:text-gray-100 font-bold"
                        : "text-gray-900 dark:text-gray-100 font-bold text-3xl"
                    }>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* Payment Details */}
            <div className={compact
                ? "bg-white dark:bg-gray-800/50 rounded-lg p-2 space-y-1.5 border border-gray-100 dark:border-gray-700/50"
                : "bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700/50"
            }>
                <SummaryRow
                    label="Amount Paid"
                    value={formatCurrency(paid)}
                    icon={<ArrowDownRight className={compact ? "w-2.5 h-2.5 text-gray-400" : "w-4 h-4 text-gray-400"} />}
                    compact={compact}
                />

                {changeAmount > 0 && (
                    <SummaryRow
                        label="Change Given"
                        value={formatCurrency(changeAmount)}
                        icon={<Coins className={compact ? "w-2.5 h-2.5 text-green-500" : "w-4 h-4 text-green-500"} />}
                        valueClassName="text-green-600 dark:text-green-400 font-bold"
                        compact={compact}
                    />
                )}

                <div className={compact
                    ? "pt-1.5 mt-1 border-t border-gray-100 dark:border-gray-700"
                    : "pt-3 mt-2 border-t border-gray-100 dark:border-gray-700"
                }>
                    <SummaryRow
                        label="Payment Method"
                        value={paymentMethod}
                        icon={<CreditCard className={compact ? "w-2.5 h-2.5 text-gray-400" : "w-4 h-4 text-gray-400"} />}
                        compact={compact}
                    />
                </div>
            </div>
        </div>
    </div>
);


export default TransactionSummary