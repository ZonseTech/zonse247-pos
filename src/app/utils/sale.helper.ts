import { CheckCircle, Clock, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

/**
 * Sale helper utilities
 * Centralized helper functions for sale-related operations
 */

// Sale reference number helper
export const getSaleRef = (sale: Sale | Transaction | null): string => {
    if (!sale) return 'N/A';
    return (sale as Sale).saleNumber ||
        (sale as Transaction).refNumber ||
        (sale as Transaction).transactionId ||
        sale.id?.slice(-8) ||
        'N/A';
};

// Sale date helper
export const getSaleDate = (sale: Sale | Transaction | null): Date | string | undefined => {
    if (!sale) return undefined;
    return (sale as Sale).saleDate || (sale as Transaction).date || sale.createdAt;
};

// Sale total helper
export const getSaleTotal = (sale: Sale | Transaction | null): number => {
    if (!sale) return 0;
    return (sale as Sale).totalAmount || (sale as Transaction).total || 0;
};

// Amount paid helper
export const getAmountPaid = (sale: Sale | Transaction | null): number => {
    if (!sale) return 0;
    return (sale as Sale).amountPaid || (sale as Transaction).paid || 0;
};

// Subtotal helper
export const getSubtotal = (sale: Sale | Transaction | null): number => {
    if (!sale) return 0;
    return sale.subtotal || 0;
};

// Tax amount helper
export const getTaxAmount = (sale: Sale | Transaction | null): number => {
    if (!sale) return 0;
    return (sale as Sale).taxAmount || (sale as Transaction).tax || 0;
};

// Discount amount helper
export const getDiscountAmount = (sale: Sale | Transaction | null): number => {
    if (!sale) return 0;
    return (sale as Sale).discountAmount || (sale as Transaction).discount || 0;
};

// Payment method name helper
export const getPaymentMethodName = (sale: Sale | Transaction | null): string => {
    if (!sale) return 'Cash';

    // Multiple payments
    if (sale.payments && sale.payments.length > 0) {
        return sale.payments.map(p => p.paymentMethod?.name || p.paymentMethodId).join(', ');
    }

    // Single payment
    return sale.paymentMethod?.name || sale.paymentMethodId || 'Cash';
};

// Status configuration type
export interface SaleStatusConfig {
    icon: typeof CheckCircle;
    color: string;
    bgColor: string;
    textColor: string;
    label: string;
}

// Sale status configuration
export const saleStatusConfig: Record<string, SaleStatusConfig> = {
    completed: {
        icon: CheckCircle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        label: 'Completed'
    },
    COMPLETED: {
        icon: CheckCircle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        label: 'Completed'
    },
    pending: {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-300',
        label: 'Pending'
    },
    PENDING: {
        icon: Clock,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        textColor: 'text-amber-700 dark:text-amber-300',
        label: 'Pending'
    },
    cancelled: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        textColor: 'text-red-700 dark:text-red-300',
        label: 'Cancelled'
    },
    refunded: {
        icon: RotateCcw,
        color: 'text-sky-500',
        bgColor: 'bg-sky-100 dark:bg-sky-900/30',
        textColor: 'text-sky-700 dark:text-sky-300',
        label: 'Refunded'
    },
    RETURNED: {
        icon: RotateCcw,
        color: 'text-sky-500',
        bgColor: 'bg-sky-100 dark:bg-sky-900/30',
        textColor: 'text-sky-700 dark:text-sky-300',
        label: 'Returned'
    },
    void: {
        icon: XCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-700/50',
        textColor: 'text-gray-600 dark:text-gray-400',
        label: 'Void'
    },
    VOIDED: {
        icon: XCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-700/50',
        textColor: 'text-gray-600 dark:text-gray-400',
        label: 'Voided'
    }
};

// Get status configuration helper
export const getSaleStatusConfig = (status: string): SaleStatusConfig => {
    return saleStatusConfig[status] || saleStatusConfig[status?.toLowerCase()] || {
        icon: AlertCircle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100 dark:bg-gray-700/50',
        textColor: 'text-gray-600 dark:text-gray-400',
        label: status || 'Unknown'
    };
};
