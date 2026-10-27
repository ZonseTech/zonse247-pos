import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    session: {
        setToken: (token: string | null) => ipcRenderer.invoke('session:set-token', token),
        getToken: () => ipcRenderer.invoke('session:get-token'),
        set: (data: { token?: string; userId?: string; tenantId?: string; branchId?: string }) =>
            ipcRenderer.invoke('session:set', data),
        get: () => ipcRenderer.invoke('session:get'),
        clear: () => ipcRenderer.invoke('session:clear'),
    },

    settings: {
        saveSetup: (setupData: any) => ipcRenderer.invoke('settings:save-setup', setupData),
        getSetup: () => ipcRenderer.invoke('settings:get-setup'),
        hasSetup: () => ipcRenderer.invoke('settings:has-setup'),
        getSignature: () => ipcRenderer.invoke('settings:get-tenant-signature'),
        getActiveBranch: () => ipcRenderer.invoke('settings:get-active-branch'),
        setActiveBranch: (branchId: string) => ipcRenderer.invoke('settings:set-active-branch', branchId),
        getAvailableBranches: () => ipcRenderer.invoke('settings:get-available-branches'),
        updateSetup: (updates: any) => ipcRenderer.invoke('settings:update-setup', updates),
        clearSetup: () => ipcRenderer.invoke('settings:clear-setup'),
    },

    database: {
        getStatus: () => ipcRenderer.invoke('db:status'),
    },

    backup: {
        uploadToCloud: () => ipcRenderer.invoke('backup:upload-to-cloud'),
        getLatest: () => ipcRenderer.invoke('backup:get-latest'),
        onProgress: (callback: (progress: { phase: string; percent: number }) => void) => {
            const listener = (_event: any, progress: { phase: string; percent: number }) => callback(progress);
            ipcRenderer.on('backup:progress', listener);
            return () => ipcRenderer.removeListener('backup:progress', listener);
        },
    },

    menu: {
        rebuild: (user: User, businessType?: BusinessType | null, hiddenNavItemIds?: string[]) =>
            ipcRenderer.invoke('menu:rebuild', user, businessType, hiddenNavItemIds),
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
            ipcRenderer.on('auth:logout', listener);
            return () => ipcRenderer.removeListener('auth:logout', listener);
        },
        onRestoreDatabase: (filePath: string) =>
            ipcRenderer.invoke('menu:restore-database', filePath)
        ,
    },

    onOnboardingStatus: (callback: (status: any) => void) => {
        ipcRenderer.on('onboarding-status', (_event, status) => callback(status));
    },
});