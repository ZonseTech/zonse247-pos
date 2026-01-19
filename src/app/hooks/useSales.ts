import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import dayjs from 'dayjs';
import salesService from '../services/sales.service';

/**
 * Hook for managing sales (migrated from transactions)
 * 
 * This hook now uses the sales API endpoints but maintains
 * backward compatibility with existing component interfaces.
 */
export const useSales = () => {
    const today = new Date();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(today);
    const [endDate, setEndDate] = useState<Date | null>(today);
    const [selectedStatus, setSelectedStatus] = useState<SaleStatus | TransactionStatus | 'all'>('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | 'all'>('all');
    const [sales, setSales] = useState<(Transaction | Sale)[]>([]);

    const loadSales = useCallback(async () => {
        try {
            setIsLoading(true);

            const queryParams: SaleQueryParams = {
                includeItems: true,
                page,
                perPage,
            };

            if (searchTerm) {
                queryParams.search = searchTerm;
            }

            if (startDate) {
                queryParams.startDate = dayjs(startDate).format('YYYY-MM-DD');
                queryParams.endDate = endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs(startDate).format('YYYY-MM-DD');
            }

            if (selectedStatus !== 'all') {
                queryParams.status = selectedStatus as SaleStatus;
            }

            if (selectedPaymentMethod !== 'all') {
                queryParams.paymentMethodId = selectedPaymentMethod;
            }

            const response = await salesService.list(queryParams);

            const salesData = Array.isArray(response.sales) ? response.sales : [];
            setSales(salesData);
            setTotalRows(response.pagination?.totalItems || salesData.length);

        } catch (error) {
            console.error("Error loading sales:", error);
            Notify.failure("Error loading sales: " + (error instanceof Error ? error.message : String(error)));
            setSales([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, startDate, endDate, selectedStatus, selectedPaymentMethod, page, perPage]);

    const getPaginatedData = useCallback(() => {
        return sales;
    }, [sales]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        setPage(1);
    }, []);

    const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
        setPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        const today = new Date();
        setSearchTerm("");
        setStartDate(today);
        setEndDate(today);
        setSelectedStatus('all');
        setSelectedPaymentMethod('all');
        setPage(1);
    }, []);

    const handleStatusChange = useCallback((status: SaleStatus | TransactionStatus | 'all') => {
        setSelectedStatus(status);
        setPage(1);
    }, []);

    const handlePaymentMethodChange = useCallback((paymentMethodId: string | 'all') => {
        setSelectedPaymentMethod(paymentMethodId);
        setPage(1);
    }, []);

    const getTodaySales = useCallback(() => {
        const today = new Date();
        setStartDate(today);
        setEndDate(today);
        setPage(1);
    }, []);

    /** @deprecated Use getTodaySales instead */
    const getTodayTransactions = getTodaySales;

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePerRowsChange = useCallback((newPerPage: number, newPage: number) => {
        setPage(newPage);
        setPerPage(newPerPage);
    }, []);

    const exportData = useCallback(() => {
        Notify.info("Export functionality to be implemented");
    }, []);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    return {
        page,
        perPage,
        totalRows,
        isLoading,
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
        sales,
        // Aliased for backward compatibility
        transactions: sales,
        loadSales,
        loadTransactions: loadSales,
        getPaginatedData,
        handleSearch,
        handleDateChange,
        handleStatusChange,
        handlePaymentMethodChange,
        getTodaySales,
        getTodayTransactions,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
    };
};

/** @deprecated Use useSales instead */
export const useTransactions = useSales;
