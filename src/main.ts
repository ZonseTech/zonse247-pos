import path from 'node:path';
import MenuBuilder from './partials/menu';
import { setupIPC } from './ipc/setup.ipc';
import { setupMenuIPC } from './ipc/menu.ipc';
import started from 'electron-squirrel-startup';
import { isElectron } from './helpers/index.helper';
import { app, BrowserWindow, screen, shell } from 'electron';
import Zonse247PosApi, {
	SecureSettingsService,
	PrintAgentService,
	initSyncJob,
	stopSyncJob,
	getSyncJob,
	resetSyncTimestamps,
	type SyncJobService,
} from 'zonse247-pos-api';
import sessionService from './services/session.service';

let syncJob: SyncJobService | null = null;
let printAgent: PrintAgentService | null = null;
let appSetup: { tenantId: string; branchId: string; terminalId: string } | null = null;

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

let server: Zonse247PosApi | null = null;
app.whenReady().then(async () => {
	server = new Zonse247PosApi(app, {

	});

	if (isElectron()) {
		try {
			await server.start();
			console.log('✓ Server started successfully');
		} catch (error) {
			console.error('Failed to start server:', error);
			app.quit();
			return;
		}
	}

	await SecureSettingsService.initialize(app.getPath('userData'));

	const setup = await SecureSettingsService.getAppSetup();
	printAgent = PrintAgentService.getInstance({
		autoDiscoverPrinters: true,
		discoveryIntervalMs: 30000,
		autoRegisterPrinters: false,
		defaultTenantId: setup?.tenantId || '',
		defaultBranchId: setup?.branchId || '',
	});

	// Store setup for session-based sync job initialization
	if (setup?.tenantId && setup?.branchId && setup?.terminalId) {
		appSetup = {
			tenantId: setup.tenantId,
			branchId: setup.branchId,
			terminalId: setup.terminalId,
		};
	}

	sessionService.onSessionChange(async (session) => {
		const liveApiUrl = import.meta.env.VITE_LIVE_API_URL || 'https://api.zonse247.com/api/v1';

		if (session.token && appSetup) {
			await resetSyncTimestamps();

			const existingJob = getSyncJob();
			if (!existingJob) {
				syncJob = initSyncJob({
					serverUrl: liveApiUrl,
					apiKey: session.token,
					terminalId: appSetup.terminalId,
					tenantId: appSetup.tenantId,
					branchId: appSetup.branchId,
					enablePull: true,
				});
				console.log('✓ Sync Job started (user logged in)');

				await syncJob.runSyncCycle();
			}

			printAgent.start().then(() => {
				console.log('✓ Print Agent auto-started (zonse247-pos-api)');
			}).catch((error) => {
				console.warn('⚠ Print Agent auto-start error:', error);
			});
		} else {
			if (syncJob) {
				stopSyncJob();
				syncJob = null;
				console.log('✓ Sync Job stopped (user logged out)');
			}
		}
	});

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
	if (printAgent) {
		printAgent.stop().catch((error) => {
			console.error('Failed to stop print agent:', error);
		});
	}

	if (syncJob) {
		stopSyncJob();
		console.log('✓ Sync Job stopped');
	}

	if (server) {
		server.stop();
	}
});