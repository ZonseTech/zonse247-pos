import type { FunctionComponent } from 'react';

interface FormSkeletonProps {
    columns?: number;
    sections?: number;
    fieldsPerSection?: number;
    showSidebar?: boolean;
}

const FormSkeleton: FunctionComponent<FormSkeletonProps> = ({
    columns = 3,
    sections = 2,
    fieldsPerSection = 4,
    showSidebar = true
}) => {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>

            <div className={`grid grid-cols-1 ${showSidebar ? `lg:grid-cols-${columns}` : ''} gap-6`}>
                {/* Main Content Skeleton */}
                <div className={`${showSidebar ? 'lg:col-span-2' : ''} space-y-6`}>
                    {[...Array(sections)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                            <div className="grid grid-cols-2 gap-4">
                                {[...Array(fieldsPerSection)].map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Skeleton */}
                {showSidebar && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="space-y-3">
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormSkeleton;
