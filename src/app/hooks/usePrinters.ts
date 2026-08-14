import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { usePagination } from './usePagination';

interface UsePrintersReturn {
    printers: Printer[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    handlePageChange: (page: number) => void;
    handlePerRowsChange: (newPerPage: number, page: number) => void;
    deletePrinter: (printerId: string) => Promise<void>;
    setDefault: (printerId: string) => Promise<void>;
    updateStatus: (printerId: string, status: PrinterStatus, errorMessage?: string) => Promise<void>;
    activatePrinter: (printerId: string) => Promise<void>;
    deactivatePrinter: (printerId: string) => Promise<void>;
    testConnection: (printerId: string) => Promise<PrinterTestResult | null>;
    printTestPage: (printerId: string) => Promise<void>;
    refreshPrinters: () => Promise<void>;
    discoverPrinters: (connectionType?: PrinterConnectionType) => Promise<DiscoveredPrinter[]>;
    pendingJobs: PrintJob[];
    loadPendingJobs: () => Promise<void>;
    cancelJob: (jobId: string) => Promise<void>;
    cleanupJobs: (daysOld?: number) => Promise<void>;
}

export const usePrinters = (): UsePrintersReturn => {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [pendingJobs, setPendingJobs] = useState<PrintJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        page, setPage, perPage, setPerPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange,
    } = usePagination();

    const loadPrinters = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await printerService.getAllPaginated({
                page,
                perPage,
                search: searchTerm || undefined,
            });
            setPrinters(result.printers || []);
            setTotalRows(result.pagination?.totalItems || 0);
        } catch (error: any) {
            console.error('Error loading printers:', error);
            Notify.failure(getErrorMessage(error, 'Failed to load printers'));
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, setTotalRows]);

    const loadPendingJobs = useCallback(async () => {
        try {
            const jobs = await printerService.getPendingJobs();
            setPendingJobs(jobs);
        } catch (error: any) {
            console.error('Error loading pending jobs:', error);
        }
    }, []);

    useEffect(() => {
        loadPrinters();
    }, [loadPrinters]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, setPage]);

    const deletePrinter = useCallback(async (printerId: string) => {
        try {
            await printerService.delete(printerId);
            Notify.success('Printer deleted successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error deleting printer:', error);
            const errorMessage = getErrorMessage(error, 'Failed to delete printer');
            Notify.failure(errorMessage);
        }
    }, [loadPrinters]);

    const setDefault = useCallback(async (printerId: string) => {
        try {
            await printerService.setDefault(printerId);
            Notify.success('Default printer set successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error setting default printer:', error);
            const errorMessage = getErrorMessage(error, 'Failed to set default printer');
            Notify.failure(errorMessage);
        }
    }, [loadPrinters]);

    const updateStatus = useCallback(async (printerId: string, status: PrinterStatus, errorMessage?: string) => {
        try {
            await printerService.updateStatus(printerId, { status, errorMessage });
            Notify.success('Printer status updated successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error updating printer status:', error);
            const message = getErrorMessage(error, 'Failed to update printer status');
            Notify.failure(message);
        }
    }, [loadPrinters]);

    const activatePrinter = useCallback(async (printerId: string) => {
        try {
            await printerService.activate(printerId);
            Notify.success('Printer activated successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error activating printer:', error);
            const errorMessage = getErrorMessage(error, 'Failed to activate printer');
            Notify.failure(errorMessage);
        }
    }, [loadPrinters]);

    const deactivatePrinter = useCallback(async (printerId: string) => {
        try {
            await printerService.deactivate(printerId);
            Notify.success('Printer deactivated successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error deactivating printer:', error);
            const errorMessage = getErrorMessage(error, 'Failed to deactivate printer');
            Notify.failure(errorMessage);
        }
    }, [loadPrinters]);

    const testConnection = useCallback(async (printerId: string): Promise<PrinterTestResult | null> => {
        try {
            const result = await printerService.testConnection(printerId);
            if (result.success) {
                Notify.success(result.message || 'Printer connection successful');
            } else {
                Notify.warning(result.message || 'Printer connection test failed');
            }
            await loadPrinters();
            return result;
        } catch (error: any) {
            console.error('Error testing printer:', error);
            const errorMessage = getErrorMessage(error, 'Failed to test printer connection');
            Notify.failure(errorMessage);
            return null;
        }
    }, [loadPrinters]);

    const printTestPage = useCallback(async (printerId: string) => {
        try {
            await printerService.printTestPage(printerId);
            Notify.success('Test page sent to printer');
        } catch (error: any) {
            console.error('Error printing test page:', error);
            const errorMessage = getErrorMessage(error, 'Failed to print test page');
            Notify.failure(errorMessage);
        }
    }, []);

    const discoverPrinters = useCallback(async (connectionType?: PrinterConnectionType): Promise<DiscoveredPrinter[]> => {
        try {
            const result = await printerService.discover(connectionType);
            if (result.count > 0) {
                Notify.success(`Found ${result.count} printer(s)`);
            } else {
                Notify.info('No printers discovered');
            }
            return result.printers;
        } catch (error: any) {
            console.error('Error discovering printers:', error);
            const errorMessage = getErrorMessage(error, 'Failed to discover printers');
            Notify.failure(errorMessage);
            return [];
        }
    }, []);

    const cancelJob = useCallback(async (jobId: string) => {
        try {
            await printerService.cancelJob(jobId);
            Notify.success('Print job cancelled');
            await loadPendingJobs();
        } catch (error: any) {
            console.error('Error cancelling print job:', error);
            const errorMessage = getErrorMessage(error, 'Failed to cancel print job');
            Notify.failure(errorMessage);
        }
    }, [loadPendingJobs]);

    const cleanupJobs = useCallback(async (daysOld: number = 30) => {
        try {
            const result = await printerService.cleanupJobs(daysOld);
            Notify.success(`Cleaned up ${result.deletedCount} old print job(s)`);
        } catch (error: any) {
            console.error('Error cleaning up print jobs:', error);
            const errorMessage = getErrorMessage(error, 'Failed to cleanup print jobs');
            Notify.failure(errorMessage);
        }
    }, []);

    const refreshPrinters = useCallback(async () => {
        await loadPrinters();
        await loadPendingJobs();
    }, [loadPrinters, loadPendingJobs]);

    return {
        printers,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        handlePageChange,
        handlePerRowsChange,
        deletePrinter,
        setDefault,
        updateStatus,
        activatePrinter,
        deactivatePrinter,
        testConnection,
        printTestPage,
        refreshPrinters,
        discoverPrinters,
        pendingJobs,
        loadPendingJobs,
        cancelJob,
        cleanupJobs,
    };
};
