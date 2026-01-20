/**
 * Sales Types (migrated from transactions)
 * 
 * API Migration Notes:
 * - Transaction -> Sale
 * - TransactionStatus -> SaleStatus  
 * - transactionId -> saleId/saleNumber
 * - Legacy types maintained for backward compatibility
 */

// ==========================================
// New Sale Types (Primary)
// ==========================================

type SaleStatus = 'PENDING' | 'COMPLETED' | 'VOIDED' | 'RETURNED';

interface SalePaymentInput {
    paymentMethodId: string;
    amount: number;
    reference?: string;
    providerId?: string;
    providerRef?: string;
    notes?: string;
}

interface SalePayment {
    id: string;
    saleId: string;
    paymentMethodId: string;
    amount: number;
    reference?: string | null;
    providerId?: string | null;
    providerRef?: string | null;
    status: string;
    processedAt: Date | string;
    notes?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    paymentMethod?: {
        methodId: string;
        name: string;
        icon?: string;
    };
}

interface SaleQueryParams {
    includeItems?: boolean;
    startDate?: string;
    endDate?: string;
    status?: SaleStatus;
    paymentMethodId?: string;
    search?: string;
    page?: number;
    perPage?: number;
    userId?: string;
    terminalId?: string;
    customerId?: string;
}

interface SaleSummaryResponse {
    totalSales: number;
    totalVoided: number;
    netSales: number;
    totalCount: number;
    completedCount: number;
    voidedCount: number;
    refundedCount: number;
    // Legacy aliases (for backward compatibility)
    totalReturns?: number;
    totalTransactions?: number;
    salesCount?: number;
    returnsCount?: number;
}

// ==========================================
// Legacy Types (for backward compatibility)
// ==========================================

/** @deprecated Use SaleStatus instead */
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded' | 'void';

/** @deprecated Use Sale instead */
type Transaction = {
    // Sale fields (new API)
    id?: string;
    saleNumber?: string;
    saleId?: string;

    // Legacy fields (mapped)
    refNumber?: string;
    discount: number;
    subtotal: number;
    tax: number;
    date: string;
    userId: string;
    tenantId?: string;
    branchId?: string;
    customerId?: string;
    paymentServiceProviderId?: string;
    transactionId?: string;
    paymentMethodId?: string;
    terminalId: string;
    phoneNumber: string;
    total: number;
    paid: number;
    changeAmount: number;

    // Status (maps to SaleStatus)
    status?: TransactionStatus | SaleStatus;
    createdAt?: Date;
    updatedAt?: Date;

    // Void information (new API)
    isVoided?: boolean;
    voidedAt?: Date | string;
    voidedBy?: string;
    voidReason?: string;

    // Refund-related fields (legacy)
    isRefund?: boolean;
    originalTransactionId?: string;
    refundReason?: string;
    refundedAmount?: number;
    refundedAt?: string | Date;

    // Relations
    customer?: Customer;
    terminal?: Terminal;
    paymentMethod?: PaymentMethod;
    paymentServiceProvider?: PaymentServiceProvider;
    items?: CartItem[] | SaleItem[];
    user?: User;
    synced?: 1 | 0;

    // Multiple payments support (new API)
    payments?: SalePayment[];

    // Refund tracking (for original transactions)
    refunds?: Transaction[];
    totalRefunded?: number;
    originalTransaction?: Transaction;
};

/** @deprecated Use CreateSalePayload instead */
type TransactionValues = {
    paymentMethodId?: string;
    paymentServiceProviderId?: string;
    phoneNumber: string;
    transactionId: string;
    cashTendered: string;
    transferType?: string;
};

/** @deprecated Use SaleQueryParams instead */
interface DateRangeFilters {
    startDate?: Date | string;
    endDate?: Date | string;
    status?: TransactionStatus | SaleStatus;
    user?: number;
    terminal?: number;
    includeItems?: boolean;
}

/** @deprecated Use SaleQueryParams instead */
interface TransactionQueryParams {
    includeItems?: boolean;
    startDate?: string;
    endDate?: string;
    status?: TransactionStatus | SaleStatus;
    paymentMethodId?: string;
    search?: string;
    page?: number;
    perPage?: number;
}

/** @deprecated Use SaleSummaryResponse instead */
interface TransactionSummaryResponse {
    totalSales: number;
    totalReturns: number;
    netSales: number;
    totalTransactions: number;
    salesCount: number;
    returnsCount: number;
}
