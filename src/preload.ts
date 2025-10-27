import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    settings: {
        save: (data: any) => ipcRenderer.invoke('settings:save', data),
        get: () => ipcRenderer.invoke('settings:get'),
        update: (id: string, data: any) => ipcRenderer.invoke('settings:update', { id, data }),
        clear: () => ipcRenderer.invoke('settings:clear'),
        hasSettings: () => ipcRenderer.invoke('settings:hasSettings'),
        verify: () => ipcRenderer.invoke('settings:verify'),
    },
});