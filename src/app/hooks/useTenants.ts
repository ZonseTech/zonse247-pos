import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import tenantService from '../services/tenant.service';
import { useDebouncedSearch } from './useDebouncedSearch';

export const useTenants = () => {
    const [tenants, setTenants] = useState<Array<Tenant>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { searchTerm, debouncedTerm, setSearchTerm, clearSearch } = useDebouncedSearch(300);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<TenantStatus | ''>('');

    const loadTenants = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await tenantService.list({
                page,
                limit: perPage,
                search: debouncedTerm || undefined,
                status: statusFilter || undefined,
            });

            setTenants(result.tenants);
            setTotalRows(result.pagination.totalItems);
        } catch (error) {
            console.error('Error loading tenants:', error);
            Notify.failure('Failed to load tenants');
            setTenants([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedTerm, statusFilter]);

    useEffect(() => {
        loadTenants();
    }, [loadTenants]);

    // Reset to page 1 whenever search or status filter changes
    useEffect(() => {
        setPage(1);
    }, [debouncedTerm, statusFilter]);

    const deleteTenant = async (tenantId: string) => {
        try {
            await tenantService.delete(tenantId);
            Notify.success('Tenant deleted successfully');
            loadTenants();
        } catch (error) {
            console.error('Error deleting tenant:', error);
            Notify.failure('Failed to delete tenant');
        }
    };

    const updateTenantStatus = async (tenantId: string, newStatus: TenantStatus) => {
        try {
            const tenant = tenants.find(t => t.tenantId === tenantId);
            if (!tenant) return;

            await tenantService.update(tenantId, { ...tenant, status: newStatus } as any);
            setTenants(prev => prev.map(t => t.tenantId === tenantId ? { ...t, status: newStatus } : t));

            Notify.success(`Tenant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
        } catch (error) {
            console.error(`Error updating tenant status:`, error);
            Notify.failure(`Failed to update tenant status`);
        }
    };

    return {
        isLoading,
        searchTerm,
        setSearchTerm,
        clearSearch,
        totalRows,
        page,
        setPage,
        perPage,
        setPerPage,
        statusFilter,
        setStatusFilter,
        tenants,
        deleteTenant,
        updateTenantStatus,
        loadTenants
    };
};
