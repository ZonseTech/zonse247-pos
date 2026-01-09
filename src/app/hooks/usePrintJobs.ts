import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';

interface UsePrintJobsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UsePrintJobsReturn {
    printJobs: PrintJob[];
    isLoading: boolean;
    isRefreshing: boolean;
    totalJobs: number;
    pendingCount: number;
    printingCount: number;
    completedCount: number;
    failedCount: number;
    cancelledCount: number;
    loadPendingJobs: () => Promise<void>;
    loadJobHistory: (printerId: string) => Promise<void>;
    cancelJob: (jobId: string) => Promise<boolean>;
    cleanupJobs: (daysOld?: number) => Promise<number>;
    refreshJobs: () => Promise<void>;
}

export const usePrintJobs = (options: UsePrintJobsOptions = {}): UsePrintJobsReturn => {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
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
            return true;
        } catch (error: any) {
            console.error('Error cancelling print job:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to cancel print job';
            Notify.failure(errorMessage);
            return false;
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs]);

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
            return result.deletedCount;
        } catch (error: any) {
            console.error('Error cleaning up print jobs:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to cleanup print jobs';
            Notify.failure(errorMessage);
            return 0;
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs]);

    const refreshJobs = useCallback(async () => {
        setIsRefreshing(true);
        try {
            if (currentPrinterId) {
                await loadJobHistory(currentPrinterId);
            } else {
                await loadPendingJobs();
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [currentPrinterId, loadJobHistory, loadPendingJobs]);

    // Initial load
    useEffect(() => {
        loadPendingJobs();
    }, [loadPendingJobs]);

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
        isLoading,
        isRefreshing,
        totalJobs: printJobs.length,
        pendingCount,
        printingCount,
        completedCount,
        failedCount,
        cancelledCount,
        loadPendingJobs,
        loadJobHistory,
        cancelJob,
        cleanupJobs,
        refreshJobs,
    };
};

export default usePrintJobs;
