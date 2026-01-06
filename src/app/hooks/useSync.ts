import { useState, useEffect, useCallback } from 'react';
import { syncService } from '../services/sync.service';

interface SyncStatus {
    isSyncing: boolean;
    pendingCount: number;
    lastSyncTime: string | null;
    error: string | null;
    autoSyncStatus: AutoSyncStatus | null;
    tables: SyncTable[];
}

export const useSync = () => {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null,
        error: null,
        autoSyncStatus: null,
        tables: [],
    });

    const fetchPendingCount = useCallback(async () => {
        try {
            const tables = await syncService.getTables();
            const pendingTables = tables.filter(
                (table) => table.status === 'pending' || table.status === 'error'
            );
            const totalPending = pendingTables.reduce(
                (acc, table) => acc + (table.pendingCount || 0),
                0
            );

            setSyncStatus((prev) => ({
                ...prev,
                tables,
                pendingCount: pendingTables.length > 0 ? pendingTables.length : totalPending,
                error: null,
            }));
        } catch (error) {
            console.error('Error fetching pending sync count:', error);
            setSyncStatus((prev) => ({
                ...prev,
                error: 'Failed to fetch sync status',
            }));
        }
    }, []);

    const fetchAutoSyncStatus = useCallback(async () => {
        try {
            const status = await syncService.getAutoSyncStatus();
            setSyncStatus((prev) => ({
                ...prev,
                autoSyncStatus: status,
            }));
        } catch {
            // Silently fail - auto-sync status endpoint may not be available
            // This is expected in desktop builds or when backend is offline
        }
    }, []);

    const startSync = useCallback(async (action: SyncAction = 'push') => {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

        try {
            const tables = await syncService.getTables();
            const pendingTableNames = tables
                .filter((table) => table.status === 'pending' || table.status === 'error')
                .map((table) => table.name);

            if (pendingTableNames.length > 0) {
                await syncService.bulkSync(pendingTableNames, action);
            }

            setSyncStatus((prev) => ({
                ...prev,
                isSyncing: false,
                pendingCount: 0,
                lastSyncTime: new Date().toISOString(),
            }));
        } catch (error) {
            console.error('Error during sync:', error);
            setSyncStatus((prev) => ({
                ...prev,
                isSyncing: false,
                error: 'Sync failed',
            }));
        }
    }, []);

    const startAutoSync = useCallback(async (tableNames?: string[], interval?: number) => {
        try {
            const response = await syncService.startAutoSync(tableNames, interval);
            if (response.success && response.data) {
                setSyncStatus((prev) => ({
                    ...prev,
                    autoSyncStatus: response.data!,
                }));
            }
            return response;
        } catch (error) {
            console.error('Error starting auto-sync:', error);
            throw error;
        }
    }, []);

    const stopAutoSync = useCallback(async () => {
        try {
            const response = await syncService.stopAutoSync();
            if (response.success) {
                setSyncStatus((prev) => ({
                    ...prev,
                    autoSyncStatus: null,
                }));
            }
            return response;
        } catch (error) {
            console.error('Error stopping auto-sync:', error);
            throw error;
        }
    }, []);

    const setIsSyncing = useCallback((syncing: boolean) => {
        setSyncStatus((prev) => ({ ...prev, isSyncing: syncing }));
    }, []);

    // Poll for pending count periodically
    useEffect(() => {
        fetchPendingCount();
        fetchAutoSyncStatus();
        const interval = setInterval(() => {
            fetchPendingCount();
            fetchAutoSyncStatus();
        }, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [fetchPendingCount, fetchAutoSyncStatus]);

    return {
        ...syncStatus,
        startSync,
        startAutoSync,
        stopAutoSync,
        setIsSyncing,
        refreshPendingCount: fetchPendingCount,
        refreshAutoSyncStatus: fetchAutoSyncStatus,
    };
};
