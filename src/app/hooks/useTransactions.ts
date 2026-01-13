import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import dayjs from 'dayjs';
import transactionService from '../services/transactions.service';

export const useTransactions = () => {
    const today = new Date();
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(today);
    const [endDate, setEndDate] = useState<Date | null>(today);
    const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'all'>('all');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | 'all'>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const loadTransactions = useCallback(async () => {
        try {
            setIsLoading(true);

            const queryParams: TransactionQueryParams = {
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
                queryParams.status = selectedStatus;
            }

            if (selectedPaymentMethod !== 'all') {
                queryParams.paymentMethodId = selectedPaymentMethod;
            }

            const response = await transactionService.list(queryParams);

            const transactionData = Array.isArray(response.data) ? response.data : [];
            setTransactions(transactionData);
            setTotalRows(response.pagination?.total || transactionData.length);

        } catch (error) {
            console.error("Error loading transactions:", error);
            Notify.failure("Error loading transactions: " + (error instanceof Error ? error.message : String(error)));
            setTransactions([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, startDate, endDate, selectedStatus, selectedPaymentMethod, page, perPage]);

    const getPaginatedData = useCallback(() => {
        return transactions;
    }, [transactions]);

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

    const handleStatusChange = useCallback((status: TransactionStatus | 'all') => {
        setSelectedStatus(status);
        setPage(1);
    }, []);

    const handlePaymentMethodChange = useCallback((paymentMethodId: string | 'all') => {
        setSelectedPaymentMethod(paymentMethodId);
        setPage(1);
    }, []);

    const getTodayTransactions = useCallback(() => {
        const today = new Date();
        setStartDate(today);
        setEndDate(today);
        setPage(1);
    }, []);

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
        loadTransactions();
    }, [loadTransactions]);

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
        transactions,
        loadTransactions,
        getPaginatedData,
        handleSearch,
        handleDateChange,
        handleStatusChange,
        handlePaymentMethodChange,
        getTodayTransactions,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
    };
};
