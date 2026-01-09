import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';
import printAgentAdapter from '../adapter/print-agent-adapter';

interface UsePrintJobsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
    useNativeAgent?: boolean; // Use Electron print agent when available
}

interface UsePrintJobsReturn {
    printJobs: PrintJob[];
    queueStatus: PrintQueueStatus | null;
    isLoading: boolean;
    isRefreshing: boolean;
    isNative: boolean;
    totalJobs: number;
    pendingCount: number;
    printingCount: number;
    completedCount: number;
    failedCount: number;
    cancelledCount: number;
    loadPendingJobs: () => Promise<void>;
    loadJobHistory: (printerId: string) => Promise<void>;
    loadQueueStatus: () => Promise<void>;
    cancelJob: (jobId: string) => Promise<boolean>;
    retryJob: (jobId: string) => Promise<boolean>;
    retryAllFailedJobs: () => Promise<number>;
    clearQueue: () => Promise<number>;
    cleanupJobs: (daysOld?: number) => Promise<number>;
    refreshJobs: () => Promise<void>;
}

export const usePrintJobs = (options: UsePrintJobsOptions = {}): UsePrintJobsReturn => {
    const { autoRefresh = false, refreshInterval = 30000, useNativeAgent = true } = options;

    const isNative = useNativeAgent && printAgentAdapter.isNativeAvailable();

    const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
    const [queueStatus, setQueueStatus] = useState<PrintQueueStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPrinterId, setCurrentPrinterId] = useState<string | null>(null);

    const loadPendingJobs = useCallback(async () => {
        setIsLoading(true);
        setCurrentPrinterId(null);
        try {
            const jobs = await printerService.getPendingJobs();
            setPrintJobs(jobs);
        } catch (error: any) {
            console.error('Error loading pending print jobs:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load pending print jobs';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadQueueStatus = useCallback(async () => {
        try {
            // Use native adapter when available
            if (isNative) {
                const status = await printAgentAdapter.getQueueStatus();
                setQueueStatus(status);
            } else {
                const status = await printerService.getQueueStatus();
                setQueueStatus(status);
            }
        } catch (error: any) {
            console.error('Error loading queue status:', error);
        }
    }, [isNative]);

    const loadJobHistory = useCallback(async (printerId: string) => {
        setIsLoading(true);
        setCurrentPrinterId(printerId);
        try {
            const jobs = await printerService.getJobHistory(printerId);
            setPrintJobs(jobs);
        } catch (error: any) {
            console.error('Error loading print job history:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load print job history';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const cancelJob = useCallback(async (jobId: string): Promise<boolean> => {
        try {
            await printerService.cancelJob(jobId);
            Notify.success('Print job cancelled successfully');
            // Refresh the current view
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
            return true;
        } catch (error: any) {
            console.error('Error cancelling print job:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to cancel print job';
            Notify.failure(errorMessage);
            return false;
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    const retryJob = useCallback(async (jobId: string): Promise<boolean> => {
        try {
            // Use native adapter when available
            if (isNative) {
                await printAgentAdapter.retryJob(jobId);
            } else {
                await printerService.retryJob(jobId);
            }
            Notify.success('Print job queued for retry');
            // Refresh the current view
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
            return true;
        } catch (error: any) {
            console.error('Error retrying print job:', error);
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to retry print job';
            Notify.failure(errorMessage);
            return false;
        }
    }, [isNative, currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    const retryAllFailedJobs = useCallback(async (): Promise<number> => {
        try {
            let affected = 0;
            // Use native adapter when available
            if (isNative) {
                const result = await printAgentAdapter.retryAllFailed();
                affected = result.affected;
                Notify.success(`Retrying ${affected} failed job(s)`);
            } else {
                const result = await printerService.retryAllFailedJobs();
                affected = result.affected;
                Notify.success(result.message || `Retrying ${affected} failed job(s)`);
            }
            // Refresh current view
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
            return affected;
        } catch (error: any) {
            console.error('Error retrying all failed jobs:', error);
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to retry jobs';
            Notify.failure(errorMessage);
            return 0;
        }
    }, [isNative, currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    const clearQueue = useCallback(async (): Promise<number> => {
        try {
            let affected = 0;
            // Use native adapter when available
            if (isNative) {
                const result = await printAgentAdapter.clearQueue();
                affected = result.affected;
                Notify.success(`Cleared ${affected} job(s) from queue`);
            } else {
                const result = await printerService.clearQueue();
                affected = result.affected;
                Notify.success(result.message || `Cleared ${affected} job(s) from queue`);
            }
            // Refresh current view
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
            return affected;
        } catch (error: any) {
            console.error('Error clearing queue:', error);
            const errorMessage = error?.message || error?.response?.data?.message || 'Failed to clear queue';
            Notify.failure(errorMessage);
            return 0;
        }
    }, [isNative, currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    const cleanupJobs = useCallback(async (daysOld: number = 30): Promise<number> => {
        try {
            const result = await printerService.cleanupJobs(daysOld);
            Notify.success(`Cleaned up ${result.deletedCount} old print job(s)`);
            // Refresh current view
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
            return result.deletedCount;
        } catch (error: any) {
            console.error('Error cleaning up print jobs:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to cleanup print jobs';
            Notify.failure(errorMessage);
            return 0;
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    const refreshJobs = useCallback(async () => {
        setIsRefreshing(true);
        try {
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
            await loadQueueStatus();
        } finally {
            setIsRefreshing(false);
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs, loadQueueStatus]);

    // Initial load
    useEffect(() => {
        loadPendingJobs();
        loadQueueStatus();
    }, [loadPendingJobs, loadQueueStatus]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
            refreshJobs();
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval, refreshJobs]);

    // Computed counts
    const pendingCount = printJobs.filter(j => j.status === 'PENDING').length;
    const printingCount = printJobs.filter(j => j.status === 'PRINTING').length;
    const completedCount = printJobs.filter(j => j.status === 'COMPLETED').length;
    const failedCount = printJobs.filter(j => j.status === 'FAILED').length;
    const cancelledCount = printJobs.filter(j => j.status === 'CANCELLED').length;

    return {
        printJobs,
        queueStatus,
        isLoading,
        isRefreshing,
        isNative,
        totalJobs: printJobs.length,
        pendingCount,
        printingCount,
        completedCount,
        failedCount,
        cancelledCount,
        loadPendingJobs,
        loadJobHistory,
        loadQueueStatus,
        cancelJob,
        retryJob,
        retryAllFailedJobs,
        clearQueue,
        cleanupJobs,
        refreshJobs,
    };
};

export default usePrintJobs;
