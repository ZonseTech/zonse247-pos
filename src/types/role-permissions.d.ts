interface Role {
    id?: number;
    uuid: string;
    client_id: string;
    shop_id?: string | null;
    name: string;
    display_name: string;
    description?: string | null;
    is_system_role?: boolean;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface Permission {
    id?: number;
    uuid: string;
    name: string;
    display_name: string;
    description?: string | null;
    category: string;
    scope?: PermissionScope;
    is_system_permission?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface RolePermission {
    id?: number;
    role_uuid: string;
    permission_uuid: string;
    created_at?: Date;
}

interface CreateRoleRequest {
    client_id: string;
    shop_id?: string | null;
    name: string;
    display_name: string;
    description?: string | null;
    is_active?: boolean;
}

interface CreateRolePermissionRequest {
    role_uuid: string;
    permission_uuid: string;
}

interface CreatePermissionRequest {
    name: string;
    scope: PermissionScope
}

interface BulkRolePermissionRequest {
    role_uuid: string;
    permission_uuids: Array<string>
}

interface Role {
    id?: number;
    uuid: string;
    client_id: string;
    shop_id?: string | null;
    name: string;
    display_name: string;
    description?: string | null;
    is_system_role?: boolean;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface Permission {
    id?: number;
    uuid: string;
    name: string;
    display_name: string;
    description?: string | null;
    category: string;
    scope?: PermissionScope;
    is_system_permission?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

interface RolePermission {
    id?: number;
    role_uuid: string;
    permission_uuid: string;
    created_at?: Date;
}

interface CreateRoleRequest {
    client_id: string;
    shop_id?: string | null;
    name: string;
    display_name: string;
    description?: string | null;
    is_active?: boolean;
}

interface UpdateRoleRequest extends Partial<CreateRoleRequest> {
    uuid: string;
}

interface CreateRolePermissionRequest {
    role_uuid: string;
    permission_uuid: string;
}

interface CreatePermissionRequest {
    name: string;
    display_name: string;
    description?: string | null;
    category: string;
    scope: PermissionScope;
}

interface UpdatePermissionRequest extends Partial<CreatePermissionRequest> {
    uuid: string;
}

interface BulkRolePermissionRequest {
    role_uuid: string;
    permission_uuids: Array<string>;
}

// Additional utility types
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

interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    page: number;
    limit: number;
}

interface RoleTabProps {
    roles: Role[];
    onCreateRole: () => void;
    onEditRole: (role: Role) => void;
    onDeleteRole: (uuid: string) => void;
    onAssignPermissions: (role: Role) => void;
}

interface PermissionTabProps {
    permissions: Permission[];
    onCreatePermission: () => void;
    onEditPermission: (permission: Permission) => void;
    onDeletePermission: (uuid: string) => void;
}

interface AssignmentTabProps {
    roles: Role[];
    permissions: Permission[];
    onBulkAssign: (roleUuid: string, permissionUuids: string[]) => void;
}

interface RoleModalProps {
    role: Role | null;
    onSave: (data: CreateRoleRequest | UpdateRoleRequest) => void;
    onClose: () => void;
}

interface PermissionModalProps {
    permission: Permission | null;
    categories: string[];
    scopes: PermissionScope[];
    onSave: (data: CreatePermissionRequest | UpdatePermissionRequest) => void;
    onClose: () => void;
}

interface AssignPermissionsModalProps {
    role: Role;
    permissions: Permission[];
    currentPermissions: Permission[];
    onAssign: (permissionUuids: string[]) => void;
    onClose: () => void;
}

interface SearchFilterProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    showCategoryFilter?: boolean;
    showScopeFilter?: boolean;
    selectedCategory?: string;
    selectedScope?: string;
    categories?: string[];
    scopes?: PermissionScope[];
    onCategoryChange?: (category: string) => void;
    onScopeChange?: (scope: string) => void;
}

interface ErrorAlertProps {
    error: string | null;
    onClose: () => void;
}

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}