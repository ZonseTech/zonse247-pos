/**
 * Tenant Registration Detail Types
 * Represents registration details for tenant onboarding
 */

interface TenantRegistrationDetailInput {
    tenantId: string;
    businessName: string;
    ownerName: string;
    email: string;
    tenantCode: string;
    verificationToken: string;
    username: string;
    password: string;
}

interface TenantRegistrationDetail extends TenantRegistrationDetailInput {
    id: number;
    detailId: string;
    isProcessed: boolean;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface TenantRegistrationDetailQueryParams {
    processed?: boolean;
    tenantId?: string;
    email?: string;
    paginated?: boolean;
    page?: number;
    perPage?: number;
    search?: string;
}

interface MarkProcessedResponse {
    success: boolean;
    detail: TenantRegistrationDetail;
}
