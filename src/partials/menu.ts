import {
	app,
	Menu,
	shell,
	BrowserWindow,
	MenuItemConstructorOptions,
} from 'electron';

export default class MenuBuilder {
	mainWindow: BrowserWindow;
	private isMac: boolean;

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
		this.isMac = process.platform === 'darwin';
	}

	buildMenu(): Menu {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		const menu = Menu.buildFromTemplate(this.buildDefaultTemplate());
		Menu.setApplicationMenu(menu);
		return menu;
	}

	setupDevelopmentEnvironment(): void {
		this.mainWindow.webContents.on('context-menu', (_, props) => {
			const { x, y } = props;
			Menu.buildFromTemplate([
				{
					label: 'Inspect element',
					click: () => {
						this.mainWindow.webContents.inspectElement(x, y);
					},
				},
				{
					label: 'Refresh',
					role: 'reload',
				},
			]).popup({ window: this.mainWindow });
		});
	}

	private navigateTo(route: string): void {
		this.mainWindow.webContents.send('menu-navigate', route);
	}

	private openModal(modal: string): void {
		this.mainWindow.webContents.send('menu-open-modal', modal);
	}

	private performAction(action: string): void {
		if (action === 'logout') {
			this.mainWindow.webContents.send('menu-logout');
		} else if (action === 'restore-database') {
			this.mainWindow.webContents.send('menu-restore-database');
		} else if (action === 'check-updates') {
			this.mainWindow.webContents.send('menu-check-updates');
		}
	}

	buildDefaultTemplate(): MenuItemConstructorOptions[] {
		const templateDefault: Array<MenuItemConstructorOptions> = [
			{
				label: 'File',
				submenu: [
					{
						label: 'New',
						submenu: [
							{
								label: 'Product',
								accelerator: 'CommandOrControl+N',
								click: () => this.openModal('new-product'),
							},
							{
								label: 'Category',
								click: () => this.openModal('new-category'),
							},
							{
								label: 'Customer',
								click: () => this.openModal('new-customer'),
							},
						] as MenuItemConstructorOptions[],
					},
					{ type: 'separator' },
					{
						label: 'Backup Database',
						click: () => this.navigateTo('/export-db'),
					},
					{
						label: 'Restore Database',
						click: () => this.performAction('restore-database'),
					},
					{ type: 'separator' },
					{
						label: 'Sync Data',
						accelerator: 'CommandOrControl+Shift+S',
						click: () => this.navigateTo('/sync-data'),
					},
					{ type: 'separator' },
					{
						label: 'Logout',
						accelerator: 'CommandOrControl+Shift+L',
						click: () => this.performAction('logout'),
					},
					{ label: 'Quit', role: 'quit', accelerator: 'CommandOrControl+Q' },
				] as MenuItemConstructorOptions[],
			},
			{
				label: 'Edit',
				submenu: [
					{ role: 'undo' },
					{ role: 'redo' },
					{ type: 'separator' },
					{ role: 'cut' },
					{ role: 'copy' },
					{ role: 'paste' },
					{ role: 'delete' },
					{ type: 'separator' },
					{ role: 'selectAll' },
				] as MenuItemConstructorOptions[],
			},
			{
				label: 'View',
				submenu: [
					{
						label: 'Point of Sale',
						accelerator: 'CommandOrControl+P',
						click: () => this.navigateTo('/pos'),
					},
					{
						label: 'Dashboard',
						accelerator: 'CommandOrControl+D',
						click: () => this.navigateTo('/dashboard'),
					},
					{ type: 'separator' },
					{
						label: 'Products',
						click: () => this.navigateTo('/products'),
					},
					{
						label: 'Categories',
						click: () => this.navigateTo('/categories'),
					},
					{ type: 'separator' },
					{
						label: 'Transactions',
						accelerator: 'CommandOrControl+T',
						click: () => this.navigateTo('/transactions'),
					},
					{ type: 'separator' },
					{
						label: 'Refresh',
						role: 'reload',
						accelerator: 'CommandOrControl+R',
					},
					...(!app.isPackaged
						? [{ role: 'toggleDevTools' as const, accelerator: 'CommandOrControl+Shift+I' } as MenuItemConstructorOptions]
						: []),
					{ type: 'separator' },
					{ role: 'resetZoom' },
					{ role: 'zoomIn', accelerator: 'CommandOrControl+Plus' },
					{ role: 'zoomOut', accelerator: 'CommandOrControl+-' },
					{ type: 'separator' },
					{ role: 'togglefullscreen', accelerator: 'F11' },
				] as MenuItemConstructorOptions[],
			},
			{
				label: 'Management',
				submenu: [
					{
						label: 'Users',
						click: () => this.navigateTo('/users'),
					},
					{
						label: 'Security & Roles',
						click: () => this.navigateTo('/roles-permissions'),
					},
					{ type: 'separator' },
					{
						label: 'Branches',
						click: () => this.navigateTo('/shops'),
					},
					{
						label: 'Terminals',
						click: () => this.navigateTo('/workstations'),
					},
					{ type: 'separator' },
					{
						label: 'Settings',
						accelerator: 'CommandOrControl+,',
						click: () => this.navigateTo('/settings'),
					},
				] as MenuItemConstructorOptions[],
			},
			{
				label: 'Admin',
				submenu: [
					{
						label: 'Subscriptions',
						click: () => this.navigateTo('/subscriptions'),
					},
					{
						label: 'Tenants',
						click: () => this.navigateTo('/tenants'),
					},
					{ type: 'separator' },
					{
						label: 'Migrations',
						click: () => this.navigateTo('/migrations'),
					},
				] as MenuItemConstructorOptions[],
			},
			{
				label: 'Help',
				submenu: [
					{
						label: 'Documentation',
						click: () => {
							shell.openExternal('https://docs.zonse247.com');
						},
					},
					{
						label: 'Send Feedback',
						click: () => {
							shell.openExternal('https://zonse247.com/feedback');
						},
					},
					{ type: 'separator' },
					{
						label: 'Check for Updates...',
						click: () => this.performAction('check-updates'),
					},
					{ type: 'separator' },
					{
						label: `About ${app.getName()}`,
						click: () => this.openModal('about'),
					},
				] as MenuItemConstructorOptions[],
			},
		];

		return templateDefault;
	}
}