import * as path from 'path';
import pkg from '../../package.json';
import { appConfig } from './config';
import { app, dialog, BrowserWindow, AboutPanelOptionsOptions } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';

const iconPath: string = path.join(
	__dirname,
	'../../../assets/images/icon.png'
);
const appVersion: string = app.getVersion();
const appName: string = app.getName();
const isPackaged: boolean = app.isPackaged;
const updateServer: string = appConfig.UPDATE_SERVER;
const updateUrl = `${updateServer}/update/${
	process.platform
}/${app.getVersion()}`;

function showAbout(): void {
	const options: AboutPanelOptionsOptions = {
		applicationName: `${appName}`,
		applicationVersion: `v${appVersion}`,
		copyright: `Copyright © ${
			appConfig.COPYRIGHT_YEAR
		}-${new Date().getFullYear()} by ${pkg.author.name}`,
		version: `v${appVersion}`,
		authors: [pkg.author.name],
		website: pkg.website,
		iconPath: iconPath,
	};
	app.setAboutPanelOptions(options);
	app.showAboutPanel();
}

function getDocs(): void {
	//
}

function sendFeedback(): void {
	//
}

function checkForUpdates(): void {
	if (!isPackaged) {
		console.log(`Skipping update check in development mode`);
		return;
	}

	const dialogOpts: Electron.MessageBoxOptions = {
		type: 'info',
		buttons: ['Update now', 'Later'],
		title: 'New version available',
		message: '',
		detail: '',
	};

	autoUpdater.setFeedURL({
		provider: 'generic',
		url: updateUrl,
	});

	autoUpdater.checkForUpdates();
	autoUpdater.autoDownload = false;

	const handleUpdateAvailable = (info: UpdateInfo): void => {
		const message = `Current version: ${pkg.version}\nNew Version: ${info.version}`;
		dialogOpts.message = message;
		dialogOpts.detail =
			process.platform === 'win32'
				? (info.releaseNotes as string)
				: (info.releaseName as string);
		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) {
				autoUpdater.downloadUpdate();
			}
		});
	};

	const handleUpdateNotAvailable = (info: UpdateInfo): void => {
		dialogOpts.type = 'info';
		dialogOpts.buttons = ['OK'];
		dialogOpts.title = 'No Updates Available';
		dialogOpts.message = `You are using the latest version: ${info.version}`;
		dialog.showMessageBox(dialogOpts);
	};

	const handleUpdateDownloaded = (info: UpdateInfo): void => {
		console.log(`Update downloaded for version ${info.version}`);
		dialogOpts.buttons = ['Install now', 'Later'];
		dialogOpts.title = 'Ready to Install Update';
		dialogOpts.message = `The update for version ${info.version} is downloaded.\nClick 'Install now' to restart the app and apply the update.`;
		dialog.showMessageBox(dialogOpts).then((returnValue) => {
			if (returnValue.response === 0) {
				autoUpdater.quitAndInstall();
			}
		});
	};

	const handleError = async (err: Error): Promise<void> => {
		try {
			console.error(`Error checking for updates: ${err}`);
			const dialogOpts: Electron.MessageBoxOptions = {
				type: 'error',
				title: 'Update check failed',
				message: 'An error occurred while checking for updates.',
				detail: err.toString(),
				buttons: ['Retry', 'Cancel'],
			};
			const returnValue = await dialog.showMessageBox(dialogOpts);
			if (returnValue.response === 0) {
				checkForUpdates();
			}
		} catch (error) {
			console.error(`Error in handleError function: ${error}`);
		}
	};

	autoUpdater.on('update-available', handleUpdateAvailable);
	autoUpdater.on('update-not-available', handleUpdateNotAvailable);
	autoUpdater.on('update-downloaded', handleUpdateDownloaded);
	autoUpdater.on('error', handleError);
}

const getMainWindow = (): BrowserWindow | null => {
	const windows = BrowserWindow.getAllWindows();
	return windows.length > 0 ? windows[0] : null;
};

export const handleClick = (action: string) => {
	const mainWindow = getMainWindow();

	if (!mainWindow) {
		console.error('No main window found');
		return;
	}

	mainWindow.webContents.send('menu-action', action);
};

export { showAbout, checkForUpdates, getDocs, sendFeedback };
