import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { purchaseRequisitionService } from '../services';

export const usePurchaseRequisitions = () => {
    const [requisitions, setRequisitions] = useState<PurchaseRequisitionWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<RequisitionStatusType | ''>('');

    const loadRequisitions = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await purchaseRequisitionService.listRequisitions({
                page,
                limit: perPage,
                status: statusFilter || undefined,
            });

            if (!result) {
                setRequisitions([]);
                setTotalRows(0);
                return;
            }

            setRequisitions(result.requisitions || []);
            setTotalRows(result.pagination?.totalItems || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load requisitions'));
            console.error('Load requisitions error:', error);
            setRequisitions([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, statusFilter]);

    useEffect(() => {
        loadRequisitions();
    }, [loadRequisitions]);

    const createRequisition = useCallback(async (payload: CreateRequisitionInput) => {
        try {
            const requisition = await purchaseRequisitionService.createRequisition(payload);
            Notify.success('Requisition created successfully');
            loadRequisitions();
            return requisition;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const updateRequisition = useCallback(async (
        requisitionId: string,
        payload: UpdateRequisitionInput
    ) => {
        try {
            const requisition = await purchaseRequisitionService.updateRequisition(requisitionId, payload);
            Notify.success('Requisition updated successfully');
            loadRequisitions();
            return requisition;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const approveRequisition = useCallback(async (
        requisitionId: string,
        payload?: ApproveRequisitionInput
    ) => {
        try {
            const requisition = await purchaseRequisitionService.approveRequisition(requisitionId, payload);
            Notify.success('Requisition approved successfully');
            loadRequisitions();
            return requisition;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to approve requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const rejectRequisition = useCallback(async (
        requisitionId: string,
        payload?: RejectRequisitionInput
    ) => {
        try {
            const requisition = await purchaseRequisitionService.rejectRequisition(requisitionId, payload);
            Notify.success('Requisition rejected');
            loadRequisitions();
            return requisition;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to reject requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const cancelRequisition = useCallback(async (requisitionId: string) => {
        try {
            await purchaseRequisitionService.cancelRequisition(requisitionId);
            Notify.success('Requisition cancelled');
            loadRequisitions();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to cancel requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const deleteRequisition = useCallback(async (requisitionId: string) => {
        try {
            await purchaseRequisitionService.deleteRequisition(requisitionId);
            Notify.success('Requisition deleted');
            loadRequisitions();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete requisition'));
            throw error;
        }
    }, [loadRequisitions]);

    const getRequisition = useCallback(async (requisitionId: string) => {
        try {
            return await purchaseRequisitionService.getRequisition(requisitionId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load requisition'));
            return null;
        }
    }, []);

    return {
        requisitions,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        loadRequisitions,
        createRequisition,
        updateRequisition,
        approveRequisition,
        rejectRequisition,
        cancelRequisition,
        deleteRequisition,
        getRequisition,
        // Aliases for form compatibility
        create: createRequisition,
        getById: getRequisition,
    };
};
