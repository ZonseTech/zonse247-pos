import { FunctionComponent, useState } from 'react';
import {
    HiOutlineCog,
    HiOutlineRefresh,
    HiOutlineDownload,
    HiOutlineUpload,
    HiOutlineClock,
    HiOutlineX
} from 'react-icons/hi';
import { HiOutlineArrowPath } from 'react-icons/hi2';

interface ConfigureTableModalProps {
    table: SyncTable | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (tableName: string, config: Partial<TableConfig>) => Promise<void>;
    isLoading: boolean;
}

const ConfigureTableModal: FunctionComponent<ConfigureTableModalProps> = ({
    table,
    isOpen,
    onClose,
    onSave,
    isLoading
}) => {
    const [config, setConfig] = useState<Partial<TableConfig>>({
        syncDirection: table?.syncDirection || 'bidirectional',
        autoSyncEnabled: table?.autoSyncEnabled || false,
        syncInterval: table?.syncInterval || 30,
        conflictResolution: 'latest_wins',
        priority: 1
    });

    // Update config when table changes
    useState(() => {
        if (table) {
            setConfig({
                syncDirection: table.syncDirection,
                autoSyncEnabled: table.autoSyncEnabled,
                syncInterval: table.syncInterval,
                conflictResolution: 'latest_wins',
                priority: 1
            });
        }
    });

    if (!isOpen || !table) return null;

    const handleSave = async () => {
        await onSave(table.name, config);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                <HiOutlineCog className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    Configure {table.displayName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Adjust sync settings for this table
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            <HiOutlineX className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-5">
                        {/* Sync Direction */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Sync Direction
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'pull', label: 'Pull Only', icon: HiOutlineDownload },
                                    { value: 'push', label: 'Push Only', icon: HiOutlineUpload },
                                    { value: 'bidirectional', label: 'Both', icon: HiOutlineArrowPath },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setConfig({ ...config, syncDirection: option.value as SyncDirection })}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${config.syncDirection === option.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <option.icon className="w-5 h-5" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Auto Sync Toggle */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <HiOutlineRefresh className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        Auto-sync
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Automatically sync this table
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, autoSyncEnabled: !config.autoSyncEnabled })}
                                className={`relative w-12 h-6 rounded-full transition-colors ${config.autoSyncEnabled
                                        ? 'bg-blue-600'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${config.autoSyncEnabled ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Sync Interval */}
                        {config.autoSyncEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <HiOutlineClock className="w-4 h-4 inline mr-1.5" />
                                    Sync Interval (minutes)
                                </label>
                                <select
                                    value={config.syncInterval}
                                    onChange={(e) => setConfig({ ...config, syncInterval: Number(e.target.value) })}
                                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value={5}>Every 5 minutes</option>
                                    <option value={15}>Every 15 minutes</option>
                                    <option value={30}>Every 30 minutes</option>
                                    <option value={60}>Every hour</option>
                                    <option value={120}>Every 2 hours</option>
                                    <option value={360}>Every 6 hours</option>
                                    <option value={720}>Every 12 hours</option>
                                    <option value={1440}>Every 24 hours</option>
                                </select>
                            </div>
                        )}

                        {/* Conflict Resolution */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Conflict Resolution
                            </label>
                            <select
                                value={config.conflictResolution}
                                onChange={(e) => setConfig({ ...config, conflictResolution: e.target.value as TableConfig['conflictResolution'] })}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="server_wins">Server wins (Remote overwrites local)</option>
                                <option value="client_wins">Client wins (Local overwrites remote)</option>
                                <option value="latest_wins">Latest wins (Most recent change)</option>
                                <option value="manual">Manual (Ask before resolving)</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Sync Priority
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={config.priority}
                                onChange={(e) => setConfig({ ...config, priority: Number(e.target.value) })}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>Low</span>
                                <span>Priority: {config.priority}</span>
                                <span>High</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isLoading && <HiOutlineRefresh className="w-4 h-4 animate-spin" />}
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigureTableModal;
