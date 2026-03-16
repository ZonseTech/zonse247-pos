import { FunctionComponent, useState } from 'react';
import {
    XCircle,
    Loader2,
    AlertTriangle,
    Download,
    Database,
    RefreshCw,
    Cloud,
    HardDrive,
    SkipForward,
    ChevronDown,
    ChevronUp,
    Check
} from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import type { SyncProgressViewProps } from '../types';
import { camelCaseToReadable } from '../../../utils';

/**
 * Get icon and styles for table sync status
 */
const getStatusDisplay = (status: SyncTableStatus) => {
    switch (status) {
        case 'fetching':
            return {
                icon: <Cloud className="w-4 h-4 animate-pulse" />,
                text: 'Fetching...',
                bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                textColor: 'text-blue-600 dark:text-blue-400',
                borderColor: 'border-blue-200 dark:border-blue-800'
            };
        case 'saving':
            return {
                icon: <HardDrive className="w-4 h-4 animate-pulse" />,
                text: 'Saving...',
                bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                textColor: 'text-amber-600 dark:text-amber-400',
                borderColor: 'border-amber-200 dark:border-amber-800'
            };
        case 'completed':
            return {
                icon: <Check className="w-4 h-4" />,
                text: 'Completed',
                bgColor: 'bg-green-100 dark:bg-green-900/30',
                textColor: 'text-green-600 dark:text-green-400',
                borderColor: 'border-green-200 dark:border-green-800'
            };
        case 'failed':
            return {
                icon: <XCircle className="w-4 h-4" />,
                text: 'Failed',
                bgColor: 'bg-red-100 dark:bg-red-900/30',
                textColor: 'text-red-600 dark:text-red-400',
                borderColor: 'border-red-200 dark:border-red-800'
            };
        case 'skipped':
            return {
                icon: <SkipForward className="w-4 h-4" />,
                text: 'Skipped',
                bgColor: 'bg-gray-100 dark:bg-gray-800/50',
                textColor: 'text-gray-500 dark:text-gray-400',
                borderColor: 'border-gray-200 dark:border-gray-700'
            };
        case 'pending':
        default:
            return {
                icon: <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />,
                text: 'Pending',
                bgColor: 'bg-gray-50 dark:bg-gray-800/50',
                textColor: 'text-gray-500 dark:text-gray-400',
                borderColor: 'border-gray-200 dark:border-gray-700'
            };
    }
};

const TableProgressItem: FunctionComponent<{
    table: SyncTableProgress;
}> = ({ table }) => {
    const display = getStatusDisplay(table.status);
    const progressText = table.status === 'completed' || table.status === 'failed'
        ? `${table.savedCount} of ${table.totalCount} saved`
        : table.status === 'fetching'
            ? `${table.fetchedCount} of ${table.totalCount} fetched`
            : table.status === 'saving'
                ? `${table.savedCount} of ${table.fetchedCount} saving`
                : table.totalCount > 0
                    ? `${table.totalCount} records`
                    : '';

    return (
        <div className="flex items-center gap-2 py-1.5 px-2 rounded border border-gray-100 dark:border-gray-800">
            <span className={display.textColor}>{display.icon}</span>
            <span className="text-sm text-gray-900 dark:text-gray-100 flex-1 truncate">
                {table.label}
            </span>
            {table.error ? (
                <span className="text-xs text-red-500 dark:text-red-400 truncate max-w-[120px]">
                    {table.error}
                </span>
            ) : progressText ? (
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {progressText}
                </span>
            ) : null}
        </div>
    );
};

/**
 * Main sync progress view
 * Shows users what data is being loaded from cloud and saved locally
 */
const SyncProgressView: FunctionComponent<SyncProgressViewProps> = ({
    terminal,
    progress,
    onComplete,
    onRetry,
}) => {
    const progressPercentage = progress.totalTables > 0
        ? Math.round((progress.completedTables / progress.totalTables) * 100)
        : 0;

    const recordsPercentage = progress.totalRecords > 0
        ? Math.round((progress.savedRecords / progress.totalRecords) * 100)
        : 0;

    const isComplete = progress.status === 'completed';
    const hasFailed = progress.status === 'failed';
    const isInProgress = progress.status === 'counting' || progress.status === 'fetching' || progress.status === 'saving';

    const [showDetails, setShowDetails] = useState(false);

    return (
        <AuthLayout className="">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                        {isInProgress ? (
                            <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                        ) : isComplete ? (
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        ) : hasFailed ? (
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        ) : (
                            <Database className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {isComplete
                            ? 'Setup Complete!'
                            : hasFailed
                                ? 'Setup Failed'
                                : 'Setting Up Your Terminal'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {isComplete
                            ? 'All data has been synchronized successfully'
                            : hasFailed
                                ? 'Some data failed to sync. You can retry or continue.'
                                : 'Synchronizing data from cloud to your device'}
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Terminal</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {terminal.terminalLabel}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Branch</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                {terminal.branch?.branchName || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            {progress.status === 'counting' && (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Counting records...
                                </span>
                            )}
                            {progress.status === 'fetching' && (
                                <span className="flex items-center gap-1">
                                    <Download className="w-4 h-4" />
                                    Fetching: {progress.currentTable ? camelCaseToReadable(progress.currentTable) : 'data'}...
                                </span>
                            )}
                            {progress.status === 'saving' && (
                                <span className="flex items-center gap-1">
                                    <Database className="w-4 h-4" />
                                    Saving to local database...
                                </span>
                            )}
                            {progress.status === 'completed' && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                    <Check className="w-4 h-4" />
                                    Sync completed
                                </span>
                            )}
                            {progress.status === 'idle' && 'Ready to sync'}
                            {progress.status === 'failed' && (
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <XCircle className="w-4 h-4" />
                                    Sync failed
                                </span>
                            )}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                            {progressPercentage}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${hasFailed
                                ? 'bg-red-500'
                                : isComplete
                                    ? 'bg-green-500'
                                    : 'bg-primary-500'
                                }`}
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{progress.completedTables} of {progress.totalTables} tables</span>
                        <span>{progress.savedRecords.toLocaleString()} of {progress.totalRecords.toLocaleString()} records ({recordsPercentage}%)</span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors mb-2"
                    >
                        {showDetails ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                        {showDetails ? 'Hide details' : 'Show details'}
                    </button>
                    {showDetails && (
                        <div className="space-y-1 max-h-[300px] overflow-y-auto">
                            {progress.tables.map((table) => (
                                <TableProgressItem key={table.table} table={table} />
                            ))}
                        </div>
                    )}
                </div>

                {progress.error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Sync Error
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                    {progress.error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    {hasFailed && (
                        <button
                            onClick={onRetry}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Retry Sync
                        </button>
                    )}

                    {(isComplete || hasFailed) && (
                        <button
                            onClick={onComplete}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${isComplete
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-white'
                                }`}
                        >
                            <Check className="w-5 h-5" />
                            {isComplete ? 'Complete Setup' : 'Continue Anyway'}
                        </button>
                    )}
                </div>

                {progress.lastSyncTimestamp && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        Last sync: {new Date(progress.lastSyncTimestamp).toLocaleString()}
                    </p>
                )}
            </div>
        </AuthLayout>
    );
};

export default SyncProgressView;
