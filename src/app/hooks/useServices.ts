import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notify } from 'notiflix';
import serviceService from '../services/service.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { useDebouncedSearch } from './useDebouncedSearch';

export const useServices = (defaultQuery: ServiceListQuery = { limit: 200 }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { searchTerm, debouncedTerm, setSearchTerm, clearSearch } = useDebouncedSearch(300);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(defaultQuery.limit || 50);
    const [totalRows, setTotalRows] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filter states
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [pricingTypeFilter, setPricingTypeFilter] = useState<ServicePricingType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [statusFilter, pricingTypeFilter, categoryFilter]);

    const loadServices = useCallback(async () => {
        setIsLoading(true);
        try {
            const query: ServiceListQuery = {
                page,
                limit: perPage,
                search: debouncedTerm || undefined,
            };
            // Status → isActive mapping (API expects string)
            if (statusFilter === 'active') query.isActive = 'true';
            else if (statusFilter === 'inactive') query.isActive = 'false';
            // Pricing type
            if (pricingTypeFilter !== 'all') query.pricingType = pricingTypeFilter;
            // Category
            if (categoryFilter !== 'all') query.categoryId = categoryFilter;

            const result = await serviceService.list(query);
            setServices(result.services || []);
            setTotalRows(result.pagination?.totalItems || 0);
            setTotalPages(result.pagination?.totalPages || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load services'));
            setServices([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedTerm, statusFilter, pricingTypeFilter, categoryFilter]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const hasActiveFilters = statusFilter !== 'all' || pricingTypeFilter !== 'all' || categoryFilter !== 'all' || !!searchTerm;

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (statusFilter !== 'all') count++;
        if (pricingTypeFilter !== 'all') count++;
        if (categoryFilter !== 'all') count++;
        return count;
    }, [searchTerm, statusFilter, pricingTypeFilter, categoryFilter]);

    const clearFilters = useCallback(() => {
        clearSearch();
        setStatusFilter('all');
        setPricingTypeFilter('all');
        setCategoryFilter('all');
    }, [clearSearch]);

    // CSV export
    const exportCSV = useCallback(() => {
        if (services.length === 0) {
            Notify.info('No services to export');
            return;
        }
        const headers = ['Name', 'SKU', 'Category', 'Pricing Type', 'Base Price', 'Duration (min)', 'Status'];
        const rows = services.map((s) => [
            s.name,
            s.sku || '',
            s.category?.name || '',
            s.pricingType,
            s.basePrice != null ? String(s.basePrice) : '',
            s.durationMin != null ? String(s.durationMin) : '',
            s.isActive ? 'Active' : 'Inactive',
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `services-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [services]);

    const getById = useCallback(async (id: string): Promise<Service | null> => {
        try {
            return await serviceService.get(id);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load service'));
            return null;
        }
    }, []);

    const create = useCallback(async (payload: CreateServiceInput): Promise<Service> => {
        const svc = await serviceService.create(payload);
        await loadServices();
        return svc;
    }, [loadServices]);

    const update = useCallback(async (id: string, payload: UpdateServiceInput): Promise<Service> => {
        const svc = await serviceService.update(id, payload);
        await loadServices();
        return svc;
    }, [loadServices]);

    const deleteService = useCallback(async (id: string): Promise<void> => {
        await serviceService.delete(id);
        await loadServices();
    }, [loadServices]);

    return {
        services,
        isLoading,
        searchTerm,
        setSearchTerm,
        clearSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        totalPages,
        // Filters
        statusFilter,
        setStatusFilter,
        pricingTypeFilter,
        setPricingTypeFilter,
        categoryFilter,
        setCategoryFilter,
        hasActiveFilters,
        activeFilterCount,
        clearFilters,
        exportCSV,
        // Actions
        refetch: loadServices,
        getById,
        create,
        update,
        deleteService,
    };
};
