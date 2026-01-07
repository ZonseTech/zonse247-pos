import path from 'node:path';
import MenuBuilder from './partials/menu';
import { setupIPC } from './ipc/setup.ipc';
import started from 'electron-squirrel-startup';
import { isElectron } from './helpers/index.helper';
import { app, BrowserWindow, screen, shell } from 'electron';
import { setupMenuIPC } from './ipc/menu.ipc';
import Zonse247PosApi, { SecureSettingsService } from 'zonse247-pos-api'

if (started) {
	app.quit();
}

const server = new Zonse247PosApi(app)

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

	if (isElectron()) {
		try {
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

app.whenReady().then(async () => {
	// Use Electron's user data path for secure storage (writable location)
	const userDataPath = path.join(app.getPath('userData'), '.secure-data');
	await SecureSettingsService.initialize(userDataPath);

	setupIPC();
	setupMenuIPC();

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