import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services';

interface UseExpenseSummaryParams {
    searchTerm?: string;
    statusFilter?: ExpenseStatusType | '';
    categoryFilter?: string;
}

const defaultSummary: ExpenseSummary = {
    totalCount: 0,
    totalAmount: 0,
    pendingApprovalCount: 0,
    pendingApprovalAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    rejectedCount: 0,
    rejectedAmount: 0,
    voidedCount: 0,
    voidedAmount: 0,
    totalApprovedAmount: 0,
};

export const useExpenseSummary = ({ searchTerm, statusFilter, categoryFilter }: UseExpenseSummaryParams) => {
    const [summary, setSummary] = useState<ExpenseSummary>(defaultSummary);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const loadSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        try {
            const result = await expenseService.getExpenseSummary({
                search: searchTerm || undefined,
                status: statusFilter || undefined,
                categoryId: categoryFilter || undefined,
            });
            setSummary(result || defaultSummary);
        } catch (error) {
            console.error('Load expense summary error:', error);
            setSummary(defaultSummary);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [searchTerm, statusFilter, categoryFilter]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    return { summary, isLoadingSummary, loadSummary };
};
