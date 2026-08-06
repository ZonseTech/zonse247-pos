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
        label: string;
        route?: string;
        action?: string;
        accelerator?: string;
        role?: string;
    }>;
}

export function buildNavMenuGroups(user: User | null, businessType?: BusinessType | null): NavMenuGroup[] {
    const groups: NavMenuGroup[] = [];
    const bt = businessType ?? 'PRODUCT_BASED';
    const { showRetail, showServices } = FEATURE_MAP[bt] ?? FEATURE_MAP.PRODUCT_BASED;

    const opsItems: NavMenuGroup['items'] = [];

    opsItems.push({ label: 'Dashboard', route: ROUTES.DASHBOARD });

    if (showRetail && hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
        opsItems.push({ label: 'Point of Sale', route: ROUTES.POS, accelerator: 'CommandOrControl+P' });
    }

    if (hasAnyPermission(user, ['customers.view', 'customers.create', 'customers.edit'])) {
        opsItems.push({ label: 'Customers', route: ROUTES.CUSTOMERS });
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        opsItems.push({ label: 'Sales', route: ROUTES.SALES, accelerator: 'CommandOrControl+T' });
        opsItems.push({ label: 'Reports', route: ROUTES.REPORTS });
    }

    if (hasAnyPermission(user, ['refunds.view', 'refunds.process', 'refunds.approve'])) {
        opsItems.push({ label: 'Returns', route: ROUTES.RETURNS });
    }

    if (opsItems.length > 0) {
        groups.push({ label: 'Operations', items: opsItems });
    }

    const mgmtItems: NavMenuGroup['items'] = [];

    if (showRetail && hasAnyPermission(user, ['products.view', 'inventory.view'])) {
        mgmtItems.push({ label: 'Inventory', route: ROUTES.INVENTORY_HUB });
    }

    if (hasAnyPermission(user, ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'inventory.receive'])) {
        mgmtItems.push({ label: 'Procurement', route: ROUTES.PROCUREMENT_SUPPLIERS });
    }

    if (showServices) {
        mgmtItems.push({ label: 'Services', route: ROUTES.SERVICES });
    }

    if (hasAnyPermission(user, ['expenses.view', 'expenses.create'])) {
        mgmtItems.push({ label: 'Expense Tracking', route: ROUTES.EXPENSES });
    }

    // if (hasAnyPermission(user, ['settings.loyalty.manage', 'customers.loyalty'])) {
    //     mgmtItems.push({ label: 'Loyalty Program', route: ROUTES.LOYALTY_PROGRAM });
    // }

    if (user) {
        mgmtItems.push({ label: 'My Profile', route: ROUTES.MY_PROFILE, accelerator: 'CommandOrControl+Shift+P' });
    }

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        mgmtItems.push({ label: 'User Management', route: ROUTES.USERS });
    }

    if (hasPermission(user, 'branches.view')) {
        mgmtItems.push({ label: 'Branches', route: ROUTES.BRANCHES });
    }

    if (hasPermission(user, 'terminals.view')) {
        mgmtItems.push({ label: 'Terminals', route: ROUTES.TERMINALS });
    }

    if (hasPermission(user, 'roles.view')) {
        mgmtItems.push({ label: 'Roles & Permissions', route: ROUTES.ROLES_PERMISSIONS });
    }

    if (mgmtItems.length > 0) {
        groups.push({ label: 'Management', items: mgmtItems });
    }

    if (hasAnyPermission(user, ['settings.branch.manage', 'settings.tax.manage', 'settings.payment.manage', 'settings.receipt.manage', 'settings.loyalty.manage'])) {
        groups.push({
            label: 'Settings',
            items: [
                { label: 'General Settings', route: ROUTES.SETTINGS_GENERAL, accelerator: 'CommandOrControl+,' },
                { label: 'Printers', route: ROUTES.PRINTERS },
                { label: 'Account Info', route: ROUTES.ACCOUNT_INFO_TENANT },
            ],
        });
    }

    if (hasPermission(user, 'system.admin')) {
        groups.push({
            label: 'Admin',
            items: [
                { label: 'Tenants', route: ROUTES.TENANTS },
            ],
        });
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
