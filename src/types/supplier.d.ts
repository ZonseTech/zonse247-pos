/**
 * Supplier Types for Purchase Order Management
 */

/**
 * Supplier status
 */
type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

/**
 * Supplier entity
 */
interface Supplier {
    id: string;
    tenantId: string;
    branchId: string;

    // Basic info
    name: string;
    code: string; // Unique supplier code (e.g., SUP001)

    // Contact information
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;

    // Address
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;

    // Business details
    taxId?: string; // VAT/Tax ID number
    registrationNumber?: string;

    // Payment terms
    paymentTerms?: string; // e.g., "NET 30", "Cash on delivery"
    creditLimit?: number;
    currency?: string;

    // Status
    status: SupplierStatus;
    isActive: boolean;

    // Notes
    notes?: string;

    // Statistics (calculated)
    totalOrders?: number;
    totalPurchaseValue?: number;
    lastOrderDate?: Date | string;

    // Audit
    createdBy: string;
    updatedBy?: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

/**
 * Supplier creation payload
 */
interface CreateSupplierPayload {
    tenantId: string;
    branchId: string;
    name: string;
    code: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    paymentTerms?: string;
    creditLimit?: number;
    currency?: string;
    status?: SupplierStatus;
    notes?: string;
}

/**
 * Supplier update payload
 */
interface UpdateSupplierPayload {
    tenantId: string;
    branchId: string;
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
    registrationNumber?: string;
    paymentTerms?: string;
    creditLimit?: number;
    currency?: string;
    status?: SupplierStatus;
    notes?: string;
}

/**
 * Supplier list query parameters
 */
interface SupplierListQuery {
    tenantId: string;
    branchId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: SupplierStatus;
}

/**
 * Supplier response from API
 */
interface SupplierResponse {
    success: boolean;
    message: string;
    data: Supplier;
}

/**
 * Supplier list response
 */
interface SupplierListResponse {
    success: boolean;
    message: string;
    data: {
        suppliers: Supplier[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
