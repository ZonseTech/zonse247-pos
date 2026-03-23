/**
 * System Role Constants
 * Defines all available roles in the system and their categorizations
 */
export const ROLE_IDS = {
    SUPER_ADMIN: 'super-admin',
    TENANT_OWNER: 'tenant-owner',
    ADMIN: 'admin',
    SUPPORT_ADMIN: 'support-admin',
    BRANCH_MANAGER: 'branch-manager',
    MANAGER: 'manager',
    SHIFT_SUPERVISOR: 'shift-supervisor',
    INVENTORY_MANAGER: 'inventory-manager',
    ACCOUNTANT: 'accountant',
    SENIOR_CASHIER: 'senior-cashier',
    CASHIER: 'cashier',
    STOCK_CLERK: 'stock-clerk',
    VIEWER: 'viewer',
    AUDITOR: 'auditor',
} as const;

export const ROLE_NAMES = {
    SUPER_ADMIN: 'super_admin',
    TENANT_OWNER: 'tenant_owner',
    ADMIN: 'admin',
    BRANCH_MANAGER: 'branch_manager',
    MANAGER: 'manager',
    SHIFT_SUPERVISOR: 'shift_supervisor',
    INVENTORY_MANAGER: 'inventory_manager',
    ACCOUNTANT: 'accountant',
    SENIOR_CASHIER: 'senior_cashier',
    CASHIER: 'cashier',
    STOCK_CLERK: 'stock_clerk',
    VIEWER: 'viewer',
    AUDITOR: 'auditor',
} as const;

const ADMIN_ROLE_IDS = new Set<string>([
    ROLE_IDS.SUPER_ADMIN,
    ROLE_IDS.TENANT_OWNER,
    ROLE_IDS.ADMIN,
]);

const ADMIN_ROLE_NAMES = new Set<string>([
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.TENANT_OWNER,
    ROLE_NAMES.ADMIN,
]);

const MANAGER_ROLE_IDS = new Set<string>([
    ...ADMIN_ROLE_IDS,
    ROLE_IDS.BRANCH_MANAGER,
    ROLE_IDS.MANAGER,
    ROLE_IDS.SHIFT_SUPERVISOR,
]);

const MANAGER_ROLE_NAMES = new Set<string>([
    ...ADMIN_ROLE_NAMES,
    ROLE_NAMES.BRANCH_MANAGER,
    ROLE_NAMES.MANAGER,
    ROLE_NAMES.SHIFT_SUPERVISOR,
]);

const READONLY_ROLE_IDS = new Set<string>([
    ROLE_IDS.VIEWER,
    ROLE_IDS.AUDITOR,
]);

const READONLY_ROLE_NAMES = new Set<string>([
    ROLE_NAMES.VIEWER,
    ROLE_NAMES.AUDITOR,
]);

/**
 * Check if a role has admin-level access
 */
export const isAdminRole = (roleId?: string, roleName?: string): boolean => {
    return !!(roleId && ADMIN_ROLE_IDS.has(roleId)) || !!(roleName && ADMIN_ROLE_NAMES.has(roleName));
};

/**
 * Check if a role has management-level access
 */
export const isManagerRole = (roleId?: string, roleName?: string): boolean => {
    return !!(roleId && MANAGER_ROLE_IDS.has(roleId)) || !!(roleName && MANAGER_ROLE_NAMES.has(roleName));
};

/**
 * Check if user is an inventory manager
 */
export const isInventoryManager = (roleId?: string, roleName?: string): boolean => {
    return roleId === ROLE_IDS.INVENTORY_MANAGER || roleName === ROLE_NAMES.INVENTORY_MANAGER;
};

/**
 * Check if user is an accountant
 */
export const isAccountant = (roleId?: string, roleName?: string): boolean => {
    return roleId === ROLE_IDS.ACCOUNTANT || roleName === ROLE_NAMES.ACCOUNTANT;
};

/**
 * Check if user has read-only access
 */
export const isReadOnlyRole = (roleId?: string, roleName?: string): boolean => {
    return !!(roleId && READONLY_ROLE_IDS.has(roleId)) || !!(roleName && READONLY_ROLE_NAMES.has(roleName));
};

// Role display information
export const ROLE_DISPLAY_INFO: Record<string, { displayName: string; description: string; level: string }> = {
    [ROLE_IDS.SUPER_ADMIN]: {
        displayName: 'Super Administrator',
        description: 'System super administrator with full access across all tenants and locations',
        level: 'System',
    },
    [ROLE_IDS.TENANT_OWNER]: {
        displayName: 'Tenant Owner',
        description: 'Business owner with full access to all locations within their tenant',
        level: 'Tenant',
    },
    [ROLE_IDS.ADMIN]: {
        displayName: 'Administrator',
        description: 'Tenant administrator with full access across all locations',
        level: 'Tenant',
    },
    [ROLE_IDS.BRANCH_MANAGER]: {
        displayName: 'Branch Manager',
        description: 'Manager with full control over a specific branch/location',
        level: 'Branch',
    },
    [ROLE_IDS.MANAGER]: {
        displayName: 'Manager',
        description: 'Branch manager with operational management access',
        level: 'Branch',
    },
    [ROLE_IDS.SHIFT_SUPERVISOR]: {
        displayName: 'Shift Supervisor',
        description: 'Supervisor with elevated cashier privileges and basic management functions',
        level: 'Branch',
    },
    [ROLE_IDS.INVENTORY_MANAGER]: {
        displayName: 'Inventory Manager',
        description: 'Specialized role for inventory and stock management across locations',
        level: 'Specialist',
    },
    [ROLE_IDS.ACCOUNTANT]: {
        displayName: 'Accountant',
        description: 'Financial reporting and payment management access',
        level: 'Specialist',
    },
    [ROLE_IDS.SENIOR_CASHIER]: {
        displayName: 'Senior Cashier',
        description: 'Experienced cashier with additional permissions like refunds',
        level: 'Operational',
    },
    [ROLE_IDS.CASHIER]: {
        displayName: 'Cashier',
        description: 'Basic cashier role for sales operations',
        level: 'Operational',
    },
    [ROLE_IDS.STOCK_CLERK]: {
        displayName: 'Stock Clerk',
        description: 'Handles receiving and basic inventory tasks',
        level: 'Operational',
    },
    [ROLE_IDS.VIEWER]: {
        displayName: 'Viewer',
        description: 'Read-only access to view sales, products, and reports',
        level: 'Read-Only',
    },
    [ROLE_IDS.AUDITOR]: {
        displayName: 'Auditor',
        description: 'Read-only access with full visibility for audit purposes',
        level: 'Read-Only',
    },
};
