/**
 * Supplier Return Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Return flow: DRAFT → APPROVED → SHIPPED → COMPLETED (stock impact on COMPLETE)
 * Completing a return auto-generates a credit note.
 */

/**
 * Supplier return status
 */
type SupplierReturnStatusType = 'DRAFT' | 'APPROVED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

/**
 * Credit note status
 */
type CreditNoteStatusType = 'PENDING' | 'APPLIED' | 'CANCELLED';

/**
 * Supplier return entity
 */
interface SupplierReturn {
    id: string;
    tenantId: string;
    branchId: string;
    supplierId: string;
    purchaseOrderId?: string | null;
    goodsReceiptId?: string | null;
    returnNumber: string; // Auto-generated: RET-YYYYMM-XXXX
    status: SupplierReturnStatusType;
    returnDate: Date | string;
    returnedBy: string;
    reason?: string | null;
    notes?: string | null;
    totalAmount: number;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Supplier return item
 */
interface SupplierReturnItem {
    id: string;
    supplierReturnId: string;
    goodsReceiptItemId?: string | null;
    variantId: string;
    tenantId: string;
    branchId: string;
    returnQuantity: number;
    unitCost: number;   // Original purchase cost from GRN
    totalCost: number;  // returnQuantity × unitCost
    reason?: string | null;
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
 * Supplier return with items (API response shape)
 */
interface SupplierReturnWithItems extends SupplierReturn {
    items: SupplierReturnItem[];
    supplier?: {
        id: string;
        name: string;
    };
    purchaseOrder?: {
        id: string;
        poNumber: string;
    } | null;
    goodsReceipt?: {
        id: string;
        receiptNumber: string;
    } | null;
    returnedByUser?: {
        userId: string;
        firstName: string;
        lastName: string;
    };
    creditNotes?: SupplierCreditNote[];
}

/**
 * Supplier credit note (auto-generated when a return is completed)
 */
interface SupplierCreditNote {
    id: string;
    supplierReturnId: string;
    tenantId: string;
    branchId: string;
    supplierId: string;
    creditNoteNumber: string;
    creditNoteDate: Date | string;
    amount: number;
    status: CreditNoteStatusType;
    appliedToInvoiceId?: string | null;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    supplierReturn?: SupplierReturn;
    supplier?: {
        id: string;
        name: string;
    } | null;
    appliedToInvoice?: {
        id: string;
        invoiceNumber: string;
    } | null;
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create supplier return input
 */
interface CreateSupplierReturnInput {
    supplierId: string;
    purchaseOrderId?: string;
    goodsReceiptId?: string;
    reason?: string;
    notes?: string;
    items: {
        goodsReceiptItemId?: string;
        variantId: string;
        returnQuantity: number;
        unitCost: number;
        reason?: string;
        notes?: string;
    }[];
}

/**
 * Update supplier return input (DRAFT only)
 */
interface UpdateSupplierReturnInput {
    reason?: string;
    notes?: string;
    items?: {
        goodsReceiptItemId?: string;
        variantId: string;
        returnQuantity: number;
        unitCost: number;
        reason?: string;
        notes?: string;
    }[];
}

/**
 * Apply credit note to an invoice
 */
interface ApplySupplierCreditNoteInput {
    invoiceId: string;
    notes?: string;
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * Supplier return list query
 */
interface SupplierReturnListQuery {
    status?: SupplierReturnStatusType;
    supplierId?: string;
    purchaseOrderId?: string;
    page?: number;
    limit?: number;
}

/**
 * Single supplier return API response
 */
interface SupplierReturnResponse {
    success: boolean;
    message: string;
    data: SupplierReturnWithItems;
}

/**
 * Supplier return list API response
 */
interface SupplierReturnListResponse {
    success: boolean;
    message: string;
    data: {
        data: SupplierReturnWithItems[];
        total: number;
        page: number;
        limit: number;
    };
}

/**
 * Credit note list query
 */
interface CreditNoteListQuery {
    status?: CreditNoteStatusType;
    supplierId?: string;
    page?: number;
    limit?: number;
}

/**
 * Credit note list API response
 */
interface CreditNoteListResponse {
    success: boolean;
    message: string;
    data: {
        data: SupplierCreditNote[];
        total: number;
        page: number;
        limit: number;
    };
}
