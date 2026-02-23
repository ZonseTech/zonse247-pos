import type { FunctionComponent } from 'react';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    showCheckbox?: boolean;
    showActions?: boolean;
}

const TableSkeleton: FunctionComponent<TableSkeletonProps> = ({
    rows = 10,
    columns = 6,
    showCheckbox = true,
    showActions = true,
}) => {
    const totalColumns = columns + (showCheckbox ? 1 : 0) + (showActions ? 1 : 0);

    return (
        <div className="w-full animate-pulse">
            {/* Table Header */}
            <div className="flex items-center gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                {showCheckbox && (
                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded" />
                )}
                {[...Array(columns)].map((_, i) => (
                    <div
                        key={`header-${i}`}
                        className="flex-1 h-4 bg-gray-300 dark:bg-gray-600 rounded"
                        style={{ maxWidth: i === 0 ? '200px' : '120px' }}
                    />
                ))}
                {showActions && (
                    <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                )}
            </div>

            {/* Table Rows */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className={`flex items-center gap-4 px-4 py-4 border-b border-gray-100 dark:border-gray-700 ${rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                >
                    {showCheckbox && (
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded" />
                    )}
                    {[...Array(columns)].map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={`flex-1 h-4 rounded ${colIndex === 0
                                    ? 'bg-gray-300 dark:bg-gray-600'
                                    : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            style={{
                                maxWidth: colIndex === 0 ? '200px' : '120px',
                                width: `${60 + Math.random() * 40}%`
                            }}
                        />
                    ))}
                    {showActions && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                        </div>
                    )}
                </div>
            ))}

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="flex gap-1">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableSkeleton;
