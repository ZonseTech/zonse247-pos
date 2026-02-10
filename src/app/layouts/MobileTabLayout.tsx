import { FunctionComponent, ReactNode, useMemo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import { MobileDrawer } from '../navigation/components';
import { useMobileNavItems } from '../navigation/partials/navItems';
import type { NavItem, NavGroup } from '../navigation/partials/RenderNavItem';
import { ROUTES } from '../utils/constants';
import { MobileNavProvider, useMobileNav } from '../context/MobileNavContext';
import { useMobileBottomNav } from '../hooks/useMobileBottomNav';

interface MobileTabLayoutProps {
    children?: ReactNode;
}

const MobileTabLayout: FunctionComponent<MobileTabLayoutProps> = ({ children }) => {
    const location = useLocation();
    const mobileNavItems = useMobileNavItems();
    const { isDrawerOpen: isNavDrawerOpen, closeDrawer } = useMobileNav();
    const { bottomNavItems, activeTabId } = useMobileBottomNav();

    const groupedNavItems = useMemo(() => {
        const groups: Record<NavGroup, NavItem[]> = {
            operations: [],
            inventory: [],
            management: [],
            admin: [],
            settings: [],
            system: [],
            misc: [],
        };
        mobileNavItems.forEach((item) => {
            const group = item.group || 'management';
            groups[group].push(item);
        });
        return groups;
    }, [mobileNavItems]);

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
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-900">

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
