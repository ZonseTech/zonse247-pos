type MraApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type BranchStatus = 'active' | 'inactive' | 'suspended';

interface Branch {
    id: number;
    branchId: string;
    tenantId: string;
    branchName: string;
    branchCode: string;
    siteId?: string | null;
    siteName?: string | null;
    description?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    addressLine3?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    currencyCode: string;
    currencySymbol: string;
    taxRate: string | number;
    chargeTax: boolean;
    receiptFooter?: string | null;
    logoUrl?: string | null;
    isVirtualWarehouse: boolean;
    isActive: boolean;
    synced: number;
    mraApprovalStatus: MraApprovalStatus;
    mraApprovalDate?: string | null;
    status: BranchStatus;
    createdAt: string;
    updatedAt: string;
}

type BranchFormValues = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>;

interface CreateBranchRequest {
    tenantId: string;
    branchCode: string;
    branchName: string;
    siteId?: string;
    siteName?: string;
    description?: string;
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    district?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phoneNumber?: string;
    email?: string;
    currencyCode?: string;
    currencySymbol?: string;
    taxRate?: number;
    chargeTax?: boolean;
    receiptFooter?: string;
    logoUrl?: string;
    isVirtualWarehouse?: boolean;
}

interface UpdateBranchRequest extends Partial<CreateBranchRequest> {
    status?: BranchStatus;
    isActive?: boolean;
    mraApprovalStatus?: MraApprovalStatus;
}

interface BranchQueryParams {
    search?: string;
    status?: BranchStatus;
    tenantId?: string;
    isActive?: boolean;
    isVirtualWarehouse?: boolean;
    mraApprovalStatus?: MraApprovalStatus;
    district?: string;
    city?: string;
    currencyCode?: string;
    paginated?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface BranchOptions {
    branchId: string;
    branchName: string;
    branchCode: string;
}
