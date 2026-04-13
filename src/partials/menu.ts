import {
	app,
	Menu,
	BrowserWindow,
	MenuItemConstructorOptions,
	shell,
} from 'electron';
import { ROUTES } from '../app/utils/constants';
import { hasAnyPermission } from '../app/utils';
import { buildNavMenuGroups, navGroupsToElectronMenu } from '../app/navigation/partials/navMenuConfig';

export default class MenuBuilder {
	mainWindow: BrowserWindow;
	private user: User | null = null;
	private businessType: BusinessType | null = null;

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
	}

	buildMenu(user?: User, businessType?: BusinessType): Menu {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		this.user = user || null;
		this.businessType = businessType || null;
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
		this.mainWindow.webContents.send(action);
	}

	buildDefaultTemplate(): Array<MenuItemConstructorOptions> {
		const template: Array<MenuItemConstructorOptions> = [];

		const fileSubmenu: Array<MenuItemConstructorOptions> = [];

		if (hasAnyPermission(this.user, ['products.create', 'products.edit'])) {
			fileSubmenu.push({
				label: 'New Item',
				accelerator: 'CommandOrControl+N',
				click: () => this.navigateTo(ROUTES.INVENTORY_FORM),
			});
			fileSubmenu.push({ type: 'separator' });
		}

		if (this.user) {
			fileSubmenu.push({
				label: 'Logout',
				accelerator: 'CommandOrControl+Shift+L',
				click: () => this.performAction('auth:logout'),
			});
			fileSubmenu.push({ type: 'separator' });
		}

		fileSubmenu.push({
			label: 'Quit',
			role: 'quit',
			accelerator: 'CommandOrControl+Q',
		});

		template.push({
			label: 'File',
			submenu: fileSubmenu,
		});

		const navGroups = buildNavMenuGroups(this.user, this.businessType);
		const navMenus = navGroupsToElectronMenu(
			navGroups,
			(route) => this.navigateTo(route),
		);
		template.push(...navMenus);

		const viewSubmenu: Array<MenuItemConstructorOptions> = [];

		if (!app.isPackaged) {
			viewSubmenu.push({
				role: 'toggleDevTools',
				accelerator: 'CommandOrControl+Shift+I',
			});
		}

		if (viewSubmenu.length > 0) {
			template.push({
				label: 'View',
				submenu: viewSubmenu,
			});
		}

		const windowSubmenu: Array<MenuItemConstructorOptions> = [
			{
				label: 'Toggle Menu Bar',
				accelerator: 'Alt+M',
				click: () => {
					const isVisible = this.mainWindow.isMenuBarVisible();
					this.mainWindow.setMenuBarVisibility(!isVisible);
					this.mainWindow.setAutoHideMenuBar(isVisible);
				},
			},
			{ type: 'separator' },
			{
				label: 'Full Screen',
				accelerator: 'F11',
				click: () => {
					this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
				},
			},
			{
				label: 'Minimize',
				accelerator: 'CommandOrControl+M',
				role: 'minimize',
			},
			{ type: 'separator' },
			{
				label: 'Reload',
				accelerator: 'CommandOrControl+R',
				click: () => {
					this.mainWindow.webContents.reload();
				},
			},
			{
				label: 'Force Reload',
				accelerator: 'CommandOrControl+Shift+R',
				click: () => {
					this.mainWindow.webContents.reloadIgnoringCache();
				},
			},
		];

		template.push({
			label: 'Window',
			submenu: windowSubmenu,
		});

		template.push({
			label: 'Help',
			submenu: [
				{
					label: 'Documentation',
					click: () => {
						shell.openExternal('https://pos-docs.zonse247.com');
					},
				},
				{
					label: 'Check for Updates...',
					click: () => this.performAction('menu:check-updates'),
				},
				{ type: 'separator' },
				{
					label: `About ${app.getName()}`,
					click: () => this.openModal('about'),
				},
			] as Array<MenuItemConstructorOptions>,
		});

		return template;
	}
}
