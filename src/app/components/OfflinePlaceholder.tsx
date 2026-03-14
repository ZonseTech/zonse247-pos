import { FunctionComponent, useCallback, useState } from 'react';
import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import classNames from 'classnames';
import { useConnectivity } from '../hooks/useConnectivity';

interface OfflinePlaceholderProps {
    title?: string;
    description?: string;
    onRetry?: () => void | Promise<void>;
    className?: string;
    forceShow?: boolean;
    variant?: 'wifi' | 'cloud';
    children?: React.ReactNode;
}

/**
 * OfflinePlaceholder - A placeholder component for pages that require network connectivity.
 * 
 * Use this on pages that fetch data from liveApi and cannot function offline.
 * The component automatically detects network status using useConnectivity hook.
 */
const OfflinePlaceholder: FunctionComponent<OfflinePlaceholderProps> = ({
    title = 'You\'re Offline',
    description = 'This page requires an internet connection to load. Please check your network connection and try again.',
    onRetry,
    className,
    forceShow = false,
    variant = 'wifi',
    children,
}) => {
    const { isOnline, serverChecking } = useConnectivity();
    const [isRetrying, setIsRetrying] = useState(false);

    const handleRetry = useCallback(async () => {
        setIsRetrying(true);
        try {
            if (onRetry) {
                await onRetry();
            } else {
                window.location.reload();
            }
        } finally {
            // Only reset if we haven't navigated away
            setTimeout(() => setIsRetrying(false), 1000);
        }
    }, [onRetry]);

    // Don't show if online (unless forced)
    if (isOnline && !forceShow) {
        return <>{children}</>;
    }

    const IconComponent = variant === 'wifi' ? WifiOff : CloudOff;

    return (
        <div className={classNames(
            'flex flex-col items-center justify-center min-h-[400px] p-8',
            className
        )}>
            <div className="max-w-md w-full text-center">
                {/* Icon Container */}
                <div className="relative mb-6">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800">
                        <IconComponent className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    {/* Animated pulse ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-2 border-gray-200 dark:border-gray-700 animate-ping opacity-20" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">
                    {title}
                </h2>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm md:text-base leading-relaxed">
                    {description}
                </p>

                {/* Network Status Indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className={classNames(
                        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                        isOnline
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}>
                        <span className={classNames(
                            'w-2 h-2 rounded-full',
                            isOnline ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        {serverChecking ? 'Checking connection...' : (isOnline ? 'Connected' : 'No connection')}
                    </span>
                </div>

                {/* Retry Button */}
                <button
                    onClick={handleRetry}
                    disabled={isRetrying || serverChecking}
                    className={classNames(
                        'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200',
                        'bg-sky-500 hover:bg-sky-600 text-white',
                        'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
                        'dark:focus:ring-offset-gray-900',
                        (isRetrying || serverChecking) && 'opacity-70 cursor-not-allowed'
                    )}
                >
                    <RefreshCw className={classNames(
                        'w-5 h-5',
                        (isRetrying || serverChecking) && 'animate-spin'
                    )} />
                    {isRetrying ? 'Retrying...' : serverChecking ? 'Checking...' : 'Try Again'}
                </button>

                {/* Help Text */}
                <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                    Tip: Check your Wi-Fi or mobile data connection
                </p>
            </div>
        </div>
    );
};

export default OfflinePlaceholder;
