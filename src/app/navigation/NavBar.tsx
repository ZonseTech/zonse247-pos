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
import CategoriesModal from '../pages/categories/CategoriesModal';
import AccountInformationModal from '../pages/admin/partials/AccountInformationModal';
import HoldOrdersModal from '../pages/pos/partials/HoldOrdersModal';
import { useAuth } from '../context/AuthProvider';
import PrinterModal from '../pages/printer/PrinterModal';
import DarkMode from '../components/DarkMode';
import { HiBuildingStorefront, HiOutlineArrowPath, HiOutlineBuildingOffice2, HiOutlineServerStack } from 'react-icons/hi2';
import { hasPermission, hasRole } from '../utils';
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
        admin: <HiOutlineUserCircle className="h-5 w-5" />,
        logout: <HiOutlineLogout className="h-5 w-5" />,
        syncData: <HiOutlineArrowPath className="h-5 w-5" />,
        theme: <HiOutlineCog className='h-5 w-5' />
    };

    const getNavItems = (): NavItem[] => {
        const items: NavItem[] = [];

        if (hasPermission(user, 'inventory') || hasPermission(user, 'sales') || hasPermission(user, 'refunds')) {
            items.push({
                type: pathname === ROUTES.PRODUCTS ? 'button' : 'split',
                color: 'bg-green-400',
                iconColor: 'bg-green-500',
                text: pathname === ROUTES.POS ? 'Products' : 'Point of Sale',
                icon: pathname === ROUTES.POS ? icons.products : icons.pos,
                onClick: () => navigate(pathname === ROUTES.POS ? ROUTES.PRODUCTS : ROUTES.POS),
                plusAction: pathname === ROUTES.PRODUCTS ? undefined : <CreateProductModal />,
            });

            items.push({
                type: 'icon',
                color: 'bg-green-400',
                iconColor: 'bg-green-500',
                text: 'Categories',
                icon: icons.categories,
                onClick: <CategoriesModal />
            });
        }

        items.push(
            {
                type: 'button',
                color: 'bg-sky-400',
                iconColor: 'bg-sky-500',
                text: 'Open Tabs',
                icon: icons.tabs,
                onClick: <HoldOrdersModal />
            },
            {
                type: 'button',
                color: 'bg-sky-400',
                iconColor: 'bg-sky-500',
                text: 'Printer',
                icon: icons.printer,
                onClick: <PrinterModal />
            },
            {
                type: 'button',
                color: 'bg-sky-400',
                iconColor: 'bg-sky-500',
                text: 'Theme',
                icon: icons.theme,
                onClick: <DarkMode />
            },
            { type: 'spacer' }
        );

        if (hasPermission(user, 'reports')) {
            items.push({
                type: 'button',
                color: 'bg-green-400',
                iconColor: 'bg-green-500',
                text: 'Transactions',
                icon: icons.transactions,
                onClick: () => navigate(ROUTES.TRANSACTIONS),
            });
        }

        if (hasPermission(user, 'users')) {
            items.push({
                type: 'button',
                color: 'bg-green-400',
                iconColor: 'bg-green-500',
                text: 'Users',
                icon: icons.users,
                onClick: () => navigate(ROUTES.USERS),
            });
        }

        if (hasPermission(user, 'settings')) {
            items.push({
                type: 'button',
                color: 'bg-red-400',
                iconColor: 'bg-red-500',
                text: "Work Stations",
                icon: icons.workstations,
                onClick: () => navigate(ROUTES.WORK_STATIONS),
            });
            items.push({
                type: 'button',
                color: 'bg-red-400',
                iconColor: 'bg-red-500',
                text: "Subscription",
                icon: icons.subscription,
                onClick: () => navigate(ROUTES.SUBSCRIPTION),
            });
            items.push({
                type: 'button',
                color: 'bg-red-400',
                iconColor: 'bg-red-500',
                text: "Clients",
                icon: icons.client,
                onClick: () => navigate(ROUTES.CLIENTS),
            });
            items.push({
                type: 'button',
                color: 'bg-red-400',
                iconColor: 'bg-red-500',
                text: "Shops",
                icon: icons.shop,
                onClick: () => navigate(ROUTES.SHOPS),
            });
        }

        if (hasRole(user, 'super-admin')) {
            items.push({
                type: 'button',
                color: 'bg-red-400',
                iconColor: 'bg-red-500',
                text: 'Migrations',
                icon: icons.migrations,
                onClick: () => navigate(ROUTES.MIGRATIONS),
            });
            items.push({
                type: 'button',
                color: 'bg-yellow-400',
                iconColor: 'bg-yellow-500',
                text: 'Export DB',
                icon: icons.export_db,
                onClick: () => navigate(ROUTES.EXPORT_DB),
            });
        }

        items.push(
            {
                type: 'button',
                color: 'bg-green-400',
                iconColor: 'bg-green-500',
                text: 'Dashboard',
                icon: icons.dashboard,
                onClick: () => navigate(ROUTES.DASHBOARD),
            },
            {
                type: 'button',
                color: 'bg-teal-400',
                iconColor: 'bg-teal-500',
                text: "Sync Data",
                icon: icons.syncData,
                onClick: async () => navigate(ROUTES.SYNC_DATA)
            },
            {
                type: 'button',
                color: 'bg-sky-400',
                iconColor: 'bg-sky-500',
                text: "Login user",
                icon: icons.admin,
                onClick: <AccountInformationModal user={user} />
            },
            {
                type: 'button',
                color: 'bg-yellow-400',
                iconColor: 'bg-yellow-400',
                text: 'Log Out',
                icon: icons.logout,
                onClick: async () => {
                    signout(() => navigate(ROUTES.LOGIN));
                }
            }
        );

        return items;
    };

    const navItems = getNavItems();

    return (
        <nav className="py-3.5">
            <div className="hidden lg:flex flex-row items-center justify-between gap-2">
                {navItems.map(item => renderNavItem(item))}
            </div>

            <div className="lg:hidden">
                <div className="flex justify-between items-center">
                    <button
                        onClick={toggleMenu}
                        className="bg-green-400 text-white px-4 py-2 rounded flex items-center"
                    >
                        {icons.hamburger}
                        Menu
                    </button>
                </div>

                <div className={`mt-2 space-y-2 ${isOpen ? 'block' : 'hidden'}`}>
                    {navItems
                        .filter(item => item.type !== 'spacer' || item.showOnMobile)
                        .map(item => renderNavItem(item, true))}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;