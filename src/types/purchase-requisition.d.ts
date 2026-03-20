/**
 * Purchase Requisition Types
 * Aligned with zonse247-pos-api v1.6.1
 * Requisitions = internal requests for stock before a PO is raised
 */

/**
 * Requisition status
 */
type RequisitionStatusType = 'PENDING' | 'APPROVED' | 'PARTIALLY_APPROVED' | 'REJECTED' | 'CANCELLED';

/**
 * Purchase requisition entity
 */
interface PurchaseRequisition {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    requisitionNumber: string; // Auto-generated: REQ-YYYYMM-XXXX
    requestedBy: string;
    status: RequisitionStatusType;
    notes?: string | null;
    approvedAt?: Date | string | null;
    approvedBy?: string | null;
    rejectedAt?: Date | string | null;
    rejectedBy?: string | null;
    rejectedReason?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Purchase requisition item
 */
interface PurchaseRequisitionItem {
    id: string;
    requisitionId: string;
    variantId: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    requestedQuantity: number;
    approvedQuantity?: number | null;
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
}

/**
 * Purchase requisition with items (API response shape)
 */
interface PurchaseRequisitionWithItems extends PurchaseRequisition {
    items: PurchaseRequisitionItem[];
    requestedByUser?: {
        userId: string;
        fullname: string;
    };
    approvedByUser?: {
        userId: string;
        fullname: string;
    } | null;
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create requisition input
 */
interface CreateRequisitionInput {
    notes?: string;
    items: {
        variantId: string;
        requestedQuantity: number;
        notes?: string;
    }[];
}

/**
 * Update requisition input (only PENDING)
 */
interface UpdateRequisitionInput {
    notes?: string;
    items?: {
        variantId: string;
        requestedQuantity: number;
        notes?: string;
    }[];
}

/**
 * Approve requisition input (full or partial)
 */
interface ApproveRequisitionInput {
    items?: {
        variantId: string;
        approvedQuantity: number;
    }[];
}

/**
 * Reject requisition input
 */
interface RejectRequisitionInput {
    rejectedReason?: string;
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * Requisition list query
 */
interface RequisitionListQuery {
    status?: RequisitionStatusType;
    requestedBy?: string;
    page?: number;
    limit?: number;
}

/**
 * Single requisition API response
 */
interface RequisitionResponse {
    success: boolean;
    message: string;
    data: PurchaseRequisitionWithItems;
}

/**
 * Requisition list API response
 */
interface RequisitionListResponse {
    success: boolean;
    message: string;
    data: {
        requisitions: PurchaseRequisitionWithItems[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}
