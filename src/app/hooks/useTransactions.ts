import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import dayjs from 'dayjs';
import transactionService from '../services/transactions.service';

export const useTransactions = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);

    const loadTransactions = useCallback(async () => {
        try {
            setIsLoading(true);

            const data = await transactionService.list({
                includeItems: true,
            });

            const transactionData = Array.isArray(data) ? data : [];
            setTransactions(transactionData);
            applyFilters(transactionData);

        } catch (error) {
            console.error("Error loading transactions:", error);
            Notify.failure("Error loading transactions: " + (error instanceof Error ? error.message : String(error)));
            setTransactions([]);
            setFilteredTransactions([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const applyFilters = useCallback((data: Transaction[]) => {
        let filtered = [...data];

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                (tx.refNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.paymentMethod?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (startDate) {
            filtered = filtered.filter(tx => {
                if (!tx.date) return false;
                const txDate = dayjs(tx.date);
                const start = dayjs(startDate).startOf('day');
                const end = endDate ? dayjs(endDate).endOf('day') : dayjs(startDate).endOf('day');
                return txDate.isAfter(start) && txDate.isBefore(end);
            });
        }

        setFilteredTransactions(filtered);
        setTotalRows(filtered.length);
    }, [searchTerm, startDate, endDate]);

    const getPaginatedData = useCallback(() => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredTransactions.slice(startIndex, endIndex);
    }, [page, perPage, filteredTransactions]);

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
        setSearchTerm("");
        setStartDate(null);
        setEndDate(null);
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

    useEffect(() => {
        if (transactions.length >= 0) {
            applyFilters(transactions);
        }
    }, [searchTerm, startDate, endDate, transactions, applyFilters]);

    return {
        // State
        page,
        perPage,
        totalRows,
        isLoading,
        searchTerm,
        startDate,
        endDate,
        transactions,
        filteredTransactions,

        // Methods
        loadTransactions,
        getPaginatedData,
        handleSearch,
        handleDateChange,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
    };
};
