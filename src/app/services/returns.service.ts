import api from './http.service';

const endpoints = {
    initiate: 'returns/initiate',
    byTransaction: 'returns/transaction',
    list: 'returns',
    show: 'returns',
    cancel: 'returns',
    restock: 'returns',
    statistics: 'returns/statistics/summary',
};

/**
 * Returns/Refunds Service
 * Handles all return and refund operations
 */
const returnsService = {
    endpoints,

    /**
     * POST /returns/initiate - Initiate a return/refund process
     * @param data Return request data including original transaction and items to return
     * @returns Return transaction details including refund amount
     */
    async initiateReturn(data: InitiateReturnRequest): Promise<InitiateReturnResponse> {
        return api
            .post<ApiResponse<InitiateReturnResponse>>(endpoints.initiate, data as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /returns/transaction/:transactionId - Get all returns for a specific transaction
     * @param transactionId The original transaction ID
     * @returns Array of return details for this transaction
     */
    async getReturnsByTransaction(transactionId: string): Promise<ReturnDetails[]> {
        return api
            .get<ApiResponse<ReturnDetails[]>>(`${endpoints.byTransaction}/${transactionId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /returns - Get all returns
     * @returns Array of all return details
     */
    async list(): Promise<ReturnDetails[]> {
        return api
            .get<ApiResponse<ReturnDetails[]>>(endpoints.list)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /returns/:returnTransactionId - Get details of a specific return
     * @param returnTransactionId The return/refund transaction ID
     * @returns Return transaction details
     */
    async getReturn(returnTransactionId: string): Promise<ReturnDetails> {
        return api
            .get<ApiResponse<ReturnDetails>>(`${endpoints.show}/${returnTransactionId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /returns/:returnTransactionId - Cancel a return transaction
     * @param returnTransactionId The return transaction to cancel
     * @returns Success confirmation
     */
    async cancelReturn(returnTransactionId: string): Promise<{ message: string; success: boolean }> {
        return api
            .delete<ApiResponse<{ message: string; success: boolean }>>(`${endpoints.cancel}/${returnTransactionId}`)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /returns/:returnTransactionId/restock - Mark returned items as restocked
     * @param returnTransactionId The return transaction ID
     * @param data Restock items details
     * @returns Updated return items
     */
    async restockItems(
        returnTransactionId: string,
        data: RestockItemsRequest
    ): Promise<{ message: string; restockedItems: ReturnItem[] }> {
        return api
            .post<ApiResponse<{ message: string; restockedItems: ReturnItem[] }>>(
                `${endpoints.restock}/${returnTransactionId}/restock`,
                data as any
            )
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /returns/statistics/summary - Get return statistics
     * @param query Query parameters including date range and filters
     * @returns Return statistics summary
     */
    async getStatistics(query: ReturnStatisticsQuery): Promise<ReturnStatistics> {
        return api
            .get<ApiResponse<ReturnStatistics>>(endpoints.statistics, query as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * Helper: Check if a transaction can be returned
     * @param transaction The transaction to check
     * @returns Boolean indicating if transaction is returnable
     */
    canReturn(transaction: Transaction): boolean {
        if (!transaction) return false;
        if (transaction.isRefund) return false;
        if (transaction.status === 'cancelled' || transaction.status === 'void') return false;
        // Check for REFUNDED status (case-insensitive for both 'refunded' and 'REFUNDED')
        if (transaction.status?.toLowerCase() === 'refunded') return false;
        return true;
    },

    /**
     * Helper: Calculate remaining refundable amount
     * @param transaction The original transaction
     * @returns Amount that can still be refunded
     */
    getRemainingRefundableAmount(transaction: Transaction): number {
        const total = transaction.total || 0;
        const refunded = transaction.totalRefunded || 0;
        return Math.max(0, total - refunded);
    },

    /**
     * Helper: Check if transaction is fully refunded
     * @param transaction The transaction to check
     * @returns Boolean indicating if fully refunded
     */
    isFullyRefunded(transaction: Transaction): boolean {
        if (!transaction) return false;
        const remaining = this.getRemainingRefundableAmount(transaction);
        return remaining === 0 && (transaction.totalRefunded || 0) > 0;
    },

    /**
     * Helper: Get refund summary for a transaction
     * @param transaction The transaction with refund data
     * @returns Refund summary
     */
    getRefundSummary(transaction: Transaction): {
        hasRefunds: boolean;
        totalRefunded: number;
        remainingAmount: number;
        refundCount: number;
        isFullyRefunded: boolean;
    } {
        const totalRefunded = transaction.totalRefunded || 0;
        const refundCount = transaction.refunds?.length || 0;
        const remainingAmount = this.getRemainingRefundableAmount(transaction);
        const isFullyRefunded = this.isFullyRefunded(transaction);

        return {
            hasRefunds: totalRefunded > 0,
            totalRefunded,
            remainingAmount,
            refundCount,
            isFullyRefunded,
        };
    },
};

export default returnsService;
