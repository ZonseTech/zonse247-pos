import useNavItems from './partials/navItems';
import { useState, useEffect, type FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { Menu, X, Bell, Settings, User, PanelLeftClose, PanelLeft, FileText, RefreshCw } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../context/AuthProvider';
import { useSync } from '../hooks/useSync';

interface NavBarProps {
    variant?: 'sidebar' | 'topbar';
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isSidebarCollapsed?: boolean;
}

const NavBar: FunctionComponent<NavBarProps> = ({ variant = 'sidebar', isCollapsed = false, onToggleCollapse, isSidebarCollapsed = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const navItems = useNavItems();
    const { user } = useAuth();
    const { isSyncing, pendingCount, startSync } = useSync();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isPOSActive = location.pathname === ROUTES.POS;

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

    if (variant === 'topbar') {
        return (
            <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
                <div className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleMenu}
                            className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                            aria-label="Toggle menu"
                        >
                            <Menu size={24} />
                        </button>
                        {isSidebarCollapsed && (
                            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 hidden sm:block">
                                Zonse247 POS
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            className="relative p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <button
                            onClick={() => navigate(ROUTES.SETTINGS)}
                            className={classNames(
                                "p-2 rounded-lg transition-all duration-200",
                                location.pathname === ROUTES.SETTINGS
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <button
                            onClick={() => startSync()}
                            disabled={isSyncing}
                            className={classNames(
                                "relative flex items-center gap-2 p-2 rounded-lg transition-all duration-200",
                                isSyncing
                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 cursor-wait"
                                    : pendingCount > 0
                                        ? "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                                        : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                            )}
                            aria-label={isSyncing ? "Syncing..." : `${pendingCount} documents pending sync`}
                            title={isSyncing ? "Syncing in progress..." : pendingCount > 0 ? `${pendingCount} documents need syncing` : "All synced"}
                        >
                            {isSyncing ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <FileText size={20} />
                                    {pendingCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-xs font-bold text-white bg-amber-500 rounded-full px-1">
                                            {pendingCount > 99 ? '99+' : pendingCount}
                                        </span>
                                    )}
                                </>
                            )}
                        </button>
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
                        isMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Menu</h2>
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4">
                            <div className="flex flex-col gap-1 px-3">
                                {navItems.map((item, index) => {
                                    const routePath = getRoutePath(item.onClick);
                                    const isActive = location.pathname === routePath;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => handleItemClick(item.onClick)}
                                            className={classNames(
                                                "flex items-center gap-4 px-3 py-2.5 rounded-xl text-left transition-all duration-200 active:scale-98",
                                                isActive
                                                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            <div className={classNames(
                                                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200",
                                                isActive
                                                    ? "text-blue-600 dark:text-blue-400"
                                                    : "text-gray-600 dark:text-gray-400"
                                            )}>
                                                {item.icon}
                                            </div>
                                            <span className={classNames(
                                                "text-base font-medium",
                                                isActive ? "font-semibold" : ""
                                            )}>
                                                {item.text}
                                            </span>
                                        </button>
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
            "h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-200 flex flex-col",
            isCollapsed ? "w-16" : "w-full"
        )}>
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
                {!isCollapsed && (
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Zonse247 POS</h2>
                )}
                {isPOSActive && onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className={classNames(
                            "p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
                            isCollapsed && "mx-auto"
                        )}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <div className={classNames("flex flex-col gap-1", isCollapsed ? "px-2" : "px-3")}>
                    {navItems.map((item, index) => {
                        const routePath = getRoutePath(item.onClick);
                        const isActive = location.pathname === routePath;
                        return (
                            <button
                                key={index}
                                onClick={() => handleItemClick(item.onClick)}
                                title={isCollapsed ? item.text : undefined}
                                className={classNames(
                                    "flex items-center rounded-xl text-left transition-all duration-200 active:scale-98",
                                    isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <div className={classNames(
                                    "flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50"
                                        : "text-gray-600 dark:text-gray-400"
                                )}>
                                    {item.icon}
                                </div>
                                {!isCollapsed && (
                                    <>
                                        <span className={classNames(
                                            "text-sm font-medium flex-1",
                                            isActive ? "font-semibold" : ""
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

            <div className={classNames("py-4 border-t border-gray-200 dark:border-gray-800", isCollapsed ? "px-2" : "px-4")}>
                <div className={classNames("flex items-center", isCollapsed ? "justify-center" : "gap-3 px-2")}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user?.fullname || user?.username || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user?.email || ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default NavBar;