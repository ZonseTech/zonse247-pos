/**
 * Return/Refund System Type Definitions
 */

/**
 * Restock status for returned items
 */
type RestockStatus = 'pending' | 'restocked' | 'damaged';

/**
 * Condition of returned items
 */
type ReturnCondition = 'excellent' | 'good' | 'fair' | 'damaged' | 'defective';

/**
 * Individual item being returned
 */
interface ReturnItem {
    returnItemId: string;
    returnTransactionId: string;
    originalOrderId: string;
    productId: string;
    returnedQuantity: number | string;
    originalQuantity: number | string;
    returnPrice: number | string;
    returnReason: string;
    restockStatus: RestockStatus;
    restockedQuantity: number | string;
    restockedAt?: string | Date;
    condition: ReturnCondition;
    notes?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    // Product details (may be populated from originalSale.items)
    product?: {
        id?: string;
        name?: string;
        sku?: string;
    };
}

/**
 * Request body for initiating a return
 */
interface InitiateReturnRequest {
    originalSaleId: string;
    items: {
        saleItemId: string;
        productId: string;
        returnQuantity: number;
        returnReason: string;
        condition: ReturnCondition;
        notes?: string;
    }[];
    refundReason: string;
    refundMethod?: 'original' | 'cash' | 'store_credit';
    partialRefund?: boolean;
}

/**
 * Response from initiating a return
 */
interface InitiateReturnResponse {
    returnTransaction: Transaction;
    returnItems: ReturnItem[];
    refundAmount: number;
    originalTransaction: Transaction;
}

/**
 * Restock request for returned items
 */
interface RestockItemsRequest {
    restockItems: {
        returnItemId: string;
        restockQuantity: number;
    }[];
}

/**
 * Return statistics summary
 */
interface ReturnStatistics {
    totalReturns: number;
    totalRefundAmount: number;
    averageRefundAmount: number;
    returnsByReason: Record<string, number>;
    returnsByCondition?: Record<string, number>;
    returnRate?: number;
}

/**
 * Query parameters for return statistics
 */
interface ReturnStatisticsQuery {
    startDate: string | Date;
    endDate: string | Date;
    branchId?: string;
    userId?: string;
}

/**
 * Full return details including transaction and items
 * Supports both legacy format (returnTransaction/originalTransaction) and new API format (returnId/originalSale)
 */
interface ReturnDetails {
    // New API format
    returnId?: string;
    returnNumber?: string;
    originalSale?: Sale;
    status?: string;
    createdAt?: string | Date;

    // Legacy format
    returnTransaction?: Transaction;
    originalTransaction?: Transaction;

    // Common fields
    returnItems: ReturnItem[];
    refundAmount: number;
}
