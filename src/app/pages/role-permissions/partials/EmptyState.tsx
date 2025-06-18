import React from 'react';

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => {
    return (
        <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="mt-4 bg-green-600 text-white dark:text-gray-100 px-4 py-2 rounded-sm hover:bg-green-700"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};