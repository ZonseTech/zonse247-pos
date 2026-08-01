interface Role {
    roleId: string;
    tenantId?: string | null;
    branchId?: string | null;
    name: string;
    displayName: string;
    description?: string | null;
    isSystemRole?: boolean;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface Permission {
    permissionId: string;
    name: string;
    displayName: string;
    description?: string | null;
    category: string;
    scope?: PermissionScope;
    isSystemPermission?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PermissionCategory { }

interface PermissionScope { }

interface RolePermission {
    id?: number;
    rolePermissionId: string;
    roleId: string;
    permissionId: string;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
    deletedAt?: Date | null;
}

interface CreateRoleRequest {
    tenantId?: string | null;
    branchId?: string | null;
    name: string;
    displayName: string;
    description?: string | null;
    isActive?: boolean;
    isSystemRole?: boolean;
}

interface CreateRolePermissionRequest {
    roleId: string;
    permissionId: string;
}

interface BulkRolePermissionRequest {
    roleId: string;
    permissionIds: Array<string>
}

interface CreateRoleRequest {
    tenantId?: string | null;
    branchId?: string | null;
    name: string;
    displayName: string;
    description?: string | null;
    isActive?: boolean;
}

interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
    uuid: string;
}

interface BulkRolePermissionRequest {
    roleId: string;
    permissionIds: Array<string>;
}

interface FilterState {
    searchTerm: string;
    selectedCategory: string;
    selectedScope: string;
}

interface ModalState {
    showRoleModal: boolean;
    showPermissionModal: boolean;
    showAssignModal: boolean;
    editingRole: Role | null;
    editingPermission: Permission | null;
    selectedRole: Role | null;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    page: number;
    limit: number;
}

