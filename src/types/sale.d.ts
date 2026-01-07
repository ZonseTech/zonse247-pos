/**
 * Sales Types for POS Integration
 * Extends the existing order/transaction system with inventory reduction
 */

/**
 * Sale status
 */
type SaleStatus =
    | 'PENDING'    // Sale in progress
    | 'COMPLETED'  // Sale completed successfully
    | 'VOIDED'     // Sale voided/cancelled
    | 'RETURNED';  // Sale returned

/**
 * Sale item
 */
interface SaleItem {
    id?: string;
    saleId?: string;
    productId: string;
    product?: Product; // Populated in responses

    // Quantities
    quantity: number;

    // Pricing
    unitPrice: number;      // Selling price per unit
    unitCost: number;       // Cost price per unit (from inventory)
    subtotal: number;       // quantity * unitPrice

    // Taxes and discounts
    taxRate?: number;
    taxAmount: number;
    discountRate?: number;
    discountAmount: number;
    totalAmount: number;    // subtotal + taxAmount - discountAmount

    // Profit calculation
    costTotal?: number;     // quantity * unitCost
    profitAmount?: number;  // totalAmount - costTotal
    profitMargin?: number;  // (profitAmount / totalAmount) * 100

    // Notes
    notes?: string;

    // Audit
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Main Sale entity
 */
interface Sale {
    id: string;
    tenantId: string;
    branchId: string;

    // Reference
    saleNumber: string; // Auto-generated: SALE-YYYYMMDD-XXXXX

    // User and terminal
    userId: string;
    user?: User; // Cashier who processed the sale
    terminalId?: string;
    terminal?: Terminal;

    // Customer
    customerId?: string;
    customer?: Customer;

    // Status
    status: SaleStatus;

    // Items
    items: SaleItem[];

    // Financial totals
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    // Payment
    amountPaid: number;
    changeAmount: number;
    paymentMethodId: string;
    paymentMethod?: PaymentMethod;

    // Profit calculation
    totalCost?: number;
    totalProfit?: number;
    profitMargin?: number;

    // Notes
    notes?: string;

    // Void information
    voidedAt?: Date | string;
    voidedBy?: string;
    voidReason?: string;

    // Return information
    returnedAt?: Date | string;
    returnedBy?: string;
    returnReason?: string;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;

    // Receipt info
    receiptPrinted?: boolean;
    receiptPrintedAt?: Date | string;
}

/**
 * Create sale payload (from POS)
 */
interface CreateSalePayload {
    tenantId: string;
    branchId: string;
    userId: string;
    terminalId?: string;
    customerId?: string;

    // Payment
    amountPaid: number;
    paymentMethodId: string;

    // Items
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        taxAmount: number;
        discountRate?: number;
        discountAmount: number;
        notes?: string;
    }[];

    // Totals (calculated on frontend, validated on backend)
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    // Notes
    notes?: string;
}

/**
 * Void sale payload
 */
interface VoidSalePayload {
    tenantId: string;
    branchId: string;
    voidedBy: string;
    voidReason: string;
}

/**
 * Return sale payload
 */
interface ReturnSalePayload {
    tenantId: string;
    branchId: string;
    returnedBy: string;
    returnReason: string;
    items?: {
        saleItemId: string;
        returnQuantity: number;
    }[]; // If not provided, returns all items
}

/**
 * Sale list query
 */
interface SaleListQuery {
    tenantId: string;
    branchId: string;
    page?: number;
    limit?: number;
    status?: SaleStatus;
    userId?: string;
    customerId?: string;
    terminalId?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    search?: string; // Search by sale number
}

/**
 * Sale response
 */
interface SaleResponse {
    success: boolean;
    message: string;
    data: Sale;
}

/**
 * Sale list response
 */
interface SaleListResponse {
    success: boolean;
    message: string;
    data: {
        sales: Sale[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

/**
 * Sale statistics
 */
interface SaleStats {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    totalItems: number;
    voidedSales: number;
    returnedSales: number;
}

/**
 * Daily sales summary
 */
interface DailySalesSummary {
    date: string;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    totalItems: number;
    averageOrderValue: number;
}
