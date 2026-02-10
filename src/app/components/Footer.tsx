import { useState, useEffect, FunctionComponent } from 'react'
import { useAuth } from '../context/AuthProvider';
import { Clock, Wifi, WifiOff, Server, ServerOff, Loader2, RefreshCw } from 'lucide-react';
import classNames from 'classnames';
import { useConnectivity } from '../hooks/useConnectivity';
import { useIsEBN } from '../hooks/useMediaQuery';

interface FooterProps {
    className?: string;
    compact?: boolean;
}

const Footer: FunctionComponent<FooterProps> = ({ className, compact: compactProp }) => {
    const { user } = useAuth();
    const { isOnline, isServerConnected, serverChecking } = useConnectivity();
    const isEBN = useIsEBN();
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Use prop if provided, otherwise auto-detect EBN
    const compact = compactProp ?? isEBN;

    const handleRefresh = () => {
        setIsRefreshing(true)
        window.location.reload()
    }

    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date())
        }
        const timer = setInterval(updateTime, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    return (
        <div className={classNames(
            className || 'hidden md:flex',
            'justify-between items-center font-medium text-gray-600',
            compact ? 'text-xs py-1 px-3' : 'text-md mb-3 pt-3 px-4'
        )}>
            <div className="flex items-center gap-1.5">
                <Clock className={compact ? "w-4 h-4" : "w-6 h-6"} />
                <span>{formatTime(currentTime)}</span>
            </div>
            <span className={compact ? "hidden lg:inline" : ""}>Zonse247 Pos @ {currentTime.getFullYear()}</span>
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