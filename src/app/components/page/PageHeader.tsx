import React from 'react';

interface PageHeaderProps {
    title?: string;
    description?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title = "User Management",
    description = "Manage workstation users, roles, and permissions"
}) => {
    return (
        <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
                {description}
            </p>
        </div>
    );
};

export default PageHeader;