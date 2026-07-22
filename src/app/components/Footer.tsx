import classNames from 'classnames';
import { useConnectivity } from '../hooks/useConnectivity';
import { useState, FunctionComponent } from 'react'
import { useIsEBN, useIsElectron } from '../hooks/useMediaQuery';
import { Wifi, WifiOff, Server, ServerOff, Loader2, RefreshCw } from 'lucide-react';
import Timer from './timer/Timer';

interface FooterProps {
    className?: string;
    compact?: boolean;
}

const Footer: FunctionComponent<FooterProps> = ({ className, compact: compactProp }) => {
    const isEBN = useIsEBN();
    const isDesktop = useIsElectron();
    const [isRefreshing, setIsRefreshing] = useState(false)
    const { isOnline, isServerConnected, serverChecking } = useConnectivity();

    const compact = compactProp ?? isEBN;

    const handleRefresh = () => {
        setIsRefreshing(true)
        window.location.reload()
    }

    return (
        <div className={classNames(
            className || 'hidden md:flex',
            'justify-between items-center font-medium text-gray-600',
            compact ? 'text-xs py-1 px-3' : 'text-md mb-3 pt-3 px-4'
        )}>
            <Timer showDate={false} iconClassName={compact ? "w-4 h-4" : "w-6 h-6"} />
            <span className={compact ? "hidden lg:inline" : ""}>Zonse247 POS @ {new Date().getFullYear()}</span>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-1"
                        title={isOnline ? 'Internet Connected' : 'No Internet Connection'}
                    >
                        {isOnline ? (
                            <Wifi className={classNames(
                                "text-green-500",
                                compact ? "w-3.5 h-3.5" : "w-5 h-5"
                            )} />
                        ) : (
                            <WifiOff className={classNames(
                                "text-red-500",
                                compact ? "w-3.5 h-3.5" : "w-5 h-5"
                            )} />
                        )}
                        {!compact && (
                            <span className={classNames(
                                'text-xs hidden lg:inline',
                                isOnline ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                            )}>
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        )}
                    </div>

                    {isDesktop ? (
                        <div
                            className="flex items-center gap-1"
                            title={serverChecking ? 'Checking server...' : (isServerConnected ? 'Server Connected' : 'Server Disconnected')}
                        >
                            {serverChecking ? (
                                <Loader2 className={classNames(
                                    "text-sky-500 animate-spin",
                                    compact ? "w-3.5 h-3.5" : "w-5 h-5"
                                )} />
                            ) : isServerConnected ? (
                                <Server className={classNames(
                                    "text-green-500",
                                    compact ? "w-3.5 h-3.5" : "w-5 h-5"
                                )} />
                            ) : (
                                <ServerOff className={classNames(
                                    "text-red-500",
                                    compact ? "w-3.5 h-3.5" : "w-5 h-5"
                                )} />
                            )}
                            {!compact && (
                                <span className={classNames(
                                    'text-xs hidden lg:inline',
                                    serverChecking
                                        ? 'text-sky-500 dark:text-sky-400'
                                        : isServerConnected
                                            ? 'text-green-500 dark:text-green-400'
                                            : 'text-red-500 dark:text-red-400'
                                )}>
                                    {serverChecking ? 'Checking...' : (isServerConnected ? 'Server' : 'No Server')}
                                </span>
                            )}
                        </div>
                    ) : null}

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={classNames(
                            'flex items-center gap-1 rounded-lg transition-all duration-200',
                            'hover:bg-gray-100 dark:hover:bg-gray-800',
                            isRefreshing ? 'cursor-wait opacity-70' : 'cursor-pointer',
                            compact ? 'p-1' : 'p-1.5'
                        )}
                        title="Refresh page"
                    >
                        <RefreshCw className={classNames(
                            'text-gray-500 dark:text-gray-400',
                            isRefreshing && 'animate-spin',
                            compact ? 'w-3.5 h-3.5' : 'w-5 h-5'
                        )} />
                        {!compact && (
                            <span className="text-xs hidden lg:inline text-gray-600 dark:text-gray-400">
                                {isRefreshing ? 'Refreshing...' : 'Refresh'}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Footer