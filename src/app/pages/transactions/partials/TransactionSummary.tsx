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
}> = ({ label, value, icon, labelClassName = '', valueClassName = '', variant = 'default' }) => {
    const variantStyles = {
        default: '',
        highlight: 'bg-blue-50/50 dark:bg-blue-900/20 -mx-4 px-4 py-2 rounded-lg',
        success: '',
        warning: ''
    };

    return (
        <div className={`flex justify-between items-center ${variantStyles[variant]}`}>
            <span className={`text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 ${labelClassName}`}>
                {icon}
                {label}
            </span>
            <span className={`text-gray-900 dark:text-gray-100 font-semibold ${valueClassName}`}>
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
}> = ({ subtotal, tax, discount, total, paid, changeAmount, paymentMethod, hasTax, hasDiscount }) => (
    <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-xl border border-gray-200/80 dark:border-gray-700/50 overflow-hidden">
        <div className="px-5 py-4 bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                <Wallet className="w-4 h-4" />
                Payment Summary
            </h4>
        </div>

        <div className="p-5 space-y-4">
            {/* Order Breakdown */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700/50">
                <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(subtotal)}
                    icon={<Calculator className="w-4 h-4 text-gray-400" />}
                />

                {hasTax && (
                    <SummaryRow
                        label="Tax"
                        value={formatCurrency(tax)}
                        icon={<Receipt className="w-4 h-4 text-amber-500" />}
                        valueClassName="text-amber-600 dark:text-amber-400"
                    />
                )}

                {hasDiscount && (
                    <SummaryRow
                        label="Discount"
                        value={`-${formatCurrency(discount)}`}
                        icon={<Percent className="w-4 h-4 text-emerald-500" />}
                        valueClassName="text-emerald-600 dark:text-emerald-400"
                    />
                )}
            </div>

            {/* Total Amount - Highlighted */}
            <div className="border-t-2 border-b-2 border-gray-900 dark:border-gray-100 py-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        Total Amount
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold text-3xl">
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-gray-700/50">
                <SummaryRow
                    label="Amount Paid"
                    value={formatCurrency(paid)}
                    icon={<ArrowDownRight className="w-4 h-4 text-gray-400" />}
                />

                {changeAmount > 0 && (
                    <SummaryRow
                        label="Change Given"
                        value={formatCurrency(changeAmount)}
                        icon={<Coins className="w-4 h-4 text-green-500" />}
                        valueClassName="text-green-600 dark:text-green-400 font-bold"
                    />
                )}

                <div className="pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                    <SummaryRow
                        label="Payment Method"
                        value={paymentMethod}
                        icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                    />
                </div>
            </div>
        </div>
    </div>
);


export default TransactionSummary