import { FunctionComponent } from "react";
import { formatCurrency } from "../../../utils";
import { Banknote, CreditCard, Smartphone, Building2 } from "lucide-react";

const getPaymentIcon = (methodName: string, compact: boolean = false) => {
    const iconClass = compact ? "w-3 h-3" : "w-3.5 h-3.5";
    const lowerName = methodName?.toLowerCase() || '';

    if (lowerName.includes('cash')) return <Banknote className={`${iconClass} text-green-500`} />;
    if (lowerName.includes('card') || lowerName.includes('credit') || lowerName.includes('debit'))
        return <CreditCard className={`${iconClass} text-sky-500`} />;
    if (lowerName.includes('mobile') || lowerName.includes('mpesa') || lowerName.includes('airtel'))
        return <Smartphone className={`${iconClass} text-purple-500`} />;
    if (lowerName.includes('bank') || lowerName.includes('transfer'))
        return <Building2 className={`${iconClass} text-indigo-500`} />;
    return <CreditCard className={`${iconClass} text-gray-400`} />;
};

const Row: FunctionComponent<{
    label: string;
    value: string;
    compact?: boolean;
    bold?: boolean;
    muted?: boolean;
    valueColor?: string;
}> = ({ label, value, compact = false, bold = false, muted = false, valueColor }) => (
    <div className={compact ? "flex justify-between items-baseline py-0.5" : "flex justify-between items-baseline py-1"}>
        <span className={`${compact ? "text-[10px]" : "text-sm"} ${muted ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-400"}`}>
            {label}
        </span>
        <span className={`tabular-nums ${compact ? "text-[10px]" : "text-sm"} ${bold ? "font-bold" : "font-medium"} ${valueColor || "text-gray-900 dark:text-gray-100"}`}>
            {value}
        </span>
    </div>
);

const SaleSummary: FunctionComponent<{
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
    payments?: SalePayment[];
}> = ({ subtotal, tax, discount, total, paid, changeAmount, paymentMethod, hasTax, hasDiscount, compact = false, payments }) => {
    const hasMultiplePayments = payments && payments.length > 1;

    return (
        <div>
            {/* Dashed divider */}
            <div className={compact ? "border-t border-dashed border-gray-300 dark:border-gray-600 my-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 my-3"} />

            {/* Subtotals */}
            <Row label="Subtotal" value={formatCurrency(subtotal)} compact={compact} />
            {hasTax && <Row label="Tax" value={formatCurrency(tax)} compact={compact} />}
            {hasDiscount && <Row label="Discount" value={`-${formatCurrency(discount)}`} compact={compact} valueColor="text-emerald-600 dark:text-emerald-400" />}

            {/* Total - bold double-line style */}
            <div className={compact ? "border-t border-double border-gray-900 dark:border-gray-100 mt-2 pt-1.5" : "border-t-2 border-double border-gray-900 dark:border-gray-100 mt-3 pt-2"}>
                <div className="flex justify-between items-baseline">
                    <span className={compact
                        ? "text-xs font-bold text-gray-900 dark:text-gray-100 uppercase"
                        : "text-base font-bold text-gray-900 dark:text-gray-100 uppercase"
                    }>
                        Total
                    </span>
                    <span className={compact
                        ? "text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums"
                        : "text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums"
                    }>
                        {formatCurrency(total)}
                    </span>
                </div>
            </div>

            {/* Payment section */}
            <div className={compact ? "border-t border-dashed border-gray-300 dark:border-gray-600 mt-2 pt-2" : "border-t border-dashed border-gray-300 dark:border-gray-600 mt-3 pt-3"}>
                {hasMultiplePayments ? (
                    <div className={compact ? "space-y-1" : "space-y-1.5"}>
                        <span className={compact
                            ? "text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold"
                            : "text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold"
                        }>
                            Payment ({payments.length} methods)
                        </span>
                        {payments.map((payment, index) => (
                            <div key={payment.id || index} className={compact ? "flex justify-between items-center py-0.5" : "flex justify-between items-center py-1"}>
                                <span className={`flex items-center gap-1.5 ${compact ? "text-[10px]" : "text-sm"} text-gray-700 dark:text-gray-300`}>
                                    {getPaymentIcon(payment.paymentMethod?.name || '', compact)}
                                    {payment.paymentMethod?.name || payment.paymentMethodId || 'Unknown'}
                                    {payment.reference && (
                                        <span className={`font-mono ${compact ? "text-[8px]" : "text-xs"} text-gray-400`}>
                                            ({payment.reference})
                                        </span>
                                    )}
                                </span>
                                <span className={`tabular-nums font-medium ${compact ? "text-[10px]" : "text-sm"} text-gray-900 dark:text-gray-100`}>
                                    {formatCurrency(payment.amount)}
                                </span>
                            </div>
                        ))}
                        <div className={compact ? "border-t border-gray-200 dark:border-gray-700 pt-1 mt-1" : "border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1"}>
                            <Row label="Total Paid" value={formatCurrency(paid)} compact={compact} bold />
                        </div>
                    </div>
                ) : (
                    <>
                        <Row label="Paid" value={formatCurrency(paid)} compact={compact} />
                        <Row label="Method" value={paymentMethod} compact={compact} muted />
                    </>
                )}

                {changeAmount > 0 && (
                    <Row label="Change" value={formatCurrency(changeAmount)} compact={compact} bold valueColor="text-green-600 dark:text-green-400" />
                )}
            </div>
        </div>
    );
};

export default SaleSummary