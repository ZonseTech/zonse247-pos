import React, { PropsWithChildren, ReactNode } from 'react';

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
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="flex-shrink-0 mt-1">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {description}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {action}
                {children}
            </div>
        </div>
    );
};

export default PageHeader;