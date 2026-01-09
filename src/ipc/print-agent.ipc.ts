import { ipcMain } from 'electron';
import printAgentService from '../services/print-agent.service';

export function setupPrintAgentIPC() {
    // ==================== Agent Control ====================

    /**
     * Start the print agent
     */
    ipcMain.handle('print-agent:start', async () => {
        try {
            const result = await printAgentService.start();
            return { success: result.success, error: result.error };
        } catch (error: any) {
            console.error('Failed to start print agent:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Stop the print agent
     */
    ipcMain.handle('print-agent:stop', async () => {
        try {
            const result = await printAgentService.stop();
            return { success: result.success, error: result.error };
        } catch (error: any) {
            console.error('Failed to stop print agent:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get agent status
     */
    ipcMain.handle('print-agent:status', async () => {
        try {
            const status = printAgentService.getStatus();
            return { success: true, data: status };
        } catch (error: any) {
            console.error('Failed to get print agent status:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get agent permissions
     */
    ipcMain.handle('print-agent:permissions', async () => {
        try {
            const permissions = printAgentService.getPermissions();
            return { success: true, data: permissions };
        } catch (error: any) {
            console.error('Failed to get print agent permissions:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get setup instructions
     */
    ipcMain.handle('print-agent:setup-instructions', async () => {
        try {
            const instructions = printAgentService.getSetupInstructions();
            return { success: true, data: instructions };
        } catch (error: any) {
            console.error('Failed to get setup instructions:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== Printer Discovery ====================

    /**
     * Discover available printers
     */
    ipcMain.handle('print-agent:discover-printers', async () => {
        try {
            const printers = await printAgentService.discoverPrinters();
            return { success: true, data: printers };
        } catch (error: any) {
            console.error('Failed to discover printers:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get list of printers
     */
    ipcMain.handle('print-agent:get-printers', async () => {
        try {
            const printers = printAgentService.getPrinters();
            return { success: true, data: printers };
        } catch (error: any) {
            console.error('Failed to get printers:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get default printer
     */
    ipcMain.handle('print-agent:get-default-printer', async () => {
        try {
            const printer = printAgentService.getDefaultPrinter();
            return { success: true, data: printer };
        } catch (error: any) {
            console.error('Failed to get default printer:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== Print Queue ====================

    /**
     * Get queue status
     */
    ipcMain.handle('print-agent:queue-status', async () => {
        try {
            const status = printAgentService.getQueueStatus();
            return { success: true, data: status };
        } catch (error: any) {
            console.error('Failed to get queue status:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Get jobs from queue
     */
    ipcMain.handle('print-agent:get-jobs', async (_event, filter?: { status?: string; limit?: number }) => {
        try {
            const jobs = printAgentService.getJobs(filter);
            return { success: true, data: jobs };
        } catch (error: any) {
            console.error('Failed to get jobs:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Retry a specific job
     */
    ipcMain.handle('print-agent:retry-job', async (_event, jobId: string) => {
        try {
            const result = await printAgentService.retryJob(jobId);
            return { success: result.success, error: result.error };
        } catch (error: any) {
            console.error('Failed to retry job:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Retry all failed jobs
     */
    ipcMain.handle('print-agent:retry-all-failed', async () => {
        try {
            const result = await printAgentService.retryAllFailed();
            return { success: true, data: { retriedCount: result.retriedCount } };
        } catch (error: any) {
            console.error('Failed to retry all failed jobs:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Clear the print queue
     */
    ipcMain.handle('print-agent:clear-queue', async () => {
        try {
            const result = await printAgentService.clearQueue();
            return { success: true, data: { clearedCount: result.clearedCount } };
        } catch (error: any) {
            console.error('Failed to clear queue:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== Print Operations ====================

    /**
     * Print content directly
     */
    ipcMain.handle('print-agent:print', async (_event, content: string, options?: {
        contentType?: 'html' | 'url' | 'raw';
        printerName?: string;
        copies?: number;
        silent?: boolean;
        color?: boolean;
        landscape?: boolean;
        pageSize?: string;
    }) => {
        try {
            const result = await printAgentService.print(content, options);
            return result;
        } catch (error: any) {
            console.error('Failed to print:', error);
            return { success: false, error: error.message };
        }
    });

    /**
     * Add a job to the print queue
     */
    ipcMain.handle('print-agent:add-job', async (_event, job: {
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
    }) => {
        try {
            const newJob = await printAgentService.addJob({
                content: job.content,
                contentType: job.contentType,
                printerName: job.printerName,
                options: job.options || {},
            });
            return { success: true, data: newJob };
        } catch (error: any) {
            console.error('Failed to add print job:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('✓ Print Agent IPC handlers registered');
}
