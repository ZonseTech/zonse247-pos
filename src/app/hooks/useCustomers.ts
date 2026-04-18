import { useState, useEffect, useCallback, useRef } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import customerService from '../services/customers.service';
import { usePagination } from './usePagination';

interface UseCustomersReturn {
    customers: Customer[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    handlePageChange: (page: number) => void;
    handlePerRowsChange: (newPerPage: number, page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    pageLabel: string;
    deleteCustomer: (customerId: string) => Promise<void>;
    refreshCustomers: () => Promise<void>;
}

export const useCustomers = (): UseCustomersReturn => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const {
        page, setPage, perPage, setPerPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange,
        nextPage, prevPage, hasNextPage, hasPrevPage, pageLabel,
    } = usePagination();

    const loadCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await customerService.listPaginated({
                page,
                limit: perPage,
                search: searchTerm || undefined,
            });
            setCustomers(result.data || []);
            setTotalRows(result.pagination?.total || 0);
        } catch (error: any) {
            console.error('Error loading customers:', error);
            Notify.failure(getErrorMessage(error, 'Failed to load customers'));
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, setTotalRows]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const setSearchTermDebounced = useCallback((term: string) => {
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => {
            setSearchTerm(term);
            setPage(1);
        }, 300);
    }, [setPage]);

    const deleteCustomer = useCallback(async (customerId: string) => {
        try {
            await customerService.delete(customerId);
            Notify.success('Customer deleted successfully');
            await loadCustomers();
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            Notify.failure(getErrorMessage(error, 'Failed to delete customer'));
        }
    }, [loadCustomers]);

    const refreshCustomers = useCallback(async () => {
        await loadCustomers();
    }, [loadCustomers]);

    return {
        customers,
        isLoading,
        searchTerm,
        setSearchTerm: setSearchTermDebounced,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        handlePageChange,
        handlePerRowsChange,
        nextPage,
        prevPage,
        hasNextPage,
        hasPrevPage,
        pageLabel,
        deleteCustomer,
        refreshCustomers,
    };
};
