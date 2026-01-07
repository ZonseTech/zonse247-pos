import path from 'node:path';
import fs from 'node:fs';
import MenuBuilder from './partials/menu';
import { setupIPC } from './ipc/setup.ipc';
import started from 'electron-squirrel-startup';
import { isElectron } from './helpers/index.helper';
import { app, BrowserWindow, screen, shell } from 'electron';
import { setupMenuIPC } from './ipc/menu.ipc';

// Types for dynamic imports
type Zonse247PosApiType = typeof import('zonse247-pos-api').default;
type SecureSettingsServiceType = typeof import('zonse247-pos-api').SecureSettingsService;

if (started) {
	app.quit();
}

let server: InstanceType<Zonse247PosApiType> | null = null;
let SecureSettingsService: SecureSettingsServiceType;

/**
 * Initialize database path and dynamically import the API module
 * Must be called after app is ready to ensure userData path is available
 * and BEFORE importing zonse247-pos-api to ensure DATABASE_URL is set
 */
const initializeDatabase = async () => {
	// Set DATABASE_URL to use Electron's userData directory for SQLite storage
	// This ensures the database is created in a writable location on all platforms
	const dbDirectory = path.join(app.getPath('userData'), 'database');
	if (!fs.existsSync(dbDirectory)) {
		fs.mkdirSync(dbDirectory, { recursive: true });
	}
	const dbPath = path.join(dbDirectory, 'local.db');
	process.env.DATABASE_URL = `file:${dbPath}`;
	process.env.DATABASE_OFFLINE_MODE = 'true';

	console.log(`Database path: ${dbPath}`);

	// Dynamic import AFTER setting env vars - this is crucial!
	// The module will now read the correct DATABASE_URL
	const apiModule = await import('zonse247-pos-api');
	SecureSettingsService = apiModule.SecureSettingsService;

	// Initialize the API server after setting env vars
	server = new apiModule.default(app);
};

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
			await server!.start();
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
		} else {
			await mainWindow.loadFile(
				path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
			);
		}

		mainWindow.webContents.on('did-finish-load', () => {
			mainWindow.webContents.send('onboarding-status', { skipOnboarding });
		});

		mainWindow.webContents.openDevTools();

		mainWindow.show();
	} catch (error) {
		console.error('Failed to load window content:', error);
		app.quit();
	}
};

app.whenReady().then(async () => {
	// Initialize database and API server first (must be after app ready)
	// This uses dynamic import to ensure DATABASE_URL is set before the module loads
	await initializeDatabase();

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