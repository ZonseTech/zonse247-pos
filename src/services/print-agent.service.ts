import { BrowserWindow } from 'electron';

export type PrintAgentState = 'idle' | 'starting' | 'running' | 'stopping' | 'error';

export interface PrintAgentStatus {
    state: PrintAgentState;
    connectedPrinters: number;
    lastError?: string;
    startedAt?: Date;
}

export interface PrintAgentPermissions {
    canPrint: boolean;
    canAccessPrinters: boolean;
    canManageQueue: boolean;
    missingPermissions: string[];
}

export interface DiscoveredPrinter {
    name: string;
    displayName: string;
    description?: string;
    status: number;
    isDefault: boolean;
}

// Internal printer info type matching Electron's structure
interface ElectronPrinterInfo {
    name: string;
    displayName: string;
    description: string;
    status: number;
    isDefault: boolean;
    options?: Record<string, string>;
}

export interface PrintJobOptions {
    silent?: boolean;
    printBackground?: boolean;
    deviceName?: string;
    color?: boolean;
    margins?: {
        marginType?: 'default' | 'none' | 'printableArea' | 'custom';
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
    };
    landscape?: boolean;
    scaleFactor?: number;
    pagesPerSheet?: number;
    collate?: boolean;
    copies?: number;
    pageRanges?: { from: number; to: number }[];
    duplexMode?: 'simplex' | 'shortEdge' | 'longEdge';
    dpi?: { horizontal: number; vertical: number };
    header?: string;
    footer?: string;
    pageSize?: string | { width: number; height: number };
}

export interface PrintJob {
    id: string;
    content: string;
    contentType: 'html' | 'url' | 'raw';
    printerName?: string;
    options: PrintJobOptions;
    status: 'pending' | 'printing' | 'completed' | 'failed';
    createdAt: Date;
    completedAt?: Date;
    error?: string;
    retryCount: number;
}

class PrintAgentService {
    private state: PrintAgentState = 'idle';
    private startedAt?: Date;
    private lastError?: string;
    private printers: ElectronPrinterInfo[] = [];
    private printQueue: PrintJob[] = [];
    private isProcessingQueue = false;
    private printWindow: BrowserWindow | null = null;
    private maxRetries = 3;
    private autoDiscoverInterval: NodeJS.Timeout | null = null;

    /**
     * Start the print agent service
     */
    async start(): Promise<{ success: boolean; error?: string }> {
        if (this.state === 'running') {
            return { success: true };
        }

        try {
            this.state = 'starting';
            this.lastError = undefined;

            // Discover printers
            await this.discoverPrinters();

            // Create hidden print window for rendering
            await this.createPrintWindow();

            // Start auto-discovery interval (every 30 seconds)
            this.autoDiscoverInterval = setInterval(() => {
                this.discoverPrinters().catch(console.error);
            }, 30000);

            this.state = 'running';
            this.startedAt = new Date();

            console.log('✓ Print Agent started successfully');
            return { success: true };
        } catch (error: any) {
            this.state = 'error';
            this.lastError = error.message;
            console.error('Failed to start Print Agent:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stop the print agent service
     */
    async stop(): Promise<{ success: boolean; error?: string }> {
        if (this.state === 'idle' || this.state === 'stopping') {
            return { success: true };
        }

        try {
            this.state = 'stopping';

            // Clear auto-discovery interval
            if (this.autoDiscoverInterval) {
                clearInterval(this.autoDiscoverInterval);
                this.autoDiscoverInterval = null;
            }

            // Destroy print window
            if (this.printWindow && !this.printWindow.isDestroyed()) {
                this.printWindow.destroy();
                this.printWindow = null;
            }

            // Clear queue
            this.printQueue = [];
            this.isProcessingQueue = false;

            this.state = 'idle';
            this.startedAt = undefined;

            console.log('✓ Print Agent stopped');
            return { success: true };
        } catch (error: any) {
            this.state = 'error';
            this.lastError = error.message;
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current agent status
     */
    getStatus(): PrintAgentStatus {
        return {
            state: this.state,
            connectedPrinters: this.printers.length,
            lastError: this.lastError,
            startedAt: this.startedAt,
        };
    }

    /**
     * Get agent permissions
     */
    getPermissions(): PrintAgentPermissions {
        const missingPermissions: string[] = [];
        let canPrint = true;
        let canAccessPrinters = true;
        const canManageQueue = true;

        // Check if we can access printers
        try {
            const win = BrowserWindow.getAllWindows()[0];
            if (!win) {
                canAccessPrinters = false;
                canPrint = false;
                missingPermissions.push('No active window available for printing');
            }
        } catch {
            canAccessPrinters = false;
            canPrint = false;
            missingPermissions.push('Cannot access printer subsystem');
        }

        // Check if any printers are available
        if (this.printers.length === 0) {
            missingPermissions.push('No printers discovered');
        }

        return {
            canPrint,
            canAccessPrinters,
            canManageQueue,
            missingPermissions,
        };
    }

    /**
     * Get setup instructions based on platform
     */
    getSetupInstructions(): {
        os: string;
        instructions: string[];
        commands?: string[];
        links?: { label: string; url: string }[];
    } {
        const platform = process.platform;
        const instructions: string[] = [];
        const commands: string[] = [];
        const links: { label: string; url: string }[] = [];

        switch (platform) {
            case 'win32':
                instructions.push(
                    'Ensure your printer is connected and powered on',
                    'Open Settings > Devices > Printers & scanners',
                    'Add your printer if not already listed',
                    'Set a default printer for automatic selection',
                    'Restart the application after adding new printers'
                );
                links.push(
                    { label: 'Windows Printer Setup Guide', url: 'https://support.microsoft.com/en-us/windows/install-a-printer-in-windows-cc0724cf-793e-3542-d1ff-727e4978638b' }
                );
                break;

            case 'darwin':
                instructions.push(
                    'Ensure your printer is connected and powered on',
                    'Open System Preferences > Printers & Scanners',
                    'Click the + button to add your printer',
                    'Select your printer from the list and click Add',
                    'Set a default printer for automatic selection',
                    'Grant printing permissions if prompted'
                );
                commands.push(
                    'lpstat -p -d  # List available printers',
                    'lpoptions -d <printer_name>  # Set default printer'
                );
                links.push(
                    { label: 'macOS Printer Setup Guide', url: 'https://support.apple.com/guide/mac-help/add-a-printer-on-mac-mh14004/mac' }
                );
                break;

            case 'linux':
                instructions.push(
                    'Ensure CUPS (Common Unix Printing System) is installed',
                    'Connect your printer and ensure it is powered on',
                    'Access CUPS web interface at http://localhost:631',
                    'Add your printer through the Administration tab',
                    'Install appropriate drivers for your printer model',
                    'Set a default printer for automatic selection'
                );
                commands.push(
                    'sudo apt install cups  # Install CUPS (Debian/Ubuntu)',
                    'sudo systemctl start cups  # Start CUPS service',
                    'sudo systemctl enable cups  # Enable CUPS on boot',
                    'lpstat -p -d  # List available printers',
                    'lpoptions -d <printer_name>  # Set default printer'
                );
                links.push(
                    { label: 'CUPS Documentation', url: 'https://www.cups.org/documentation.html' },
                    { label: 'Linux Printing Guide', url: 'https://wiki.archlinux.org/title/CUPS' }
                );
                break;

            default:
                instructions.push(
                    'Connect your printer and ensure it is powered on',
                    'Install appropriate printer drivers',
                    'Configure the printer in your system settings',
                    'Restart the application after setup'
                );
        }

        return {
            os: platform,
            instructions,
            commands: commands.length > 0 ? commands : undefined,
            links: links.length > 0 ? links : undefined,
        };
    }

    /**
     * Discover available printers
     */
    async discoverPrinters(): Promise<DiscoveredPrinter[]> {
        try {
            const win = BrowserWindow.getAllWindows()[0];
            if (!win) {
                throw new Error('No window available for printer discovery');
            }

            // Use webContents.getPrinters() if available (Electron < 20)
            // For newer versions, we need to use a different approach
            const webContents = win.webContents as any;

            if (typeof webContents.getPrinters === 'function') {
                this.printers = webContents.getPrinters();
            } else {
                // For Electron 20+, printers are discovered during print dialog
                // We'll use cached printers or return empty array
                // The print() method with silent: false will show available printers
                console.warn('getPrinters() not available, using cached printer list');
            }

            return this.printers.map((printer) => ({
                name: printer.name,
                displayName: printer.displayName || printer.name,
                description: printer.description,
                status: printer.status ?? 0,
                isDefault: printer.isDefault ?? false,
            }));
        } catch (error: any) {
            console.error('Failed to discover printers:', error);
            throw error;
        }
    }

    /**
     * Get list of discovered printers
     */
    getPrinters(): DiscoveredPrinter[] {
        return this.printers.map((printer) => ({
            name: printer.name,
            displayName: printer.displayName || printer.name,
            description: printer.description,
            status: printer.status,
            isDefault: printer.isDefault,
        }));
    }

    /**
     * Get default printer
     */
    getDefaultPrinter(): DiscoveredPrinter | null {
        const defaultPrinter = this.printers.find((p) => p.isDefault);
        if (!defaultPrinter) return null;

        return {
            name: defaultPrinter.name,
            displayName: defaultPrinter.displayName || defaultPrinter.name,
            description: defaultPrinter.description,
            status: defaultPrinter.status,
            isDefault: true,
        };
    }

    /**
     * Create hidden window for print rendering
     */
    private async createPrintWindow(): Promise<void> {
        if (this.printWindow && !this.printWindow.isDestroyed()) {
            return;
        }

        this.printWindow = new BrowserWindow({
            show: false,
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            },
        });

        // Load blank page initially
        await this.printWindow.loadURL('about:blank');
    }

    /**
     * Add a job to the print queue
     */
    async addJob(job: Omit<PrintJob, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<PrintJob> {
        const newJob: PrintJob = {
            ...job,
            id: this.generateJobId(),
            status: 'pending',
            createdAt: new Date(),
            retryCount: 0,
        };

        this.printQueue.push(newJob);

        // Start processing if not already
        if (!this.isProcessingQueue) {
            this.processQueue();
        }

        return newJob;
    }

    /**
     * Get queue status
     */
    getQueueStatus(): {
        queueSize: number;
        pendingJobs: number;
        processingJobs: number;
        failedJobs: number;
        completedToday: number;
        failedJobsList: PrintJob[];
    } {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const pendingJobs = this.printQueue.filter((j) => j.status === 'pending').length;
        const processingJobs = this.printQueue.filter((j) => j.status === 'printing').length;
        const failedJobs = this.printQueue.filter((j) => j.status === 'failed').length;
        const completedToday = this.printQueue.filter(
            (j) => j.status === 'completed' && j.completedAt && j.completedAt >= startOfDay
        ).length;
        const failedJobsList = this.printQueue.filter((j) => j.status === 'failed');

        return {
            queueSize: this.printQueue.length,
            pendingJobs,
            processingJobs,
            failedJobs,
            completedToday,
            failedJobsList,
        };
    }

    /**
     * Retry a specific failed job
     */
    async retryJob(jobId: string): Promise<{ success: boolean; error?: string }> {
        const job = this.printQueue.find((j) => j.id === jobId);
        if (!job) {
            return { success: false, error: 'Job not found' };
        }

        if (job.status !== 'failed') {
            return { success: false, error: 'Can only retry failed jobs' };
        }

        job.status = 'pending';
        job.error = undefined;

        // Start processing if not already
        if (!this.isProcessingQueue) {
            this.processQueue();
        }

        return { success: true };
    }

    /**
     * Retry all failed jobs
     */
    async retryAllFailed(): Promise<{ success: boolean; retriedCount: number }> {
        const failedJobs = this.printQueue.filter((j) => j.status === 'failed');

        for (const job of failedJobs) {
            job.status = 'pending';
            job.error = undefined;
        }

        // Start processing if not already
        if (!this.isProcessingQueue && failedJobs.length > 0) {
            this.processQueue();
        }

        return { success: true, retriedCount: failedJobs.length };
    }

    /**
     * Clear the print queue (pending and failed jobs only)
     */
    async clearQueue(): Promise<{ success: boolean; clearedCount: number }> {
        const beforeCount = this.printQueue.length;
        this.printQueue = this.printQueue.filter(
            (j) => j.status === 'printing' || j.status === 'completed'
        );
        const clearedCount = beforeCount - this.printQueue.length;

        return { success: true, clearedCount };
    }

    /**
     * Get all jobs
     */
    getJobs(filter?: { status?: string; limit?: number }): PrintJob[] {
        let jobs = [...this.printQueue];

        if (filter?.status) {
            jobs = jobs.filter((j) => j.status === filter.status);
        }

        // Sort by creation date, newest first
        jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (filter?.limit) {
            jobs = jobs.slice(0, filter.limit);
        }

        return jobs;
    }

    /**
     * Process the print queue
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessingQueue || this.state !== 'running') {
            return;
        }

        this.isProcessingQueue = true;

        while (this.printQueue.some((j) => j.status === 'pending')) {
            const job = this.printQueue.find((j) => j.status === 'pending');
            if (!job) break;

            try {
                await this.processJob(job);
            } catch (error: any) {
                console.error(`Failed to process job ${job.id}:`, error);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Process a single print job
     */
    private async processJob(job: PrintJob): Promise<void> {
        job.status = 'printing';

        try {
            if (!this.printWindow || this.printWindow.isDestroyed()) {
                await this.createPrintWindow();
            }

            // Load content based on type
            switch (job.contentType) {
                case 'html':
                    await this.printWindow!.loadURL(
                        `data:text/html;charset=utf-8,${encodeURIComponent(job.content)}`
                    );
                    break;
                case 'url':
                    await this.printWindow!.loadURL(job.content);
                    break;
                case 'raw':
                    // For raw content, wrap in basic HTML
                    const rawHtml = `<!DOCTYPE html><html><body><pre>${job.content}</pre></body></html>`;
                    await this.printWindow!.loadURL(
                        `data:text/html;charset=utf-8,${encodeURIComponent(rawHtml)}`
                    );
                    break;
            }

            // Wait for content to load
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Print
            await this.executePrint(job);

            job.status = 'completed';
            job.completedAt = new Date();
        } catch (error: any) {
            job.retryCount++;

            if (job.retryCount >= this.maxRetries) {
                job.status = 'failed';
                job.error = error.message;
            } else {
                // Re-queue for retry
                job.status = 'pending';
            }
        }
    }

    /**
     * Execute the actual print operation
     */
    private async executePrint(job: PrintJob): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.printWindow || this.printWindow.isDestroyed()) {
                reject(new Error('Print window not available'));
                return;
            }

            const printOptions: Electron.WebContentsPrintOptions = {
                silent: job.options.silent ?? true,
                printBackground: job.options.printBackground ?? true,
                deviceName: job.printerName || job.options.deviceName,
                color: job.options.color ?? true,
                landscape: job.options.landscape ?? false,
                copies: job.options.copies ?? 1,
                collate: job.options.collate ?? true,
            };

            // Add margins if specified
            if (job.options.margins) {
                printOptions.margins = job.options.margins;
            }

            // Add page ranges if specified
            if (job.options.pageRanges) {
                printOptions.pageRanges = job.options.pageRanges;
            }

            // Add duplex mode if specified
            if (job.options.duplexMode) {
                printOptions.duplexMode = job.options.duplexMode;
            }

            // Add DPI if specified
            if (job.options.dpi) {
                printOptions.dpi = job.options.dpi;
            }

            // Add header/footer if specified
            if (job.options.header) {
                printOptions.header = job.options.header;
            }
            if (job.options.footer) {
                printOptions.footer = job.options.footer;
            }

            // Add page size if specified
            if (job.options.pageSize) {
                printOptions.pageSize = job.options.pageSize as any;
            }

            this.printWindow.webContents.print(printOptions, (success, failureReason) => {
                if (success) {
                    resolve();
                } else {
                    reject(new Error(failureReason || 'Print failed'));
                }
            });
        });
    }

    /**
     * Generate unique job ID
     */
    private generateJobId(): string {
        return `pj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Print content directly (shorthand method)
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
        if (this.state !== 'running') {
            return { success: false, error: 'Print agent is not running' };
        }

        try {
            const job = await this.addJob({
                content,
                contentType: options.contentType || 'html',
                printerName: options.printerName,
                options: {
                    silent: options.silent ?? true,
                    copies: options.copies ?? 1,
                    color: options.color ?? true,
                    landscape: options.landscape ?? false,
                    pageSize: options.pageSize,
                },
            });

            return { success: true, jobId: job.id };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const printAgentService = new PrintAgentService();
export default printAgentService;
