import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import customerService from '../services/customers.service';

interface UseCustomersReturn {
    customers: Customer[];
    filteredCustomers: Customer[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    deleteCustomer: (customerId: string) => Promise<void>;
    refreshCustomers: () => Promise<void>;
    filterCustomers: (term: string) => Customer[];
    getPaginatedData: () => Customer[];
}

export const useCustomers = (): UseCustomersReturn => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const loadCustomers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await customerService.list();
            setCustomers(data);
            setFilteredCustomers(data);
            setTotalRows(data.length);
        } catch (error: any) {
            console.error('Error loading customers:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load customers';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const filterCustomers = useCallback((term: string): Customer[] => {
        if (!term.trim()) {
            return customers;
        }

        const lowerTerm = term.toLowerCase();
        return customers.filter((customer) =>
            customer.name?.toLowerCase().includes(lowerTerm) ||
            customer.email?.toLowerCase().includes(lowerTerm) ||
            customer.phone?.toLowerCase().includes(lowerTerm) ||
            customer.address?.toLowerCase().includes(lowerTerm)
        );
    }, [customers]);

    useEffect(() => {
        const filtered = filterCustomers(searchTerm);
        setFilteredCustomers(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    }, [searchTerm, filterCustomers]);

    const getPaginatedData = useCallback((): Customer[] => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredCustomers.slice(startIndex, endIndex);
    }, [page, perPage, filteredCustomers]);

    const deleteCustomer = useCallback(async (customerId: string) => {
        try {
            await customerService.delete(customerId);
            Notify.success('Customer deleted successfully');
            await loadCustomers();
        } catch (error: any) {
            console.error('Error deleting customer:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete customer';
            Notify.failure(errorMessage);
        }
    }, [loadCustomers]);

    const refreshCustomers = useCallback(async () => {
        await loadCustomers();
    }, [loadCustomers]);

    return {
        customers,
        filteredCustomers,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deleteCustomer,
        refreshCustomers,
        filterCustomers,
        getPaginatedData,
    };
};
