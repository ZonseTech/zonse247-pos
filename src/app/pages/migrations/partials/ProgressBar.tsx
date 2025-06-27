import { FunctionComponent } from "react";

export const ProgressBar: FunctionComponent<{ getStatusIcon, migrationProgress }> = ({ getStatusIcon, migrationProgress }) => (
    <div className="p-6">
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {migrationProgress.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0">
                        {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.table || item.message}
                        </p>
                        {item.details && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.details}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.timestamp}
                        </p>
                        {item.recordCount && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                {item.recordCount} records
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);