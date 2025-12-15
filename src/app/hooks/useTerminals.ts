import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notify } from 'notiflix';
import terminalService from '../services/terminal.service';

interface UseTerminalsReturn {
    terminals: Terminal[];
    filteredTerminals: Terminal[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    page: number;
    setPage: (page: number) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    totalRows: number;
    deleteTerminal: (terminalId: string) => Promise<void>;
    updateActivationStatus: (terminalId: string, status: TerminalActivationStatus) => Promise<void>;
    blockTerminal: (terminalId: string, reason: string) => Promise<void>;
    unblockTerminal: (terminalId: string) => Promise<void>;
    setPrimary: (terminalId: string, branchId: string) => Promise<void>;
    syncTerminal: (terminalId: string) => Promise<void>;
    refreshTerminals: () => Promise<void>;
    filterTerminals: (term: string) => Terminal[];
    getPaginatedData: () => Terminal[];
}

export const useTerminals = (): UseTerminalsReturn => {
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const loadTerminals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await terminalService.list();
            setTerminals(data);
            setFilteredTerminals(data);
            setTotalRows(data.length);
        } catch (error: any) {
            console.error('Error loading terminals:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load terminals';
            Notify.failure(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTerminals();
    }, [loadTerminals]);

    const filterTerminals = useCallback((term: string): Terminal[] => {
        if (!term.trim()) {
            return terminals;
        }

        const lowerTerm = term.toLowerCase();
        return terminals.filter((terminal) =>
            terminal.terminalLabel?.toLowerCase().includes(lowerTerm) ||
            terminal.terminalCode?.toLowerCase().includes(lowerTerm) ||
            terminal.deviceId?.toLowerCase().includes(lowerTerm) ||
            terminal.macAddress?.toLowerCase().includes(lowerTerm) ||
            terminal.activationStatus?.toLowerCase().includes(lowerTerm)
        );
    }, [terminals]);

    useEffect(() => {
        const filtered = filterTerminals(searchTerm);
        setFilteredTerminals(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    }, [searchTerm, filterTerminals]);

    const getPaginatedData = useCallback((): Terminal[] => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredTerminals.slice(startIndex, endIndex);
    }, [page, perPage, filteredTerminals]);

    const deleteTerminal = useCallback(async (terminalId: string) => {
        try {
            await terminalService.delete(terminalId);
            Notify.success('Terminal deleted successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error deleting terminal:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to delete terminal';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const updateActivationStatus = useCallback(async (terminalId: string, status: TerminalActivationStatus) => {
        try {
            if (status === 'ACTIVATED') {
                await terminalService.activate(terminalId);
            } else if (status === 'DEACTIVATED') {
                await terminalService.deactivate(terminalId);
            } else {
                await terminalService.update(terminalId, { activationStatus: status });
            }
            Notify.success(`Terminal ${status.toLowerCase()} successfully`);
            await loadTerminals();
        } catch (error: any) {
            console.error('Error updating terminal status:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to update terminal status';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const blockTerminal = useCallback(async (terminalId: string, reason: string) => {
        try {
            await terminalService.block(terminalId, reason);
            Notify.success('Terminal blocked successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error blocking terminal:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to block terminal';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const unblockTerminal = useCallback(async (terminalId: string) => {
        try {
            await terminalService.unblock(terminalId);
            Notify.success('Terminal unblocked successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error unblocking terminal:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to unblock terminal';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const setPrimary = useCallback(async (terminalId: string, branchId: string) => {
        try {
            await terminalService.setPrimary(terminalId, branchId);
            Notify.success('Primary terminal set successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error setting primary terminal:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to set primary terminal';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const syncTerminal = useCallback(async (terminalId: string) => {
        try {
            await terminalService.syncTerminal(terminalId);
            Notify.success('Terminal synced successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error syncing terminal:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to sync terminal';
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const refreshTerminals = useCallback(async () => {
        await loadTerminals();
    }, [loadTerminals]);

    return {
        terminals,
        filteredTerminals,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deleteTerminal,
        updateActivationStatus,
        blockTerminal,
        unblockTerminal,
        setPrimary,
        syncTerminal,
        refreshTerminals,
        filterTerminals,
        getPaginatedData,
    };
};
