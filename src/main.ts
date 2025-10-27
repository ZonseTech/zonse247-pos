import path from 'node:path';
import startServer from './api/server';
import MenuBuilder from './partials/menu';
import { Capacitor } from '@capacitor/core';
import started from 'electron-squirrel-startup';
import { app, BrowserWindow, screen, shell, ipcMain } from 'electron';
import { SecureSettingsService } from './api/services/secure-settings.service';

let server;

if (started) {
	app.quit();
}

const createWindow = async (skipOnboarding: boolean = false) => {
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	const mainWindow = new BrowserWindow({
		width,
		height,
		icon: path.join(__dirname, './assets/images/favicon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
		show: false,
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: 'deny' };
	});

	if (!Capacitor.isNativePlatform()) {
		try {
			server = startServer;
			await server.start();
			console.log('Server started successfully');
		} catch (error) {
			console.error('Failed to start server:', error);
			app.quit();
			return;
		}
	}

	try {
		if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
			await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
			mainWindow.webContents.openDevTools();
		} else {
			await mainWindow.loadFile(
				path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
			);
		}

		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.webContents.send('onboarding-status', { skipOnboarding });
		});

		mainWindow.show();
	} catch (error) {
		console.error('Failed to load window content:', error);
		app.quit();
	}
};

function setupIPC() {
	ipcMain.handle('settings:save-setup', async (event, setupData) => {
		try {
			await SecureSettingsService.saveAppSetup(setupData);
			return { success: true };
		} catch (error: any) {
			console.error('Failed to save setup:', error);
			return { success: false, error: error.message };
		}
	});

	ipcMain.handle('settings:get-setup', async () => {
		try {
			const setup = await SecureSettingsService.getAppSetup();
			return { success: true, data: setup };
		} catch (error: any) {
			console.error('Failed to get setup:', error);
			return { success: false, error: error.message };
		}
	});

	ipcMain.handle('settings:has-setup', async () => {
		try {
			const hasSetup = await SecureSettingsService.hasAppSetup();
			return { success: true, data: hasSetup };
		} catch (error: any) {
			console.error('Failed to check setup:', error);
			return { success: false, error: error.message };
		}
	});

	ipcMain.handle('settings:get-tenant-signature', async () => {
		try {
			const verificationToken = await SecureSettingsService.getTenantSignature();
			return { success: true, data: verificationToken };
		} catch (error: any) {
			console.error('Failed to get verificationToken:', error);
			return { success: false, error: error.message };
		}
	});

	ipcMain.handle('settings:update-setup', async (event, updates) => {
		try {
			await SecureSettingsService.updateAppSetup(updates);
			return { success: true };
		} catch (error: any) {
			console.error('Failed to update setup:', error);
			return { success: false, error: error.message };
		}
	});

	ipcMain.handle('settings:clear-setup', async () => {
		try {
			await SecureSettingsService.clearAppSetup();
			return { success: true };
		} catch (error: any) {
			console.error('Failed to clear setup:', error);
			return { success: false, error: error.message };
		}
	});
}

app.whenReady().then(async () => {
	await SecureSettingsService.initialize();

	setupIPC();

	const hasSetup = await SecureSettingsService.hasAppSetup();

	await createWindow(!hasSetup);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on('will-quit', () => {
	if (server) {
		server.stop();
	}
});