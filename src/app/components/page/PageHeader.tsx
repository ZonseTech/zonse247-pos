import { useIsMobile, useIsElectron } from '../../hooks/useMediaQuery';
import React, { PropsWithChildren, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PageHeaderProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
    compact?: boolean;
    showBackButton?: boolean;
    onBack?: () => void;
}

const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = ({
    title = "Page Title",
    description = "Page description",
    icon,
    action,
    children,
    className = "",
    compact = false,
    showBackButton = false,
    onBack
}) => {
    const isMobile = useIsMobile();
    const isElectron = useIsElectron();
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className={compact
            ? `flex flex-col ${children ? 'border-b border-gray-300 dark:border-gray-600' : ''} mb-2 pb-2 -mx-2 px-2 gap-1 ${className}`
            : `flex flex-col ${children ? 'border-b border-gray-300 dark:border-gray-600' : ''} mb-4 md:pb-4 -mx-4 md:mx-0 px-3 md:px-0 gap-3 md:gap-4 ${className}`
        }>
            <div className={compact
                ? "fixed top-0 left-0 md:left-64 right-0 z-50 bg-white dark:bg-gray-900 flex justify-between items-center gap-2 py-1 px-2 border-b border-gray-300 dark:border-gray-600"
                : "fixed top-0 left-0 md:left-64 right-0 z-50 bg-white dark:bg-gray-900 flex justify-between items-center gap-2 sm:gap-4 py-2 md:py-3 px-3 md:px-4 border-b border-gray-300 dark:border-gray-600"
            }>
                <div className={compact
                    ? "flex items-center gap-2 flex-1 min-w-0"
                    : "flex items-center gap-2 sm:gap-4 flex-1 min-w-0"
                }>
                    {(showBackButton || isMobile) && (
                        <button
                            onClick={handleBack}
                            className={compact
                                ? "flex-shrink-0 p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                                : "flex-shrink-0 p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                            }
                            aria-label="Go back"
                            type='button'
                        >
                            <ArrowLeft className={compact ? "w-5 h-5 text-gray-600 dark:text-gray-400" : "w-6 h-6 text-gray-600 dark:text-gray-400"} />
                        </button>
                    )}
                    {(icon && !isMobile && isElectron) && (
                        <div className={compact
                            ? "flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5"
                            : "flex-shrink-0 [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8"
                        }>
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className={compact
                            ? "text-sm font-bold text-gray-800 dark:text-gray-100 truncate"
                            : "text-lg sm:text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 truncate sm:break-words"
                        }>
                            {title}
                        </h1>
                        {!compact && (
                            <p className="text-xs sm:text-sm hidden md:block text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 break-words">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>

            <div className={compact ? "h-10" : "h-12 md:h-16"} />

            {children && (
                <div className={compact
                    ? "py-1 -mx-2 px-2"
                    : "py-2 md:py-4 md:pt-4 md:pb-0 -mx-3 md:mx-0 px-3 md:px-0"
                }>
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;