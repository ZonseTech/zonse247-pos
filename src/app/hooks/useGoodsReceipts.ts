import { useState, useEffect, useCallback, useRef } from 'react';
import { Notify } from 'notiflix';
import { goodsReceiptService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';

export const useGoodsReceipts = () => {
    const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptWithItems[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<GRNStatusType | ''>('');
    const [poFilter, setPoFilter] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    // Guards against out-of-order responses overwriting newer results (see usePurchaseOrders).
    const requestIdRef = useRef(0);

    const loadGoodsReceipts = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setIsLoading(true);
        try {
            const result = await goodsReceiptService.listGoodsReceipts({
                page,
                limit: perPage,
                status: statusFilter || undefined,
                purchaseOrderId: poFilter || undefined,
                search: searchTerm || undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
            });

            if (requestId !== requestIdRef.current) return;

            if (!result) {
                setGoodsReceipts([]);
                setTotalRows(0);
                return;
            }

            const receipts = result.receipts || [];
            const pagination = result.pagination || { totalItems: 0 };

            setGoodsReceipts(receipts);
            setTotalRows(pagination.totalItems || 0);
        } catch (error: any) {
            if (requestId !== requestIdRef.current) return;
            Notify.failure(getErrorMessage(error, 'Failed to load goods receipts'));
            console.error('Load goods receipts error:', error);
            setGoodsReceipts([]);
            setTotalRows(0);
        } finally {
            if (requestId === requestIdRef.current) setIsLoading(false);
        }
    }, [page, perPage, statusFilter, poFilter, searchTerm, dateFrom, dateTo]);

    useEffect(() => {
        loadGoodsReceipts();
    }, [loadGoodsReceipts]);

    const createGoodsReceipt = useCallback(async (payload: CreateGoodsReceiptInput) => {
        try {
            const grn = await goodsReceiptService.createGoodsReceipt(payload);
            Notify.success('Goods receipt created successfully');
            loadGoodsReceipts();
            return grn;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const updateGoodsReceipt = useCallback(async (
        grnId: string,
        payload: UpdateGoodsReceiptInput
    ) => {
        try {
            const grn = await goodsReceiptService.updateGoodsReceipt(grnId, payload);
            Notify.success('Goods receipt updated successfully');
            loadGoodsReceipts();
            return grn;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const verifyGoodsReceipt = useCallback(async (grnId: string, payload?: VerifyGoodsReceiptInput) => {
        try {
            const grn = await goodsReceiptService.verifyGoodsReceipt(grnId, payload);
            Notify.success('Goods receipt verified successfully');
            loadGoodsReceipts();
            return grn;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to verify goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const postGoodsReceipt = useCallback(async (grnId: string, payload?: PostGoodsReceiptInput) => {
        try {
            const grn = await goodsReceiptService.postGoodsReceipt(grnId, payload);
            Notify.success('Goods receipt posted! Inventory has been updated.');
            loadGoodsReceipts();
            return grn;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to post goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const cancelGoodsReceipt = useCallback(async (grnId: string) => {
        try {
            await goodsReceiptService.cancelGoodsReceipt(grnId);
            Notify.success('Goods receipt cancelled');
            loadGoodsReceipts();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to cancel goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const deleteGoodsReceipt = useCallback(async (grnId: string) => {
        try {
            await goodsReceiptService.deleteGoodsReceipt(grnId);
            Notify.success('Goods receipt deleted');
            loadGoodsReceipts();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete goods receipt'));
            throw error;
        }
    }, [loadGoodsReceipts]);

    const getGoodsReceipt = useCallback(async (grnId: string) => {
        try {
            return await goodsReceiptService.getGoodsReceipt(grnId);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load goods receipt'));
            return null;
        }
    }, []);

    return {
        goodsReceipts,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        poFilter,
        setPoFilter,
        searchTerm,
        setSearchTerm,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        loadGoodsReceipts,
        createGoodsReceipt,
        updateGoodsReceipt,
        verifyGoodsReceipt,
        postGoodsReceipt,
        cancelGoodsReceipt,
        deleteGoodsReceipt,
        getGoodsReceipt,
    };
};
