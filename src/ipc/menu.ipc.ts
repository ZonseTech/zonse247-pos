import MenuBuilder from '../partials/menu';
import { version } from '../../package.json';
import { ipcMain, BrowserWindow, dialog } from 'electron';

export function setupMenuIPC() {
    ipcMain.handle('menu:rebuild', async (event, user, businessType, hiddenNavItemIds) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win) return;

        const menuBuilder = new MenuBuilder(win);
        menuBuilder.buildMenu(user, businessType, hiddenNavItemIds);
    });

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

    ipcMain.on('menu-logout', async (event) => {
        try {
            const win = BrowserWindow.fromWebContents(event.sender);
            if (!win) return;

            win.webContents.send('auth:logout');
        } catch (error) {
            console.error('Menu logout error:', error);
        }
    });

    ipcMain.handle('menu:check-updates', async () => {
        return { updateAvailable: false, version };
    });
}
