import { ReactNode } from 'react';
import { Banknote, Smartphone, Building2, CreditCard } from 'lucide-react';
import { PaymentMethodType, PAYMENT_METHODS } from './types';
export { PAYMENT_METHODS } from './types';

export const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, (className?: string) => ReactNode> = {
    [PAYMENT_METHODS.CASH]: (className = "w-5 h-5") => <Banknote className={className} />,
    [PAYMENT_METHODS.MOBILE_MONEY]: (className = "w-5 h-5") => <Smartphone className={className} />,
    [PAYMENT_METHODS.BANK_TRANSFER]: (className = "w-5 h-5") => <Building2 className={className} />,
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
    [PAYMENT_METHODS.CASH]: 'Cash',
    [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethodType, string> = {
    [PAYMENT_METHODS.CASH]: 'bg-green-500 hover:bg-green-600',
    [PAYMENT_METHODS.MOBILE_MONEY]: 'bg-orange-500 hover:bg-orange-600',
    [PAYMENT_METHODS.BANK_TRANSFER]: 'bg-sky-500 hover:bg-sky-600',
};

export const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];
