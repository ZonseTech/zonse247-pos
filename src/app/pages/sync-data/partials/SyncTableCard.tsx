import { FunctionComponent, useState } from 'react';
import {
    HiOutlineDatabase,
    HiOutlineDownload,
    HiOutlineUpload,
    HiOutlineRefresh,
    HiOutlineClock,
    HiOutlineCheck,
    HiOutlineCog,
    HiOutlineChartBar,
    HiOutlineEye
} from 'react-icons/hi';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath } from 'react-icons/hi2';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface SyncTableCardProps {
    table: SyncTable;
    onPull: (tableName: string) => void;
    onPush: (tableName: string) => void;
    onBidirectional: (tableName: string) => void;
    onConfigure: (table: SyncTable) => void;
    onViewRecords: (tableName: string) => void;
    isLoading: Record<string, boolean>;
}

const SyncTableCard: FunctionComponent<SyncTableCardProps> = ({
    table,
    onPull,
    onPush,
    onBidirectional,
    onConfigure,
    onViewRecords,
    isLoading,
}) => {
    const getStatusColor = (status: SyncStatus) => {
        const colors = {
            idle: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            syncing: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
            synced: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
            pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
            error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
            paused: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        };
        return colors[status] || colors.idle;
    };

    const getStatusIcon = (status: SyncStatus) => {
        const icons = {
            idle: <HiOutlineDatabase className="w-4 h-4" />,
            syncing: <HiOutlineRefresh className="w-4 h-4 animate-spin" />,
            synced: <HiOutlineCheck className="w-4 h-4" />,
            pending: <HiOutlineClock className="w-4 h-4" />,
            error: <HiOutlineExclamationTriangle className="w-4 h-4" />,
            paused: <HiOutlineClock className="w-4 h-4" />,
        };
        return icons[status] || icons.idle;
    };

    const getDirectionIcon = (direction: SyncDirection) => {
        const icons = {
            pull: <HiOutlineDownload className="w-4 h-4" />,
            push: <HiOutlineUpload className="w-4 h-4" />,
            bidirectional: <HiOutlineArrowPath className="w-4 h-4" />,
        };
        return icons[direction] || icons.bidirectional;
    };

    const syncProgress = table.recordCount > 0
        ? Math.round((table.syncedCount / table.recordCount) * 100)
        : 0;

    const isSyncing = isLoading[`${table.name}-pull`] ||
        isLoading[`${table.name}-push`] ||
        isLoading[`${table.name}-bidirectional`] ||
        table.status === 'syncing';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg shadow-sm">
                            <HiOutlineDatabase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {table.displayName}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {table.description}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                            {getStatusIcon(table.status)}
                            {table.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            {table.recordCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                    </div>
                    <div className="text-center border-x border-slate-200 dark:border-slate-700">
                        <p className="text-2xl font-bold text-green-500 dark:text-green-400">
                            {table.syncedCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Synced</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                            {table.pendingCount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Sync Progress</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{syncProgress}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${syncProgress === 100
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                                }`}
                            style={{ width: `${syncProgress}%` }}
                        />
                    </div>
                </div>

                {/* Last Sync */}
                <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <HiOutlineClock className="w-3.5 h-3.5" />
                        Last sync: {table.lastSyncAt ? dayjs(table.lastSyncAt).fromNow() : 'Never'}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        {getDirectionIcon(table.syncDirection)}
                        {table.syncDirection}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPull(table.name)}
                        disabled={isSyncing}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-700 disabled:bg-sky-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {isLoading[`${table.name}-pull`] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineDownload className="w-4 h-4" />
                        )}
                        Pull
                    </button>
                    <button
                        onClick={() => onPush(table.name)}
                        disabled={isSyncing}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {isLoading[`${table.name}-push`] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineUpload className="w-4 h-4" />
                        )}
                        Push
                    </button>
                    <button
                        onClick={() => onBidirectional(table.name)}
                        disabled={isSyncing}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {isLoading[`${table.name}-bidirectional`] ? (
                            <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        ) : (
                            <HiOutlineArrowPath className="w-4 h-4" />
                        )}
                        Sync
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => onViewRecords(table.name)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                    >
                        <HiOutlineEye className="w-4 h-4" />
                        View Records
                    </button>
                    <button
                        onClick={() => onConfigure(table)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                    >
                        <HiOutlineCog className="w-4 h-4" />
                        Configure
                    </button>
                </div>
            </div>

            {/* Auto-sync indicator */}
            {table.autoSyncEnabled && (
                <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-t border-green-100 dark:border-green-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                            <HiOutlineRefresh className="w-3.5 h-3.5" />
                            Auto-sync enabled
                        </span>
                        <span className="text-green-500 dark:text-green-500">
                            Every {table.syncInterval} min
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyncTableCard;
