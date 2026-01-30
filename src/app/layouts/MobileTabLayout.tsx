import { FunctionComponent, ReactNode, useMemo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BarChart3, MoreHorizontal } from 'lucide-react';
import { FaCircleDollarToSlot, FaCashRegister, FaListCheck } from 'react-icons/fa6';
import MobileBottomNav, { BottomNavItem } from '../components/navigation/MobileBottomNav';
import { MobileDrawer } from '../navigation/components';
import useNavItems from '../navigation/partials/navItems';
import type { NavItem, NavGroup } from '../navigation/partials/RenderNavItem';
import { ROUTES } from '../utils/constants';
import { useInventory } from '../hooks/useInventory';
import { MobileNavProvider, useMobileNav } from '../context/MobileNavContext';

interface MobileTabLayoutProps {
    children?: ReactNode;
}

const MobileTabLayout: FunctionComponent<MobileTabLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navItems = useNavItems();
    const { cart } = useInventory();
    const { isDrawerOpen: isNavDrawerOpen, openDrawer, closeDrawer } = useMobileNav();

    const activeTabId = useMemo(() => {
        const path = location.pathname;
        if (path === ROUTES.DASHBOARD || path.startsWith(ROUTES.DASHBOARD + '/')) return 'reports';
        if (path === ROUTES.SALES || path.startsWith(ROUTES.SALES + '/')) return 'today';
        if (path === ROUTES.POS || path.startsWith(ROUTES.POS + '/')) return 'counter';
        if (path === ROUTES.INVENTORY || path.startsWith(ROUTES.INVENTORY + '/')) return 'items';
        return '';
    }, [location.pathname]);

    const bottomNavItems: BottomNavItem[] = useMemo(() => [
        {
            id: 'reports',
            label: 'Reports',
            icon: <BarChart3 className="w-6 h-6" />,
            route: ROUTES.DASHBOARD,
        },
        {
            id: 'today',
            label: 'Today',
            icon: <FaCircleDollarToSlot className="w-6 h-6" />,
            route: ROUTES.SALES,
        },
        {
            id: 'counter',
            label: 'Counter',
            icon: <FaCashRegister className="w-6 h-6" />,
            route: ROUTES.POS,
            badge: cart.length,
        },
        {
            id: 'items',
            label: 'Items',
            icon: <FaListCheck className="w-6 h-6" />,
            route: ROUTES.INVENTORY,
        },
        {
            id: 'more',
            label: 'More',
            icon: <MoreHorizontal className="w-6 h-6" />,
            onClick: () => openDrawer(),
        },
    ], [cart.length, openDrawer]);

    const groupedNavItems = useMemo(() => {
        const groups: Record<NavGroup, NavItem[]> = {
            operations: [],
            inventory: [],
            management: [],
            admin: [],
            settings: [],
            system: [],
        };
        navItems.forEach((item) => {
            const group = item.group || 'operations';
            groups[group].push(item);
        });
        return groups;
    }, [navItems]);

    useEffect(() => {
        if (isNavDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isNavDrawerOpen]);

    const getRoutePath = (onClick: any): string => {
        for (const [key, value] of Object.entries(ROUTES)) {
            if (onClick?.toString().includes(key) || onClick?.toString().includes(value as string)) {
                return value as string;
            }
        }
        return '';
    };

    const isRouteActive = (routePath: string): boolean => {
        if (!routePath) return false;
        const currentPath = location.pathname;
        if (currentPath === routePath) return true;
        if (currentPath.startsWith(routePath + '/')) return true;
        return false;
    };

    const handleNavItemClick = (onClick: any) => {
        if (typeof onClick === 'function') {
            onClick();
        }
        closeDrawer();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">

            <div className="flex-1 min-h-0 overflow-hidden pb-[52px]">
                {children || <Outlet />}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40">
                <MobileBottomNav items={bottomNavItems} activeId={activeTabId} />
            </div>

            <MobileDrawer
                isOpen={isNavDrawerOpen}
                onClose={closeDrawer}
                groupedNavItems={groupedNavItems}
                onItemClick={handleNavItemClick}
                getRoutePath={getRoutePath}
                isRouteActive={isRouteActive}
            />
        </div>
    );
};

const MobileTabLayoutWithProvider: FunctionComponent<MobileTabLayoutProps> = (props) => {
    return (
        <MobileNavProvider>
            <MobileTabLayout {...props} />
        </MobileNavProvider>
    );
};

export default MobileTabLayoutWithProvider;
