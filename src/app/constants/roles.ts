/**
 * System Role Constants
 * Defines all available roles in the system and their categorizations for dashboard rendering
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

export enum DashboardCategory {
    ADMIN = 'admin',           // Full system overview
    MANAGER = 'manager',       // Branch/location operations
    SPECIALIST = 'specialist', // Role-specific views (inventory, accounting)
    CASHIER = 'cashier',       // Sales and transactions
    READONLY = 'readonly',     // View-only access
}

export const ROLE_DASHBOARD_MAP: Record<string, DashboardCategory> = {
    [ROLE_IDS.SUPER_ADMIN]: DashboardCategory.ADMIN,
    [ROLE_IDS.TENANT_OWNER]: DashboardCategory.ADMIN,
    [ROLE_IDS.ADMIN]: DashboardCategory.ADMIN,
    [ROLE_IDS.BRANCH_MANAGER]: DashboardCategory.MANAGER,
    [ROLE_IDS.MANAGER]: DashboardCategory.MANAGER,
    [ROLE_IDS.SHIFT_SUPERVISOR]: DashboardCategory.MANAGER,
    [ROLE_IDS.INVENTORY_MANAGER]: DashboardCategory.SPECIALIST,
    [ROLE_IDS.ACCOUNTANT]: DashboardCategory.SPECIALIST,
    [ROLE_IDS.SENIOR_CASHIER]: DashboardCategory.CASHIER,
    [ROLE_IDS.CASHIER]: DashboardCategory.CASHIER,
    [ROLE_IDS.STOCK_CLERK]: DashboardCategory.CASHIER,
    [ROLE_IDS.VIEWER]: DashboardCategory.READONLY,
    [ROLE_IDS.AUDITOR]: DashboardCategory.READONLY,
};

export const ROLE_NAME_DASHBOARD_MAP: Record<string, DashboardCategory> = {
    [ROLE_NAMES.SUPER_ADMIN]: DashboardCategory.ADMIN,
    [ROLE_NAMES.TENANT_OWNER]: DashboardCategory.ADMIN,
    [ROLE_NAMES.ADMIN]: DashboardCategory.ADMIN,
    [ROLE_NAMES.BRANCH_MANAGER]: DashboardCategory.MANAGER,
    [ROLE_NAMES.MANAGER]: DashboardCategory.MANAGER,
    [ROLE_NAMES.SHIFT_SUPERVISOR]: DashboardCategory.MANAGER,
    [ROLE_NAMES.INVENTORY_MANAGER]: DashboardCategory.SPECIALIST,
    [ROLE_NAMES.ACCOUNTANT]: DashboardCategory.SPECIALIST,
    [ROLE_NAMES.SENIOR_CASHIER]: DashboardCategory.CASHIER,
    [ROLE_NAMES.CASHIER]: DashboardCategory.CASHIER,
    [ROLE_NAMES.STOCK_CLERK]: DashboardCategory.CASHIER,
    [ROLE_NAMES.VIEWER]: DashboardCategory.READONLY,
    [ROLE_NAMES.AUDITOR]: DashboardCategory.READONLY,
};

/**
 * Get the dashboard category for a user based on their role
 */
export const getDashboardCategory = (roleId?: string, roleName?: string): DashboardCategory => {
    if (roleId && ROLE_DASHBOARD_MAP[roleId]) {
        return ROLE_DASHBOARD_MAP[roleId];
    }
    if (roleName && ROLE_NAME_DASHBOARD_MAP[roleName]) {
        return ROLE_NAME_DASHBOARD_MAP[roleName];
    }

    return DashboardCategory.CASHIER;
};

/**
 * Check if a role has admin-level access
 */
export const isAdminRole = (roleId?: string, roleName?: string): boolean => {
    const category = getDashboardCategory(roleId, roleName);
    return category === DashboardCategory.ADMIN;
};

/**
 * Check if a role has management-level access
 */
export const isManagerRole = (roleId?: string, roleName?: string): boolean => {
    const category = getDashboardCategory(roleId, roleName);
    return category === DashboardCategory.ADMIN || category === DashboardCategory.MANAGER;
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
    const category = getDashboardCategory(roleId, roleName);
    return category === DashboardCategory.READONLY;
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
