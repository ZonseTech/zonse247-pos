import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Expense Category Service
 * Tenant/branch-scoped lookup used to categorize expenses (Rent, Utilities, Transport, etc.)
 */

const endpoints = {
    root: 'expense-categories',
    list: 'expense-categories',
    create: 'expense-categories',
    update: (id: string) => `expense-categories/${id}`,
    delete: (id: string) => `expense-categories/${id}`,
};

const expenseCategoryService = {
    endpoints,

    async listExpenseCategories(): Promise<ExpenseCategory[]> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<ExpenseCategoryListResponse>(endpoints.list, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    async createExpenseCategory(payload: CreateExpenseCategoryInput): Promise<ExpenseCategory> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<ExpenseCategoryResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    async updateExpenseCategory(
        categoryId: string,
        payload: UpdateExpenseCategoryInput
    ): Promise<ExpenseCategory> {
        const headers = await getAuthHeaders();
        return liveApi
            .put<ExpenseCategoryResponse>(endpoints.update(categoryId), payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    async deleteExpenseCategory(categoryId: string): Promise<void> {
        const headers = await getAuthHeaders();
        return liveApi
            .delete(endpoints.delete(categoryId), { headers })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },
};

export default expenseCategoryService;
