import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { supplierService } from '../services';

export const useSuppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<SupplierStatus | ''>('');

    const loadSuppliers = useCallback(async () => {

        setIsLoading(true);
        try {
            const result = await supplierService.listSuppliers({
                page,
                limit: perPage,
                search: searchTerm || undefined,
                status: statusFilter || undefined,
            } as any);

            // Handle case where result might be undefined or malformed
            if (!result) {
                setSuppliers([]);
                setTotalRows(0);
                return;
            }

            setSuppliers(result.suppliers || []);
            setTotalRows(result.pagination?.total || 0);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load suppliers');
            console.error('Load suppliers error:', error);
            // Reset state on error
            setSuppliers([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, statusFilter]);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    const createSupplier = useCallback(async (payload: CreateSupplierPayload) => {
        try {
            const supplier = await supplierService.createSupplier(payload);
            Notify.success('Supplier created successfully');
            loadSuppliers();
            return supplier;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to create supplier');
            throw error;
        }
    }, [loadSuppliers]);

    const updateSupplier = useCallback(async (supplierId: string, payload: UpdateSupplierPayload) => {
        try {
            const supplier = await supplierService.updateSupplier(supplierId, payload);
            Notify.success('Supplier updated successfully');
            loadSuppliers();
            return supplier;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to update supplier');
            throw error;
        }
    }, [loadSuppliers]);

    const deleteSupplier = useCallback(async (supplierId: string) => {
        try {
            await supplierService.deleteSupplier(supplierId);
            Notify.success('Supplier deleted successfully');
            loadSuppliers();
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to delete supplier');
            throw error;
        }
    }, [loadSuppliers]);

    const getSupplier = useCallback(async (supplierId: string) => {
        try {
            return await supplierService.getSupplier(supplierId);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load supplier');
            return null;
        }
    }, []);

    return {
        suppliers,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        loadSuppliers,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        getSupplier,
        // Aliases for form compatibility
        create: createSupplier,
        update: updateSupplier,
        getById: getSupplier,
    };
};
