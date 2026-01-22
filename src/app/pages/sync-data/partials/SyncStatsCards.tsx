import { FunctionComponent } from 'react';
import {
    HiOutlineDatabase,
    HiOutlineCheck,
    HiOutlineRefresh,
    HiOutlineClock,
    HiOutlineChartBar
} from 'react-icons/hi';
import { HiOutlineExclamationTriangle, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

interface SyncStatsCardsProps {
    tables: SyncTable[];
    autoSyncStatus: AutoSyncStatus | null;
}

const SyncStatsCards: FunctionComponent<SyncStatsCardsProps> = ({ tables, autoSyncStatus }) => {
    const totalTables = tables.length;
    const syncedTables = tables.filter(t => t.status === 'synced').length;
    const pendingTables = tables.filter(t => t.status === 'pending' || t.status === 'syncing').length;
    const errorTables = tables.filter(t => t.status === 'error').length;
    const totalRecords = tables.reduce((acc, t) => acc + t.recordCount, 0);
    const totalSynced = tables.reduce((acc, t) => acc + t.syncedCount, 0);
    const syncPercentage = totalRecords > 0 ? Math.round((totalSynced / totalRecords) * 100) : 0;

    const stats = [
        {
            label: 'Total Tables',
            value: totalTables,
            icon: HiOutlineDatabase,
            color: 'blue',
            bgGradient: 'from-sky-500 to-indigo-600',
            lightBg: 'bg-sky-50 dark:bg-sky-900/20',
        },
        {
            label: 'Synced',
            value: syncedTables,
            icon: HiOutlineCheck,
            color: 'green',
            bgGradient: 'from-green-500 to-emerald-600',
            lightBg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: 'In Progress',
            value: pendingTables,
            icon: HiOutlineRefresh,
            color: 'amber',
            bgGradient: 'from-amber-500 to-orange-600',
            lightBg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            label: 'Errors',
            value: errorTables,
            icon: HiOutlineExclamationTriangle,
            color: 'red',
            bgGradient: 'from-red-500 to-rose-600',
            lightBg: 'bg-red-50 dark:bg-red-900/20',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg bg-gradient-to-br ${stat.bgGradient} shadow-sm`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                    {stat.value}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <HiOutlineChartBar className="w-5 h-5 text-sky-500" />
                            Overall Sync Progress
                        </h3>
                        <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                            {syncPercentage}%
                        </span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 transition-all duration-700"
                            style={{ width: `${syncPercentage}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                            {totalSynced.toLocaleString()} of {totalRecords.toLocaleString()} records
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <HiOutlineArrowTrendingUp className="w-4 h-4 text-green-500" />
                            {tables.reduce((acc, t) => acc + t.pendingCount, 0).toLocaleString()} pending
                        </span>
                    </div>
                </div>

                {/* Auto-Sync Status Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <HiOutlineRefresh className={`w-5 h-5 ${autoSyncStatus?.isRunning ? 'text-green-500 animate-spin' : 'text-slate-400'}`} />
                            Auto-Sync Status
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${autoSyncStatus?.isRunning
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}>
                            {autoSyncStatus?.isRunning ? 'Running' : 'Stopped'}
                        </span>
                    </div>

                    {autoSyncStatus?.isRunning ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">Current Table</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {autoSyncStatus.currentTable || 'Idle'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">In Queue</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {autoSyncStatus.tablesInQueue?.length || 0} tables
                                </span>
                            </div>
                            {autoSyncStatus.progress > 0 && (
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                                        style={{ width: `${autoSyncStatus.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-4 text-slate-400 dark:text-slate-500">
                            <HiOutlineClock className="w-5 h-5 mr-2" />
                            <span>Auto-sync is not running</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SyncStatsCards;
