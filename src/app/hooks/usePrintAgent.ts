import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import printAgentAdapter from '../adapter/print-agent-adapter';

interface UsePrintAgentOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UsePrintAgentReturn {
    agentStatus: PrintAgentState | null;
    permissions: PrintAgentPermissions | null;
    setupInstructions: PrintAgentSetupInstructions | null;
    isLoading: boolean;
    isStarting: boolean;
    isStopping: boolean;
    startAgent: () => Promise<boolean>;
    stopAgent: () => Promise<boolean>;
    refreshStatus: () => Promise<void>;
    loadPermissions: () => Promise<void>;
    loadSetupInstructions: () => Promise<void>;
    // Print operations
    printReceipt: (data: PrintReceiptRequest) => Promise<PrintJob>;
    printLabel: (data: PrintLabelRequest) => Promise<PrintJob>;
    printTestPage: (printerId: string) => Promise<PrintJob>;
}

export const usePrintAgent = (options: UsePrintAgentOptions = {}): UsePrintAgentReturn => {
    const { autoRefresh = true, refreshInterval = 10000 } = options;

    const [agentStatus, setAgentStatus] = useState<PrintAgentState | null>(null);
    const [permissions, setPermissions] = useState<PrintAgentPermissions | null>(null);
    const [setupInstructions, setSetupInstructions] = useState<PrintAgentSetupInstructions | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);

    const refreshStatus = useCallback(async () => {
        try {
            const status = await printAgentAdapter.getAgentStatus();
            setAgentStatus(status);
        } catch (error: any) {
            console.error('Error fetching agent status:', error);
            // Don't show error notification on auto-refresh
        }
    }, []);

    const loadPermissions = useCallback(async () => {
        try {
            const perms = await printAgentAdapter.getAgentPermissions();
            setPermissions(perms);
        } catch (error: any) {
            console.error('Error fetching agent permissions:', error);
            const errorMessage = error?.message || 'Failed to load permissions';
            Notify.failure(errorMessage);
        }
    }, []);

    const loadSetupInstructions = useCallback(async () => {
        try {
            const instructions = await printAgentAdapter.getSetupInstructions();
            setSetupInstructions(instructions);
        } catch (error: any) {
            console.error('Error fetching setup instructions:', error);
            const errorMessage = error?.message || 'Failed to load setup instructions';
            Notify.failure(errorMessage);
        }
    }, []);

    const startAgent = useCallback(async (): Promise<boolean> => {
        setIsStarting(true);
        try {
            const status = await printAgentAdapter.startAgent();
            setAgentStatus(status);
            Notify.success('Print agent started successfully');
            return true;
        } catch (error: any) {
            console.error('Error starting print agent:', error);
            const errorMessage = error?.message || 'Failed to start print agent';
            Notify.failure(errorMessage);
            return false;
        } finally {
            setIsStarting(false);
        }
    }, []);

    const stopAgent = useCallback(async (): Promise<boolean> => {
        setIsStopping(true);
        try {
            const status = await printAgentAdapter.stopAgent();
            setAgentStatus(status);
            Notify.success('Print agent stopped');
            return true;
        } catch (error: any) {
            console.error('Error stopping print agent:', error);
            const errorMessage = error?.message || 'Failed to stop print agent';
            Notify.failure(errorMessage);
            return false;
        } finally {
            setIsStopping(false);
        }
    }, []);

    const printReceipt = useCallback(async (data: PrintReceiptRequest): Promise<PrintJob> => {
        return printAgentAdapter.printReceipt(data);
    }, []);

    const printLabel = useCallback(async (data: PrintLabelRequest): Promise<PrintJob> => {
        return printAgentAdapter.printLabel(data);
    }, []);

    const printTestPage = useCallback(async (printerId: string): Promise<PrintJob> => {
        return printAgentAdapter.printTestPage(printerId);
    }, []);

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    refreshStatus(),
                    loadPermissions(),
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, [refreshStatus, loadPermissions]);

    // Auto-refresh status
    useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
            refreshStatus();
        }, refreshInterval);

        return () => clearInterval(intervalId);
    }, [autoRefresh, refreshInterval, refreshStatus]);

    return {
        agentStatus,
        permissions,
        setupInstructions,
        isLoading,
        isStarting,
        isStopping,
        startAgent,
        stopAgent,
        refreshStatus,
        loadPermissions,
        loadSetupInstructions,
        printReceipt,
        printLabel,
        printTestPage,
    };
};

export default usePrintAgent;
