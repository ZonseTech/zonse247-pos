import { FC, useMemo, useCallback } from "react";
import { HiOutlineCreditCard, HiOutlineCash, HiOutlineDeviceMobile } from "react-icons/hi";
import { Banknote, Wallet } from "lucide-react";
import { useIsMobile } from '../../../hooks/useMediaQuery';

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
    const isMobile = useIsMobile();

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

    // Mobile: render as dropdown
    if (isMobile) {
        const selectedMethod = paymentMethods.find(m => m.methodId === selectedPaymentMethod);
        const SelectedIcon = selectedMethod ? getIcon(selectedMethod.name) : Wallet;

        return (
            <div className="flex items-center gap-2 w-full">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Payment:</span>
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <SelectedIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </div>
                    <select
                        value={selectedPaymentMethod}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full h-10 pl-10 pr-8 
                            appearance-none cursor-pointer
                            rounded-lg text-sm font-medium
                            bg-white dark:bg-gray-800 
                            text-gray-700 dark:text-gray-200
                            border border-gray-300 dark:border-gray-600
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                            focus:border-blue-500 dark:focus:border-blue-400
                            transition-colors"
                    >
                        <option value="all" className="bg-white dark:bg-gray-800">
                            All Methods
                        </option>
                        {paymentMethods.map((method) => (
                            <option
                                key={method.methodId}
                                value={method.methodId}
                                className="bg-white dark:bg-gray-800"
                            >
                                {method.name}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop: render as button group
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
