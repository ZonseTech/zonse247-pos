import { app, dialog } from 'electron';
import { autoUpdater, UpdateInfo } from 'electron-updater';

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000;

let initialized = false;
let checking = false;
let manualCheck = false;
let promptedVersion: string | null = null;

function promptRestart(info: UpdateInfo): void {
	dialog
		.showMessageBox({
			type: 'info',
			title: 'Update Ready',
			message: `Zonse247 POS ${info.version} has been downloaded.`,
			detail: 'Restart now to install it, or it will install automatically the next time the app closes.',
			buttons: ['Restart Now', 'Later'],
			defaultId: 0,
			cancelId: 1,
		})
		.then(({ response }) => {
			if (response === 0) {
				autoUpdater.quitAndInstall();
			}
		});
}

export function initUpdater(): void {
	if (initialized || !app.isPackaged) return;
	initialized = true;

	autoUpdater.autoDownload = true;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.on('update-available', (info: UpdateInfo) => {
		if (manualCheck && promptedVersion !== info.version) {
			dialog.showMessageBox({
				type: 'info',
				title: 'Update Available',
				message: `Zonse247 POS ${info.version} is available.`,
				detail: 'It is downloading in the background. You will be asked to restart once it is ready.',
				buttons: ['OK'],
			});
		}
		manualCheck = false;
	});

	autoUpdater.on('update-not-available', () => {
		if (manualCheck) {
			dialog.showMessageBox({
				type: 'info',
				title: 'No Updates Available',
				message: `You are using the latest version: ${app.getVersion()}`,
				buttons: ['OK'],
			});
		}
		manualCheck = false;
	});

	autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
		const wasManual = manualCheck;
		manualCheck = false;
		if (!wasManual && promptedVersion === info.version) return;
		promptedVersion = info.version;
		promptRestart(info);
	});

	autoUpdater.on('error', (error: Error) => {
		console.error('Auto-update error:', error);
		if (manualCheck) {
			dialog.showErrorBox(
				'Update Check Failed',
				'Could not check for updates. Please make sure you are connected to the internet and try again.'
			);
		}
		manualCheck = false;
	});

	checkForUpdates();
	setInterval(() => checkForUpdates(), CHECK_INTERVAL_MS);
}

export async function checkForUpdates(manual: boolean = false): Promise<void> {
	if (!app.isPackaged) {
		if (manual) {
			dialog.showMessageBox({
				type: 'info',
				title: 'Updates Unavailable',
				message: 'Updates are only available in the installed app.',
				buttons: ['OK'],
			});
		}
		return;
	}

	if (manual) manualCheck = true;
	if (checking) return;

	checking = true;
	await autoUpdater.checkForUpdates().catch(() => {});
	checking = false;
}
