import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { expenseCategoryService } from '../services';
import { getErrorMessage } from '../utils/api-error-handler';

export const useExpenseCategories = () => {
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await expenseCategoryService.listExpenseCategories();
            setCategories(result || []);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load expense categories'));
            console.error('Load expense categories error:', error);
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const createCategory = useCallback(async (payload: CreateExpenseCategoryInput) => {
        try {
            const category = await expenseCategoryService.createExpenseCategory(payload);
            Notify.success('Expense category created');
            loadCategories();
            return category;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to create expense category'));
            throw error;
        }
    }, [loadCategories]);

    const updateCategory = useCallback(async (categoryId: string, payload: UpdateExpenseCategoryInput) => {
        try {
            await expenseCategoryService.updateExpenseCategory(categoryId, payload);
            Notify.success('Expense category updated');
            loadCategories();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to update expense category'));
            throw error;
        }
    }, [loadCategories]);

    const deleteCategory = useCallback(async (categoryId: string) => {
        try {
            await expenseCategoryService.deleteExpenseCategory(categoryId);
            Notify.success('Expense category deleted');
            loadCategories();
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to delete expense category'));
            throw error;
        }
    }, [loadCategories]);

    return {
        categories,
        isLoading,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};
