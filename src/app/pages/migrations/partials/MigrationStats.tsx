import { FunctionComponent } from 'react';

const MigrationStats: FunctionComponent<{ migrationStats, getProgressPercentage }> = ({ migrationStats, getProgressPercentage }) => (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {migrationStats.total}
                </p>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mt-1">
                    Total Records
                </p>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {migrationStats.completed}
                </p>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mt-1">
                    Completed
                </p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {migrationStats.errors}
                </p>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mt-1">
                    Errors
                </p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {getProgressPercentage()}%
                </p>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-300 mt-1">
                    Progress
                </p>
            </div>
        </div>

        <div className="mt-6">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <span>Migration Progress</span>
                <span>{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${getProgressPercentage()}%` }}
                ></div>
            </div>
        </div>
    </div>
);

export default MigrationStats