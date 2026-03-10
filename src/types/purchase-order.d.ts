/**
 * Purchase Order Types
 * Aligned with zonse247-pos-api module
 * Following the principle: "Orders show intent, receipts confirm reality"
 */

/**
 * Purchase order status (from Prisma)
 */
type PurchaseOrderStatus =
    | 'DRAFT'              // Being created
    | 'PENDING'            // Sent to supplier, awaiting delivery
    | 'PARTIALLY_RECEIVED' // Some items received
    | 'RECEIVED'           // All items received
    | 'CANCELLED';         // Order cancelled

/**
 * Purchase order item - aligned with API model
 */
interface PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    productId: string;
    product?: {
        id: string;
        name: string;
        sku: string;
    };

    // Quantities
    orderedQuantity: number;    // What we ordered
    receivedQuantity: number;   // What we actually got (good stock)
    damagedQuantity: number;    // What arrived damaged

    // Pricing
    unitPrice: number;          // Price per unit
    totalPrice: number;         // orderedQuantity * unitPrice (calculated)

    // Notes
    notes?: string;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Main Purchase Order entity - aligned with API model
 */
interface PurchaseOrder {
    id: string;
    purchaseOrderId: string; // Same as id - for compatibility
    tenantId: string;
    branchId: string;

    // Reference
    poNumber: string; // Auto-generated: PO-YYYYMM-XXXX

    // Supplier
    supplierId: string;
    supplier?: {
        id: string;
        name: string;
    };

    // Status
    status: PurchaseOrderStatus;
    isLocked: boolean;

    // Items
    items: PurchaseOrderItem[];

    // Dates
    orderDate: Date | string;
    expectedDeliveryDate?: Date | string;
    receivedAt?: Date | string;

    // Notes
    notes?: string;

    // Receiving info
    receivedBy?: string; // User ID who received the order

    // Audit
    createdBy: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Computed field for UI (calculated from items)
    totalAmount?: number;
}

/**
 * Create purchase order input - aligned with API
 */
interface CreatePurchaseOrderInput {
    supplierId: string;
    expectedDeliveryDate?: string;
    notes?: string;
    items: {
        productId: string;
        orderedQuantity: number;
        unitPrice: number;
    }[];
}

/**
 * Receive purchase order input - aligned with API
 */
interface ReceivePurchaseOrderInput {
    items: {
        productId: string;
        receivedQuantity: number;
        damagedQuantity: number;
    }[];
}

/**
 * Purchase order list query
 */
interface PurchaseOrderListQuery {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    page?: number;
    limit?: number;
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
 * Purchase order list response - aligned with API
 */
interface PurchaseOrderListResponse {
    success: boolean;
    message: string;
    data: {
        orders: PurchaseOrder[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

// Legacy type aliases for backward compatibility
type CreatePurchaseOrderPayload = CreatePurchaseOrderInput;
type ReceivePurchaseOrderPayload = ReceivePurchaseOrderInput;
