import { useState, type FunctionComponent } from 'react';
import { Menu, Bell, PanelLeft } from 'lucide-react';
import classNames from 'classnames';
import { useIsEBN } from '../../hooks/useMediaQuery';
import BranchSwitcher from '../../components/BranchSwitcher';
import logo from '../../assets/images/logo.png';
import ProfileDropdown from './ProfileDropdown';
import SyncButton from './SyncButton';
import type { TopBarProps } from './types';

const TopBar: FunctionComponent<TopBarProps> = ({
    isSidebarCollapsed = false,
    onToggleSidebar,
    onToggleMenu,
}) => {
    const isEBN = useIsEBN();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    return (
        <nav className={classNames(
            "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200 safe-area-top-android",
            isEBN && "py-0"
        )}>
            <div className={classNames(
                "flex items-center justify-between",
                isEBN ? "px-2 h-10" : "px-4 lg:px-6 h-16"
            )}>
                {/* Left Section */}
                <div className={classNames("flex items-center", isEBN ? "gap-2" : "gap-4")}>
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onToggleMenu}
                        className={classNames(
                            "md:hidden rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all duration-200",
                            isEBN ? "p-1.5" : "p-2.5"
                        )}
                        aria-label="Toggle menu"
                    >
                        <Menu size={isEBN ? 18 : 22} />
                    </button>

                    {/* Show branding when sidebar is collapsed */}
                    {isSidebarCollapsed && (
                        <div className={classNames("hidden sm:flex items-center", isEBN ? "gap-1" : "gap-3")}>
                            {onToggleSidebar && (
                                <button
                                    onClick={onToggleSidebar}
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
                                <img
                                    src={logo}
                                    alt="Zonse247"
                                    className={isEBN ? "w-6 h-6 rounded object-contain" : "w-8 h-8 rounded-lg object-contain"}
                                />
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

                {/* Right Section */}
                <div className={classNames("flex items-center", isEBN ? "gap-0.5" : "gap-1 sm:gap-2")}>
                    {/* Notifications */}
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

                    {/* Sync Button */}
                    <SyncButton />

                    {/* Divider */}
                    <div className={classNames(
                        "w-px bg-gray-200 dark:bg-gray-700 hidden sm:block",
                        isEBN ? "h-4 mx-0.5" : "h-6 mx-1"
                    )} />

                    {/* Profile Dropdown */}
                    <ProfileDropdown
                        isOpen={isProfileDropdownOpen}
                        setIsOpen={setIsProfileDropdownOpen}
                    />
                </div>
            </div>
        </nav>
    );
};

export default TopBar;
