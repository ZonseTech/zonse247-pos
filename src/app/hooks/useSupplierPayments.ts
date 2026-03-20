import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { supplierPaymentService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';

export const useSupplierPayments = () => {
    const [payments, setPayments] = useState<SupplierPaymentWithAllocations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<PaymentStatusType | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');

    const loadPayments = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await supplierPaymentService.listPayments({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
            });

            if (!result) {
                setPayments([]);
                setTotalRows(0);
                return;
            }

            setPayments(result.payments || []);
            setTotalRows(result.total || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load supplier payments'));
            console.error('Load supplier payments error:', error);
            setPayments([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const createPayment = useCallback(async (payload: CreateSupplierPaymentInput) => {
        try {
            const payment = await supplierPaymentService.createPayment(payload);
            Notify.success('Payment recorded successfully');
            loadPayments();
            return payment;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to record payment'));
            throw error;
        }
    }, [loadPayments]);

    const voidPayment = useCallback(async (paymentId: string, reason?: string) => {
        try {
            await supplierPaymentService.voidPayment(paymentId, reason);
            Notify.success('Payment voided — invoice balances restored');
            loadPayments();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to void payment'));
            throw error;
        }
    }, [loadPayments]);

    const getPayment = useCallback(async (paymentId: string) => {
        try {
            return await supplierPaymentService.getPayment(paymentId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load payment'));
            return null;
        }
    }, []);

    const getPaymentsForInvoice = useCallback(async (invoiceId: string) => {
        try {
            return await supplierPaymentService.getPaymentsForInvoice(invoiceId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load invoice payments'));
            return [];
        }
    }, []);

    return {
        payments,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        supplierFilter,
        setSupplierFilter,
        loadPayments,
        createPayment,
        voidPayment,
        getPayment,
        getPaymentsForInvoice,
    };
};
