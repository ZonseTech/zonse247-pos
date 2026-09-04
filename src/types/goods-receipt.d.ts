/**
 * Goods Receipt Note (GRN) Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * GRN flow: DRAFT → VERIFIED → POSTED (stock impact on POST only)
 * Multiple GRNs per PO allowed (partial deliveries)
 */

/**
 * GRN status
 */
type GRNStatusType = 'DRAFT' | 'VERIFIED' | 'POSTED' | 'CANCELLED';

/**
 * Goods receipt entity
 */
interface GoodsReceipt {
    id: string;
    tenantId: string;
    branchId: string;
    purchaseOrderId: string;
    receiptNumber: string; // Auto-generated: GRN-YYYYMM-XXXX
    status: GRNStatusType;
    receivedAt: Date | string;
    receivedBy: string;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Goods receipt item
 */
interface GoodsReceiptItem {
    id: string;
    goodsReceiptId: string;
    purchaseOrderItemId: string;
    variantId: string;
    tenantId: string;
    branchId: string;
    receivedQuantity: number;
    rejectedQuantity: number;
    rejectionReason?: string | null;
    unitCost: number;
    totalCost: number;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    variant?: {
        id: string;
        variantName: string;
        sku?: string | null;
        product?: {
            id: string;
            name: string;
        };
    };
    purchaseOrderItem?: {
        id: string;
        orderedQuantity: number;
        receivedQuantity: number;
        damagedQuantity: number;
    };
}

/**
 * Goods receipt with items (API response shape)
 */
interface GoodsReceiptWithItems extends GoodsReceipt {
    items: GoodsReceiptItem[];
    purchaseOrder?: {
        id: string;
        poNumber: string;
        supplierId: string;
        supplier?: {
            id: string;
            name: string;
        };
    };
    receivedByUser?: {
        userId: string;
        firstName: string;
        lastName: string;
    };
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create goods receipt input
 */
interface CreateGoodsReceiptInput {
    purchaseOrderId: string;
    notes?: string;
    items: {
        purchaseOrderItemId: string;
        variantId: string;
        receivedQuantity: number;
        rejectedQuantity?: number;
        rejectionReason?: string;
        unitCost: number;
        notes?: string;
    }[];
}

/**
 * Update goods receipt input (DRAFT only)
 */
interface UpdateGoodsReceiptInput {
    notes?: string;
    items?: {
        purchaseOrderItemId: string;
        variantId: string;
        receivedQuantity: number;
        rejectedQuantity?: number;
        rejectionReason?: string;
        unitCost: number;
        notes?: string;
    }[];
}

/**
 * Verify goods receipt input
 */
interface VerifyGoodsReceiptInput {
    notes?: string;
}

/**
 * Post goods receipt input
 */
interface PostGoodsReceiptInput {
    notes?: string;
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * GRN list query
 */
interface GoodsReceiptListQuery {
    status?: GRNStatusType;
    purchaseOrderId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

/**
 * Single GRN API response
 */
interface GoodsReceiptResponse {
    success: boolean;
    message: string;
    data: GoodsReceiptWithItems;
}

/**
 * GRN list API response — aligned with actual API controller
 */
interface GoodsReceiptListResponse {
    success: boolean;
    message: string;
    data: {
        receipts: GoodsReceiptWithItems[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}
