type ExpenseStatusType = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'VOIDED';

interface ExpenseCategory {
    id: number;
    categoryId: string;
    tenantId: string;
    branchId: string;
    name: string;
    isActive: boolean;
    sortOrder?: number | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface Expense {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    expenseNumber: string;
    categoryId: string;
    amount: number;
    paymentMethodId?: string | null;
    supplierId?: string | null;
    expenseDate: Date | string;
    reference?: string | null;
    notes?: string | null;
    status: ExpenseStatusType;
    recordedBy: string;
    approvedBy?: string | null;
    approvedAt?: Date | string | null;
    rejectedBy?: string | null;
    rejectedAt?: Date | string | null;
    rejectedReason?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: { categoryId: string; name: string };
    paymentMethod?: { methodId: string; name: string } | null;
    supplier?: { id: string; name: string } | null;
    recordedByUser?: { userId: string; fullname: string } | null;
    approvedByUser?: { userId: string; fullname: string } | null;
    rejectedByUser?: { userId: string; fullname: string } | null;
}

interface CreateExpenseInput {
    categoryId: string;
    amount: number;
    paymentMethodId?: string;
    supplierId?: string;
    expenseDate?: string;
    reference?: string;
    notes?: string;
}

interface UpdateExpenseInput {
    categoryId?: string;
    amount?: number;
    paymentMethodId?: string;
    supplierId?: string;
    expenseDate?: string;
    reference?: string;
    notes?: string;
}

interface RejectExpenseInput {
    rejectedReason?: string;
}

interface VoidExpenseInput {
    reason?: string;
}

interface CreateExpenseCategoryInput {
    name: string;
    isActive?: boolean;
    sortOrder?: number;
}

interface UpdateExpenseCategoryInput {
    name?: string;
    isActive?: boolean;
    sortOrder?: number;
}

interface ExpenseListQuery {
    status?: ExpenseStatusType;
    categoryId?: string;
    supplierId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

interface ExpenseResponse {
    success: boolean;
    message: string;
    data: Expense;
}

interface ExpenseListResponse {
    success: boolean;
    message: string;
    data: {
        expenses: Expense[];
        total: number;
        totalPages: number;
    };
}

interface ExpenseCategoryListResponse {
    success: boolean;
    message: string;
    data: ExpenseCategory[];
}

interface ExpenseCategoryResponse {
    success: boolean;
    message: string;
    data: ExpenseCategory;
}

interface ExpenseSummaryQuery {
    status?: ExpenseStatusType;
    categoryId?: string;
    search?: string;
}

interface ExpenseSummary {
    totalCount: number;
    totalAmount: number;
    pendingApprovalCount: number;
    pendingApprovalAmount: number;
    approvedCount: number;
    approvedAmount: number;
    rejectedCount: number;
    rejectedAmount: number;
    voidedCount: number;
    voidedAmount: number;
    totalApprovedAmount: number;
}

interface ExpenseSummaryResponse {
    success: boolean;
    message: string;
    data: ExpenseSummary;
}
