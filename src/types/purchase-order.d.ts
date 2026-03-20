/**
 * Purchase Order Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * PO flow: DRAFT → SENT → PARTIALLY_RECEIVED / RECEIVED
 * "Orders show intent, receipts confirm reality"
 */

/**
 * Purchase order status
 */
type PurchaseOrderStatus =
    | 'PENDING'
    | 'DRAFT'
    | 'SENT'
    | 'SHIPPED'
    | 'PARTIALLY_RECEIVED'
    | 'RECEIVED'
    | 'CANCELLED';

/**
 * Purchase order item — aligned with API model
 */
interface PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    tenantId: string;
    branchId: string;
    variantId: string;

    // Quantities
    orderedQuantity: number;
    receivedQuantity: number;
    damagedQuantity: number;
    invoicedQuantity: number;

    // Pricing
    unitPrice: number;
    totalPrice: number; // orderedQuantity × unitPrice

    // Notes
    notes?: string;

    // Versioning
    version: number;
    deletedAt?: Date | string | null;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;

    // Relations (populated in responses)
    variant?: {
        id: string;
        variantName: string;
        sku?: string;
        product?: {
            id: string;
            name: string;
        };
    };

    /**
     * @deprecated Use variantId instead. Kept for backward compat.
     */
    productId?: string;
    /**
     * @deprecated Use variant instead. Kept for backward compat.
     */
    product?: {
        id: string;
        name: string;
        sku: string;
    };
}

/**
 * Main Purchase Order entity — aligned with API model
 */
interface PurchaseOrder {
    id: string;
    purchaseOrderId: string; // Same as id — for compatibility
    tenantId: string;
    branchId: string;

    // Supplier
    supplierId: string;
    supplier?: {
        id: string;
        name: string;
    };

    // Requisition link (optional)
    requisitionId?: string | null;
    requisition?: {
        id: string;
        requisitionNumber: string;
    } | null;

    // Reference
    poNumber: string; // Auto-generated: PO-YYYYMM-XXXX

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

    // Users
    createdBy: string;
    receivedBy?: string;

    // Versioning
    version: number;
    deletedAt?: Date | string | null;

    // Audit
    createdAt: Date | string;
    updatedAt: Date | string;

    // Computed (UI convenience)
    totalAmount?: number;
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create purchase order input — aligned with API
 */
interface CreatePurchaseOrderInput {
    supplierId: string;
    requisitionId?: string;
    expectedDeliveryDate?: string;
    notes?: string;
    createdBy: string;
    items: {
        variantId: string;
        orderedQuantity: number;
        unitPrice: number;
        notes?: string;
    }[];
}

/**
 * Update purchase order input (DRAFT only)
 */
interface UpdatePurchaseOrderInput {
    supplierId?: string;
    expectedDeliveryDate?: string;
    notes?: string;
    items?: {
        variantId: string;
        orderedQuantity: number;
        unitPrice: number;
        notes?: string;
    }[];
}

/**
 * Receive purchase order input — aligned with API
 */
interface ReceivePurchaseOrderInput {
    receivedBy: string;
    items: {
        variantId: string;
        receivedQuantity: number;
        damagedQuantity: number;
    }[];
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * Purchase order list query
 */
interface PurchaseOrderListQuery {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    requisitionId?: string;
    page?: number;
    limit?: number;
}

/**
 * Single PO API response
 */
interface PurchaseOrderResponse {
    success: boolean;
    message: string;
    data: PurchaseOrder;
}

/**
 * PO list API response
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

/**
 * Create PO from approved requisition input
 */
interface CreatePOFromRequisitionInput {
    requisitionId: string;
    supplierId: string;
    itemPrices: { variantId: string; unitPrice: number }[];
    expectedDeliveryDate?: string;
    notes?: string;
}

// Legacy type aliases for backward compatibility
type CreatePurchaseOrderPayload = CreatePurchaseOrderInput;
type ReceivePurchaseOrderPayload = ReceivePurchaseOrderInput;
