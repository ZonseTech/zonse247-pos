/**
 * Sales Types for POS Integration
 * Updated for Product/Variant model (API v1.6.0+)
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
 * Sale item - now references variantId (required) and productId (optional)
 */
interface SaleItem {
    id?: string;
    saleId?: string;
    variantId: string;     // Required: The variant being sold
    productId?: string;    // Optional: Parent product ID for reference
    product?: {
        id: string;
        productId?: string;
        name: string;
        variantName?: string;
        displayName?: string;
        sku?: string;
        primaryBarcode?: string;
        barcodes?: { barcode: string }[];
    }; // Populated in responses

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
    user?: {
        userId: string;
        fullname: string;
        username?: string;
        email?: string;
    }; // Cashier who processed the sale
    terminalId?: string;
    terminal?: {
        terminalId: string;
        terminalLabel: string;
        terminalCode?: string;
    };

    // Customer
    customerId?: string | null;
    customer?: Customer | null;

    // Status
    status: SaleStatus;
    isVoided?: boolean;

    // Sale date (main transaction date)
    saleDate?: Date | string;

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

    // Multiple payments support
    payments?: SalePayment[];

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
 * Single payment entry for multiple payments
 */
interface PaymentEntry {
    paymentMethodId: string;
    amount: number;
    reference?: string;
    providerId?: string;
    providerRef?: string;
    phoneNumber?: string;
    notes?: string;
}

/**
 * Input for a single sale item
 */
interface CreateSaleItemInput {
    variantId: string;     // Required: The variant being sold
    productId?: string;    // Optional: Parent product ID
    quantity: number;
    unitPrice: number;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
}

/**
 * Input for creating a payment (split payment support)
 */
interface SalePaymentInput {
    paymentMethodId: string;
    amount: number;
    reference?: string;
    providerId?: string;
    providerRef?: string;
    notes?: string;
}

/**
 * Input for other charges (fees, service charges, etc.)
 */
interface OtherChargeInput {
    type: string;
    label: string;
    value: number;
    isPercentage: boolean;
    amount: number;
}

/**
 * Create sale payload (from POS)
 * Updated for variant model (API v1.6.0+)
 */
interface CreateSalePayload {
    tenantId: string;
    branchId: string;
    userId: string;
    terminalId?: string;
    customerId?: string;

    // Payment - single payment (legacy)
    amountPaid: number;
    paymentMethodId?: string;

    // Multiple payments support
    payments?: SalePaymentInput[] | PaymentEntry[];

    // Items - now require variantId
    items: CreateSaleItemInput[] | {
        variantId: string;
        productId?: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        taxAmount?: number;
        discountRate?: number;
        discountAmount?: number;
        notes?: string;
    }[];

    // Totals (calculated on frontend, validated on backend)
    subtotal?: number;
    taxAmount?: number;
    discountAmount?: number;
    totalAmount?: number;

    // Other charges
    otherCharges?: OtherChargeInput[] | number | {
        type: string;
        label: string;
        value: number;
        isPercentage: boolean;
        amount: number;
    }[];

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
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            // Legacy aliases
            page?: number;
            limit?: number;
            total?: number;
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

/**
 * Options for sales summary
 */
interface SalesSummaryOptions {
    startDate?: Date | string;
    endDate?: Date | string;
    status?: string;
    paymentMethodId?: string;
    userId?: string;
    terminalId?: string;
}

/**
 * Sales summary response
 */
interface SalesSummary {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    totalItems: number;
    topProducts?: {
        productId: string;
        variantId: string;
        name: string;
        quantity: number;
        revenue: number;
    }[];
    paymentMethodBreakdown?: {
        paymentMethodId: string;
        name: string;
        count: number;
        total: number;
    }[];
}
