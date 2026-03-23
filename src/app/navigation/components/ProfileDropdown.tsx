import type { FunctionComponent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, User, ChevronDown, LogOut } from 'lucide-react';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthProvider';
import { useIsEBN } from '../../hooks/useMediaQuery';
import { ROUTES } from '../../utils/constants';
import type { ProfileDropdownProps } from './types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Separator from '@radix-ui/react-separator';
import * as Avatar from '@radix-ui/react-avatar';

const ProfileDropdown: FunctionComponent<ProfileDropdownProps> = ({ isOpen, setIsOpen, isCompact = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { signout } = useAuth();
    const isEBN = useIsEBN();

    const handleMenuClick = (route: string) => {
        navigate(route);
        setIsOpen(false);
    };

    const handleSignOut = () => {
        setIsOpen(false);
        signout(() => navigate(ROUTES.LOGIN, { replace: true }));
    };

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger asChild>
                <button
                    className={classNames(
                        'flex items-center gap-2 rounded-xl transition-all duration-200',
                        isEBN ? 'p-1 pr-2' : 'p-1.5 pr-3',
                        isOpen || location.pathname === ROUTES.MY_PROFILE
                            ? 'bg-sky-50 dark:bg-sky-500/10'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                    aria-label="User Profile Menu"
                >
                    <Avatar.Root
                        className={classNames(
                            'rounded-lg flex items-center justify-center transition-all duration-200 overflow-hidden',
                            isEBN ? 'w-6 h-6' : 'w-8 h-8',
                            isOpen || location.pathname === ROUTES.MY_PROFILE
                                ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                        )}
                    >
                        <Avatar.Fallback>
                            <User size={isEBN ? 14 : 18} />
                        </Avatar.Fallback>
                    </Avatar.Root>
                    <ChevronDown
                        size={isEBN ? 12 : 14}
                        className={classNames(
                            'text-gray-400 hidden sm:block transition-transform duration-200',
                            isOpen && 'rotate-180',
                        )}
                    />
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in origin-top-right"
                >
                    <DropdownMenu.Item
                        onSelect={() => handleMenuClick(ROUTES.MY_PROFILE)}
                        className={classNames(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 cursor-pointer outline-none',
                            location.pathname === ROUTES.MY_PROFILE
                                ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800',
                        )}
                    >
                        <User size={18} className="text-gray-500 dark:text-gray-400" />
                        <span>My Profile</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                        onSelect={() => handleMenuClick(ROUTES.SETTINGS)}
                        className={classNames(
                            'flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 cursor-pointer outline-none',
                            location.pathname === ROUTES.SETTINGS
                                ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-500 dark:text-sky-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800',
                        )}
                    >
                        <Settings size={18} className="text-gray-500 dark:text-gray-400" />
                        <span>Settings</span>
                    </DropdownMenu.Item>

                    <Separator.Root className="my-2 h-px bg-gray-200 dark:bg-gray-700" />

                    <DropdownMenu.Item
                        onSelect={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 focus:bg-red-50 dark:focus:bg-red-500/10 transition-colors duration-150 cursor-pointer outline-none"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className="fill-white dark:fill-gray-900" />
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default ProfileDropdown;
