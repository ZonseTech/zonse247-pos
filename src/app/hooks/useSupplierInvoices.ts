import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { supplierInvoiceService } from '../services';

export const useSupplierInvoices = () => {
    const [invoices, setInvoices] = useState<SupplierInvoiceWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatusType | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');

    const loadInvoices = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await supplierInvoiceService.listInvoices({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
            });

            if (!result) {
                setInvoices([]);
                setTotalRows(0);
                return;
            }

            setInvoices(result.invoices || []);
            setTotalRows(result.total || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load supplier invoices'));
            console.error('Load supplier invoices error:', error);
            setInvoices([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter]);

    useEffect(() => {
        loadInvoices();
    }, [loadInvoices]);

    const createInvoice = useCallback(async (payload: CreateSupplierInvoiceInput) => {
        try {
            const invoice = await supplierInvoiceService.createInvoice(payload);
            Notify.success('Supplier invoice created successfully');
            loadInvoices();
            return invoice;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create supplier invoice'));
            throw error;
        }
    }, [loadInvoices]);

    const updateInvoice = useCallback(async (
        invoiceId: string,
        payload: UpdateSupplierInvoiceInput,
    ) => {
        try {
            const invoice = await supplierInvoiceService.updateInvoice(invoiceId, payload);
            Notify.success('Supplier invoice updated successfully');
            loadInvoices();
            return invoice;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update supplier invoice'));
            throw error;
        }
    }, [loadInvoices]);

    const cancelInvoice = useCallback(async (invoiceId: string) => {
        try {
            await supplierInvoiceService.cancelInvoice(invoiceId);
            Notify.success('Invoice cancelled');
            loadInvoices();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to cancel invoice'));
            throw error;
        }
    }, [loadInvoices]);

    const disputeInvoice = useCallback(async (invoiceId: string, reason?: string) => {
        try {
            const invoice = await supplierInvoiceService.disputeInvoice(invoiceId, reason);
            Notify.success('Invoice marked as disputed');
            loadInvoices();
            return invoice;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to dispute invoice'));
            throw error;
        }
    }, [loadInvoices]);

    const deleteInvoice = useCallback(async (invoiceId: string) => {
        try {
            await supplierInvoiceService.deleteInvoice(invoiceId);
            Notify.success('Invoice deleted');
            loadInvoices();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete invoice'));
            throw error;
        }
    }, [loadInvoices]);

    const getInvoice = useCallback(async (invoiceId: string) => {
        try {
            return await supplierInvoiceService.getInvoice(invoiceId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load invoice'));
            return null;
        }
    }, []);

    const threeWayMatch = useCallback(async (purchaseOrderId: string) => {
        try {
            return await supplierInvoiceService.threeWayMatch(purchaseOrderId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load 3-way match data'));
            return [];
        }
    }, []);

    const getSupplierBalance = useCallback(async (supplierId: string) => {
        try {
            return await supplierInvoiceService.getSupplierBalance(supplierId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load supplier balance'));
            return null;
        }
    }, []);

    return {
        invoices,
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
        loadInvoices,
        createInvoice,
        updateInvoice,
        cancelInvoice,
        disputeInvoice,
        deleteInvoice,
        getInvoice,
        threeWayMatch,
        getSupplierBalance,
    };
};
