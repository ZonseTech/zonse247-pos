import type { NavItem, NavGroup } from '../partials/RenderNavItem';

export interface NavBarContextProps {
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    toggleMenu: () => void;
    handleItemClick: (onClick: any) => void;
    getRoutePath: (onClick: any) => string;
    isRouteActive: (routePath: string) => boolean;
    groupedNavItems: Record<NavGroup, NavItem[]>;
}

export interface ProfileDropdownProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCompact?: boolean;
}

export interface SyncButtonProps {
    isCompact?: boolean;
}

export interface NavGroupProps {
    groupKey: NavGroup;
    items: NavItem[];
    onItemClick: (onClick: any) => void;
    getRoutePath: (onClick: any) => string;
    isRouteActive: (routePath: string) => boolean;
}

export interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    groupedNavItems: Record<NavGroup, NavItem[]>;
    onItemClick: (onClick: any) => void;
    getRoutePath: (onClick: any) => string;
    isRouteActive: (routePath: string) => boolean;
}

export interface SidebarProps {
    groupedNavItems: Record<NavGroup, NavItem[]>;
    onItemClick: (onClick: any) => void;
    getRoutePath: (onClick: any) => string;
    isRouteActive: (routePath: string) => boolean;
}

export const GROUP_ORDER: NavGroup[] = ['operations', 'inventory', 'management', 'misc', 'settings', 'admin', 'system'];

export const MOBILE_GROUP_ORDER: NavGroup[] = ['management', 'misc', 'admin', 'settings'];
