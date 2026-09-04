import { useState, type FunctionComponent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Building2, ChevronRight, LogOut } from 'lucide-react';
import classNames from 'classnames';
import { version } from '../../../../package.json';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useAuth } from '../../context/AuthProvider';
import { useBranch } from '../../context/BranchContext';
import { isElectron } from '../../utils';
import Button from '../../components/Button';
import BranchSwitchModal from './BranchSwitchModal';
import { ROUTES } from '../../utils/constants';
import type { MobileDrawerProps } from './types';
import { FaCaretDown } from 'react-icons/fa';
import type { NavGroup as NavGroupType, NavItemBase, NavSubGroup } from '../../../types/navigation';
import * as Collapsible from '@radix-ui/react-collapsible';

// ─── Shared active-state helper ──────────────────────────────────────────────
function isItemActive(item: NavItemBase, pathname: string, search: string): boolean {
    if (!item.route) return false;
    const qIdx = item.route.indexOf('?');
    if (qIdx === -1) {
        return pathname === item.route || pathname.startsWith(item.route + '/');
    }
    const routePath = item.route.slice(0, qIdx);
    const routeSearch = item.route.slice(qIdx);
    return pathname === routePath && search === routeSearch;
}

// ─── Mobile nav item button ──────────────────────────────────────────────────
const MobileNavItemBtn: FunctionComponent<{
    item: NavItemBase;
    isActive: boolean;
    onClick: () => void;
}> = ({ item, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={classNames(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 active:scale-[0.98] w-full group',
            isActive
                ? 'text-sky-500 dark:text-sky-400'
                : 'text-gray-700 dark:text-gray-300',
        )}
    >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 text-sky-500 dark:text-sky-400">
            {item.icon}
        </div>
        <span className={classNames('text-sm flex-1', isActive ? 'font-semibold' : 'font-medium')}>
            {item.label}
        </span>
        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
    </button>
);

// ─── Mobile collapsible sub-group ────────────────────────────────────────────
const MobileSubGroup: FunctionComponent<{
    subGroup: NavSubGroup;
    pathname: string;
    search: string;
    onItemClick: (item: NavItemBase) => void;
}> = ({ subGroup, pathname, search, onItemClick }) => {
    const hasActiveChild = subGroup.items.some((item) => isItemActive(item, pathname, search));
    const [open, setOpen] = useState(!subGroup.defaultCollapsed || hasActiveChild);

    const mobileItems = subGroup.items.filter((i) => i.showOnMobile !== false);
    if (mobileItems.length === 0) return null;

    return (
        <Collapsible.Root open={open} onOpenChange={setOpen}>
            <Collapsible.Trigger asChild>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-left text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60">
                    {subGroup.icon && (
                        <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                            {subGroup.icon}
                        </div>
                    )}
                    <span className="text-[11px] font-semibold uppercase tracking-wider flex-1">
                        {subGroup.label}
                    </span>
                    <ChevronRight
                        size={14}
                        className={classNames('transition-transform duration-200 text-gray-400', open && 'rotate-90')}
                    />
                </button>
            </Collapsible.Trigger>
            <Collapsible.Content className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="flex flex-col gap-0.5 pl-3 mt-0.5 border-l-2 border-gray-100 dark:border-gray-800 ml-3">
                    {mobileItems.map((item) => (
                        <MobileNavItemBtn
                            key={item.id}
                            item={item}
                            isActive={isItemActive(item, pathname, search)}
                            onClick={() => onItemClick(item)}
                        />
                    ))}
                </div>
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

// ─── Mobile collapsible group ────────────────────────────────────────────────
const MobileNavGroup: FunctionComponent<{
    group: NavGroupType;
    pathname: string;
    search: string;
    onItemClick: (item: NavItemBase) => void;
}> = ({ group, pathname, search, onItemClick }) => {
    const mobileItems = group.items.filter((i) => i.showOnMobile !== false);
    const mobileSubGroups = group.subGroups?.filter(
        (sg) => sg.items.some((i) => i.showOnMobile !== false),
    );
    const totalMobile = mobileItems.length + (mobileSubGroups?.reduce((s, sg) => s + sg.items.filter((i) => i.showOnMobile !== false).length, 0) ?? 0);
    if (totalMobile === 0) return null;

    return (
        <div>
            <div className="flex items-center gap-2 px-2 mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {group.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
            </div>
            <div className="flex flex-col gap-0.5">
                {mobileItems.map((item) => (
                    <MobileNavItemBtn
                        key={item.id}
                        item={item}
                        isActive={isItemActive(item, pathname, search)}
                        onClick={() => onItemClick(item)}
                    />
                ))}
                {mobileSubGroups?.map((sg) => (
                    <MobileSubGroup
                        key={sg.id}
                        subGroup={sg}
                        pathname={pathname}
                        search={search}
                        onItemClick={onItemClick}
                    />
                ))}
            </div>
        </div>
    );
};

const MobileDrawer: FunctionComponent<MobileDrawerProps> = ({
    isOpen,
    onClose,
    navGroups,
    onNavItemClick,
}) => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signout } = useAuth();
    const { currentBranch, accessibleBranches } = useBranch();
    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const isDesktopApp = isElectron();

    const handleItemClick = (item: NavItemBase) => {
        if (item.onClick) item.onClick();
        onNavItemClick?.(item);
        onClose();
    };

    const handleEditBranch = () => {
        onClose();
        navigate(ROUTES.BRANCH_FORM, { state: { branchId: currentBranch?.branchId } });
    };

    const handleEditProfile = () => {
        onClose();
        navigate(ROUTES.MY_PROFILE);
    };

    const handleSwitchBranch = () => {
        setIsBranchModalOpen(true);
    };

    return (
        <>
            <div
                className={classNames(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all duration-300 ",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div
                className={classNames(
                    "fixed top-0 left-0 h-full w-[85%] max-w-sm bg-gray-100 dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out ",
                    isMobile && "safe-area-top-android",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    <div className="bg-sky-500 dark:bg-sky-700 px-5 py-4 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-200"
                            aria-label="Close menu"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex flex-col items-center justify-center pt-2 pb-3">
                            <h1 className="text-xl font-bold text-white">Zonse247 POS</h1>
                            <p className="text-sm text-white/70">v {version}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                            </div>
                            <Button
                                layout="link"
                                size="small"
                                theme='primary'
                                onClick={handleEditBranch}
                                className="underline text-xs text-sky-500 dark:text-sky-400 px-0 pr-0"
                            >
                                EDIT BRANCH
                            </Button>
                        </div>

                        <button
                            onClick={!isDesktopApp ? handleSwitchBranch : undefined}
                            disabled={isDesktopApp}
                            className={classNames(
                                "flex items-center justify-between w-full text-left -mx-1 px-1 py-1 rounded-lg transition-colors",
                                isDesktopApp && "cursor-default"
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-sky-500 dark:text-sky-400 truncate">
                                    {currentBranch?.branchName || 'No Branch'}
                                </p>
                                <p className="text-xs text-sky-500 dark:text-sky-400/80 truncate">
                                    {currentBranch?.phoneNumber || 'No phone number'}
                                </p>
                            </div>
                            {!isDesktopApp && <FaCaretDown className="w-6 h-6 flex-shrink-0 text-sky-500 dark:text-sky-400 " />}
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user?.fullname || 'Unknown User'}
                                        {user?.roleName && (
                                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                                                ({user.roleName})
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user?.email || 'No email'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                layout="link"
                                size="small"
                                theme='primary'
                                onClick={handleEditProfile}
                                className="underline flex-shrink-0 text-xs text-sky-500 dark:text-sky-400 px-0 pr-0"
                            >
                                EDIT PROFILE
                            </Button>
                        </div>
                    </div>

                    {!isDesktopApp && (
                        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <Button
                                theme="primary"
                                layout="primary"
                                onClick={handleSwitchBranch}
                                disabled={accessibleBranches.length <= 1}
                                block
                            >
                                SWITCH BRANCH
                            </Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto py-3 px-2 bg-white dark:bg-gray-800">
                        <div className="flex flex-col gap-4">
                            {navGroups
                                ?.filter((g) => g.key !== 'system')
                                .sort((a, b) => a.order - b.order)
                                .map((group) => (
                                    <MobileNavGroup
                                        key={group.key}
                                        group={group}
                                        pathname={location.pathname}
                                        search={location.search}
                                        onItemClick={handleItemClick}
                                    />
                                ))}
                        </div>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <button
                            onClick={() => {
                                onClose();
                                signout(() => navigate(ROUTES.LOGIN, { replace: true }));
                            }}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all duration-150"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {!isDesktopApp && (
                <BranchSwitchModal
                    isOpen={isBranchModalOpen}
                    onClose={() => setIsBranchModalOpen(false)}
                    onBranchSwitch={onClose}
                />
            )}
        </>
    );
};

export default MobileDrawer;
