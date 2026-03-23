import type {
    NavGroup as NavGroupHierarchical,
    NavItemBase,
} from '../../../types/navigation';

export interface ProfileDropdownProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    isCompact?: boolean;
}

export interface SyncButtonProps {
    isCompact?: boolean;
}

export interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    navGroups?: NavGroupHierarchical[];
    onNavItemClick?: (item: NavItemBase) => void;
}

export interface SidebarProps {
    navGroups?: NavGroupHierarchical[];
    onNavItemClick?: (item: NavItemBase) => void;
}
