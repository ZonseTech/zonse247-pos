import NavBar from '../../navigation/NavBar';
import { useIsMobile } from '../../hooks/useMediaQuery';
import React, { PropsWithChildren, ReactNode } from 'react';

interface PageHeaderProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = ({
    title = "Page Title",
    description = "Page description",
    icon,
    action,
    children,
    className = ""
}) => {
    const isMobile = useIsMobile();

    return (
        <div className={`flex flex-col border-b border-gray-300 dark:border-gray-600 mb-4 md:pb-4 -mx-4 md:mx-0 md:px-0 gap-4 ${className}`}>
            <div className="flex justify-between items-center md:items-center gap-4">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    {icon && (
                        <div className='flex flex-col'>
                            {isMobile && (
                                <div className="relative flex-shrink-0 bg-white dark:bg-gray-800">
                                    <NavBar />
                                </div>
                            )}
                            {!isMobile && (
                                <div className="flex-shrink-0 mt-1">
                                    {icon}
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 break-words">
                            {title}
                        </h1>
                        <p className="text-sm hidden md:block text-gray-600 dark:text-gray-400 mt-1 break-words">
                            {description}
                        </p>
                    </div>
                </div>

                {action && (
                    <div className="flex-shrink-0 mx-4">
                        {action}
                    </div>
                )}
            </div>

            {children && (
                <div className="py-4 md:pt-4 md:pb-0 md:px-0 border-t border-gray-200 dark:border-gray-700">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;