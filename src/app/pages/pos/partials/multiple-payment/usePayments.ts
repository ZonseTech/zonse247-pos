import { useState, useCallback, useEffect } from 'react';
import { PaymentEntryState, PaymentMethodType } from './types';
import { generatePaymentId } from './utils';

interface UsePaymentsReturn {
    payments: PaymentEntryState[];
    totalPaid: number;
    remaining: number;
    change: number;
    isFullyPaid: boolean;
    addPayment: (method: PaymentMethodType) => void;
    removePayment: (id: string) => void;
    updatePayment: (id: string, field: keyof PaymentEntryState, value: string) => void;
    resetPayments: () => void;
}

export const usePayments = (total: number, isOpen: boolean): UsePaymentsReturn => {
    const [payments, setPayments] = useState<PaymentEntryState[]>([]);

    const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total);
    const isFullyPaid = totalPaid >= total;

    const addPayment = useCallback((method: PaymentMethodType) => {
        const currentRemaining = Math.max(0, total - payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0));
        const newPayment: PaymentEntryState = {
            id: generatePaymentId(),
            paymentMethodId: method,
            amount: currentRemaining > 0 ? currentRemaining.toFixed(2) : '',
            reference: '',
            providerId: '',
            phoneNumber: '',
            notes: '',
        };
        setPayments(prev => [...prev, newPayment]);
    }, [total, payments]);

    const removePayment = useCallback((id: string) => {
        setPayments(prev => prev.filter(p => p.id !== id));
    }, []);

    const updatePayment = useCallback((id: string, field: keyof PaymentEntryState, value: string) => {
        setPayments(prev => prev.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    }, []);

    const resetPayments = useCallback(() => {
        setPayments([]);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setPayments([]);
        }
    }, [isOpen]);

    return {
        payments,
        totalPaid,
        remaining,
        change,
        isFullyPaid,
        addPayment,
        removePayment,
        updatePayment,
        resetPayments,
    };
};
