import { FunctionComponent } from 'react';

interface StatisticsPanelProps {
    categories: Category[];
}

export const StatisticsPanel: FunctionComponent<StatisticsPanelProps> = ({ categories }) => {
    const totalItems = categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0);
    const avgItems = Math.round(totalItems / categories.length || 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</div>
                <div className="text-gray-500 dark:text-gray-400">Total Categories</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
                <div className="text-gray-500 dark:text-gray-400">Total Items</div>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{avgItems}</div>
                <div className="text-gray-500 dark:text-gray-400">Avg Items per Category</div>
            </div>
        </div>
    );
};