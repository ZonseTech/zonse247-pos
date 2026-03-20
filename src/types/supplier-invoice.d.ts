/**
 * Supplier Invoice Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * 3-way match: PO (ordered) ↔ GRN (received) ↔ Invoice (billed)
 */

/**
 * Invoice status
 */
type InvoiceStatusType = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'DISPUTED';

/**
 * Supplier invoice entity
 */
interface SupplierInvoice {
    id: string;
    tenantId: string;
    branchId: string;
    supplierId: string;
    purchaseOrderId?: string | null;
    invoiceNumber: string;
    invoiceDate: Date | string;
    dueDate?: Date | string | null;
    status: InvoiceStatusType;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Supplier invoice item
 */
interface SupplierInvoiceItem {
    id: string;
    supplierInvoiceId: string;
    purchaseOrderItemId?: string | null;
    variantId: string;
    tenantId: string;
    branchId: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number | null;
    taxAmount: number;
    discountAmount: number;
    totalPrice: number;
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
    } | null;
}

/**
 * Supplier invoice with items (API response shape)
 */
interface SupplierInvoiceWithItems extends SupplierInvoice {
    items: SupplierInvoiceItem[];
    supplier?: {
        id: string;
        name: string;
    };
    purchaseOrder?: {
        id: string;
        poNumber: string;
    } | null;
}

/**
 * 3-way match result: ordered vs received vs invoiced per item
 */
interface ThreeWayMatchResult {
    purchaseOrderItemId: string;
    variantId: string;
    orderedQuantity: number;
    receivedQuantity: number;
    invoicedQuantity: number;
    match: boolean;
    discrepancies: string[];
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create supplier invoice input
 */
interface CreateSupplierInvoiceInput {
    supplierId: string;
    purchaseOrderId?: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate?: string;
    subtotal?: number;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    items: {
        purchaseOrderItemId?: string;
        variantId: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        taxAmount?: number;
        discountAmount?: number;
        notes?: string;
    }[];
}

/**
 * Update supplier invoice input (PENDING only)
 */
interface UpdateSupplierInvoiceInput {
    dueDate?: string;
    taxAmount?: number;
    discountAmount?: number;
    notes?: string;
    items?: {
        purchaseOrderItemId?: string;
        variantId: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        taxAmount?: number;
        discountAmount?: number;
        notes?: string;
    }[];
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * Supplier invoice list query
 */
interface SupplierInvoiceListQuery {
    status?: InvoiceStatusType;
    supplierId?: string;
    purchaseOrderId?: string;
    page?: number;
    limit?: number;
}

/**
 * Single invoice API response
 */
interface SupplierInvoiceResponse {
    success: boolean;
    message: string;
    data: SupplierInvoiceWithItems;
}

/**
 * Invoice list API response
 */
interface SupplierInvoiceListResponse {
    success: boolean;
    message: string;
    data: {
        invoices: SupplierInvoiceWithItems[];
        total: number;
        totalPages: number;
    };
}

/**
 * 3-way match API response
 */
interface ThreeWayMatchResponse {
    success: boolean;
    message: string;
    data: ThreeWayMatchResult[];
}

/**
 * Supplier balance response
 */
interface SupplierBalanceResponse {
    success: boolean;
    message: string;
    data: {
        totalOutstanding: number;
        invoiceCount: number;
    };
}
