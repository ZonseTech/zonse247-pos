import * as path from 'path';
import pkg from '../../package.json';
import { appConfig } from './config';
import { app, dialog, BrowserWindow, AboutPanelOptionsOptions } from 'electron';

const iconPath: string = path.join(
	__dirname,
	'../../../assets/images/icon.png'
);
const appVersion: string = app.getVersion();
const appName: string = app.getName();

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

export { showAbout, getDocs, sendFeedback };
