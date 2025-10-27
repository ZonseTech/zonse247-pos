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

    onOnboardingStatus: (callback: (status: any) => void) => {
        ipcRenderer.on('onboarding-status', (event, status) => callback(status));
    },
});