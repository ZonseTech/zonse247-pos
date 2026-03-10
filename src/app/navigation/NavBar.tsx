import useNavItems, { useMobileNavItems } from './partials/navItems';
import type { NavItem, NavGroup } from './partials/RenderNavItem';
import { useState, useEffect, useMemo, type FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Sidebar, MobileDrawer } from './components';

interface NavBarProps {
    variant?: 'sidebar' | 'topbar';
}

const NavBar: FunctionComponent<NavBarProps> = ({
    variant = 'sidebar',
}) => {
    const location = useLocation();
    const navItems = useNavItems();
    const mobileNavItems = useMobileNavItems();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

        navItems.forEach((item) => {
            const group = item.group || 'operations';
            groups[group].push(item);
        });

        return groups;
    }, [navItems]);

    const groupedMobileNavItems = useMemo(() => {
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
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    /**
     * Extract route path from onClick handler
     */
    const getRoutePath = (onClick: any): string => {
        for (const [key, value] of Object.entries(ROUTES)) {
            if (onClick?.toString().includes(key) || onClick?.toString().includes(value as string)) {
                return value as string;
            }
        }
        return '';
    };

    /**
     * Check if a route is active, including sub-routes
     */
    const isRouteActive = (routePath: string): boolean => {
        if (!routePath) return false;
        const currentPath = location.pathname;

        if (currentPath === routePath) return true;

        if (currentPath.startsWith(routePath + '/')) return true;

        return false;
    };

    const handleItemClick = (onClick: any) => {
        if (typeof onClick === 'function') {
            onClick();
        }
        setIsMenuOpen(false);
    };

    if (variant === 'topbar') {
        return (
            <MobileDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                groupedNavItems={groupedMobileNavItems}
                onItemClick={handleItemClick}
                getRoutePath={getRoutePath}
                isRouteActive={isRouteActive}
            />
        );
    }

    return (
        <Sidebar
            groupedNavItems={groupedNavItems}
            onItemClick={handleItemClick}
            getRoutePath={getRoutePath}
            isRouteActive={isRouteActive}
        />
    );
};

export default NavBar;