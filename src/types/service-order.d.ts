/**
 * Service Order Types
 * Aligned with zonse247-pos-api v1.7.0 MULTI_INDUSTRY_FRONTEND_GUIDE.md
 */

type ServicePricingType = 'FIXED' | 'VARIABLE' | 'HOURLY' | 'PER_UNIT' | 'PACKAGE' | 'FLAT_RATE' | 'TIERED' | 'SUBSCRIPTION' | 'CUSTOM';

type ServiceOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PARTIALLY_PAID' | 'PAID';
type ServiceOrderType = 'SERVICE_ONLY' | 'PRODUCT_ONLY' | 'HYBRID';
type ServiceItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type CommissionType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// ─── Service catalog ─────────────────────────────────────────────────────────

interface Service {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    name: string;
    description?: string | null;
    sku?: string | null;
    pricingType: ServicePricingType;
    basePrice?: number | null;
    durationMin?: number | null;
    categoryId?: string | null;
    isTaxable: boolean;
    taxRate?: number | null;
    imageUrl?: string | null;
    isActive: boolean;
    version: number;
    category?: { categoryId: string; name: string } | null;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface CreateServiceInput {
    name: string;
    description?: string;
    sku?: string;
    pricingType?: ServicePricingType;
    basePrice?: number;
    durationMin?: number;
    categoryId?: string;
    isTaxable?: boolean;
    taxRate?: number;
    imageUrl?: string;
    isActive?: boolean;
}

interface UpdateServiceInput {
    name?: string;
    description?: string;
    sku?: string;
    pricingType?: ServicePricingType;
    basePrice?: number;
    durationMin?: number;
    categoryId?: string;
    isTaxable?: boolean;
    taxRate?: number;
    imageUrl?: string;
    isActive?: boolean;
}

interface ServiceListQuery {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: 'true' | 'false';
    pricingType?: ServicePricingType;
}

interface ServiceListResponse {
    services: Service[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// ─── Service Summary ─────────────────────────────────────────────────────────

interface ServiceSummaryQuery {
    categoryId?: string;
    isActive?: 'true' | 'false';
    pricingType?: ServicePricingType;
}

interface ServiceSummary {
    totalServices: number;
    activeServices: number;
    inactiveServices: number;
    pricing: {
        averagePrice: number;
        highestPrice: number;
        lowestPrice: number;
        servicesWithNoPrice: number;
    };
    byPricingType: Array<{
        pricingType: ServicePricingType;
        count: number;
    }>;
    byCategory: Array<{
        categoryId: string | null;
        categoryName: string;
        count: number;
    }>;
    duration: {
        averageDurationMin: number;
        shortestDurationMin: number;
        longestDurationMin: number;
        servicesWithNoDuration: number;
    };
}

// ─── Staff ───────────────────────────────────────────────────────────────────

type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED' | 'RESIGNED';

interface Staff {
    staffId: string;
    tenantId: string;
    branchId: string;
    userId: string;
    employeeCode?: string | null;
    department?: string | null;
    designation?: string | null;
    joiningDate?: string | Date | null;
    calculateAs?: string | null;
    staffSalary?: number | null;
    salaryFrequency?: string | null;
    trackAttendance?: boolean;
    allowAppAccess?: boolean;
    employmentStatus: EmploymentStatus;
    user?: { userId: string; fullname: string; email?: string | null; phone?: string | null } | null;
    deletedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface StaffListQuery {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    employmentStatus?: EmploymentStatus;
}

interface StaffListResponse {
    staff: Staff[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// ─── Create / Input types ──────────────────────────────────────────────────────

interface CreateServiceOrderInput {
    customerId?: string;
    terminalId?: string;
    notes?: string;
    items?: CreateServiceOrderItemInput[];
    productItems?: CreateServiceOrderProductItemInput[];
}

interface CreateServiceOrderProductItemInput {
    variantId: string;
    quantity: number;
    unitPrice: number;
    taxAmount?: number;
    discountAmount?: number;
}

interface CreateServiceOrderItemInput {
    serviceId: string;
    quantity?: number;
    unitPrice: number;
    discountAmount?: number;
    taxAmount?: number;
    notes?: string;
    staffAssignments?: StaffAssignmentInput[];
}

interface StaffAssignmentInput {
    staffId: string;
    role?: string;
    commissionType?: CommissionType;
    commissionValue?: number;
}

interface ConsumptionInput {
    productVariantId: string;
    quantity: number;
}

interface UpdateServiceOrderInput {
    customerId?: string;
    notes?: string;
    discountAmount?: number;
    items?: CreateServiceOrderItemInput[];
    productItems?: CreateServiceOrderProductItemInput[];
}

interface CompleteItemInput {
    consumptions?: ConsumptionInput[];
}

interface ServiceOrderPaymentInput {
    paymentMethodId: string;
    amount: number;
    reference?: string;
    providerId?: string;
    providerRef?: string;
    notes?: string;
}

// ─── Response / Detail types ───────────────────────────────────────────────────

interface StaffAssignment {
    id: string;
    serviceOrderItemId: string;
    staffId: string;
    role?: string | null;
    commissionType: CommissionType;
    commissionValue: number;
    commissionAmount: number;
    staff?: {
        staffId: string;
        userId: string;
        employeeCode?: string | null;
        user?: { fullname: string } | null;
    } | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface ServiceConsumption {
    id: string;
    serviceOrderItemId: string;
    productVariantId: string;
    tenantId: string;
    branchId: string;
    quantity: number;
    unitCostAtTime: number;
    totalCost: number;
    stockMovementId?: string | null;
    notes?: string | null;
    variant?: ProductVariant | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface ServiceOrderItemDetail {
    id: string;
    serviceOrderId: string;
    serviceId: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    subtotal: number;
    taxAmount: number;
    totalPrice: number;
    status: ServiceItemStatus;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    notes?: string | null;
    service?: Service | null;
    consumptions?: ServiceConsumption[];
    staffAssignments?: StaffAssignment[];
}

interface ServiceOrderProductItemDetail {
    id: string;
    serviceOrderId: string;
    variantId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    variant?: {
        id: string;
        variantName?: string | null;
        sku?: string | null;
        product?: { id: string; name: string } | null;
    } | null;
}

interface ServiceOrderWithItems {
    id: string;
    tenantId: string;
    branchId: string;
    terminalId?: string | null;
    customerId?: string | null;
    orderNumber: string;
    orderType?: ServiceOrderType;
    status: ServiceOrderStatus;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    notes?: string | null;
    createdBy?: string | null;
    mraStatus?: MraSaleStatus | null;
    mraSubmissionId?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    items: ServiceOrderItemDetail[];
    productItems?: ServiceOrderProductItemDetail[];
    payments?: SalePayment[];
    customer?: Customer | null;
    createdByUser?: { userId: string; fullname: string } | null;
    appointment?: any;
}

// ─── Query types ──────────────────────────────────────────────────────────────

interface ServiceOrderListQuery {
    status?: ServiceOrderStatus;
    customerId?: string;
    search?: string;
    paymentMethodId?: string;
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
}

interface ServiceOrderListResponse {
    orders: ServiceOrderWithItems[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

interface ServiceOrderPaymentListResponse {
    payments: SalePayment[];
}
