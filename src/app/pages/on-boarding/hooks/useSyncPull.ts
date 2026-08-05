import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import onboardingService from '../../../services/on-boarding.service';

interface UseSyncPullOptions {
    terminal: TerminalWithRelations | null;
    onComplete: (lastSyncTimestamp: string) => void;
}

interface UseSyncPullReturn {
    progress: SyncPullProgress;
    startSync: () => Promise<void>;
    retrySync: () => Promise<void>;
}

/**
 * Hook for managing the initial sync flow during onboarding
 * 
 * Production-grade implementation that:
 * - Processes one table at a time (dependency order)
 * - Fetches data in batches (500 records per batch)
 * - Saves each batch immediately (no memory buildup)
 * - Provides real-time progress per batch
 * - Handles thousands of records gracefully
 * 
 * Flow per table:
 * 1. Fetch batch from cloud via cursor pagination
 * 2. Save batch to local SQLite immediately
 * 3. Update progress
 * 4. Repeat until no more data
 * 5. Move to next table
 */
export function useSyncPull({
    terminal,
    onComplete,
}: UseSyncPullOptions): UseSyncPullReturn {
    const syncInProgressRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastProgressUpdateRef = useRef(0);

    const [progress, setProgress] = useState<SyncPullProgress>({
        status: 'idle',
        tables: onboardingService.getDefaultTableProgress(),
        totalTables: onboardingService.INITIAL_SYNC_TABLES.length,
        completedTables: 0,
        totalRecords: 0,
        fetchedRecords: 0,
        savedRecords: 0,
        lastSyncTimestamp: null,
        error: null,
    });

    /**
     * Execute the initial sync using table-by-table batched approach
     */
    const executeSyncPull = useCallback(async () => {
        if (!terminal || syncInProgressRef.current) return;

        syncInProgressRef.current = true;
        abortControllerRef.current = new AbortController();

        // Reset progress
        const defaultTables = onboardingService.getDefaultTableProgress();
        setProgress({
            status: 'counting',
            tables: defaultTables,
            totalTables: defaultTables.length,
            completedTables: 0,
            totalRecords: 0,
            fetchedRecords: 0,
            savedRecords: 0,
            lastSyncTimestamp: null,
            error: null,
        });

        try {
            toast.info('Starting data synchronization...', { autoClose: 2000 });

            // Execute the professional sync flow
            const result = await onboardingService.performTableByTableSync(
                terminal.terminalId,
                terminal.tenantId,
                terminal.branchId,
                (update) => {
                    const now = Date.now();
                    const shouldThrottle = now - lastProgressUpdateRef.current < 120;

                    if (shouldThrottle && update.phase !== 'completed' && update.phase !== 'failed') {
                        return;
                    }

                    lastProgressUpdateRef.current = now;

                    // Handle progress updates from the service
                    if (update.phase === 'counting') {
                        if (update.counts) {
                            // Update table counts and total records
                            let totalRecords = 0;
                            setProgress(prev => ({
                                ...prev,
                                status: 'counting',
                                tables: prev.tables.map(t => {
                                    const count = update.counts![t.table as keyof typeof update.counts] || 0;
                                    totalRecords += count;
                                    return {
                                        ...t,
                                        totalCount: count,
                                        status: count > 0 ? 'pending' : 'skipped',
                                    };
                                }),
                                totalRecords,
                            }));
                        }
                    } else if (update.phase === 'syncing' && update.currentTable && update.tableProgress) {
                        // Real-time batch progress
                        const { currentTable, currentTableIndex, totalTables, tableProgress } = update;
                        
                        setProgress(prev => {
                            // Calculate running totals
                            let fetchedRecords = 0;
                            let savedRecords = 0;
                            let completedTables = 0;

                            const updatedTables = prev.tables.map((t, idx) => {
                                if (t.table === currentTable) {
                                    // Current table - update with batch progress
                                    fetchedRecords += tableProgress.fetchedCount;
                                    savedRecords += tableProgress.savedCount;
                                    
                                    const isCompleted = !tableProgress.hasMore;
                                    if (isCompleted) completedTables++;

                                    return {
                                        ...t,
                                        status: isCompleted ? 'completed' as SyncTableStatus : 'fetching' as SyncTableStatus,
                                        fetchedCount: tableProgress.fetchedCount,
                                        savedCount: tableProgress.savedCount,
                                    };
                                } else if (idx < (currentTableIndex || 0)) {
                                    // Already completed tables
                                    fetchedRecords += t.fetchedCount;
                                    savedRecords += t.savedCount;
                                    if (t.status === 'completed' || t.status === 'skipped') {
                                        completedTables++;
                                    }
                                    return t;
                                } else {
                                    // Future tables - unchanged
                                    return t;
                                }
                            });

                            return {
                                ...prev,
                                status: 'fetching',
                                currentTable,
                                tables: updatedTables,
                                completedTables,
                                fetchedRecords,
                                savedRecords,
                            };
                        });
                    } else if (update.phase === 'completed' && update.result) {
                        // Sync completed successfully
                        const { tables: resultTables, syncedAt } = update.result;

                        setProgress(prev => {
                            let savedRecords = 0;
                            let completedTables = 0;

                            const updatedTables = prev.tables.map(t => {
                                const tableResult = resultTables.find(r => r.table === t.table);
                                if (tableResult) {
                                    const saved = tableResult.inserted + tableResult.updated;
                                    savedRecords += saved;
                                    completedTables++;
                                    return {
                                        ...t,
                                        savedCount: saved,
                                        status: tableResult.success ? 'completed' as SyncTableStatus : 'failed' as SyncTableStatus,
                                        error: tableResult.errors.length > 0 ? tableResult.errors[0] : null,
                                    };
                                }
                                if (t.totalCount === 0) {
                                    completedTables++;
                                }
                                return t;
                            });

                            return {
                                ...prev,
                                status: 'completed',
                                currentTable: undefined,
                                tables: updatedTables,
                                completedTables,
                                savedRecords,
                                lastSyncTimestamp: syncedAt,
                                error: null,
                            };
                        });
                    } else if (update.phase === 'failed') {
                        // Sync failed
                        setProgress(prev => ({
                            ...prev,
                            status: 'failed',
                            currentTable: undefined,
                            error: update.error || 'Sync failed',
                        }));
                    }
                }
            );

            if (result.success) {
                toast.success('Data synchronized successfully!');
                onComplete(result.syncedAt);
            } else {
                const failedTables = result.tables.filter(t => !t.success);
                toast.warning(`Sync completed with ${failedTables.length} table(s) having errors`);
                // Still call onComplete - partial success is still progress
                onComplete(result.syncedAt);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sync data';

            setProgress(prev => ({
                ...prev,
                status: 'failed',
                error: errorMessage,
                currentTable: undefined,
            }));

            toast.error(errorMessage);
        } finally {
            syncInProgressRef.current = false;
            abortControllerRef.current = null;
        }
    }, [terminal, onComplete]);

    /**
     * Start the sync process
     */
    const startSync = useCallback(async () => {
        await executeSyncPull();
    }, [executeSyncPull]);

    /**
     * Retry the sync process after a failure
     */
    const retrySync = useCallback(async () => {
        await executeSyncPull();
    }, [executeSyncPull]);

    return {
        progress,
        startSync,
        retrySync,
    };
}
