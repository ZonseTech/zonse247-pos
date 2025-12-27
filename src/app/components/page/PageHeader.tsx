import React, { PropsWithChildren, ReactNode } from 'react';
import NavBar from '../../navigation/NavBar';

interface PageHeaderProps {
    title?: string;
    description?: string;
    icon?: ReactNode;
    action?: ReactNode;
}

const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = ({
    title = "Page Title",
    description = "Page description",
    icon,
    action,
    children
}) => {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4 gap-4">
            <div className="flex items-center md:items-start gap-3 md:gap-4 flex-1 min-w-0">
                {icon && (
                    <>
                        <div className="md:hidden flex-shrink-0">
                            <NavBar />
                        </div>
                        <div className="hidden md:block flex-shrink-0 mt-1">
                            {icon}
                        </div>
                    </>
                )}
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 break-words">
                        {title}
                    </h1>
                    <p className="text-sm hidden md:text-base text-gray-600 dark:text-gray-400 mt-1 break-words">
                        {description}
                    </p>
                </div>
            </div>

            {(action || children) && (
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {action}
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;