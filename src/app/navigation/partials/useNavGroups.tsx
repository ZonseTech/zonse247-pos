import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    HiOutlineShoppingCart,
    HiOutlineUsers,
    HiOutlineUserCircle,
    HiOutlineLogout,
    HiOutlinePresentationChartBar,
    HiOutlinePrinter,
    HiOutlineUserGroup,
} from 'react-icons/hi';
import {
    HiOutlineBuildingOffice2,
    HiOutlineBuildingStorefront,
    HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import {
    Package,
    ShoppingCart as POIcon,
} from 'lucide-react';
import { LucideSubscript } from 'lucide-react';
import { RiGroup3Line } from 'react-icons/ri';

import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { hasAnyPermission, hasPermission, hasRole, isElectron } from '../../utils';
import type { NavGroup, NavItemBase, UseNavGroupsReturn } from '../../../types/navigation';


const ic = (Icon: any, cls = 'h-5 w-5') => <Icon className={cls} />;

const useNavGroups = (): UseNavGroupsReturn => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();

    const groups = useMemo<NavGroup[]>(() => {
        const result: NavGroup[] = [];

        const opsItems: NavItemBase[] = [];

        if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
            opsItems.push({
                id: 'pos',
                label: 'Point of Sale',
                icon: ic(HiOutlineShoppingCart),
                route: ROUTES.POS,
                onClick: () => navigate(ROUTES.POS),
                shortcut: 'Ctrl+P',
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
            opsItems.push({
                id: 'customers',
                label: 'Customers',
                icon: ic(HiOutlineUserGroup),
                route: ROUTES.CUSTOMERS,
                onClick: () => navigate(ROUTES.CUSTOMERS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
            opsItems.push({
                id: 'sales',
                label: 'Sales',
                icon: ic(HiOutlinePresentationChartBar),
                route: ROUTES.SALES_HUB,
                onClick: () => navigate(ROUTES.SALES_HUB_SALES),
                shortcut: 'Ctrl+T',
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (opsItems.length > 0) {
            result.push({
                key: 'operations',
                label: 'Operations',
                items: opsItems,
                order: 1,
            });
        }

        const mgmtItems: NavItemBase[] = [];

        if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
            const isDesktop = isElectron();
            mgmtItems.push({
                id: 'inventory',
                label: 'Inventory',
                icon: ic(Package),
                route: isDesktop ? ROUTES.INVENTORY : ROUTES.INVENTORY_HUB,
                onClick: isDesktop
                    ? () => navigate(ROUTES.INVENTORY)
                    : () => navigate(`${ROUTES.INVENTORY_HUB}/products`),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
            const isDesktop = isElectron();
            mgmtItems.push({
                id: 'procurement',
                label: 'Procurement',
                icon: ic(POIcon),
                route: isDesktop ? ROUTES.SUPPLIERS : ROUTES.PROCUREMENT,
                onClick: isDesktop
                    ? () => navigate(ROUTES.SUPPLIERS)
                    : () => navigate(ROUTES.PROCUREMENT_SUPPLIERS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
            mgmtItems.push({
                id: 'staff-management',
                label: 'Staff Management',
                icon: ic(HiOutlineUsers),
                route: ROUTES.USERS,
                onClick: () => navigate(ROUTES.USERS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (mgmtItems.length > 0) {
            result.push({
                key: 'management',
                label: 'Management',
                items: mgmtItems,
                order: 2,
            });
        }

        if (hasAnyPermission(user, ['settings.branch.manage'])) {
            result.push({
                key: 'settings',
                label: 'Settings',
                icon: ic(HiOutlineWrenchScrewdriver),
                items: [
                    {
                        id: 'printers',
                        label: 'Printers',
                        icon: ic(HiOutlinePrinter),
                        route: ROUTES.PRINTERS,
                        onClick: () => navigate(ROUTES.PRINTERS),
                        showOnDesktop: true,
                        showOnMobile: true,
                    },
                    {
                        id: 'settings-general',
                        label: 'Settings',
                        icon: ic(HiOutlineWrenchScrewdriver),
                        route: ROUTES.SETTINGS_GENERAL,
                        onClick: () => navigate(ROUTES.SETTINGS_GENERAL),
                        shortcut: 'Ctrl+,',
                        showOnDesktop: true,
                        showOnMobile: true,
                    },
                ],
                defaultCollapsed: false,
                order: 3,
            });
        }

        if (hasRole(user, 'admin') || hasPermission(user, 'system.admin')) {
            result.push({
                key: 'admin',
                label: 'Administration',
                items: [
                    {
                        id: 'subscriptions',
                        label: 'Subscriptions',
                        icon: ic(LucideSubscript),
                        route: ROUTES.SUBSCRIPTIONS,
                        onClick: () => navigate(ROUTES.SUBSCRIPTIONS),
                        showOnDesktop: true,
                        showOnMobile: true,
                    },
                    {
                        id: 'tenants',
                        label: 'Tenants',
                        icon: ic(RiGroup3Line),
                        route: ROUTES.TENANTS,
                        onClick: () => navigate(ROUTES.TENANTS),
                        showOnDesktop: true,
                        showOnMobile: true,
                    },
                ],
                order: 4,
            });
        }

        const systemItems: NavItemBase[] = [
            {
                id: 'account-info',
                label: 'Account Info',
                icon: ic(HiOutlineBuildingStorefront),
                route: ROUTES.ACCOUNT_INFO,
                onClick: () => navigate(ROUTES.ACCOUNT_INFO_TENANT),
                showOnDesktop: true,
                showOnMobile: true,
            },
            {
                id: 'my-profile',
                label: 'My Profile',
                icon: ic(HiOutlineUserCircle),
                route: ROUTES.MY_PROFILE,
                onClick: () => navigate(ROUTES.MY_PROFILE),
                shortcut: 'Ctrl+Shift+P',
                showOnDesktop: true,
                showOnMobile: true,
            },
        ];

        if (isElectron()) {
            systemItems.push({
                id: 'logout',
                label: 'Logout',
                icon: ic(HiOutlineLogout),
                onClick: async () => {
                    signout(() => navigate(ROUTES.LOGIN));
                },
                shortcut: 'Ctrl+Shift+L',
                showOnDesktop: true,
                showOnMobile: false,
            });
        }

        result.push({
            key: 'system',
            label: 'System',
            items: systemItems,
            order: 5,
        });

        return result.sort((a, b) => a.order - b.order);
    }, [user, navigate, signout]);

    const flatItems = useMemo<NavItemBase[]>(() => {
        const items: NavItemBase[] = [];
        for (const group of groups) {
            items.push(...group.items);
            if (group.subGroups) {
                for (const sub of group.subGroups) {
                    items.push(...sub.items);
                }
            }
        }
        return items;
    }, [groups]);

    return { groups, flatItems };
};

export default useNavGroups;
