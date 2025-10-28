import { ipcMain, BrowserWindow, dialog, autoUpdater } from 'electron';

export function setupMenuIPC() {
    ipcMain.handle('menu:restore-database', async (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);

        if (!win) return null;

        const result = await dialog.showOpenDialog(win, {
            title: 'Select Database Backup',
            filters: [
                { name: 'Database Files', extensions: ['db', 'sqlite', 'sql'] },
                { name: 'All Files', extensions: ['*'] }
            ],
            properties: ['openFile']
        });

        if (!result.canceled && result.filePaths.length > 0) {
            return result.filePaths[0];
        }

        return null;
    });

    ipcMain.handle('menu:check-updates', async () => {
        return { updateAvailable: false, version: '1.0.0' };
    });
}