import { FunctionComponent } from 'react';
import {
    HiOutlineRefresh,
    HiOutlineDownload,
    HiOutlineUpload,
    HiOutlinePlay,
    HiOutlineStop,
    HiOutlineCog
} from 'react-icons/hi';
import { HiOutlineArrowPath } from 'react-icons/hi2';

interface SyncActionsBarProps {
    tables: SyncTable[];
    autoSyncStatus: AutoSyncStatus | null;
    onRefresh: () => void;
    onPullAll: () => void;
    onPushAll: () => void;
    onBidirectionalAll: () => void;
    onStartAutoSync: () => void;
    onStopAutoSync: () => void;
    isLoading: Record<string, boolean>;
}

const SyncActionsBar: FunctionComponent<SyncActionsBarProps> = ({
    tables,
    autoSyncStatus,
    onRefresh,
    onPullAll,
    onPushAll,
    onBidirectionalAll,
    onStartAutoSync,
    onStopAutoSync,
    isLoading
}) => {
    const isBulkSyncing = isLoading['bulk-pull'] || isLoading['bulk-push'] || isLoading['bulk-bidirectional'];
    const isAutoSyncRunning = autoSyncStatus?.isRunning || false;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left: Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
                        Bulk Actions:
                    </span>
                    <button
                        onClick={onRefresh}
                        disabled={isLoading['refresh']}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlineRefresh className={`w-4 h-4 ${isLoading['refresh'] ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={onPullAll}
                        disabled={isBulkSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading['bulk-pull'] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineDownload className="w-4 h-4" />
                        )}
                        Pull All
                    </button>
                    <button
                        onClick={onPushAll}
                        disabled={isBulkSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading['bulk-push'] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineUpload className="w-4 h-4" />
                        )}
                        Push All
                    </button>
                    <button
                        onClick={onBidirectionalAll}
                        disabled={isBulkSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-400 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading['bulk-bidirectional'] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineArrowPath className="w-4 h-4" />
                        )}
                        Sync All
                    </button>
                </div>

                {/* Right: Auto-Sync Controls */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Auto-Sync:
                    </span>
                    {isAutoSyncRunning ? (
                        <button
                            onClick={onStopAutoSync}
                            disabled={isLoading['auto-sync-stop']}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading['auto-sync-stop'] ? (
                                <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                            ) : (
                                <HiOutlineStop className="w-4 h-4" />
                            )}
                            Stop Auto-Sync
                        </button>
                    ) : (
                        <button
                            onClick={onStartAutoSync}
                            disabled={isLoading['auto-sync-start']}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading['auto-sync-start'] ? (
                                <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                            ) : (
                                <HiOutlinePlay className="w-4 h-4" />
                            )}
                            Start Auto-Sync
                        </button>
                    )}
                </div>
            </div>

            {/* Progress indicator for bulk operations */}
            {isBulkSyncing && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">
                            Syncing {tables.filter(t => t.status === 'syncing').length} of {tables.length} tables...
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {Math.round((tables.filter(t => t.status === 'synced').length / tables.length) * 100)}%
                        </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{
                                width: `${(tables.filter(t => t.status === 'synced').length / tables.length) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyncActionsBar;
