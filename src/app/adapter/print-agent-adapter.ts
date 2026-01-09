import { isElectron } from '../../helpers/index.helper';
import printerService from '../services/printer.service';

/**
 * Print Agent Adapter
 * Bridges the Electron main process print agent with the UI.
 * Falls back to HTTP API when not running in Electron.
 */
class PrintAgentAdapter {
    private isElectronApp: boolean;

    constructor() {
        this.isElectronApp = isElectron() && !!window.electronAPI?.printAgent;
    }

    /**
     * Check if running in Electron with print agent available
     */
    isNativeAvailable(): boolean {
        return this.isElectronApp;
    }

    // ==================== Agent Control ====================

    /**
     * Convert Electron agent state to API PrintAgentState format
     */
    private toApiAgentState(electronState: {
        state: 'idle' | 'starting' | 'running' | 'stopping' | 'error';
        connectedPrinters: number;
        lastError?: string;
        startedAt?: Date;
    }): PrintAgentState {
        const statusMap: Record<string, PrintAgentStatus> = {
            'idle': 'STOPPED',
            'starting': 'STARTING',
            'running': 'RUNNING',
            'stopping': 'STOPPING',
            'error': 'ERROR',
        };

        return {
            status: statusMap[electronState.state] || 'STOPPED',
            isRunning: electronState.state === 'running',
            startedAt: electronState.startedAt?.toISOString() || null,
            stoppedAt: null,
            lastError: electronState.lastError || null,
            processedJobs: 0,
            failedJobs: 0,
            connectedPrinters: electronState.connectedPrinters,
            queueSize: 0,
        };
    }

    /**
     * Start the print agent
     */
    async startAgent(): Promise<PrintAgentState> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.start();
            if (!result.success) {
                throw new Error(result.error || 'Failed to start print agent');
            }
            // Get updated status after starting
            const statusResult = await window.electronAPI.printAgent.getStatus();
            if (statusResult.success && statusResult.data) {
                return this.toApiAgentState(statusResult.data);
            }
            return this.toApiAgentState({ state: 'running', connectedPrinters: 0 });
        }
        // Fallback to HTTP API
        return printerService.startAgent();
    }

    /**
     * Stop the print agent
     */
    async stopAgent(): Promise<PrintAgentState> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.stop();
            if (!result.success) {
                throw new Error(result.error || 'Failed to stop print agent');
            }
            return this.toApiAgentState({ state: 'idle', connectedPrinters: 0 });
        }
        return printerService.stopAgent();
    }

    /**
     * Get agent status
     */
    async getAgentStatus(): Promise<PrintAgentState> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getStatus();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get agent status');
            }
            if (result.data) {
                return this.toApiAgentState(result.data);
            }
            return this.toApiAgentState({ state: 'idle', connectedPrinters: 0 });
        }
        return printerService.getAgentStatus();
    }

    /**
     * Get agent permissions
     */
    async getAgentPermissions(): Promise<PrintAgentPermissions> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getPermissions();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get permissions');
            }
            // Map electron permissions to API format
            const electronPerms = result.data;
            return {
                hasSerialAccess: electronPerms?.canAccessPrinters || false,
                hasUsbAccess: electronPerms?.canAccessPrinters || false,
                serialPorts: [],
                usbDevices: [],
                missingPermissions: electronPerms?.missingPermissions || [],
                instructions: electronPerms?.missingPermissions?.join('. '),
            };
        }
        return printerService.getAgentPermissions();
    }

    /**
     * Get setup instructions
     */
    async getSetupInstructions(): Promise<PrintAgentSetupInstructions> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getSetupInstructions();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get setup instructions');
            }
            return result.data || {
                os: 'unknown',
                instructions: ['Unable to load instructions'],
            };
        }
        return printerService.getAgentSetupInstructions();
    }

    // ==================== Printer Discovery ====================

    /**
     * Discover available printers
     */
    async discoverPrinters(): Promise<DiscoveredPrinter[]> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.discoverPrinters();
            if (!result.success) {
                throw new Error(result.error || 'Failed to discover printers');
            }
            // Map electron printers to API format
            return (result.data || []).map(p => ({
                name: p.name,
                displayName: p.displayName,
                driver: '',
                portName: '',
                description: p.description || '',
                status: p.status === 0 ? 'online' : 'offline',
                capabilities: {},
                isNetwork: false,
                isUSB: false,
                isSerial: false,
            })) as unknown as DiscoveredPrinter[];
        }
        // Fallback: use HTTP API to discover printers
        const result = await printerService.discover();
        return result.printers || [];
    }

    /**
     * Get list of registered printers
     */
    async getPrinters(): Promise<Printer[]> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getPrinters();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get printers');
            }
            // Map electron printers to API format
            return (result.data || []).map(p => ({
                id: p.name,
                name: p.displayName || p.name,
                status: p.status === 0 ? 'online' : 'offline',
                location: p.description || '',
                isDefault: p.isDefault,
            })) as unknown as Printer[];
        }
        // Fallback: use HTTP API
        return printerService.getAll();
    }

    /**
     * Get default printer for a specific use
     */
    async getDefaultPrinter(use?: 'receipt' | 'label' | 'kitchen' | 'report'): Promise<Printer | null> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getDefaultPrinter();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get default printer');
            }
            if (result.data) {
                return {
                    id: result.data.name,
                    name: result.data.displayName || result.data.name,
                    status: result.data.status === 0 ? 'online' : 'offline',
                    location: result.data.description || '',
                    isDefault: true,
                } as unknown as Printer;
            }
            return null;
        }
        // Fallback: use HTTP API
        return printerService.getDefault(use);
    }

    // ==================== Print Queue ====================

    /**
     * Get queue status
     */
    async getQueueStatus(): Promise<PrintQueueStatus> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.getQueueStatus();
            if (!result.success) {
                throw new Error(result.error || 'Failed to get queue status');
            }
            return {
                queueSize: result.data?.queueSize || 0,
                pendingJobs: result.data?.pendingJobs || 0,
                processingJobs: result.data?.processingJobs || 0,
                failedJobs: result.data?.failedJobs || 0,
                completedToday: result.data?.completedToday || 0,
                failedJobsList: [],
            };
        }
        return printerService.getQueueStatus();
    }

    /**
     * Retry a specific job
     */
    async retryJob(jobId: string): Promise<void> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.retryJob(jobId);
            if (!result.success) {
                throw new Error(result.error || 'Failed to retry job');
            }
            return;
        }
        await printerService.retryJob(jobId);
    }

    /**
     * Retry all failed jobs
     */
    async retryAllFailed(): Promise<{ affected: number; message: string }> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.retryAllFailed();
            if (!result.success) {
                throw new Error(result.error || 'Failed to retry all failed jobs');
            }
            return {
                affected: result.data?.retriedCount || 0,
                message: `Retried ${result.data?.retriedCount || 0} jobs`
            };
        }
        return printerService.retryAllFailedJobs();
    }

    /**
     * Clear the print queue
     */
    async clearQueue(): Promise<{ affected: number; message: string }> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.clearQueue();
            if (!result.success) {
                throw new Error(result.error || 'Failed to clear queue');
            }
            return {
                affected: result.data?.clearedCount || 0,
                message: `Cleared ${result.data?.clearedCount || 0} jobs`
            };
        }
        return printerService.clearQueue();
    }

    // ==================== Print Operations ====================

    /**
     * Print content directly
     */
    async print(
        content: string,
        options: {
            contentType?: 'html' | 'url' | 'raw';
            printerName?: string;
            copies?: number;
            silent?: boolean;
            color?: boolean;
            landscape?: boolean;
            pageSize?: string;
        } = {}
    ): Promise<{ success: boolean; jobId?: string; error?: string }> {
        if (this.isElectronApp) {
            return window.electronAPI.printAgent.print(content, options);
        }

        // Fallback: Create a print job via HTTP API
        // This assumes there's a way to send print content via API
        try {
            // For HTTP fallback, we'll need to use the browser's print functionality
            // or send to a print server
            console.warn('Print fallback: Native printing not available');
            return { success: false, error: 'Native printing not available. Please use Electron app.' };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Print HTML content (convenience method)
     */
    async printHtml(
        html: string,
        printerName?: string,
        options: { copies?: number; silent?: boolean; landscape?: boolean } = {}
    ): Promise<{ success: boolean; jobId?: string; error?: string }> {
        return this.print(html, {
            contentType: 'html',
            printerName,
            ...options,
        });
    }

    /**
     * Print receipt
     */
    async printReceipt(
        receiptHtml: string,
        printerName?: string
    ): Promise<{ success: boolean; jobId?: string; error?: string }> {
        return this.printHtml(receiptHtml, printerName, {
            silent: true,
            copies: 1,
        });
    }

    /**
     * Add a job to the print queue
     */
    async addJob(job: {
        content: string;
        contentType: 'html' | 'url' | 'raw';
        printerName?: string;
        options?: {
            silent?: boolean;
            printBackground?: boolean;
            color?: boolean;
            landscape?: boolean;
            copies?: number;
            pageSize?: string;
        };
    }): Promise<{ success: boolean; jobId?: string; error?: string }> {
        if (this.isElectronApp) {
            const result = await window.electronAPI.printAgent.addJob(job);
            if (result.success && result.data) {
                return { success: true, jobId: result.data.id };
            }
            return { success: false, error: result.error };
        }
        return { success: false, error: 'Queue management requires Electron app' };
    }
}

// Export singleton instance
export const printAgentAdapter = new PrintAgentAdapter();
export default printAgentAdapter;
