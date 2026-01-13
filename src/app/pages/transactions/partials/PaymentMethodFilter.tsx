import { FC, useMemo, useCallback } from "react";
import { HiOutlineCreditCard, HiOutlineCash, HiOutlineDeviceMobile } from "react-icons/hi";
import { Banknote, Wallet } from "lucide-react";

interface PaymentMethodFilterProps {
    selectedPaymentMethod: string | 'all';
    onChange: (paymentMethodId: string | 'all') => void;
    paymentMethods: PaymentMethod[];
    isLoading?: boolean;
}

export const PaymentMethodFilter: FC<PaymentMethodFilterProps> = ({
    selectedPaymentMethod,
    onChange,
    paymentMethods,
    isLoading = false
}) => {
    const getIcon = useCallback((name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('cash')) return HiOutlineCash;
        if (lowerName.includes('card') || lowerName.includes('credit') || lowerName.includes('debit')) return HiOutlineCreditCard;
        if (lowerName.includes('mobile') || lowerName.includes('m-pesa') || lowerName.includes('airtel')) return HiOutlineDeviceMobile;
        if (lowerName.includes('bank')) return Banknote;
        return Wallet;
    }, []);

    const getColorClasses = useCallback((isSelected: boolean) => {
        const baseClasses = "transition-all duration-200";

        if (isSelected) {
            return `${baseClasses} bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700`;
        }

        return `${baseClasses} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`;
    }, []);

    // Memoize payment method buttons to prevent unnecessary re-renders
    const paymentMethodButtons = useMemo(() => {
        return paymentMethods.map((method) => {
            const Icon = getIcon(method.name);
            const isSelected = selectedPaymentMethod === method.methodId;

            return (
                <button
                    key={method.methodId}
                    onClick={() => onChange(method.methodId)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${getColorClasses(isSelected)}`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{method.name}</span>
                </button>
            );
        });
    }, [paymentMethods, selectedPaymentMethod, onChange, getIcon, getColorClasses]);

    if (isLoading) {
        return (
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Payment Method:</span>
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Payment Method:</span>

            {/* All option */}
            <button
                onClick={() => onChange('all')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border ${getColorClasses(selectedPaymentMethod === 'all')}`}
            >
                <Wallet className="w-4 h-4" />
                <span>All</span>
            </button>

            {/* Memoized payment method buttons */}
            {paymentMethodButtons}
        </div>
    );
};
