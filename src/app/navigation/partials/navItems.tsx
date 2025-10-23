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
} from 'react-icons/hi';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import {
    HiOutlineArrowPath,
    HiOutlineBuildingOffice2,
    HiOutlineBuildingStorefront,
    HiOutlineKey,
    HiOutlineServerStack,
    HiOutlineWrenchScrewdriver
} from 'react-icons/hi2';
import { hasAnyPermission, hasPermission, hasRole } from '../../utils';
import { LucideSubscript } from 'lucide-react';
import { RiGroup3Line } from 'react-icons/ri';
import { NavItem } from './RenderNavItem';

const navItems = (): NavItem[] => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    const icons = {
        pos: <HiOutlineShoppingCart className="h-6 w-6 mr-1" />,
        dashboard: <HiOutlinePresentationChartBar className="h-6 w-6 mr-1" />,
        products: <HiOutlineQrcode className="h-5 w-5" />,
        categories: <HiOutlineViewList className="h-5 w-5" />,
        tabs: <HiOutlineViewGrid className="h-5 w-5" />,
        orders: <HiOutlineShoppingCart className="h-5 w-5" />,
        printer: <HiOutlinePrinter className="h-5 w-5" />,
        workstations: <HiOutlineBuildingOffice2 className="h-5 w-5" />,
        subscription: <LucideSubscript className="h-5 w-5" />,
        client: <RiGroup3Line className="h-5 w-5" />,
        shop: <HiOutlineBuildingStorefront className="h-5 w-5" />,
        migrations: <HiOutlineServerStack className="h-5 w-5" />,
        export_db: <HiOutlineFolderDownload className="h-5 w-5" />,
        transactions: <HiOutlinePresentationChartBar className="h-5 w-5" />,
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
            color: 'bg-blue-700 hover:bg-blue-800',
            iconColor: 'bg-blue-800',
            text: 'Point of Sale',
            icon: icons.pos,
            onClick: () => navigate(ROUTES.POS),
        });

        items.push({
            type: 'button',
            color: 'bg-blue-600 hover:bg-blue-700',
            iconColor: 'bg-blue-700',
            text: 'Products',
            icon: icons.products,
            onClick: () => navigate(ROUTES.PRODUCTS),
        });

        if (hasAnyPermission(user, ['products.view', 'products.create', 'products.edit'])) {
            items.push({
                type: 'button',
                color: 'bg-blue-500 hover:bg-blue-600',
                iconColor: 'bg-blue-600',
                text: 'Categories',
                icon: icons.categories,
                onClick: () => navigate(ROUTES.CATEGORIES),
            });
        }
    }

    if (hasAnyPermission(user, ['reports.sales.daily', 'reports.sales.detailed', 'payments.view'])) {
        items.push({
            type: 'button',
            color: 'bg-emerald-600 hover:bg-emerald-700',
            iconColor: 'bg-emerald-700',
            text: 'Transactions',
            icon: icons.transactions,
            onClick: () => navigate(ROUTES.TRANSACTIONS),
        });
    }

    items.push({
        type: 'button',
        color: 'bg-emerald-500 hover:bg-emerald-600',
        iconColor: 'bg-emerald-600',
        text: 'Dashboard',
        icon: icons.dashboard,
        onClick: () => navigate(ROUTES.DASHBOARD),
    });

    if (hasAnyPermission(user, ['users.view', 'users.create', 'users.edit', 'users.delete'])) {
        items.push({
            type: 'button',
            color: 'bg-orange-600 hover:bg-orange-700',
            iconColor: 'bg-orange-700',
            text: 'Users',
            icon: icons.users,
            onClick: () => navigate(ROUTES.USERS),
        });
    }

    if (hasAnyPermission(user, ['users.roles.assign', 'users.create', 'users.edit'])) {
        items.push({
            type: 'button',
            color: 'bg-orange-500 hover:bg-orange-600',
            iconColor: 'bg-orange-600',
            text: 'Security',
            icon: icons.role_permissions,
            onClick: () => navigate(ROUTES.ROLES_PERMISSIONS),
        });
    }

    if (hasAnyPermission(user, ['settings.shop.manage'])) {
        items.push({
            type: 'button',
            color: 'bg-cyan-500 hover:bg-cyan-600',
            iconColor: 'bg-cyan-600',
            text: "Shops",
            icon: icons.shop,
            onClick: () => navigate(ROUTES.SHOPS),
        });

        items.push({
            type: 'button',
            color: 'bg-cyan-600 hover:bg-cyan-700',
            iconColor: 'bg-cyan-700',
            text: "Workstations",
            icon: icons.workstations,
            onClick: () => navigate(ROUTES.WORK_STATIONS),
        });

        items.push({
            type: 'button',
            color: 'bg-green-500 hover:bg-green-600',
            iconColor: 'bg-green-600',
            text: "Settings",
            icon: icons.settings,
            onClick: () => navigate(ROUTES.SETTINGS)
        });
    }

    if (hasRole(user, 'admin') || hasPermission(user, 'system.admin')) {
        items.push({
            type: 'button',
            color: 'bg-purple-600 hover:bg-purple-700',
            iconColor: 'bg-purple-700',
            text: "Subscription",
            icon: icons.subscription,
            onClick: () => navigate(ROUTES.SUBSCRIPTION),
        });

        items.push({
            type: 'button',
            color: 'bg-cyan-400 hover:bg-cyan-500',
            iconColor: 'bg-cyan-500',
            text: "Clients",
            icon: icons.client,
            onClick: () => navigate(ROUTES.CLIENTS),
        });

        items.push({
            type: 'button',
            color: 'bg-red-600 hover:bg-red-700',
            iconColor: 'bg-red-700',
            text: 'Migrations',
            icon: icons.migrations,
            onClick: () => navigate(ROUTES.MIGRATIONS),
        });

        if (hasPermission(user, 'system.backup')) {
            items.push({
                type: 'button',
                color: 'bg-red-500 hover:bg-red-600',
                iconColor: 'bg-red-600',
                text: 'Export DB',
                icon: icons.export_db,
                onClick: () => navigate(ROUTES.EXPORT_DB),
            });
        }
    }

    items.push({
        type: 'button',
        color: 'bg-green-500 hover:bg-green-600',
        iconColor: 'bg-green-600',
        text: "Sync Data",
        icon: icons.syncData,
        onClick: async () => navigate(ROUTES.SYNC_DATA)
    });

    items.push({
        type: 'button',
        color: 'bg-red-700 hover:bg-red-800',
        iconColor: 'bg-red-800',
        text: 'Logout',
        icon: icons.logout,
        onClick: async () => {
            signout(() => navigate(ROUTES.LOGIN));
        }
    });

    return items;
};


export default navItems