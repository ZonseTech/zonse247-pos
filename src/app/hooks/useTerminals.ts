import { useState, useEffect, useCallback, useMemo } from 'react';
import { Notify } from 'notiflix';
import terminalService from '../services/terminal.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { usePagination } from './usePagination';

interface UseTerminalsOptions {
    branchId?: string;
    tenantId?: string;
    isAdminMode?: boolean;
    autoLoad?: boolean;
}

interface UseTerminalsReturn {
    terminals: Terminal[];
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
    deleteTerminal: (terminalId: string) => Promise<void>;
    updateActivationStatus: (terminalId: string, status: TerminalActivationStatus) => Promise<void>;
    blockTerminal: (terminalId: string, reason: string) => Promise<void>;
    unblockTerminal: (terminalId: string) => Promise<void>;
    setPrimary: (terminalId: string, branchId: string) => Promise<void>;
    syncTerminal: (terminalId: string) => Promise<void>;
    refreshTerminals: () => Promise<void>;
}

export const useTerminals = (options: UseTerminalsOptions = {}): UseTerminalsReturn => {
    const { branchId, tenantId, isAdminMode = false, autoLoad = true } = options;

    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        page, setPage, perPage, setPerPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange,
    } = usePagination();

    const loadTerminals = useCallback(async () => {
        setIsLoading(true);
        try {
            const query: TerminalQueryParams = {
                page,
                perPage,
                search: searchTerm || undefined,
            };

            if (branchId) {
                query.branchId = branchId;
            }
            if (isAdminMode) {
                query.isAdminMode = true;
                if (tenantId) {
                    query.tenantId = tenantId;
                }
            }

            const result = await terminalService.listPaginated(query);
            setTerminals(result.data || []);
            setTotalRows(result.pagination?.total || 0);
        } catch (error: any) {
            console.error('Error loading terminals:', error);
            Notify.failure(getErrorMessage(error, 'Failed to load terminals'));
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, branchId, tenantId, isAdminMode, setTotalRows]);

    useEffect(() => {
        if (autoLoad) {
            loadTerminals();
        }
    }, [loadTerminals, autoLoad]);

    // Reset to page 1 when search changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, setPage]);

    const deleteTerminal = useCallback(async (terminalId: string) => {
        try {
            await terminalService.delete(terminalId);
            Notify.success('Terminal deleted successfully');
            await loadTerminals();
        } catch (error: any) {
            console.error('Error deleting terminal:', error);
            const errorMessage = getErrorMessage(error, 'Failed to delete terminal');
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
            const errorMessage = getErrorMessage(error, 'Failed to update terminal status');
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
            const errorMessage = getErrorMessage(error, 'Failed to block terminal');
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
            const errorMessage = getErrorMessage(error, 'Failed to unblock terminal');
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
            const errorMessage = getErrorMessage(error, 'Failed to set primary terminal');
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
            const errorMessage = getErrorMessage(error, 'Failed to sync terminal');
            Notify.failure(errorMessage);
        }
    }, [loadTerminals]);

    const refreshTerminals = useCallback(async () => {
        await loadTerminals();
    }, [loadTerminals]);

    return {
        terminals,
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
        deleteTerminal,
        updateActivationStatus,
        blockTerminal,
        unblockTerminal,
        setPrimary,
        syncTerminal,
        refreshTerminals,
    };
};
