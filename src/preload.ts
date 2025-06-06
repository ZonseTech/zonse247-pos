import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
	on: (channel: string, callback: (...args: any[]) => void) => {
		const validChannels = ['menu-action'];
		if (validChannels.includes(channel)) {
			const subscription = (_event: any, ...args: any[]) => callback(...args);
			ipcRenderer.on(channel, subscription);

			return () => {
				ipcRenderer.removeListener(channel, subscription);
			};
		}
		return null;
	},
});
