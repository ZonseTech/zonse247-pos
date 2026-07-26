import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { expenseService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';
import { useDebouncedSearch } from './useDebouncedSearch';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { searchTerm, debouncedTerm, setSearchTerm, clearSearch } = useDebouncedSearch(300);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [statusFilter, setStatusFilter] = useState<ExpenseStatusType | ''>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    const loadExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await expenseService.listExpenses({
                page,
                limit: perPage,
                search: debouncedTerm || undefined,
                status: statusFilter || undefined,
                categoryId: categoryFilter || undefined,
            });

            if (!result) {
                setExpenses([]);
                setTotalRows(0);
                return;
            }

            setExpenses(result.expenses || []);
            setTotalRows(result.total || 0);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load expenses'));
            console.error('Load expenses error:', error);
            setExpenses([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedTerm, statusFilter, categoryFilter]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    const createExpense = useCallback(async (payload: CreateExpenseInput) => {
        try {
            const expense = await expenseService.createExpense(payload);
            Notify.success('Expense recorded — pending approval');
            loadExpenses();
            return expense;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to record expense'));
            throw error;
        }
    }, [loadExpenses]);

    const approveExpense = useCallback(async (expenseId: string) => {
        try {
            await expenseService.approveExpense(expenseId);
            Notify.success('Expense approved');
            loadExpenses();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to approve expense'));
            throw error;
        }
    }, [loadExpenses]);

    const rejectExpense = useCallback(async (expenseId: string, rejectedReason?: string) => {
        try {
            await expenseService.rejectExpense(expenseId, rejectedReason);
            Notify.success('Expense rejected');
            loadExpenses();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to reject expense'));
            throw error;
        }
    }, [loadExpenses]);

    const voidExpense = useCallback(async (expenseId: string, reason?: string) => {
        try {
            await expenseService.voidExpense(expenseId, reason);
            Notify.success('Expense voided');
            loadExpenses();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to void expense'));
            throw error;
        }
    }, [loadExpenses]);

    return {
        expenses,
        isLoading,
        searchTerm,
        debouncedTerm,
        setSearchTerm,
        clearSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,
        loadExpenses,
        createExpense,
        approveExpense,
        rejectExpense,
        voidExpense,
    };
};
