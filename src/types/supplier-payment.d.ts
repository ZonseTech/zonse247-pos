/**
 * Supplier Payment Types
 * Aligned with zonse247-pos-api v1.6.1
 *
 * Payments are allocated across one or more invoices.
 * payment.amount === sum(allocations.allocatedAmount)
 */

/**
 * Payment status
 */
type PaymentStatusType = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

/**
 * Supplier payment entity
 */
interface SupplierPayment {
    id: string;
    tenantId: string;
    branchId: string;
    supplierId: string;
    paymentNumber: string; // Auto-generated: PAY-YYYYMM-XXXX
    paymentDate: Date | string;
    amount: number;
    paymentMethod?: string | null;
    reference?: string | null;
    status: PaymentStatusType;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Payment allocation to an invoice
 */
interface SupplierPaymentAllocation {
    id: string;
    tenantId: string;
    branchId: string;
    paymentId: string;
    invoiceId: string;
    allocatedAmount: number;
    allocatedDate: Date | string;
    notes?: string | null;
    version: number;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    invoice?: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        amountPaid: number;
        balanceDue: number;
        status: string;
    };
}

/**
 * Supplier payment with allocations (API response shape)
 */
interface SupplierPaymentWithAllocations extends SupplierPayment {
    allocations: SupplierPaymentAllocation[];
    supplier?: {
        id: string;
        name: string;
    };
}

// ─── Input Payloads ────────────────────────────────────────────────────────

/**
 * Create supplier payment input
 * amount must equal sum of all allocation amounts
 */
interface CreateSupplierPaymentInput {
    supplierId: string;
    paymentDate?: string;
    amount: number;
    paymentMethod?: string;
    reference?: string;
    notes?: string;
    allocations: {
        invoiceId: string;
        allocatedAmount: number;
        notes?: string;
    }[];
}

/**
 * Void supplier payment input
 */
interface VoidSupplierPaymentInput {
    reason?: string;
}

// ─── Query & Response ──────────────────────────────────────────────────────

/**
 * Supplier payment list query
 */
interface SupplierPaymentListQuery {
    status?: PaymentStatusType;
    supplierId?: string;
    page?: number;
    limit?: number;
}

/**
 * Single payment API response
 */
interface SupplierPaymentResponse {
    success: boolean;
    message: string;
    data: SupplierPaymentWithAllocations;
}

/**
 * Payment list API response
 */
interface SupplierPaymentListResponse {
    success: boolean;
    message: string;
    data: {
        payments: SupplierPaymentWithAllocations[];
        total: number;
        totalPages: number;
    };
}
