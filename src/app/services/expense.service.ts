import { liveApi, getAuthHeaders } from './live-api.service';

/**
 * Expense Service
 * Record, approve/reject, and void business expenses.
 * Expenses are always created as PENDING_APPROVAL.
 */

const endpoints = {
    root: 'expenses',
    create: 'expenses',
    list: 'expenses',
    summary: 'expenses/summary',
    get: (id: string) => `expenses/${id}`,
    update: (id: string) => `expenses/${id}`,
    approve: (id: string) => `expenses/${id}/approve`,
    reject: (id: string) => `expenses/${id}/reject`,
    void: (id: string) => `expenses/${id}/void`,
};

const expenseService = {
    endpoints,

    /**
     * POST /expenses — Record a new expense (starts PENDING_APPROVAL)
     */
    async createExpense(payload: CreateExpenseInput): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<ExpenseResponse>(endpoints.create, payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /expenses — List expenses with filters
     */
    async listExpenses(query: ExpenseListQuery): Promise<ExpenseListResponse['data']> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<ExpenseListResponse>(endpoints.list, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /expenses/summary — Aggregate counts/totals for summary cards,
     * computed over the full filtered set (not just the current page)
     */
    async getExpenseSummary(query: ExpenseSummaryQuery): Promise<ExpenseSummary> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        const headers = await getAuthHeaders();
        return liveApi
            .get<ExpenseSummaryResponse>(endpoints.summary, { headers, params })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /expenses/:id — Get a single expense
     */
    async getExpense(expenseId: string): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .get<ExpenseResponse>(endpoints.get(expenseId), { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /expenses/:id — Edit a recorded expense (only while PENDING_APPROVAL)
     */
    async updateExpense(expenseId: string, payload: UpdateExpenseInput): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .put<ExpenseResponse>(endpoints.update(expenseId), payload, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /expenses/:id/approve
     */
    async approveExpense(expenseId: string): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<ExpenseResponse>(endpoints.approve(expenseId), {}, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /expenses/:id/reject
     */
    async rejectExpense(expenseId: string, rejectedReason?: string): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<ExpenseResponse>(endpoints.reject(expenseId), { rejectedReason }, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /expenses/:id/void — Void a previously APPROVED expense
     */
    async voidExpense(expenseId: string, reason?: string): Promise<Expense> {
        const headers = await getAuthHeaders();
        return liveApi
            .post<ExpenseResponse>(endpoints.void(expenseId), { reason }, { headers })
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default expenseService;
