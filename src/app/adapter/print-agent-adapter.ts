import printerService from '../services/printer.service';

/**
 * Print Agent Adapter
 * Provides a unified interface for printing operations using the zonse247 HTTP API.
 * The Electron main process runs its own print agent that connects to the same API.
 */
class PrintAgentAdapter {
    // ==================== Agent Control ====================

    /**
     * Start the print agent
     */
    async startAgent(): Promise<PrintAgentState> {
        return printerService.startAgent();
    }

    /**
     * Stop the print agent
     */
    async stopAgent(): Promise<PrintAgentState> {
        return printerService.stopAgent();
    }

    /**
     * Get agent status
     */
    async getAgentStatus(): Promise<PrintAgentState> {
        return printerService.getAgentStatus();
    }

    /**
     * Get agent permissions
     */
    async getAgentPermissions(): Promise<PrintAgentPermissions> {
        return printerService.getAgentPermissions();
    }

    /**
     * Get setup instructions
     */
    async getSetupInstructions(): Promise<PrintAgentSetupInstructions> {
        return printerService.getAgentSetupInstructions();
    }

    // ==================== Printer Discovery ====================

    /**
     * Discover available printers
     */
    async discoverPrinters(): Promise<DiscoveredPrinter[]> {
        const result = await printerService.discover();
        return result.printers || [];
    }

    /**
     * Scan network for printers
     */
    async scanNetwork(baseIP: string, startHost?: number, endHost?: number, port?: number): Promise<DiscoveredPrinter[]> {
        const result = await printerService.scanNetwork({ baseIP, startHost, endHost, port });
        return result.printers || [];
    }

    /**
     * Get available serial ports
     */
    async getSerialPorts(): Promise<SerialPortInfo[]> {
        return printerService.getSerialPorts();
    }

    /**
     * Register a discovered printer
     */
    async registerPrinter(discoveredPrinter: DiscoveredPrinter, options?: {
        printerName?: string;
        tenantId?: string;
        branchId?: string;
        isDefault?: boolean;
        isReceiptPrinter?: boolean;
        isLabelPrinter?: boolean;
        isKitchenPrinter?: boolean;
    }): Promise<Printer> {
        return printerService.registerDiscoveredPrinter({
            name: discoveredPrinter.name,
            address: discoveredPrinter.address,
            port: discoveredPrinter.port,
            connectionType: discoveredPrinter.connectionType,
            printerType: discoveredPrinter.type,
            ...options,
        } as any);
    }

    /**
     * Test printer connection
     */
    async testPrinter(printerId: string): Promise<PrinterTestResult> {
        return printerService.testConnection(printerId);
    }

    /**
     * Get list of registered printers
     */
    async getPrinters(): Promise<Printer[]> {
        return printerService.getAll();
    }

    /**
     * Get default printer for a specific use
     */
    async getDefaultPrinter(use?: 'receipt' | 'label' | 'kitchen' | 'report'): Promise<Printer | null> {
        return printerService.getDefault(use);
    }

    // ==================== Print Queue ====================

    /**
     * Get queue status
     */
    async getQueueStatus(): Promise<PrintQueueStatus> {
        return printerService.getQueueStatus();
    }

    /**
     * Retry a specific job
     */
    async retryJob(jobId: string): Promise<PrintJob> {
        return printerService.retryJob(jobId);
    }

    /**
     * Retry all failed jobs
     */
    async retryAllFailed(): Promise<{ affected: number; message: string }> {
        return printerService.retryAllFailedJobs();
    }

    /**
     * Clear the print queue
     */
    async clearQueue(): Promise<{ affected: number; message: string }> {
        return printerService.clearQueue();
    }

    // ==================== Print Operations ====================

    /**
     * Print a receipt
     */
    async printReceipt(data: PrintReceiptRequest): Promise<PrintJob> {
        return printerService.printReceipt(data);
    }

    /**
     * Print a label
     */
    async printLabel(data: PrintLabelRequest): Promise<PrintJob> {
        return printerService.printLabel(data);
    }

    /**
     * Print a test page
     */
    async printTestPage(printerId: string): Promise<PrintJob> {
        return printerService.printTestPage(printerId);
    }

    /**
     * Open cash drawer
     */
    async openCashDrawer(printerId: string): Promise<{ success: boolean; message: string }> {
        return printerService.openCashDrawer(printerId);
    }

    /**
     * Get pending print jobs
     */
    async getPendingJobs(): Promise<PrintJob[]> {
        return printerService.getPendingJobs();
    }

    /**
     * Get print job history for a printer
     */
    async getJobHistory(printerId: string): Promise<PrintJob[]> {
        return printerService.getJobHistory(printerId);
    }

    /**
     * Cancel a print job
     */
    async cancelJob(jobId: string): Promise<PrintJob> {
        return printerService.cancelJob(jobId);
    }
}

// Export singleton instance
export const printAgentAdapter = new PrintAgentAdapter();
export default printAgentAdapter;
