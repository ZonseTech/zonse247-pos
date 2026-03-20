/**
 * Shared navigation config consumed by the Electron MenuBuilder.
 *
 * This module is deliberately hook‑free so it can run in the main process.
 * It mirrors the group/permission structure of `useNavGroups` to eliminate
 * the duplication that previously existed between navItems.tsx and menu.ts.
 */
import { ROUTES } from '../../utils/constants';
import { hasAnyPermission, hasPermission, hasRole } from '../../utils';
import type { MenuItemConstructorOptions } from 'electron';

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

/**
 * Builds a serialisable array of menu groups from the same permission logic
 * that `useNavGroups` uses on the renderer side.
 */
export function buildNavMenuGroups(user: User | null): NavMenuGroup[] {
    const groups: NavMenuGroup[] = [];

    // ── Operations ─────────────────────────────────────────────────────
    const opsItems: NavMenuGroup['items'] = [];

    if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
        opsItems.push({ label: 'Point of Sale', route: ROUTES.POS, accelerator: 'CommandOrControl+P' });
    }

    if (user) {
        opsItems.push({ label: 'Reports', route: ROUTES.REPORTS, accelerator: 'CommandOrControl+D' });
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        opsItems.push({ label: 'Sales', route: ROUTES.SALES, accelerator: 'CommandOrControl+T' });
    }

    if (hasAnyPermission(user, ['refunds.process', 'refunds.view', 'returns.manage'])) {
        opsItems.push({ label: 'Returns', route: ROUTES.RETURNS });
    }

    if (opsItems.length > 0) {
        groups.push({ label: 'Operations', items: opsItems });
    }

    // ── Management ─────────────────────────────────────────────────────
    const mgmtItems: NavMenuGroup['items'] = [];

    if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
        mgmtItems.push({ label: 'Inventory', route: ROUTES.INVENTORY });
        mgmtItems.push({ label: 'Procurement', route: ROUTES.PROCUREMENT });
    }

    if (user) {
        mgmtItems.push({ label: 'My Profile', route: ROUTES.MY_PROFILE, accelerator: 'CommandOrControl+Shift+P' });
    }

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        mgmtItems.push({ label: 'Staff Management', route: ROUTES.USERS });
    }

    if (mgmtItems.length > 0) {
        groups.push({ label: 'Management', items: mgmtItems });
    }

    // ── Settings ───────────────────────────────────────────────────────
    if (hasPermission(user, 'settings.branch.manage')) {
        groups.push({
            label: 'Settings',
            items: [
                { label: 'General Settings', route: ROUTES.SETTINGS_GENERAL, accelerator: 'CommandOrControl+,' },
                { label: 'Printers', route: ROUTES.PRINTERS },
                { label: 'Branch Settings', route: ROUTES.BRANCHES },
                { label: 'Terminals', route: ROUTES.TERMINALS },
            ],
        });
    }

    // ── Admin ──────────────────────────────────────────────────────────
    if (hasRole(user, 'admin') || hasPermission(user, 'system.admin')) {
        groups.push({
            label: 'Admin',
            items: [
                { label: 'Subscriptions', route: ROUTES.SUBSCRIPTIONS },
                { label: 'Tenants', route: ROUTES.TENANTS },
            ],
        });
    }

    return groups;
}

/**
 * Converts `NavMenuGroup[]` into Electron `MenuItemConstructorOptions[]`.
 *
 * Used by `MenuBuilder.buildDefaultTemplate()` to eliminate hand‑written
 * menu duplication.
 */
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
            if (item.action) opts.click = () => { }; // action items handled separately
            return opts;
        }),
    }));
}
