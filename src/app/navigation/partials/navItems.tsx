import {
    HiOutlineViewList,
    HiOutlineViewGrid,
    HiOutlineShoppingCart,
    HiOutlineCog,
    HiOutlineUsers,
    HiOutlineUserCircle,
    HiOutlineLogout,
    HiOutlineQrcode,
    HiOutlinePresentationChartBar,
    HiOutlinePrinter,
    HiOutlineFolderDownload,
    HiOutlineUserGroup,
    HiOutlineCreditCard,
    HiOutlineChat,
    HiOutlineDocumentText,
    HiOutlineReceiptRefund,
} from 'react-icons/hi';
import { RotateCcw, Package, Users as SuppliersIcon, ShoppingCart as POIcon, ArrowRightLeft, ClipboardList, Settings, FileText, Store } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import {
    HiOutlineArrowPath,
    HiOutlineBuildingOffice2,
    HiOutlineBuildingStorefront,
    HiOutlineHomeModern,
    HiOutlineKey,
    HiOutlineServerStack,
    HiOutlineWrenchScrewdriver
} from 'react-icons/hi2';
import { hasAnyPermission, hasPermission, hasRole } from '../../utils';
import { LucideSubscript } from 'lucide-react';
import { RiGroup3Line } from 'react-icons/ri';
import { NavItem, NavGroup } from './RenderNavItem';

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
    operations: 'Operations',
    inventory: 'Inventory',
    management: 'Management',
    admin: 'Administration',
    settings: 'Settings',
    system: 'System',
    misc: 'Misc',
};

const useNavItems = (): Array<NavItem> => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();

    const icons = {
        pos: <HiOutlineShoppingCart className="h-5 w-5" />,
        dashboard: <HiOutlineHomeModern className="h-5 w-5" />,
        products: <HiOutlineQrcode className="h-5 w-5" />,
        categories: <HiOutlineViewList className="h-5 w-5" />,
        customers: <HiOutlineUserGroup className="h-5 w-5" />,
        tabs: <HiOutlineViewGrid className="h-5 w-5" />,
        orders: <HiOutlineShoppingCart className="h-5 w-5" />,
        printer: <HiOutlinePrinter className="h-5 w-5" />,
        terminals: <HiOutlineBuildingOffice2 className="h-5 w-5" />,
        subscription: <LucideSubscript className="h-5 w-5" />,
        billing: <HiOutlineCreditCard className="h-5 w-5" />,
        tenants: <RiGroup3Line className="h-5 w-5" />,
        registration_details: <ClipboardList className="h-5 w-5" />,
        branch: <HiOutlineBuildingStorefront className="h-5 w-5" />,
        migrations: <HiOutlineServerStack className="h-5 w-5" />,
        export_db: <HiOutlineFolderDownload className="h-5 w-5" />,
        sales: <HiOutlinePresentationChartBar className="h-5 w-5" />,
        returns: <RotateCcw className="h-5 w-5" />,
        inventory_products: <Package className="h-5 w-5" />,
        suppliers: <SuppliersIcon className="h-5 w-5" />,
        purchase_orders: <POIcon className="h-5 w-5" />,
        stock_movements: <ArrowRightLeft className="h-5 w-5" />,
        users: <HiOutlineUsers className="h-5 w-5" />,
        role_permissions: <HiOutlineKey className="h-5 w-5" />,
        admin: <HiOutlineUserCircle className="h-5 w-5" />,
        logout: <HiOutlineLogout className="h-5 w-5" />,
        syncData: <HiOutlineArrowPath className="h-5 w-5" />,
        settings: <HiOutlineWrenchScrewdriver className="h-5 w-5" />,
        theme: <HiOutlineCog className='h-5 w-5' />
    };

    const items: NavItem[] = [];

    if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
        items.push({
            type: 'button',
            color: 'bg-sky-700 hover:bg-sky-800',
            iconColor: 'bg-sky-800',
            text: 'Point of Sale',
            icon: icons.pos,
            group: 'operations',
            onClick: () => navigate(ROUTES.POS),
        });

        items.push({
            type: 'button',
            color: 'bg-sky-500 hover:bg-sky-700',
            iconColor: 'bg-sky-700',
            text: 'Inventory',
            icon: icons.products,
            group: 'inventory',
            onClick: () => navigate(ROUTES.INVENTORY),
        });

        if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
            items.push({
                type: 'button',
                color: 'bg-indigo-600 hover:bg-indigo-700',
                iconColor: 'bg-indigo-700',
                text: 'Products',
                icon: icons.inventory_products,
                group: 'inventory',
                onClick: () => navigate(ROUTES.PRODUCTS),
            });

            items.push({
                type: 'button',
                color: 'bg-purple-600 hover:bg-purple-700',
                iconColor: 'bg-purple-700',
                text: 'Suppliers',
                icon: icons.suppliers,
                group: 'inventory',
                onClick: () => navigate(ROUTES.SUPPLIERS),
            });

            items.push({
                type: 'button',
                color: 'bg-violet-600 hover:bg-violet-700',
                iconColor: 'bg-violet-700',
                text: 'Purchase Orders',
                icon: icons.purchase_orders,
                group: 'inventory',
                onClick: () => navigate(ROUTES.PURCHASE_ORDERS),
            });

            items.push({
                type: 'button',
                color: 'bg-fuchsia-600 hover:bg-fuchsia-700',
                iconColor: 'bg-fuchsia-700',
                text: 'Stock Movements',
                icon: icons.stock_movements,
                group: 'inventory',
                onClick: () => navigate(ROUTES.STOCK_MOVEMENTS),
            });

            items.push({
                type: 'button',
                color: 'bg-sky-500 hover:bg-sky-500',
                iconColor: 'bg-sky-500',
                text: 'Categories',
                icon: icons.categories,
                group: 'inventory',
                onClick: () => navigate(ROUTES.CATEGORIES),
            });
        }

        items.push({
            type: 'button',
            color: 'bg-teal-500 hover:bg-teal-600',
            iconColor: 'bg-teal-600',
            text: 'Customers',
            icon: icons.customers,
            group: 'operations',
            onClick: () => navigate(ROUTES.CUSTOMERS),
        });
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        items.push({
            type: 'button',
            color: 'bg-emerald-500 hover:bg-emerald-700',
            iconColor: 'bg-emerald-700',
            text: 'Sales',
            icon: icons.sales,
            group: 'operations',
            onClick: () => navigate(ROUTES.SALES),
        });
    }

    if (hasAnyPermission(user, ['refunds.process', 'refunds.view', 'returns.manage'])) {
        items.push({
            type: 'button',
            color: 'bg-sky-500 hover:bg-sky-700',
            iconColor: 'bg-sky-700',
            text: 'Returns',
            icon: icons.returns,
            group: 'operations',
            onClick: () => navigate(ROUTES.RETURNS),
        });
    }

    // items.push({
    //     type: 'button',
    //     color: 'bg-emerald-500 hover:bg-emerald-500',
    //     iconColor: 'bg-emerald-500',
    //     text: 'Dashboard',
    //     icon: icons.dashboard,
    //     group: 'operations',
    //     onClick: () => navigate(ROUTES.DASHBOARD),
    // });

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        items.push({
            type: 'button',
            color: 'bg-orange-700 hover:bg-orange-800',
            iconColor: 'bg-orange-800',
            text: 'Billing',
            icon: icons.billing,
            group: 'management',
            onClick: () => navigate(ROUTES.SUBSCRIPTION_BILLING),
        });

        items.push({
            type: 'button',
            color: 'bg-orange-600 hover:bg-orange-700',
            iconColor: 'bg-orange-700',
            text: 'Users',
            icon: icons.users,
            group: 'management',
            onClick: () => navigate(ROUTES.USERS),
        });
    }

    if (hasRole(user, 'admin') || hasRole(user, 'super-admin')) {
        items.push({
            type: 'button',
            color: 'bg-orange-500 hover:bg-orange-600',
            iconColor: 'bg-orange-600',
            text: 'Security',
            icon: icons.role_permissions,
            group: 'management',
            onClick: () => navigate(ROUTES.ROLES_PERMISSIONS),
        });
    }

    if (hasAnyPermission(user, ['settings.branch.manage'])) {
        items.push({
            type: 'button',
            color: 'bg-cyan-500 hover:bg-cyan-600',
            iconColor: 'bg-cyan-600',
            text: "Branches",
            icon: icons.branch,
            group: 'settings',
            onClick: () => navigate(ROUTES.BRANCHES),
        });

        items.push({
            type: 'button',
            color: 'bg-cyan-600 hover:bg-cyan-700',
            iconColor: 'bg-cyan-700',
            text: "Terminals",
            icon: icons.terminals,
            group: 'settings',
            onClick: () => navigate(ROUTES.TERMINALS),
        });

        items.push({
            type: 'button',
            color: 'bg-emerald-500 hover:bg-emerald-500',
            iconColor: 'bg-emerald-500',
            text: "Printers",
            icon: icons.printer,
            group: 'settings',
            onClick: () => navigate(ROUTES.PRINTERS),
        });

        items.push({
            type: 'button',
            color: 'bg-green-500 hover:bg-green-500',
            iconColor: 'bg-green-500',
            text: "Settings",
            icon: icons.settings,
            group: 'settings',
            onClick: () => navigate(ROUTES.SETTINGS)
        });
    }

    if (hasRole(user, 'admin') || hasPermission(user, 'system.admin')) {
        items.push({
            type: 'button',
            color: 'bg-purple-600 hover:bg-purple-700',
            iconColor: 'bg-purple-700',
            text: "Subscriptions",
            icon: icons.subscription,
            group: 'admin',
            onClick: () => navigate(ROUTES.SUBSCRIPTIONS),
        });

        items.push({
            type: 'button',
            color: 'bg-cyan-400 hover:bg-cyan-500',
            iconColor: 'bg-cyan-500',
            text: "Tenants",
            icon: icons.tenants,
            group: 'admin',
            onClick: () => navigate(ROUTES.TENANTS),
        });

        items.push({
            type: 'button',
            color: 'bg-teal-500 hover:bg-teal-600',
            iconColor: 'bg-teal-600',
            text: "Registrations",
            icon: icons.registration_details,
            group: 'admin',
            onClick: () => navigate(ROUTES.TENANT_REGISTRATION_DETAILS),
        });

        items.push({
            type: 'button',
            color: 'bg-red-500 hover:bg-red-700',
            iconColor: 'bg-red-700',
            text: 'Migrations',
            icon: icons.migrations,
            group: 'system',
            onClick: () => navigate(ROUTES.MIGRATIONS),
        });

        if (hasPermission(user, 'system.backup')) {
            items.push({
                type: 'button',
                color: 'bg-red-500 hover:bg-red-500',
                iconColor: 'bg-red-500',
                text: 'Export DB',
                icon: icons.export_db,
                group: 'system',
                onClick: () => navigate(ROUTES.EXPORT_DB),
            });
        }
    }

    items.push({
        type: 'button',
        color: 'bg-green-500 hover:bg-green-500',
        iconColor: 'bg-green-500',
        text: "Sync Data",
        icon: icons.syncData,
        group: 'system',
        onClick: async () => navigate(ROUTES.SYNC_DATA)
    });

    items.push({
        type: 'button',
        color: 'bg-red-700 hover:bg-red-800',
        iconColor: 'bg-red-800',
        text: 'Logout',
        icon: icons.logout,
        group: 'system',
        onClick: async () => {
            signout(() => navigate(ROUTES.LOGIN));
        }
    });

    return items;
};

export const useMobileNavItems = (): Array<NavItem> => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();

    const icons = {
        inventory: <Package className="h-5 w-5" />,
        receipts: <HiOutlineDocumentText className="h-5 w-5" />,
        customers: <HiOutlineUserGroup className="h-5 w-5" />,
        staff: <HiOutlineUsers className="h-5 w-5" />,
        returns: <HiOutlineReceiptRefund className="h-5 w-5" />,
        procurement: <POIcon className="h-5 w-5" />,
        subscription: <LucideSubscript className="h-5 w-5" />,
        tenants: <RiGroup3Line className="h-5 w-5" />,
        registrations: <ClipboardList className="h-5 w-5" />,
        receiptSettings: <FileText className="h-5 w-5" />,
        businessSettings: <Store className="h-5 w-5" />,
        generalSettings: <Settings className="h-5 w-5" />,
        printerSetup: <HiOutlinePrinter className="h-5 w-5" />,
        logout: <HiOutlineLogout className="h-5 w-5" />,
    };

    const items: NavItem[] = [];
    if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
        items.push({
            type: 'button',
            color: 'bg-indigo-500 hover:bg-indigo-600',
            iconColor: 'bg-indigo-600',
            text: 'Inventory Management',
            icon: icons.inventory,
            group: 'management',
            onClick: () => navigate(ROUTES.MOBILE_INVENTORY),
        });
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        items.push({
            type: 'button',
            color: 'bg-emerald-500 hover:bg-emerald-600',
            iconColor: 'bg-emerald-600',
            text: 'Receipts',
            icon: icons.receipts,
            group: 'management',
            onClick: () => navigate(ROUTES.RECEIPTS),
        });
    }

    if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create'])) {
        items.push({
            type: 'button',
            color: 'bg-teal-500 hover:bg-teal-600',
            iconColor: 'bg-teal-600',
            text: 'Customers Management',
            icon: icons.customers,
            group: 'management',
            onClick: () => navigate(ROUTES.CUSTOMERS),
        });
    }

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        items.push({
            type: 'button',
            color: 'bg-orange-500 hover:bg-orange-600',
            iconColor: 'bg-orange-600',
            text: 'Staff Management',
            icon: icons.staff,
            group: 'management',
            onClick: () => navigate(ROUTES.USERS),
        });
    }

    if (hasAnyPermission(user, ['refunds.process', 'refunds.view', 'returns.manage'])) {
        items.push({
            type: 'button',
            color: 'bg-rose-500 hover:bg-rose-600',
            iconColor: 'bg-rose-600',
            text: 'Returned Receipt',
            icon: icons.returns,
            group: 'misc',
            onClick: () => navigate(ROUTES.RETURNS),
        });
    }

    if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
        items.push({
            type: 'button',
            color: 'bg-violet-500 hover:bg-violet-600',
            iconColor: 'bg-violet-600',
            text: 'Procurement Management',
            icon: icons.procurement,
            group: 'misc',
            onClick: () => navigate(ROUTES.PURCHASE_ORDERS),
        });
    }

    if (hasRole(user, 'admin') || hasPermission(user, 'system.admin')) {
        items.push({
            type: 'button',
            color: 'bg-purple-500 hover:bg-purple-600',
            iconColor: 'bg-purple-600',
            text: 'Subscription',
            icon: icons.subscription,
            group: 'admin',
            onClick: () => navigate(ROUTES.SUBSCRIPTIONS),
        });

        items.push({
            type: 'button',
            color: 'bg-cyan-500 hover:bg-cyan-600',
            iconColor: 'bg-cyan-600',
            text: 'Tenants',
            icon: icons.tenants,
            group: 'admin',
            onClick: () => navigate(ROUTES.TENANTS),
        });

        items.push({
            type: 'button',
            color: 'bg-teal-500 hover:bg-teal-600',
            iconColor: 'bg-teal-600',
            text: 'Registrations',
            icon: icons.registrations,
            group: 'admin',
            onClick: () => navigate(ROUTES.TENANT_REGISTRATION_DETAILS),
        });
    }

    if (hasAnyPermission(user, ['settings.branch.manage'])) {
        items.push({
            type: 'button',
            color: 'bg-amber-500 hover:bg-amber-600',
            iconColor: 'bg-amber-600',
            text: 'Receipt Settings',
            icon: icons.receiptSettings,
            group: 'settings',
            onClick: () => navigate(ROUTES.SETTINGS),
        });

        items.push({
            type: 'button',
            color: 'bg-blue-500 hover:bg-blue-600',
            iconColor: 'bg-blue-600',
            text: 'Business Settings',
            icon: icons.businessSettings,
            group: 'settings',
            onClick: () => navigate(ROUTES.BRANCHES),
        });

        items.push({
            type: 'button',
            color: 'bg-green-500 hover:bg-green-600',
            iconColor: 'bg-green-600',
            text: 'General Settings',
            icon: icons.generalSettings,
            group: 'settings',
            onClick: () => navigate(ROUTES.SETTINGS),
        });

        items.push({
            type: 'button',
            color: 'bg-slate-500 hover:bg-slate-600',
            iconColor: 'bg-slate-600',
            text: 'Printer Setup',
            icon: icons.printerSetup,
            group: 'settings',
            onClick: () => navigate(ROUTES.PRINTERS),
        });
    }

    items.push({
        type: 'button',
        color: 'bg-red-600 hover:bg-red-700',
        iconColor: 'bg-red-700',
        text: 'Logout',
        icon: icons.logout,
        group: 'settings',
        onClick: async () => {
            signout(() => navigate(ROUTES.LOGIN));
        }
    });

    return items;
};


export default useNavItems