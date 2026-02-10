import React, { useState, useCallback, useEffect } from 'react';
import {
    HiOutlineArrowRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlineExclamation,
    HiOutlineRefresh,
    HiOutlinePlay,
    HiOutlineDatabase,
    HiOutlineChartBar,
} from 'react-icons/hi';
import { FaSpinner } from 'react-icons/fa';
import { migrationService, type MigrationStatus, type MigrationRunResult } from '../../../services/migration.service';
import { Button } from '../../../components';

interface TransactionToSaleMigrationProps {
    onMigrationComplete?: (result: MigrationRunResult) => void;
}

const TransactionToSaleMigration: React.FC<TransactionToSaleMigrationProps> = ({
    onMigrationComplete
}) => {
    // Configuration state
    const [batchSize, setBatchSize] = useState<number>(100);
    const [dryRun, setDryRun] = useState<boolean>(true);

    // Status state
    const [status, setStatus] = useState<MigrationStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    // Migration state
    const [isMigrating, setIsMigrating] = useState(false);
    const [result, setResult] = useState<MigrationRunResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load migration status on mount
    const loadStatus = useCallback(async () => {
        setIsLoadingStatus(true);
        setError(null);
        try {
            const migrationStatus = await migrationService.getStatus();
            setStatus(migrationStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load migration status');
        } finally {
            setIsLoadingStatus(false);
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    const handleRunMigration = useCallback(async () => {
        setIsMigrating(true);
        setError(null);
        setResult(null);

        try {
            const migrationResult = await migrationService.runMigration({
                dryRun,
                batchSize,
            });
            setResult(migrationResult);
            onMigrationComplete?.(migrationResult);

            // Refresh status after migration
            if (!dryRun) {
                await loadStatus();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Migration failed');
        } finally {
            setIsMigrating(false);
        }
    }, [dryRun, batchSize, onMigrationComplete, loadStatus]);

    const getProgressPercentage = () => {
        if (!status || status.totalTransactions === 0) return 0;
        return Math.round((status.migratedCount / status.totalTransactions) * 100);
    };

    return (
        <div className="space-y-6">

            {/* Migration Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HiOutlineChartBar className="w-5 h-5 text-sky-500 dark:text-sky-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Migration Status</h3>
                    </div>
                    <Button
                        onClick={loadStatus}
                        disabled={isLoadingStatus}
                        size="small"
                        layout="outline"
                        className="flex items-center gap-1.5"
                    >
                        {isLoadingStatus ? (
                            <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <HiOutlineRefresh className="w-3.5 h-3.5" />
                        )}
                        Refresh
                    </Button>
                </div>

                <div className="p-5">
                    {isLoadingStatus && !status ? (
                        <div className="flex items-center justify-center py-8">
                            <FaSpinner className="w-6 h-6 text-sky-500 animate-spin" />
                            <span className="ml-2 text-gray-500">Loading status...</span>
                        </div>
                    ) : status ? (
                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Migration Progress</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {getProgressPercentage()}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${status.isComplete
                                            ? 'bg-green-500'
                                            : 'bg-sky-500'
                                            }`}
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    />
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {status.totalTransactions}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Transactions</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-green-500 dark:text-green-400">
                                        {status.migratedCount}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Migrated</p>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {status.pendingCount}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pending</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                                        {status.failedCount}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failed</p>
                                </div>
                            </div>

                            {/* Completion Badge */}
                            {status.isComplete && (
                                <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                        Migration Complete
                                    </span>
                                </div>
                            )}

                            {status.lastMigrationDate && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Last migration: {new Date(status.lastMigrationDate).toLocaleString()}
                                </p>
                            )}
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-8 text-red-500">
                            <HiOutlineExclamation className="w-5 h-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Migration Configuration */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <HiOutlineDatabase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Run Migration</h3>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Configuration Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Batch Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Batch Size
                            </label>
                            <input
                                type="number"
                                min={10}
                                max={500}
                                value={batchSize}
                                onChange={(e) => setBatchSize(Math.min(500, Math.max(10, parseInt(e.target.value) || 100)))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Records processed per batch (10-500)</p>
                        </div>

                        {/* Dry Run Toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Mode
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setDryRun(true)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${dryRun
                                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 ring-2 ring-sky-500'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Dry Run (Preview)
                                </button>
                                <button
                                    onClick={() => setDryRun(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!dryRun
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 ring-2 ring-green-500'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    Live Migration
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {dryRun
                                    ? 'Preview mode - no changes will be made'
                                    : '⚠️ This will permanently migrate transactions'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Warning for Live Migration */}
                    {!dryRun && (
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <HiOutlineExclamation className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Live Migration Mode
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                    This will permanently convert transaction records to sales. Make sure you have a backup before proceeding.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && !isLoadingStatus && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <HiOutlineXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
                                <p className="text-sm text-red-500 dark:text-red-300 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Result Display */}
                    {result && (
                        <div className={`p-4 rounded-lg border ${result.success
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <HiOutlineCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <HiOutlineXCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                                        }`}>
                                        {result.dryRun ? '(Dry Run) ' : ''}{result.message}
                                    </p>

                                    <div className="grid grid-cols-3 gap-4 mt-3">
                                        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                            <p className="text-lg font-bold text-green-500">{result.migratedCount}</p>
                                            <p className="text-xs text-gray-500">{result.dryRun ? 'Would Migrate' : 'Migrated'}</p>
                                        </div>
                                        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                            <p className="text-lg font-bold text-yellow-600">{result.skippedCount}</p>
                                            <p className="text-xs text-gray-500">Skipped</p>
                                        </div>
                                        <div className="text-center p-2 bg-white dark:bg-gray-800 rounded">
                                            <p className="text-lg font-bold text-red-500">{result.failedCount}</p>
                                            <p className="text-xs text-gray-500">Failed</p>
                                        </div>
                                    </div>

                                    {result.errors && result.errors.length > 0 && (
                                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded max-h-32 overflow-auto">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Errors:</p>
                                            {result.errors.map((err, i) => (
                                                <p key={i} className="text-xs text-red-500 dark:text-red-400">
                                                    {err.id}: {err.error}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            onClick={handleRunMigration}
                            disabled={isMigrating || (status?.isComplete && !dryRun)}
                            theme={dryRun ? 'primary' : 'success'}
                            className="flex items-center gap-2"
                        >
                            {isMigrating ? (
                                <FaSpinner className="w-4 h-4 animate-spin" />
                            ) : (
                                <HiOutlinePlay className="w-4 h-4" />
                            )}
                            {isMigrating
                                ? 'Running...'
                                : dryRun
                                    ? 'Preview Migration'
                                    : 'Start Migration'
                            }
                        </Button>

                        {result && (
                            <Button
                                onClick={() => { setResult(null); setError(null); }}
                                theme="neutral"
                                className="flex items-center gap-2"
                            >
                                <HiOutlineRefresh className="w-4 h-4" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionToSaleMigration;
