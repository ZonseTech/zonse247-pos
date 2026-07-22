/**
 * Supplier Types for Purchase Order Management
 */

/**
 * Supplier status
 */
type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

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
    tenantId?: string;
    branchId?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: SupplierStatus;
    includeInactive?: boolean;
    startDate?: string;
    endDate?: string;
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
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

/**
 * A single product historically supplied by a supplier, aggregated from purchase order history
 */
interface SupplierProductHistoryItem {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    sku: string | null;
    unit: string;
    totalOrdered: number;
    totalReceived: number;
    lastUnitPrice: number;
    lastOrderDate: Date | string;
    lastPoNumber: string;
    orderCount: number;
}

/**
 * Supplier product history response
 */
interface SupplierProductHistoryResponse {
    success: boolean;
    message: string;
    data: SupplierProductHistoryItem[];
}
