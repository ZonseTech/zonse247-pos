import { PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS } from './constants';
import { PaymentMethodType } from './types';

export const getPaymentMethodIcon = (method: PaymentMethodType, className?: string) => {
    const iconFn = PAYMENT_METHOD_ICONS[method] || PAYMENT_METHOD_ICONS['card'];
    return iconFn(className);
};

export const getPaymentMethodLabel = (method: PaymentMethodType): string => {
    return PAYMENT_METHOD_LABELS[method] || 'Unknown';
};

export const getPaymentMethodColor = (method: PaymentMethodType): string => {
    return PAYMENT_METHOD_COLORS[method] || 'bg-gray-500 hover:bg-gray-600';
};

export const generatePaymentId = (): string => {
    return `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
