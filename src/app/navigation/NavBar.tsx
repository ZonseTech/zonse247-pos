import { type FunctionComponent, useState } from 'react';
import {
    HiOutlineMenuAlt1,
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
} from 'react-icons/hi';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../utils/constants';
import renderNavItem, { type NavItem } from './partials/RenderNavItem';
import CreateProductModal from '../pages/products/CreateProductModal';
import AccountInformationModal from '../pages/admin/partials/AccountInformationModal';
import HoldOrdersModal from '../pages/pos/partials/HoldOrdersModal';
import { useAuth } from '../context/AuthProvider';
import PrinterModal from '../pages/printer/PrinterModal';
import DarkMode from '../components/DarkMode';
import { HiBuildingStorefront, HiOutlineArrowPath, HiOutlineBuildingOffice2, HiOutlineKey, HiOutlineServerStack } from 'react-icons/hi2';
import { hasAnyPermission, hasPermission, hasRole } from '../utils';
import { FaFileExport } from 'react-icons/fa';
import { LucideSubscript } from 'lucide-react';
import { RiGroup3Line } from 'react-icons/ri';

const NavBar: FunctionComponent = () => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const icons = {
        hamburger: <HiOutlineMenuAlt1 className="h-6 w-6 mr-1" />,
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
        shop: <HiBuildingStorefront className="h-5 w-5" />,
        migrations: <HiOutlineServerStack className="h-5 w-5" />,
        export_db: <FaFileExport className="h-5 w-5" />,
        transactions: <HiOutlinePresentationChartBar className="h-5 w-5" />,
        users: <HiOutlineUsers className="h-5 w-5" />,
        role_permissions: <HiOutlineKey className="h-5 w-5" />,
        admin: <HiOutlineUserCircle className="h-5 w-5" />,
        logout: <HiOutlineLogout className="h-5 w-5" />,
        syncData: <HiOutlineArrowPath className="h-5 w-5" />,
        theme: <HiOutlineCog className='h-5 w-5' />
    };

    const getNavItems = (): NavItem[] => {
        const items: NavItem[] = [];

        if (hasAnyPermission(user, ['products.view', 'products.create', 'sales.create', 'refunds.process'])) {
            items.push({
                type: 'button',
                color: 'bg-blue-700 hover:bg-blue-800',
                iconColor: 'bg-blue-800',
                text: 'Point of Sale',
                icon: icons.pos,
                onClick: () => navigate(ROUTES.POS),
                plusAction: undefined,
            });

            items.push({
                type: 'split',
                color: 'bg-blue-600 hover:bg-blue-700',
                iconColor: 'bg-blue-700',
                text: 'Products',
                icon: icons.products,
                onClick: () => navigate(ROUTES.PRODUCTS),
                plusAction: (hasPermission(user, 'products.create') ? <CreateProductModal /> : undefined),
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

        items.push({
            type: 'button',
            color: 'bg-green-600 hover:bg-green-700',
            iconColor: 'bg-green-700',
            text: 'Open Orders',
            icon: icons.tabs,
            onClick: <HoldOrdersModal />
        });

        items.push({ type: 'spacer' });

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

        items.push({
            type: 'button',
            color: 'bg-slate-600 hover:bg-slate-700',
            iconColor: 'bg-slate-700',
            text: 'Printer',
            icon: icons.printer,
            onClick: <PrinterModal />
        });

        items.push({ type: 'spacer' });

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
                text: 'Roles & Permissions',
                icon: icons.role_permissions,
                onClick: () => navigate(ROUTES.ROLES_PERMISSIONS),
            });
        }

        if (hasAnyPermission(user, ['settings.shop.manage', 'settings.tax.manage', 'settings.payment.manage'])) {
            items.push({
                type: 'button',
                color: 'bg-cyan-600 hover:bg-cyan-700',
                iconColor: 'bg-cyan-700',
                text: "Workstations",
                icon: icons.workstations,
                onClick: () => navigate(ROUTES.WORK_STATIONS),
            });
        }

        items.push({ type: 'spacer' });

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
                color: 'bg-cyan-500 hover:bg-cyan-600',
                iconColor: 'bg-cyan-600',
                text: "Shops",
                icon: icons.shop,
                onClick: () => navigate(ROUTES.SHOPS),
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

        items.push({ type: 'spacer' });

        items.push({
            type: 'button',
            color: 'bg-green-600 hover:bg-green-700',
            iconColor: 'bg-green-700',
            text: 'Theme',
            icon: icons.theme,
            onClick: <DarkMode />
        });

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
            color: 'bg-slate-500 hover:bg-slate-600',
            iconColor: 'bg-slate-600',
            text: "Account",
            icon: icons.admin,
            onClick: <AccountInformationModal user={user} />
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

    const navItems = getNavItems();

    return (


        <nav className="py-3.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="hidden lg:flex flex-row items-center justify-between gap-2 mx-4">
                {navItems.map(item => renderNavItem(item))}
            </div>

            <div className="lg:hidden">
                <div className="flex justify-between items-center">
                    <button
                        onClick={toggleMenu}
                        className="
                            bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700
                            text-white dark:text-gray-100 
                            px-4 py-2 rounded-lg 
                            flex items-center 
                            transition-all duration-200 ease-in-out
                            shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-xl
                            transform hover:scale-105
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                        "
                    >
                        {icons.hamburger}
                        Menu
                    </button>
                </div>

                <div className={`
                    mt-3 space-y-2 
                    ${isOpen ? 'block' : 'hidden'}
                    bg-gray-50 dark:bg-gray-800 
                    rounded-lg p-3 
                    border border-gray-200 dark:border-gray-700
                    shadow-lg dark:shadow-2xl
                    transition-all duration-200
                `}>
                    {navItems
                        .filter(item => item.type !== 'spacer' || item.showOnMobile)
                        .map(item => renderNavItem(item, true))}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;