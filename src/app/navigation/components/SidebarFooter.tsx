import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { useState, type FunctionComponent } from 'react';
import { version as appVersion } from '../../../../package.json';
import { User, LogOut, Settings, ChevronUp, Wifi, WifiOff, Server, ServerOff, Loader2, RefreshCw } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Separator from '@radix-ui/react-separator';
import { formatRoleName } from '../../pages/auth/profile';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useIsElectron } from '../../hooks/useMediaQuery';

const APP_VERSION = import.meta.env.VITE_APP_VERSION || appVersion || '1.3.9';

const SidebarFooter: FunctionComponent = () => {
    const navigate = useNavigate();
    const { user, signout } = useAuth();
    const isDesktop = useIsElectron();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { isOnline, isServerConnected, serverChecking } = useConnectivity();

    const handleSignOut = () => {
        signout(() => navigate(ROUTES.LOGIN, { replace: true }));
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        window.location.reload();
    };

    const handleNavigate = (route: string) => {
        navigate(route);
    };

    const displayName = user?.fullname || user?.username || 'User';
    const roleName = user?.role?.name || 'Staff';

    return (
        <div className="border-t border-gray-200/60 dark:border-gray-800/60 p-3">
            <Popover.Root>
                <Popover.Trigger asChild>
                    <button
                        className={classNames(
                            'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200',
                            'hover:bg-gray-100/80 dark:hover:bg-gray-800/80',
                            'data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800',
                        )}
                    >
                        <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {formatRoleName(roleName)}
                            </p>
                        </div>

                        <ChevronUp
                            size={16}
                            className="text-gray-400 transition-transform duration-200 flex-shrink-0 [[data-state=closed]>&]:rotate-180"
                        />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="w-[var(--radix-popover-trigger-width)] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-fade-in origin-bottom"
                    >
                        <button
                            onClick={() => handleNavigate(ROUTES.MY_PROFILE)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                            <User size={16} className="text-gray-500 dark:text-gray-400" />
                            <span>My Profile</span>
                        </button>

                        <button
                            onClick={() => handleNavigate(ROUTES.SETTINGS)}
                            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                        >
                            <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                            <span>Settings</span>
                        </button>

                        <Separator.Root className="my-1.5 mx-3 h-px bg-gray-200 dark:bg-gray-700" />

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors duration-150"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>

                        <Popover.Arrow className="fill-white dark:fill-gray-900" />
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <div className="mt-2 px-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        title="Refresh page"
                        className={classNames(
                            'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
                            isRefreshing ? 'cursor-wait opacity-70' : 'cursor-pointer'
                        )}
                    >
                        <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                    <div title={isOnline ? 'Internet Connected' : 'No Internet Connection'}>
                        {isOnline ? (
                            <Wifi size={13} className="text-green-500" />
                        ) : (
                            <WifiOff size={13} className="text-red-500" />
                        )}
                    </div>

                    {isDesktop && (
                        <div title={serverChecking ? 'Checking server...' : (isServerConnected ? 'Server Connected' : 'Server Disconnected')}>
                            {serverChecking ? (
                                <Loader2 size={13} className="text-sky-500 animate-spin" />
                            ) : isServerConnected ? (
                                <Server size={13} className="text-green-500" />
                            ) : (
                                <ServerOff size={13} className="text-red-500" />
                            )}
                        </div>
                    )}
                </div>

                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    v{APP_VERSION}
                </p>
            </div>
        </div>
    );
};

export default SidebarFooter;
