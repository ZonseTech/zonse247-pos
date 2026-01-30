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
    isCollapsed?: boolean;
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
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    groupedNavItems: Record<NavGroup, NavItem[]>;
    onItemClick: (onClick: any) => void;
    getRoutePath: (onClick: any) => string;
    isRouteActive: (routePath: string) => boolean;
}

export interface TopBarProps {
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    onToggleMenu: () => void;
    isMenuOpen: boolean;
}

export const GROUP_ORDER: NavGroup[] = ['operations', 'inventory', 'management', 'settings', 'admin', 'system'];
