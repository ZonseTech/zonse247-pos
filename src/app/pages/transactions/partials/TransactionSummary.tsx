import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";

const SummaryRow: FunctionComponent<{
    label: string;
    value: string;
    labelClassName?: string;
    valueClassName?: string;
}> = ({ label, value, labelClassName = '', valueClassName = '' }) => (
    <div className="flex justify-between items-center">
        <span className={`text-gray-600 dark:text-gray-400 font-medium ${labelClassName}`}>
            {label}
        </span>
        <span className={`text-gray-900 dark:text-gray-100 font-medium ${valueClassName}`}>
            {value}
        </span>
    </div>
);

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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
            💰 Payment Summary
        </h4>

        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

                {hasTax && (
                    <SummaryRow
                        label="Tax"
                        value={formatCurrency(tax)}
                        valueClassName="text-amber-600 dark:text-amber-400"
                    />
                )}

                {hasDiscount && (
                    <SummaryRow
                        label="Discount"
                        value={`-${formatCurrency(discount)}`}
                        valueClassName="text-emerald-600 dark:text-emerald-400 font-semibold"
                    />
                )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800/50">
                <SummaryRow
                    label="Total Amount"
                    value={formatCurrency(total)}
                    labelClassName="font-bold text-lg text-blue-900 dark:text-blue-100"
                    valueClassName="font-bold text-xl text-blue-900 dark:text-blue-100"
                />
            </div>

            <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                <SummaryRow
                    label="Amount Paid"
                    value={formatCurrency(paid)}
                    valueClassName="font-semibold"
                />

                {changeAmount > 0 && (
                    <SummaryRow
                        label="Change Given"
                        value={formatCurrency(changeAmount)}
                        valueClassName="text-green-600 dark:text-green-400 font-semibold"
                    />
                )}

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <SummaryRow
                        label="Payment Method"
                        value={paymentMethod}
                        valueClassName="font-medium"
                    />
                </div>
            </div>
        </div>
    </div>
);


export default TransactionSummary