import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import printerService from '../services/printer.service';

interface UsePrintersReturn {
    printers: Printer[];
    filteredPrinters: Printer[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    deletePrinter: (printerId: string) => Promise<void>;
    setDefault: (printerId: string) => Promise<void>;
    updateStatus: (printerId: string, status: PrinterStatus, errorMessage?: string) => Promise<void>;
    activatePrinter: (printerId: string) => Promise<void>;
    deactivatePrinter: (printerId: string) => Promise<void>;
    testConnection: (printerId: string) => Promise<PrinterTestResult | null>;
    printTestPage: (printerId: string) => Promise<void>;
    refreshPrinters: () => Promise<void>;
    filterPrinters: (term: string) => Printer[];
    getPaginatedData: () => Printer[];
    discoverPrinters: (connectionType?: PrinterConnectionType) => Promise<DiscoveredPrinter[]>;
    pendingJobs: PrintJob[];
    loadPendingJobs: () => Promise<void>;
    cancelJob: (jobId: string) => Promise<void>;
    cleanupJobs: (daysOld?: number) => Promise<void>;
}

export const usePrinters = (): UsePrintersReturn => {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [filteredPrinters, setFilteredPrinters] = useState<Printer[]>([]);
    const [pendingJobs, setPendingJobs] = useState<PrintJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const loadPrinters = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await printerService.getAll();
            setPrinters(data);
            setFilteredPrinters(data);
            setTotalRows(data.length);
        } catch (error: any) {
            console.error('Error loading printers:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load printers';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
        loadPendingJobs();
    }, [loadPrinters, loadPendingJobs]);

    const filterPrinters = useCallback((term: string): Printer[] => {
        if (!term.trim()) {
            return printers;
        }

        const lowerTerm = term.toLowerCase();
        return printers.filter((printer) =>
            printer.printerName?.toLowerCase().includes(lowerTerm) ||
            printer.printerModel?.toLowerCase().includes(lowerTerm) ||
            printer.printerType?.toLowerCase().includes(lowerTerm) ||
            printer.connectionType?.toLowerCase().includes(lowerTerm) ||
            printer.connectionAddress?.toLowerCase().includes(lowerTerm) ||
            printer.status?.toLowerCase().includes(lowerTerm) ||
            printer.serialNumber?.toLowerCase().includes(lowerTerm)
        );
    }, [printers]);

    useEffect(() => {
        const filtered = filterPrinters(searchTerm);
        setFilteredPrinters(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    }, [searchTerm, filterPrinters]);

    const getPaginatedData = useCallback((): Printer[] => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredPrinters.slice(startIndex, endIndex);
    }, [page, perPage, filteredPrinters]);

    const deletePrinter = useCallback(async (printerId: string) => {
        try {
            await printerService.delete(printerId);
            Notify.success('Printer deleted successfully');
            await loadPrinters();
        } catch (error: any) {
            console.error('Error deleting printer:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete printer';
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
            const errorMessage = error?.response?.data?.message || 'Failed to set default printer';
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
            const message = error?.response?.data?.message || 'Failed to update printer status';
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
            const errorMessage = error?.response?.data?.message || 'Failed to activate printer';
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
            const errorMessage = error?.response?.data?.message || 'Failed to deactivate printer';
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
            const errorMessage = error?.response?.data?.message || 'Failed to test printer connection';
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
            const errorMessage = error?.response?.data?.message || 'Failed to print test page';
            Notify.failure(errorMessage);
        }
    }, []);

    const discoverPrinters = useCallback(async (connectionType?: PrinterConnectionType): Promise<DiscoveredPrinter[]> => {
        try {
            Notify.info('Discovering printers...');
            const discovered = await printerService.discover(connectionType);
            if (discovered.length > 0) {
                Notify.success(`Found ${discovered.length} printer(s)`);
            } else {
                Notify.info('No printers discovered');
            }
            return discovered;
        } catch (error: any) {
            console.error('Error discovering printers:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to discover printers';
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
            const errorMessage = error?.response?.data?.message || 'Failed to cancel print job';
            Notify.failure(errorMessage);
        }
    }, [loadPendingJobs]);

    const cleanupJobs = useCallback(async (daysOld: number = 30) => {
        try {
            const result = await printerService.cleanupJobs(daysOld);
            Notify.success(`Cleaned up ${result.deletedCount} old print job(s)`);
        } catch (error: any) {
            console.error('Error cleaning up print jobs:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to cleanup print jobs';
            Notify.failure(errorMessage);
        }
    }, []);

    const refreshPrinters = useCallback(async () => {
        await loadPrinters();
        await loadPendingJobs();
    }, [loadPrinters, loadPendingJobs]);

    return {
        printers,
        filteredPrinters,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deletePrinter,
        setDefault,
        updateStatus,
        activatePrinter,
        deactivatePrinter,
        testConnection,
        printTestPage,
        refreshPrinters,
        filterPrinters,
        getPaginatedData,
        discoverPrinters,
        pendingJobs,
        loadPendingJobs,
        cancelJob,
        cleanupJobs,
    };
};
