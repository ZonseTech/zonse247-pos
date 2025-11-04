import React, { PropsWithChildren } from 'react';

interface PageHeaderProps {
    title?: string;
    description?: string;
}

const PageHeader: React.FC<PropsWithChildren<PageHeaderProps>> = ({
    title = "User Management",
    description = "Manage workstation users, roles, and permissions",
    children
}) => {
    return (
        <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600">

            <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    {title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                </p>
            </div>

            {children}
        </div>
    );
};

export default PageHeader;