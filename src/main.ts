import { app, BrowserWindow, screen, shell } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import MenuBuilder from './partials/menu';
import startServer from './api/server';
import { Capacitor } from '@capacitor/core';

let server;

if (started) {
	app.quit();
}

const createWindow = () => {
	server = startServer;
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;

	const mainWindow = new BrowserWindow({
		width,
		height,
		icon: path.join(__dirname, './assets/images/favicon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: true,
		},
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();

	mainWindow.webContents.setWindowOpenHandler((edata) => {
		shell.openExternal(edata.url);
		return { action: 'deny' };
	});

	if (process.env.NODE_ENV === 'production' && !Capacitor.isNativePlatform()) {
		server.start();
	}

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
		);
	}

	mainWindow.webContents.openDevTools();
};

app.whenReady().then(createWindow);

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
