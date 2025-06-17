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