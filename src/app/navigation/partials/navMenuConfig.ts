import { ROUTES } from '../../utils/constants';
import { hasAnyPermission, hasPermission } from '../../utils';
import type { MenuItemConstructorOptions } from 'electron';

const FEATURE_MAP: Record<string, { showRetail: boolean; showServices: boolean }> = {
    PRODUCT_BASED: { showRetail: true, showServices: false },
    SERVICE_BASED: { showRetail: false, showServices: true },
    HYBRID: { showRetail: true, showServices: true },
    SALON: { showRetail: true, showServices: true },
    REPAIR: { showRetail: true, showServices: true },
    TATTOO: { showRetail: true, showServices: true },
    MED_SPA: { showRetail: true, showServices: true },
    FITNESS: { showRetail: false, showServices: true },
};

export interface NavMenuGroup {
    label: string;
    items: Array<{
        id?: string;
        label: string;
        route?: string;
        action?: string;
        accelerator?: string;
        role?: string;
    }>;
}

export function buildNavMenuGroups(
    user: User | null,
    businessType?: BusinessType | null,
    hiddenNavItemIds: string[] = [],
): NavMenuGroup[] {
    const groups: NavMenuGroup[] = [];
    const bt = businessType ?? 'PRODUCT_BASED';
    const { showRetail, showServices } = FEATURE_MAP[bt] ?? FEATURE_MAP.PRODUCT_BASED;
    const hiddenIds = new Set(hiddenNavItemIds);

    const opsItems: NavMenuGroup['items'] = [];

    if (user) {
        opsItems.push({ id: 'dashboard', label: 'Dashboard', route: ROUTES.DASHBOARD });
    }

    if (showRetail && hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
        opsItems.push({ id: 'pos', label: 'Point of Sale', route: ROUTES.POS, accelerator: 'CommandOrControl+P' });
    }

    if (hasAnyPermission(user, ['customers.view', 'customers.create', 'customers.edit'])) {
        opsItems.push({ id: 'customers', label: 'Customers', route: ROUTES.CUSTOMERS });
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        opsItems.push({ id: 'sales', label: 'Sales', route: ROUTES.SALES, accelerator: 'CommandOrControl+T' });
        opsItems.push({ id: 'reports', label: 'Reports', route: ROUTES.REPORTS });
    }

    if (hasAnyPermission(user, ['refunds.view', 'refunds.process', 'refunds.approve'])) {
        opsItems.push({ id: 'returns', label: 'Returns', route: ROUTES.RETURNS });
    }

    const filteredOpsItems = opsItems.filter((item) => !item.id || !hiddenIds.has(item.id));
    if (filteredOpsItems.length > 0) {
        groups.push({ label: 'Operations', items: filteredOpsItems });
    }

    const mgmtItems: NavMenuGroup['items'] = [];

    if (showRetail && hasAnyPermission(user, ['products.view', 'inventory.view'])) {
        mgmtItems.push({ id: 'inventory', label: 'Inventory', route: ROUTES.INVENTORY_HUB });
    }

    if (hasAnyPermission(user, ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'inventory.receive'])) {
        mgmtItems.push({ id: 'procurement', label: 'Procurement', route: ROUTES.PROCUREMENT_SUPPLIERS });
    }

    if (showServices) {
        mgmtItems.push({ id: 'services', label: 'Services', route: ROUTES.SERVICES });
    }

    if (hasAnyPermission(user, ['expenses.view', 'expenses.create'])) {
        mgmtItems.push({ id: 'expenses', label: 'Expense Tracking', route: ROUTES.EXPENSES });
    }

    // if (hasAnyPermission(user, ['settings.loyalty.manage', 'customers.loyalty'])) {
    //     mgmtItems.push({ label: 'Loyalty Program', route: ROUTES.LOYALTY_PROGRAM });
    // }

    if (user) {
        mgmtItems.push({ label: 'My Profile', route: ROUTES.MY_PROFILE, accelerator: 'CommandOrControl+Shift+P' });
    }

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        mgmtItems.push({ id: 'staff-management', label: 'User Management', route: ROUTES.USERS });
    }

    if (user) {
        mgmtItems.push({ label: 'Account Info', route: ROUTES.ACCOUNT_INFO_TENANT });
    }

    if (hasPermission(user, 'roles.view')) {
        mgmtItems.push({ id: 'roles-permissions', label: 'Roles & Permissions', route: ROUTES.ROLES_PERMISSIONS });
    }

    const filteredMgmtItems = mgmtItems.filter((item) => !item.id || !hiddenIds.has(item.id));
    if (filteredMgmtItems.length > 0) {
        groups.push({ label: 'Management', items: filteredMgmtItems });
    }

    const adminItems: NavMenuGroup['items'] = [];

    if (hasAnyPermission(user, ['settings.branch.manage', 'settings.tax.manage', 'settings.payment.manage', 'settings.receipt.manage', 'settings.loyalty.manage'])) {
        adminItems.push(
            { label: 'General Settings', route: ROUTES.SETTINGS_GENERAL, accelerator: 'CommandOrControl+,' },
            ...(hiddenIds.has('printers') ? [] : [{ id: 'printers', label: 'Printers', route: ROUTES.PRINTERS }]),
        );
    }

    if (hasPermission(user, 'tenants.view') && !hiddenIds.has('tenants')) {
        adminItems.push({ id: 'tenants', label: 'Tenants', route: ROUTES.TENANTS });
    }

    if (adminItems.length > 0) {
        groups.push({ label: 'Administration', items: adminItems });
    }

    return groups;
}

export function navGroupsToElectronMenu(
    menuGroups: NavMenuGroup[],
    navigateTo: (route: string) => void,
): MenuItemConstructorOptions[] {
    return menuGroups.map((group) => ({
        label: group.label,
        submenu: group.items.map((item) => {
            const opts: MenuItemConstructorOptions = { label: item.label };
            if (item.accelerator) opts.accelerator = item.accelerator;
            if (item.route) opts.click = () => navigateTo(item.route!);
            if (item.action) opts.click = () => { };
            return opts;
        }),
    }));
}
