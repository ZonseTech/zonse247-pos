import { useState, useEffect, FunctionComponent } from 'react'
import { useAuth } from '../context/AuthProvider';
import { Clock, Wifi, WifiOff, Server, ServerOff, Loader2 } from 'lucide-react';
import classNames from 'classnames';
import { useConnectivity } from '../hooks/useConnectivity';

const Footer: FunctionComponent<{ className?: string }> = ({ className }) => {
    const { user } = useAuth();
    const { isOnline, isServerConnected, serverChecking } = useConnectivity();
    const [currentTime, setCurrentTime] = useState(new Date())

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
            'justify-between items-center text-md font-medium text-gray-600 mb-3 pt-3 px-4'
        )}>
            <div className="flex items-center gap-2">
                <Clock className="w-6 h-6" />
                <span>{formatTime(currentTime)}</span>
            </div>
            <span>Zonse247 Pos @ {currentTime.getFullYear()}</span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center gap-1.5"
                        title={isOnline ? 'Internet Connected' : 'No Internet Connection'}
                    >
                        {isOnline ? (
                            <Wifi className="w-5 h-5 text-green-500" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-500" />
                        )}
                        <span className={classNames(
                            'text-xs hidden lg:inline',
                            isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>

                    <div
                        className="flex items-center gap-1.5"
                        title={serverChecking ? 'Checking server...' : (isServerConnected ? 'Server Connected' : 'Server Disconnected')}
                    >
                        {serverChecking ? (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : isServerConnected ? (
                            <Server className="w-5 h-5 text-green-500" />
                        ) : (
                            <ServerOff className="w-5 h-5 text-red-500" />
                        )}
                        <span className={classNames(
                            'text-xs hidden lg:inline',
                            serverChecking
                                ? 'text-blue-600 dark:text-blue-400'
                                : isServerConnected
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                        )}>
                            {serverChecking ? 'Checking...' : (isServerConnected ? 'Server' : 'No Server')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer