import { useIsMobile, useIsElectron } from '../../hooks/useMediaQuery';
import React, { PropsWithChildren, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { PageHeaderPortal } from '../../context/PageHeaderContext';

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

    const headerContent = (
        <header
            className={`flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 ${className}`}
        >
            {/* Title bar */}
            <div className={compact
                ? "flex justify-between items-center gap-2 py-2 px-4 md:px-6"
                : "flex justify-between items-center gap-3 py-3 md:py-4 px-4 md:px-6"
            }>
                <div className={compact
                    ? "flex items-center gap-2 flex-1 min-w-0"
                    : "flex items-center gap-3 flex-1 min-w-0"
                }>
                    {(showBackButton || isMobile) && (
                        <button
                            onClick={handleBack}
                            className="flex-shrink-0 p-1.5 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                            aria-label="Go back"
                            type="button"
                        >
                            <ArrowLeft className={compact
                                ? "w-4 h-4 text-gray-500 dark:text-gray-400"
                                : "w-5 h-5 text-gray-500 dark:text-gray-400"
                            } />
                        </button>
                    )}
                    {icon && !isMobile && !isElectron && (
                        <div className="flex-shrink-0 [&>svg]:w-6 [&>svg]:h-6">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className={compact
                            ? "text-sm font-semibold text-gray-900 dark:text-gray-100 truncate"
                            : "text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate"
                        }>
                            {title}
                        </h1>
                        {!compact && description && (
                            <p className="text-xs sm:text-sm hidden md:block text-gray-500 dark:text-gray-400 mt-0.5 truncate">
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

            {/* Optional sub-content (filters, tabs, etc.) */}
            {children && (
                <div className={compact
                    ? "px-4 md:px-6 py-1 border-t border-gray-100 dark:border-gray-800"
                    : "px-4 md:px-6 py-2 border-t border-gray-100 dark:border-gray-800"
                }>
                    {children}
                </div>
            )}
        </header>
    );

    return <PageHeaderPortal>{headerContent}</PageHeaderPortal>;
};

export default PageHeader;