declare global {
    interface Window {
        electronAPI: {
            settings: {
                clearSetup: () => Promise<ApiResponse<void>>;
                hasSetup: () => Promise<ApiResponse<boolean>>;
                getSetup: () => Promise<ApiResponse<SetupData>>;
                getSignature: () => Promise<ApiResponse<string>>;
                saveSetup: (setupData: SetupData) => Promise<ApiResponse<void>>;
                updateSetup: (updates: Partial<SetupData>) => Promise<ApiResponse<void>>;
            };
            database: {
                getStatus: () => Promise<{
                    initialized: boolean;
                    version: string | null;
                    targetVersion: string;
                    needsMigration: boolean;
                    dbPath: string;
                    backupsPath: string;
                } | null>;
                runMigrations: () => Promise<{
                    success: boolean;
                    migrationsApplied: string[];
                    error?: string;
                }>;
            };
            printAgent: {
                // Agent Control
                start: () => Promise<{ success: boolean; error?: string }>;
                stop: () => Promise<{ success: boolean; error?: string }>;
                getStatus: () => Promise<{
                    success: boolean;
                    data?: {
                        state: 'idle' | 'starting' | 'running' | 'stopping' | 'error';
                        connectedPrinters: number;
                        lastError?: string;
                        startedAt?: Date;
                    };
                    error?: string;
                }>;
                getPermissions: () => Promise<{
                    success: boolean;
                    data?: {
                        canPrint: boolean;
                        canAccessPrinters: boolean;
                        canManageQueue: boolean;
                        missingPermissions: string[];
                    };
                    error?: string;
                }>;
                getSetupInstructions: () => Promise<{
                    success: boolean;
                    data?: {
                        os: string;
                        instructions: string[];
                        commands?: string[];
                        links?: { label: string; url: string }[];
                    };
                    error?: string;
                }>;
                // Printer Discovery
                discoverPrinters: () => Promise<{
                    success: boolean;
                    data?: Array<{
                        name: string;
                        displayName: string;
                        description?: string;
                        status: number;
                        isDefault: boolean;
                    }>;
                    error?: string;
                }>;
                getPrinters: () => Promise<{
                    success: boolean;
                    data?: Array<{
                        name: string;
                        displayName: string;
                        description?: string;
                        status: number;
                        isDefault: boolean;
                    }>;
                    error?: string;
                }>;
                getDefaultPrinter: () => Promise<{
                    success: boolean;
                    data?: {
                        name: string;
                        displayName: string;
                        description?: string;
                        status: number;
                        isDefault: boolean;
                    } | null;
                    error?: string;
                }>;
                // Print Queue
                getQueueStatus: () => Promise<{
                    success: boolean;
                    data?: {
                        queueSize: number;
                        pendingJobs: number;
                        processingJobs: number;
                        failedJobs: number;
                        completedToday: number;
                    };
                    error?: string;
                }>;
                getJobs: (filter?: { status?: string; limit?: number }) => Promise<{
                    success: boolean;
                    data?: Array<{
                        id: string;
                        content: string;
                        contentType: 'html' | 'url' | 'raw';
                        printerName?: string;
                        status: 'pending' | 'printing' | 'completed' | 'failed';
                        createdAt: Date;
                        completedAt?: Date;
                        error?: string;
                        retryCount: number;
                    }>;
                    error?: string;
                }>;
                retryJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
                retryAllFailed: () => Promise<{ success: boolean; data?: { retriedCount: number }; error?: string }>;
                clearQueue: () => Promise<{ success: boolean; data?: { clearedCount: number }; error?: string }>;
                // Print Operations
                print: (content: string, options?: {
                    contentType?: 'html' | 'url' | 'raw';
                    printerName?: string;
                    copies?: number;
                    silent?: boolean;
                    color?: boolean;
                    landscape?: boolean;
                    pageSize?: string;
                }) => Promise<{ success: boolean; jobId?: string; error?: string }>;
                addJob: (job: {
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
                }) => Promise<{
                    success: boolean;
                    data?: {
                        id: string;
                        status: string;
                        createdAt: Date;
                    };
                    error?: string;
                }>;
            };
            menu: {
                rebuild: (user: User) => void;
                onLogout: (callback: () => void) => () => void;
                onCheckUpdates: (callback: () => void) => () => void;
                onNavigate: (callback: (route: string) => void) => () => void;
                onOpenModal: (callback: (modalName: string) => void) => () => void;
                onRestoreDatabase: (callback: (filePath: string) => void) => () => void;
            };
            onOnboardingStatus: (callback: (status: any) => void) => void;
        };
    }
}

export function isElectron() {
    return !!(
        (typeof process !== 'undefined' && process.versions && process.versions.electron) ||
        (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Electron'))
    );
}