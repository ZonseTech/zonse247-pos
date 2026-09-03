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
    HiOutlineViewGrid,
} from 'react-icons/hi';
import {
    HiOutlineBuildingStorefront,
    HiOutlineWrenchScrewdriver,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';
import {
    Package,
    ShoppingCart as POIcon,
    FileBarChart2,
    Wrench,
    Receipt,
    RotateCcw,
} from 'lucide-react';
import { RiGroup3Line } from 'react-icons/ri';

import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { hasAnyPermission, hasPermission, isElectron } from '../../utils';
import { useIsNativeMobile } from '../../hooks/useMediaQuery';
import useBusinessFeatures from '../../hooks/useBusinessFeatures';
import type { NavGroup, NavItemBase, UseNavGroupsReturn } from '../../../types/navigation';


const ic = (Icon: any, cls = 'h-5 w-5') => <Icon className={cls} />;

const useNavGroups = (): UseNavGroupsReturn => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();
    const { currentBranch } = useBranch();
    const isNativeMobile = useIsNativeMobile();
    const { showRetail, showServices } = useBusinessFeatures();

    const hiddenNavItemIds = useMemo(
        () => new Set(currentBranch?.branchPreferences?.navigation?.hiddenNavItemIds ?? []),
        [currentBranch]
    );

    const groups = useMemo<NavGroup[]>(() => {
        const result: NavGroup[] = [];

        const opsItems: NavItemBase[] = [];

        opsItems.push({
            id: 'dashboard',
            label: 'Dashboard',
            icon: ic(HiOutlineViewGrid),
            route: ROUTES.DASHBOARD,
            onClick: () => navigate(ROUTES.DASHBOARD),
            showOnDesktop: true,
            showOnMobile: true,
        });

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

        if (hasAnyPermission(user, ['customers.view', 'customers.create', 'customers.edit'])) {
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
                route: ROUTES.SALES,
                onClick: () => navigate(ROUTES.SALES),
                shortcut: 'Ctrl+T',
                showOnDesktop: true,
                showOnMobile: true,
            });

            opsItems.push({
                id: 'reports',
                label: 'Reports',
                icon: ic(FileBarChart2),
                route: ROUTES.REPORTS,
                onClick: () => navigate(ROUTES.REPORTS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['refunds.view', 'refunds.process', 'refunds.approve'])) {
            opsItems.push({
                id: 'returns',
                label: 'Returns',
                icon: ic(RotateCcw),
                route: ROUTES.RETURNS,
                onClick: () => navigate(ROUTES.RETURNS),
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

        if (hasAnyPermission(user, ['products.view', 'inventory.view'])) {
            mgmtItems.push({
                id: 'inventory',
                label: 'Inventory',
                icon: ic(Package),
                route: isNativeMobile ? ROUTES.INVENTORY : ROUTES.INVENTORY_HUB,
                onClick: isNativeMobile
                    ? () => navigate(ROUTES.INVENTORY)
                    : () => navigate(`${ROUTES.INVENTORY_HUB}/products`),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['suppliers.view', 'suppliers.create', 'suppliers.edit', 'inventory.receive'])) {
            mgmtItems.push({
                id: 'procurement',
                label: 'Procurement',
                icon: ic(POIcon),
                route: isNativeMobile ? ROUTES.SUPPLIERS : ROUTES.PROCUREMENT_SUPPLIERS,
                onClick: isNativeMobile
                    ? () => navigate(ROUTES.SUPPLIERS)
                    : () => navigate(ROUTES.PROCUREMENT_SUPPLIERS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (showServices) {
            mgmtItems.push({
                id: 'services',
                label: 'Services',
                icon: ic(Wrench),
                route: ROUTES.SERVICES,
                onClick: () => navigate(ROUTES.SERVICES),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasAnyPermission(user, ['expenses.view', 'expenses.create'])) {
            mgmtItems.push({
                id: 'expenses',
                label: 'Expenses',
                icon: ic(Receipt),
                route: ROUTES.EXPENSES,
                onClick: () => navigate(ROUTES.EXPENSES),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        // if (hasAnyPermission(user, ['settings.loyalty.manage', 'customers.loyalty'])) {
        //     mgmtItems.push({
        //         id: 'loyalty-program',
        //         label: 'Loyalty Program',
        //         icon: ic(HeartHandshake),
        //         route: ROUTES.LOYALTY_PROGRAM,
        //         onClick: () => navigate(ROUTES.LOYALTY_PROGRAM),
        //         showOnDesktop: true,
        //         showOnMobile: true,
        //     });
        // }

        if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
            mgmtItems.push({
                id: 'staff-management',
                label: 'Users',
                icon: ic(HiOutlineUsers),
                route: ROUTES.USERS,
                onClick: () => navigate(ROUTES.USERS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        if (hasPermission(user, 'roles.view')) {
            mgmtItems.push({
                id: 'roles-permissions',
                label: 'Roles & Permissions',
                icon: ic(HiOutlineShieldCheck),
                route: ROUTES.ROLES_PERMISSIONS,
                onClick: () => navigate(ROUTES.ROLES_PERMISSIONS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        mgmtItems.push({
            id: 'account-info',
            label: 'Account Info',
            icon: ic(HiOutlineBuildingStorefront),
            route: ROUTES.ACCOUNT_INFO,
            onClick: () => navigate(ROUTES.ACCOUNT_INFO_TENANT),
            showOnDesktop: true,
            showOnMobile: true,
        });

        if (mgmtItems.length > 0) {
            result.push({
                key: 'management',
                label: 'Management',
                items: mgmtItems,
                order: 2,
            });
        }

        const systemItems: NavItemBase[] = [];

        if (hasAnyPermission(user, ['settings.branch.manage', 'settings.tax.manage', 'settings.payment.manage', 'settings.receipt.manage', 'settings.loyalty.manage'])) {
            systemItems.push(
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
                    route: ROUTES.SETTINGS,
                    onClick: () => navigate(ROUTES.SETTINGS_GENERAL),
                    shortcut: 'Ctrl+,',
                    showOnDesktop: true,
                    showOnMobile: true,
                },
            );
        }

        if (hasPermission(user, 'tenants.view')) {
            systemItems.push({
                id: 'tenants',
                label: 'Tenants',
                icon: ic(RiGroup3Line),
                route: ROUTES.TENANTS,
                onClick: () => navigate(ROUTES.TENANTS),
                showOnDesktop: true,
                showOnMobile: true,
            });
        }

        systemItems.push({
            id: 'my-profile',
            label: 'My Profile',
            icon: ic(HiOutlineUserCircle),
            route: ROUTES.MY_PROFILE,
            onClick: () => navigate(ROUTES.MY_PROFILE),
            shortcut: 'Ctrl+Shift+P',
            showOnDesktop: true,
            showOnMobile: true,
        });

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
            label: 'Administration',
            items: systemItems,
            order: 5,
        });

        return result
            .map((group) => ({
                ...group,
                items: group.items.filter((item) => !hiddenNavItemIds.has(item.id)),
                subGroups: group.subGroups
                    ?.map((sub) => ({
                        ...sub,
                        items: sub.items.filter((item) => !hiddenNavItemIds.has(item.id)),
                    }))
                    .filter((sub) => sub.items.length > 0),
            }))
            .filter((group) => group.items.length > 0 || (group.subGroups?.length ?? 0) > 0)
            .sort((a, b) => a.order - b.order);
    }, [user, navigate, signout, isNativeMobile, showRetail, showServices, hiddenNavItemIds]);

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
