/**
 * Parked Sales Types
 * For temporarily saving sales that will be completed later
 */

/**
 * Parked sale status
 */
type ParkedSaleStatus = 'PARKED' | 'RESUMED' | 'VOIDED' | 'EXPIRED';

/**
 * Parked sale item
 */
interface ParkedSaleItem {
    productId: string;
    barcode: string | number;
    name: string;
    categoryId: string;
    quantity: number;
    unitPrice: number;
    sellingPrice: number;
    purchasePrice: number;
    discount: number;
    taxAmount?: number;
    taxRate?: number;
    variancePrice?: number;
    notes?: string;
}

/**
 * Main Parked Sale entity
 */
interface ParkedSale {
    id: string;
    tenantId: string;
    branchId: string;

    // Reference
    reference: string;
    parkNumber?: string; // Auto-generated: PARK-YYYYMMDD-XXXXX

    // User and terminal
    userId: string;
    user?: User;
    terminalId?: string;
    terminal?: Terminal;

    // Customer
    customerId?: string;
    customer?: Customer;

    // Status
    status: ParkedSaleStatus;

    // Items
    items: ParkedSaleItem[];

    // Financial totals
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    // Notes
    notes?: string;

    // Timestamps
    parkedAt: Date | string;
    expiresAt?: Date | string;
    resumedAt?: Date | string;
    voidedAt?: Date | string;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Create parked sale payload
 */
interface CreateParkedSalePayload {
    tenantId: string;
    branchId: string;
    userId: string;
    terminalId?: string;
    customerId?: string;

    // Reference (customer name or order reference)
    reference: string;

    // Items
    items: {
        productId: string;
        barcode: string | number;
        name: string;
        categoryId: string;
        quantity: number;
        unitPrice: number;
        sellingPrice: number;
        purchasePrice: number;
        discount: number;
        taxAmount?: number;
        variancePrice?: number;
    }[];

    // Totals
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    // Notes
    notes?: string;
}

/**
 * Resume parked sale payload
 */
interface ResumeParkedSalePayload {
    tenantId: string;
    branchId: string;
    resumedBy: string;
}

/**
 * Void parked sale payload
 */
interface VoidParkedSalePayload {
    tenantId: string;
    branchId: string;
    voidedBy: string;
    voidReason?: string;
}

/**
 * Parked sale list query
 */
interface ParkedSaleListQuery {
    tenantId: string;
    branchId: string;
    page?: number;
    limit?: number;
    status?: ParkedSaleStatus;
    userId?: string;
    customerId?: string;
    terminalId?: string;
    search?: string;
}

/**
 * Parked sale response
 */
interface ParkedSaleResponse {
    success: boolean;
    message: string;
    data: ParkedSale;
}

/**
 * Parked sale list response
 */
interface ParkedSaleListResponse {
    success: boolean;
    message: string;
    data: {
        parkedSales: ParkedSale[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
