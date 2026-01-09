import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    settings: {
        saveSetup: (setupData: any) => ipcRenderer.invoke('settings:save-setup', setupData),
        getSetup: () => ipcRenderer.invoke('settings:get-setup'),
        hasSetup: () => ipcRenderer.invoke('settings:has-setup'),
        getSignature: () => ipcRenderer.invoke('settings:get-tenant-signature'),
        updateSetup: (updates: any) => ipcRenderer.invoke('settings:update-setup', updates),
        clearSetup: () => ipcRenderer.invoke('settings:clear-setup'),
    },

    database: {
        getStatus: () => ipcRenderer.invoke('db:status'),
        runMigrations: () => ipcRenderer.invoke('db:run-migrations'),
    },

    printAgent: {
        // Agent Control
        start: () => ipcRenderer.invoke('print-agent:start'),
        stop: () => ipcRenderer.invoke('print-agent:stop'),
        getStatus: () => ipcRenderer.invoke('print-agent:status'),
        getPermissions: () => ipcRenderer.invoke('print-agent:permissions'),
        getSetupInstructions: () => ipcRenderer.invoke('print-agent:setup-instructions'),

        // Printer Discovery
        discoverPrinters: () => ipcRenderer.invoke('print-agent:discover-printers'),
        getPrinters: () => ipcRenderer.invoke('print-agent:get-printers'),
        getDefaultPrinter: () => ipcRenderer.invoke('print-agent:get-default-printer'),

        // Print Queue
        getQueueStatus: () => ipcRenderer.invoke('print-agent:queue-status'),
        getJobs: (filter?: { status?: string; limit?: number }) =>
            ipcRenderer.invoke('print-agent:get-jobs', filter),
        retryJob: (jobId: string) => ipcRenderer.invoke('print-agent:retry-job', jobId),
        retryAllFailed: () => ipcRenderer.invoke('print-agent:retry-all-failed'),
        clearQueue: () => ipcRenderer.invoke('print-agent:clear-queue'),

        // Print Operations
        print: (content: string, options?: {
            contentType?: 'html' | 'url' | 'raw';
            printerName?: string;
            copies?: number;
            silent?: boolean;
            color?: boolean;
            landscape?: boolean;
            pageSize?: string;
        }) => ipcRenderer.invoke('print-agent:print', content, options),
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
        }) => ipcRenderer.invoke('print-agent:add-job', job),
    },

    menu: {
        rebuild: (user: User) =>
            ipcRenderer.invoke('menu:rebuild', user),
        onNavigate: (callback: (route: string) => void) => {
            const listener = (_event: any, route: string) => callback(route);
            ipcRenderer.on('menu-navigate', listener);
            return () => ipcRenderer.removeListener('menu-navigate', listener);
        },
        onOpenModal: (callback: (modalName: string) => void) => {
            const listener = (_event: any, modalName: string) => callback(modalName);
            ipcRenderer.on('menu-open-modal', listener);
            return () => ipcRenderer.removeListener('menu-open-modal', listener);
        },
        onLogout: (callback: () => void) => {
            const listener = () => callback();
            ipcRenderer.on('menu-logout', listener);
            return () => ipcRenderer.removeListener('menu-logout', listener);
        },
        onRestoreDatabase: (filePath: string) =>
            ipcRenderer.invoke('menu:restore-database', filePath)
        ,
        onCheckUpdates: (callback: () => void) => {
            const listener = () => callback();
            ipcRenderer.on('menu:check-updates', listener);
            return () => ipcRenderer.removeListener('menu:check-updates', listener);
        },
    },

    onOnboardingStatus: (callback: (status: any) => void) => {
        ipcRenderer.on('onboarding-status', (_event, status) => callback(status));
    },
});