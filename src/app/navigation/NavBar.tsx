import useNavItems, { NAV_GROUP_LABELS } from './partials/navItems';
import type { NavItem, NavGroup } from './partials/RenderNavItem';
import { useState, useEffect, useMemo, useRef, type FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Menu, X, Bell, Settings, User, PanelLeftClose, PanelLeft, FileText, RefreshCw, ChevronDown, LogOut } from 'lucide-react';
import classNames from 'classnames';
import { useSync } from '../hooks/useSync';
import { useAuth } from '../context/AuthProvider';
import { useIsEBN } from '../hooks/useMediaQuery';
import BranchSwitcher from '../components/BranchSwitcher';
import logo from '../assets/images/logo.png';
import { useIsMobile } from '../hooks/useMediaQuery';

interface NavBarProps {
    variant?: 'sidebar' | 'topbar';
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isSidebarCollapsed?: boolean;
}

const GROUP_ORDER: NavGroup[] = ['operations', 'inventory', 'management', 'settings', 'admin', 'system'];

const NavBar: FunctionComponent<NavBarProps> = ({ variant = 'sidebar', isCollapsed = false, onToggleCollapse, isSidebarCollapsed = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navItems = useNavItems();
    const { isSyncing, pendingCount, startSync } = useSync();
    const { signout } = useAuth();
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef<HTMLDivElement>(null);

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
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
                setIsProfileDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileMenuClick = (route: string) => {
        navigate(route);
        setIsProfileDropdownOpen(false);
    };

    const handleSignOut = () => {
        setIsProfileDropdownOpen(false);
        signout(() => navigate(ROUTES.LOGIN, { replace: true }));
    };

    const getRoutePath = (onClick: any): string => {
        for (const [key, value] of Object.entries(ROUTES)) {
            if (onClick?.toString().includes(key) || onClick?.toString().includes(value as string)) {
                return value as string;
            }
        }
        return '';
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleItemClick = (onClick: any) => {
        if (typeof onClick === 'function') {
            onClick();
        }
        setIsMenuOpen(false);
    };

    /**
     * Check if a route is active, including sub-routes
     * e.g., /inventory is active when on /inventory/form
     */
    const isRouteActive = (routePath: string): boolean => {
        if (!routePath) return false;
        const currentPath = location.pathname;

        // Exact match
        if (currentPath === routePath) return true;

        // Sub-route match: /inventory should be active for /inventory/form
        // But /inventory should NOT be active for /inventory-other
        if (currentPath.startsWith(routePath + '/')) return true;

        return false;
    };

    if (variant === 'topbar') {
        return (
            <nav className={classNames(
                "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200 safe-area-top-android",
                isEBN && "py-0"
            )}>
                <div className={classNames(
                    "flex items-center justify-between",
                    isEBN ? "px-2 h-10" : "px-4 lg:px-6 h-16"
                )}>
                    <div className={classNames("flex items-center", isEBN ? "gap-2" : "gap-4")}>
                        <button
                            onClick={toggleMenu}
                            className={classNames(
                                "md:hidden rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200",
                                isEBN ? "p-1.5" : "p-2.5"
                            )}
                            aria-label="Toggle menu"
                        >
                            <Menu size={isEBN ? 18 : 22} />
                        </button>

                        {isSidebarCollapsed && (
                            <div className={classNames("hidden sm:flex items-center", isEBN ? "gap-1" : "gap-3")}>
                                {onToggleCollapse && (
                                    <button
                                        onClick={onToggleCollapse}
                                        className={classNames(
                                            "rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200",
                                            isEBN ? "p-1" : "p-2.5"
                                        )}
                                        aria-label="Show sidebar"
                                        title="Show sidebar"
                                    >
                                        <PanelLeft size={isEBN ? 16 : 20} />
                                    </button>
                                )}

                                <div className={classNames("flex items-center", isEBN ? "gap-1" : "gap-2")}>
                                    <img src={logo} alt="Zonse247" className={isEBN ? "w-6 h-6 rounded object-contain" : "w-8 h-8 rounded-lg object-contain"} />
                                    {!isEBN && (
                                        <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                            Zonse247
                                        </h1>
                                    )}
                                </div>

                                <BranchSwitcher compact />
                            </div>
                        )}
                    </div>

                    <div className={classNames("flex items-center", isEBN ? "gap-0.5" : "gap-1 sm:gap-2")}>
                        <button
                            className={classNames(
                                "relative rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200",
                                isEBN ? "p-1.5" : "p-2.5"
                            )}
                            aria-label="Notifications"
                        >
                            <Bell size={isEBN ? 16 : 20} />
                            <span className={classNames(
                                "absolute bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900",
                                isEBN ? "top-1 right-1 w-1.5 h-1.5" : "top-2 right-2 w-2 h-2"
                            )} />
                        </button>

                        <button
                            onClick={() => startSync()}
                            disabled={isSyncing}
                            className={classNames(
                                "relative flex items-center gap-2 rounded-xl transition-all duration-200",
                                isEBN ? "p-1.5" : "p-2.5",
                                isSyncing
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 cursor-wait"
                                    : pendingCount > 0
                                        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                        : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            )}
                            aria-label={isSyncing ? "Syncing..." : `${pendingCount} documents pending sync`}
                            title={isSyncing ? "Syncing in progress..." : pendingCount > 0 ? `${pendingCount} documents need syncing` : "All synced"}
                        >
                            {isSyncing ? (
                                <RefreshCw size={isEBN ? 14 : 20} className="animate-spin" />
                            ) : (
                                <>
                                    <FileText size={isEBN ? 14 : 20} />
                                    {pendingCount > 0 && (
                                        <span className={classNames(
                                            "absolute flex items-center justify-center font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-1",
                                            isEBN ? "-top-0.5 -right-0.5 min-w-[14px] h-[14px] text-[8px]" : "-top-0.5 -right-0.5 min-w-[18px] h-[18px] text-[10px]"
                                        )}>
                                            {pendingCount > 99 ? '99+' : pendingCount}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>

                        <div className={classNames("w-px bg-gray-200 dark:bg-gray-700 hidden sm:block", isEBN ? "h-4 mx-0.5" : "h-6 mx-1")} />

                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className={classNames(
                                    "flex items-center gap-2 rounded-xl transition-all duration-200",
                                    isEBN ? "p-1 pr-2" : "p-1.5 pr-3",
                                    isProfileDropdownOpen || location.pathname === ROUTES.MY_PROFILE
                                        ? "bg-blue-50 dark:bg-blue-500/10"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                                aria-label="User Profile Menu"
                                aria-expanded={isProfileDropdownOpen}
                                aria-haspopup="true"
                            >
                                <div className={classNames(
                                    "rounded-lg flex items-center justify-center transition-all duration-200",
                                    isEBN ? "w-6 h-6" : "w-8 h-8",
                                    isProfileDropdownOpen || location.pathname === ROUTES.MY_PROFILE
                                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                )}>
                                    <User size={isEBN ? 14 : 18} />
                                </div>
                                <ChevronDown
                                    size={isEBN ? 12 : 14}
                                    className={classNames(
                                        "text-gray-400 hidden sm:block transition-transform duration-200",
                                        isProfileDropdownOpen && "rotate-180"
                                    )}
                                />
                            </button>

                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => handleProfileMenuClick(ROUTES.MY_PROFILE)}
                                        className={classNames(
                                            "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                                            location.pathname === ROUTES.MY_PROFILE
                                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <User size={18} className="text-gray-500 dark:text-gray-400" />
                                        <span>My Profile</span>
                                    </button>

                                    <button
                                        onClick={() => handleProfileMenuClick(ROUTES.SETTINGS)}
                                        className={classNames(
                                            "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                                            location.pathname === ROUTES.SETTINGS
                                                ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <Settings size={18} className="text-gray-500 dark:text-gray-400" />
                                        <span>Settings</span>
                                    </button>

                                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                                    >
                                        <LogOut size={18} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={classNames(
                        "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 md:hidden",
                        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                />

                <div
                    className={classNames(
                        "fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 ease-out md:hidden",
                        isMobile && "safe-area-top-android",
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="Zonse247" className="w-10 h-10 rounded-xl object-contain" />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Zonse247</h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Point of Sale</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                                aria-label="Close menu"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <BranchSwitcher />
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 px-3">
                            <div className="flex flex-col gap-6">
                                {GROUP_ORDER.map((groupKey) => {
                                    const items = groupedNavItems[groupKey];
                                    if (items.length === 0) return null;

                                    return (
                                        <div key={groupKey}>
                                            <div className="flex items-center gap-3 px-3 mb-2">
                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                    {NAV_GROUP_LABELS[groupKey]}
                                                </span>
                                                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {items.map((item, index) => {
                                                    const routePath = getRoutePath(item.onClick);
                                                    const isActive = isRouteActive(routePath);
                                                    return (
                                                        <button
                                                            key={`${groupKey}-${index}`}
                                                            onClick={() => handleItemClick(item.onClick)}
                                                            className={classNames(
                                                                "flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 active:scale-[0.98] w-full group",
                                                                isActive
                                                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-blue-400"
                                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                            )}
                                                        >
                                                            <div className={classNames(
                                                                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200",
                                                                isActive
                                                                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                                                            )}>
                                                                {item.icon}
                                                            </div>
                                                            <span className={classNames(
                                                                "text-[15px] flex-1",
                                                                isActive ? "font-semibold" : "font-medium"
                                                            )}>
                                                                {item.text}
                                                            </span>
                                                            {isActive && (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <aside className={classNames(
            "h-full z-50 transition-all duration-300 flex flex-col safe-area-top",
            "bg-gradient-to-b from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-900/95",
            "border-r border-gray-200/60 dark:border-gray-800/60",
            isCollapsed ? "w-[72px]" : "w-full"
        )}>
            <div className={classNames(
                "flex flex-col border-b border-gray-200/60 dark:border-gray-800/60",
                isCollapsed ? "py-4" : "p-4"
            )}>
                <div className={classNames(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "justify-between"
                )}>
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Zonse247" className="w-10 h-10 rounded-xl object-contain" />
                            <div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                                    Zonse247
                                </h2>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
                                    Point of Sale
                                </p>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <img src={logo} alt="Zonse247" className="w-10 h-10 rounded-xl object-contain" />
                    )}
                    {onToggleCollapse && !isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
                            aria-label="Collapse sidebar"
                            title="Collapse sidebar"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}
                </div>

                {!isCollapsed && (
                    <div className="mt-4">
                        <BranchSwitcher compact />
                    </div>
                )}

                {isCollapsed && onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className="mt-3 p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 mx-auto"
                        aria-label="Expand sidebar"
                        title="Expand sidebar"
                    >
                        <PanelLeft size={18} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <div className={classNames("flex flex-col gap-4", isCollapsed ? "px-2" : "px-3")}>
                    {GROUP_ORDER.map((groupKey) => {
                        const items = groupedNavItems[groupKey];
                        if (items.length === 0) return null;

                        return (
                            <div key={groupKey}>
                                {!isCollapsed && (
                                    <div className="flex items-center gap-3 px-3 mb-1.5">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {NAV_GROUP_LABELS[groupKey]}
                                        </span>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
                                    </div>
                                )}
                                {isCollapsed && (
                                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mx-auto my-1" title={NAV_GROUP_LABELS[groupKey]} />
                                )}
                                <div className="flex flex-col gap-0.5">
                                    {items.map((item, index) => {
                                        const routePath = getRoutePath(item.onClick);
                                        const isActive = isRouteActive(routePath);
                                        return (
                                            <button
                                                key={`${groupKey}-${index}`}
                                                onClick={() => handleItemClick(item.onClick)}
                                                title={isCollapsed ? item.text : undefined}
                                                className={classNames(
                                                    "flex items-center rounded-lg text-left transition-all duration-200 active:scale-[0.98] w-full group",
                                                    isCollapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5",
                                                    isActive
                                                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-600 dark:text-blue-400"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200"
                                                )}
                                            >
                                                <div className={classNames(
                                                    "flex items-center justify-center transition-all duration-200",
                                                    isActive
                                                        ? "text-blue-600 dark:text-blue-400"
                                                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                                                )}>
                                                    {item.icon}
                                                </div>
                                                {!isCollapsed && (
                                                    <>
                                                        <span className={classNames(
                                                            "text-[13px] flex-1 transition-colors duration-200",
                                                            isActive ? "font-semibold" : "font-medium"
                                                        )}>
                                                            {item.text}
                                                        </span>
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                        )}
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* {!isCollapsed && (
                <div className="p-4 border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                        <span>© 2026 Zonse247</span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Online
                        </span>
                    </div>
                </div>
            )} */}
        </aside>
    );
};

export default NavBar;