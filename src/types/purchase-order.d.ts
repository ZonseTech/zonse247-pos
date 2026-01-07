/**
 * Purchase Order Types
 * Following the principle: "Orders show intent, receipts confirm reality"
 */

/**
 * Purchase order status
 */
type PurchaseOrderStatus =
    | 'DRAFT'              // Being created
    | 'PENDING'            // Sent to supplier, awaiting delivery
    | 'PARTIALLY_RECEIVED' // Some items received
    | 'RECEIVED'           // All items received
    | 'CANCELLED'          // Order cancelled
    | 'LOCKED';            // Locked for editing

/**
 * Purchase order item
 */
interface PurchaseOrderItem {
    id?: string;
    purchaseOrderId?: string;
    productId: string;
    product?: Product; // Populated in responses

    // Quantities
    orderedQuantity: number;    // What we ordered
    receivedQuantity: number;   // What we actually got (good stock)
    damagedQuantity: number;    // What arrived damaged

    // Pricing
    unitPrice: number;          // Price per unit
    totalPrice?: number;        // orderedQuantity * unitPrice (calculated)

    // Taxes and discounts
    taxRate?: number;
    taxAmount?: number;
    discountRate?: number;
    discountAmount?: number;

    // Notes
    notes?: string;

    // Audit
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

/**
 * Main Purchase Order entity
 */
interface PurchaseOrder {
    id: string;
    purchaseOrderId?: string; // Alias for id, some API responses may use this
    tenantId: string;
    branchId: string;

    // Reference
    poNumber: string; // Auto-generated: PO-YYYYMM-XXXX

    // Supplier
    supplierId: string;
    supplier?: Supplier; // Populated in responses

    // Status
    status: PurchaseOrderStatus;

    // Items
    items: PurchaseOrderItem[];

    // Dates
    orderDate: Date | string;
    expectedDeliveryDate?: Date | string;
    receivedAt?: Date | string;

    // Financial totals (calculated)
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;

    // Notes
    notes?: string;
    internalNotes?: string; // Not visible to supplier

    // Payment
    paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
    paidAmount?: number;

    // Receiving info
    receivedBy?: string; // User ID who received the order
    receivingNotes?: string;

    // Audit
    createdBy: string;
    updatedBy?: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Attachments
    attachments?: string[]; // URLs to invoices, delivery notes, etc.
}

/**
 * Create purchase order payload
 */
interface CreatePurchaseOrderPayload {
    tenantId: string;
    branchId: string;
    supplierId: string;
    expectedDeliveryDate?: Date | string;
    notes?: string;
    internalNotes?: string;
    createdBy: string;
    items: {
        productId: string;
        orderedQuantity: number;
        unitPrice: number;
        taxRate?: number;
        discountRate?: number;
        notes?: string;
    }[];
}

/**
 * Update purchase order payload
 */
interface UpdatePurchaseOrderPayload {
    tenantId: string;
    branchId: string;
    supplierId?: string;
    expectedDeliveryDate?: Date | string;
    notes?: string;
    internalNotes?: string;
    items?: {
        id?: string; // Include for existing items to update
        productId: string;
        orderedQuantity: number;
        unitPrice: number;
        taxRate?: number;
        discountRate?: number;
        notes?: string;
    }[];
}

/**
 * Receive purchase order payload
 * This is where inventory is actually updated
 */
interface ReceivePurchaseOrderPayload {
    tenantId?: string;
    branchId?: string;
    receivedBy: string;
    receivingNotes?: string;
    items: {
        productId: string;
        receivedQuantity: number;  // Good stock received
        damagedQuantity: number;   // Damaged items
        notes?: string;
    }[];
}

/**
 * Cancel purchase order payload
 */
interface CancelPurchaseOrderPayload {
    tenantId?: string;
    branchId?: string;
    cancelledBy?: string;
    cancelReason?: string;
}

/**
 * Purchase order list query
 */
interface PurchaseOrderListQuery {
    tenantId: string;
    branchId: string;
    page?: number;
    limit?: number;
    status?: PurchaseOrderStatus;
    supplierId?: string;
    startDate?: Date | string;
    endDate?: Date | string;
    search?: string; // Search by PO number
}

/**
 * Purchase order response
 */
interface PurchaseOrderResponse {
    success: boolean;
    message: string;
    data: PurchaseOrder;
}

/**
 * Purchase order list response
 */
interface PurchaseOrderListResponse {
    success: boolean;
    message: string;
    data: {
        orders: PurchaseOrder[]; // API returns 'orders' not 'purchaseOrders'
        purchaseOrders?: PurchaseOrder[]; // Keep for backward compatibility
        pagination: {
            currentPage?: number;
            page?: number;
            limit?: number;
            itemsPerPage?: number;
            total?: number;
            totalItems?: number;
            totalPages?: number;
        };
    };
}

/**
 * Purchase order statistics
 */
interface PurchaseOrderStats {
    totalOrders: number;
    pendingOrders: number;
    receivedOrders: number;
    totalValue: number;
    pendingValue: number;
}
