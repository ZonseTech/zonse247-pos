import { useRef, useEffect, type FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, User, ChevronDown, LogOut } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthProvider';
import { useIsEBN } from '../../hooks/useMediaQuery';
import { ROUTES } from '../../utils/constants';
import type { ProfileDropdownProps } from './types';

const ProfileDropdown: FunctionComponent<ProfileDropdownProps> = ({ isOpen, setIsOpen, isCompact = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signout } = useAuth();
    const isEBN = useIsEBN();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setIsOpen]);

    const handleMenuClick = (route: string) => {
        navigate(route);
        setIsOpen(false);
    };

    const handleSignOut = () => {
        setIsOpen(false);
        signout(() => navigate(ROUTES.LOGIN, { replace: true }));
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={classNames(
                    "flex items-center gap-2 rounded-xl transition-all duration-200",
                    isEBN ? "p-1 pr-2" : "p-1.5 pr-3",
                    isOpen || location.pathname === ROUTES.MY_PROFILE
                        ? "bg-sky-50 dark:bg-sky-500/10"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                aria-label="User Profile Menu"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className={classNames(
                    "rounded-lg flex items-center justify-center transition-all duration-200",
                    isEBN ? "w-6 h-6" : "w-8 h-8",
                    isOpen || location.pathname === ROUTES.MY_PROFILE
                        ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                )}>
                    <User size={isEBN ? 14 : 18} />
                </div>
                <ChevronDown
                    size={isEBN ? 12 : 14}
                    className={classNames(
                        "text-gray-400 hidden sm:block transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => handleMenuClick(ROUTES.MY_PROFILE)}
                        className={classNames(
                            "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                            location.pathname === ROUTES.MY_PROFILE
                                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <User size={18} className="text-gray-500 dark:text-gray-400" />
                        <span>My Profile</span>
                    </button>

                    <button
                        onClick={() => handleMenuClick(ROUTES.SETTINGS)}
                        className={classNames(
                            "flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150",
                            location.pathname === ROUTES.SETTINGS
                                ? "bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                    >
                        <Settings size={18} className="text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                    </button>

                    <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
