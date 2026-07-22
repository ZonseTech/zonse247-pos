export const PAYMENT_METHODS = {
    CASH: 'cash',
    POS: 'pos',
    MOBILE_MONEY: 'mobile-money',
    BANK_TRANSFER: 'bank-transfer',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export interface PaymentEntryState {
    id: string;
    paymentMethodId: PaymentMethodType;
    amount: string;
    reference?: string;
    providerId?: string;
    phoneNumber?: string;
    notes?: string;
}

export interface MultiplePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** When checking out a completed service order, link the sale to it */
    serviceOrderId?: string;
    /** Called after a successful sale linked to a service order */
    onServiceOrderSaleComplete?: () => void;
}

export interface PaymentSummaryProps {
    total: number;
    totalPaid: number;
    remaining: number;
    change: number;
    isFullyPaid: boolean;
    isEBN: boolean;
    isMobile?: boolean;
}

export interface PaymentMethodButtonsProps {
    onAddPayment: (method: PaymentMethodType) => void;
    processing: boolean;
    isEBN: boolean;
}

export interface PaymentEntryCardProps {
    payment: PaymentEntryState;
    index: number;
    remaining: number;
    processing: boolean;
    isEBN: boolean;
    onUpdate: (id: string, field: keyof PaymentEntryState, value: string) => void;
    onRemove: (id: string) => void;
}

export interface PaymentEntriesListProps {
    payments: PaymentEntryState[];
    remaining: number;
    processing: boolean;
    isEBN: boolean;
    onUpdate: (id: string, field: keyof PaymentEntryState, value: string) => void;
    onRemove: (id: string) => void;
}

export interface ModalHeaderProps {
    onClose: () => void;
    processing: boolean;
    isEBN: boolean;
}

export interface ModalFooterProps {
    onClose: () => void;
    onCompleteSale: () => void;
    isFullyPaid: boolean;
    processing: boolean;
    paymentsCount: number;
    isEBN: boolean;
    remaining?: number;
}
