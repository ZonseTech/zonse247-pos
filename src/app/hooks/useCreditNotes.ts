import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { supplierReturnService } from '../services';

export const useCreditNotes = () => {
    const [creditNotes, setCreditNotes] = useState<SupplierCreditNote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<CreditNoteStatusType | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');

    const loadCreditNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await supplierReturnService.listCreditNotes({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
            });

            if (!result) {
                setCreditNotes([]);
                setTotalRows(0);
                return;
            }

            setCreditNotes(result.data || []);
            setTotalRows(result.total || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load credit notes'));
            console.error('Load credit notes error:', error);
            setCreditNotes([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter]);

    useEffect(() => {
        loadCreditNotes();
    }, [loadCreditNotes]);

    const applyCreditNote = useCallback(async (creditNoteId: string, invoiceId: string, notes?: string) => {
        try {
            const result = await supplierReturnService.applyCreditNote(creditNoteId, {
                invoiceId,
                notes,
            });
            Notify.success('Credit note applied to invoice');
            loadCreditNotes();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to apply credit note'));
            throw error;
        }
    }, [loadCreditNotes]);

    /**
     * Fetch pending credit notes for a specific supplier (for the apply modal)
     */
    const getPendingCreditNotesForSupplier = useCallback(async (supplierId: string) => {
        try {
            const result = await supplierReturnService.listCreditNotes({
                status: 'PENDING',
                supplierId,
                limit: 100,
            });
            return result?.data || [];
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load pending credit notes'));
            return [];
        }
    }, []);

    return {
        creditNotes,
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
        loadCreditNotes,
        applyCreditNote,
        getPendingCreditNotesForSupplier,
    };
};
