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

    menu: {
        rebuild: (userPermissions: { permissions: string[], roles: string[] }) =>
            ipcRenderer.invoke('menu:rebuild', userPermissions),
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
        onRestoreDatabase: (callback: (filePath: string) => void) => {
            const listener = (_event: any, filePath: string) => callback(filePath);
            ipcRenderer.on('menu-restore-database', listener);
            return () => ipcRenderer.removeListener('menu-restore-database', listener);
        },
        onCheckUpdates: (callback: () => void) => {
            const listener = () => callback();
            ipcRenderer.on('menu-check-updates', listener);
            return () => ipcRenderer.removeListener('menu-check-updates', listener);
        },
    },

    onOnboardingStatus: (callback: (status: any) => void) => {
        ipcRenderer.on('onboarding-status', (_event, status) => callback(status));
    },
});