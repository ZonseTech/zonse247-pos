import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { supplierReturnService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';

export const useSupplierReturns = () => {
    const [returns, setReturns] = useState<SupplierReturnWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<SupplierReturnStatusType | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<string>('');

    const loadReturns = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await supplierReturnService.listReturns({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                supplierId: supplierFilter || undefined,
            });

            if (!result) {
                setReturns([]);
                setTotalRows(0);
                return;
            }

            setReturns(result.data || []);
            setTotalRows(result.total || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load supplier returns'));
            console.error('Load supplier returns error:', error);
            setReturns([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter, supplierFilter]);

    useEffect(() => {
        loadReturns();
    }, [loadReturns]);

    const createReturn = useCallback(async (payload: CreateSupplierReturnInput) => {
        try {
            const result = await supplierReturnService.createReturn(payload);
            Notify.success('Return created as draft');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create return'));
            throw error;
        }
    }, [loadReturns]);

    const updateReturn = useCallback(async (id: string, payload: UpdateSupplierReturnInput) => {
        try {
            const result = await supplierReturnService.updateReturn(id, payload);
            Notify.success('Return updated');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update return'));
            throw error;
        }
    }, [loadReturns]);

    const approveReturn = useCallback(async (id: string, notes?: string) => {
        try {
            const result = await supplierReturnService.approveReturn(id, notes);
            Notify.success('Return approved');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to approve return'));
            throw error;
        }
    }, [loadReturns]);

    const shipReturn = useCallback(async (id: string, notes?: string) => {
        try {
            const result = await supplierReturnService.shipReturn(id, notes);
            Notify.success('Return marked as shipped');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to mark return as shipped'));
            throw error;
        }
    }, [loadReturns]);

    const completeReturn = useCallback(async (id: string, notes?: string) => {
        try {
            const result = await supplierReturnService.completeReturn(id, notes);
            Notify.success('Return completed — stock adjusted, credit note generated');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to complete return'));
            throw error;
        }
    }, [loadReturns]);

    const cancelReturn = useCallback(async (id: string, notes?: string) => {
        try {
            const result = await supplierReturnService.cancelReturn(id, notes);
            Notify.success('Return cancelled');
            loadReturns();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to cancel return'));
            throw error;
        }
    }, [loadReturns]);

    const deleteReturn = useCallback(async (id: string) => {
        try {
            await supplierReturnService.deleteReturn(id);
            Notify.success('Draft return deleted');
            loadReturns();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete return'));
            throw error;
        }
    }, [loadReturns]);

    const getReturn = useCallback(async (id: string) => {
        try {
            return await supplierReturnService.getReturn(id);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load return'));
            return null;
        }
    }, []);

    return {
        returns,
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
        loadReturns,
        createReturn,
        updateReturn,
        approveReturn,
        shipReturn,
        completeReturn,
        cancelReturn,
        deleteReturn,
        getReturn,
    };
};
