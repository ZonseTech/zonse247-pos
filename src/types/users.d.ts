type UserStatus = 'active' | 'inactive' | 'suspended';

interface User {
    id?: number;
    userId: string;
    tenantId: string;
    branchId: string;
    username: string;
    password?: string;
    fullname: string;
    email?: string | null;
    phone?: string | null;
    roleId: string;
    roleName?: string | null;
    permissions?: string[] | null;
    status?: UserStatus;
    accessibleBranches?: string[] | null;
    allowedTerminals?: string[] | null;
    maxDiscountPercent?: string | number;
    canOverridePrices?: boolean;
    pinCode?: string | null;
    currentBranchId?: string | null;
    lastLogin?: string | Date | null;
    lastLogout?: string | Date | null;
    passwordChangedAt?: string | Date;
    forcePasswordChange?: boolean;
    synced?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

interface UserQueryParams {
    search?: string;
    tenantId?: string;
    branchId?: string;
    roleId?: string;
    status?: UserStatus;
    paginated?: boolean;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

interface CreateUserRequest {
    tenantId: string;
    branchId: string;
    username: string;
    password: string;
    fullname: string;
    email?: string;
    phone?: string;
    roleId: string;
    status?: UserStatus;
    accessibleBranches?: string[];
    allowedTerminals?: string[];
    maxDiscountPercent?: string | number;
    canOverridePrices?: boolean;
    pinCode?: string;
    forcePasswordChange?: boolean;
}

interface UpdateUserRequest {
    username?: string;
    fullname?: string;
    email?: string;
    phone?: string;
    roleId?: string;
    status?: UserStatus;
    accessibleBranches?: string[];
    allowedTerminals?: string[];
    maxDiscountPercent?: string | number;
    canOverridePrices?: boolean;
    pinCode?: string;
    currentBranchId?: string;
    forcePasswordChange?: boolean;
}

interface PublicUser extends Omit<User, 'password'> {
    roleName?: string;
    permissions?: string[];
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Record<string, number>;
}

interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordRequest {
    newPassword: string;
    forcePasswordChange?: boolean;
}
