import { FC, ReactNode } from 'react';

interface TableEmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    /** Optional action button — e.g. "Clear filters" */
    action?: ReactNode;
}

/**
 * Shared empty-state component for `react-data-table-component`'s `noDataComponent` prop.
 * Provides a consistent look across all inventory pages.
 */
const TableEmptyState: FC<TableEmptyStateProps> = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <span className="[&>svg]:w-8 [&>svg]:h-8 text-gray-400 dark:text-gray-500">
                {icon}
            </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            {description}
        </p>
        {action && <div className="mt-4">{action}</div>}
    </div>
);

export default TableEmptyState;
