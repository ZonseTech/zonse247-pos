export interface HideableNavItem {
    id: string;
    label: string;
}

export const HIDEABLE_NAV_ITEMS: HideableNavItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pos', label: 'Point of Sale' },
    { id: 'customers', label: 'Customers' },
    { id: 'sales', label: 'Sales' },
    { id: 'reports', label: 'Reports' },
    { id: 'returns', label: 'Returns' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'procurement', label: 'Procurement' },
    { id: 'services', label: 'Services' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'staff-management', label: 'Users' },
    { id: 'roles-permissions', label: 'Roles & Permissions' },
    { id: 'branches', label: 'Branches' },
    { id: 'terminals', label: 'Terminals' },
    { id: 'printers', label: 'Printers' },
    { id: 'tenants', label: 'Tenants' },
];
