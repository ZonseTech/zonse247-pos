import {
	app,
	Menu,
	BrowserWindow,
	MenuItemConstructorOptions,
	shell,
} from 'electron';
import { ROUTES } from '../app/utils/constants';
import { hasAnyPermission, hasPermission, hasRole } from '../app/utils';

export default class MenuBuilder {
	mainWindow: BrowserWindow;
	private user: User | null = null;

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
	}

	buildMenu(user?: User): Menu {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		this.user = user || null;
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
			const newSubmenu: Array<MenuItemConstructorOptions> = [];

			if (hasPermission(this.user, 'products.create')) {
				newSubmenu.push({
					label: 'Product',
					accelerator: 'CommandOrControl+N',
					click: () => this.openModal('new-product'),
				});
				newSubmenu.push({
					label: 'Category',
					click: () => this.openModal('new-category'),
				});
			}

			if (hasPermission(this.user, 'sales.create')) {
				newSubmenu.push({
					label: 'Customer',
					click: () => this.openModal('new-customer'),
				});
			}

			if (newSubmenu.length > 0) {
				fileSubmenu.push({
					label: 'New',
					submenu: newSubmenu,
				});
				fileSubmenu.push({ type: 'separator' });
			}
		}

		if (
			hasRole(this.user, 'admin') ||
			hasPermission(this.user, 'system.backup')
		) {
			fileSubmenu.push({
				label: 'Backup Database',
				click: () => this.navigateTo(ROUTES.EXPORT_DB),
			});
			fileSubmenu.push({
				label: 'Restore Database',
				click: () => this.performAction('menu:restore-database'),
			});
			fileSubmenu.push({ type: 'separator' });
		}

		if (this.user) {
			fileSubmenu.push({
				label: 'Sync Data',
				accelerator: 'CommandOrControl+Shift+S',
				click: () => this.navigateTo(ROUTES.SYNC_DATA),
			});
			fileSubmenu.push({ type: 'separator' });
			fileSubmenu.push({
				label: 'Logout',
				accelerator: 'CommandOrControl+Shift+L',
				click: () => this.performAction('menu-logout'),
			});
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

		const viewSubmenu: Array<MenuItemConstructorOptions> = [];

		if (
			hasAnyPermission(this.user, [
				'products.view',
				'products.create',
				'sales.create',
				'refunds.process',
			])
		) {
			viewSubmenu.push({
				label: 'Point of Sale',
				accelerator: 'CommandOrControl+P',
				click: () => this.navigateTo(ROUTES.POS),
			});
		}

		if (this.user) {
			viewSubmenu.push({
				label: 'Dashboard',
				accelerator: 'CommandOrControl+D',
				click: () => this.navigateTo(ROUTES.DASHBOARD),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'products.view',
				'products.create',
				'products.edit',
			])
		) {
			if (viewSubmenu.length > 0) {
				viewSubmenu.push({ type: 'separator' });
			}
			viewSubmenu.push({
				label: 'Inventory',
				click: () => this.navigateTo(ROUTES.INVENTORY),
			});
			viewSubmenu.push({
				label: 'Categories',
				click: () => this.navigateTo(ROUTES.CATEGORIES),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'reports.sales.daily',
				'reports.sales.detailed',
				'payments.view',
			])
		) {
			viewSubmenu.push({ type: 'separator' });
			viewSubmenu.push({
				label: 'Transactions',
				accelerator: 'CommandOrControl+T',
				click: () => this.navigateTo(ROUTES.TRANSACTIONS),
			});
		}

		viewSubmenu.push({ type: 'separator' });

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

		const managementSubmenu: Array<MenuItemConstructorOptions> = [];

		if (
			hasAnyPermission(this.user, [
				'users.view',
				'users.create',
				'users.edit',
				'users.delete',
			])
		) {
			managementSubmenu.push({
				label: 'Billing',
				click: () => this.navigateTo(ROUTES.SUBSCRIPTION_BILLING),
			});
			managementSubmenu.push({
				label: 'Users',
				click: () => this.navigateTo(ROUTES.USERS),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'users.roles.assign',
				'users.create',
				'users.edit',
			])
		) {
			managementSubmenu.push({
				label: 'Security & Roles',
				click: () => this.navigateTo(ROUTES.ROLES_PERMISSIONS),
			});
		}

		if (hasPermission(this.user, 'settings.shop.manage')) {
			if (managementSubmenu.length > 0) {
				managementSubmenu.push({ type: 'separator' });
			}
			managementSubmenu.push({
				label: 'Branches',
				click: () => this.navigateTo(ROUTES.BRANCHES),
			});
			managementSubmenu.push({
				label: 'Terminals',
				click: () => this.navigateTo(ROUTES.TERMINALS),
			});
			managementSubmenu.push({ type: 'separator' });
			managementSubmenu.push({
				label: 'Settings',
				accelerator: 'CommandOrControl+,',
				click: () => this.navigateTo(ROUTES.SETTINGS),
			});
		}

		if (managementSubmenu.length > 0) {
			template.push({
				label: 'Management',
				submenu: managementSubmenu,
			});
		}

		if (
			hasRole(this.user, 'admin') ||
			hasPermission(this.user, 'system.admin')
		) {
			const adminSubmenu: Array<MenuItemConstructorOptions> = [
				{
					label: 'Subscriptions',
					click: () => this.navigateTo(ROUTES.SUBSCRIPTIONS),
				},
				{
					label: 'Tenants',
					click: () => this.navigateTo(ROUTES.TENANTS),
				},
				{ type: 'separator' },
				{
					label: 'Migrations',
					click: () => this.navigateTo(ROUTES.MIGRATIONS),
				},
			];

			template.push({
				label: 'Admin',
				submenu: adminSubmenu,
			});
		}

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
