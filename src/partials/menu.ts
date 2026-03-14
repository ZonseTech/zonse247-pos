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

		const operationsItems: Array<MenuItemConstructorOptions> = [];

		if (
			hasAnyPermission(this.user, [
				'products.view',
				'products.create',
				'sales.create',
				'refunds.process',
			])
		) {
			operationsItems.push({
				label: 'Point of Sale',
				accelerator: 'CommandOrControl+P',
				click: () => this.navigateTo(ROUTES.POS),
			});
		}

		if (this.user) {
			operationsItems.push({
				label: 'Reports',
				accelerator: 'CommandOrControl+D',
				click: () => this.navigateTo(ROUTES.REPORTS),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'reports.sales.daily',
				'reports.sales.detailed',
				'payments.view',
			])
		) {
			operationsItems.push({
				label: 'Sales',
				accelerator: 'CommandOrControl+T',
				click: () => this.navigateTo(ROUTES.SALES),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'refunds.process',
				'refunds.view',
				'returns.manage',
			])
		) {
			operationsItems.push({
				label: 'Returns',
				click: () => this.navigateTo(ROUTES.RETURNS),
			});
		}

		if (operationsItems.length > 0) {
			template.push({
				label: 'Operations',
				submenu: operationsItems,
			});
		}
		if (
			hasAnyPermission(this.user, [
				'products.view',
				'products.create',
				'products.edit',
			])
		) {
			const inventoryItems: Array<MenuItemConstructorOptions> = [
				{
					label: 'Inventory',
					click: () => this.navigateTo(ROUTES.INVENTORY),
				},
				{
					label: 'Categories',
					click: () => this.navigateTo(ROUTES.CATEGORIES),
				},
				{
					label: 'Suppliers',
					click: () => this.navigateTo(ROUTES.SUPPLIERS),
				},
				{
					label: 'Purchase Orders',
					click: () => this.navigateTo(ROUTES.PURCHASE_ORDERS),
				},
				{
					label: 'Stock Movements',
					click: () => this.navigateTo(ROUTES.STOCK_MOVEMENTS),
				},
				{
					label: 'Customers',
					click: () => this.navigateTo(ROUTES.CUSTOMERS),
				},
			];

			template.push({
				label: 'Inventory',
				submenu: inventoryItems,
			});
		}

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

		const managementSubmenu: Array<MenuItemConstructorOptions> = [];

		if (this.user) {
			managementSubmenu.push({
				label: 'My Profile',
				accelerator: 'CommandOrControl+Shift+P',
				click: () => this.navigateTo(ROUTES.MY_PROFILE),
			});
		}

		const managementItems: Array<MenuItemConstructorOptions> = [];

		if (
			hasAnyPermission(this.user, [
				'users.view',
				'users.create',
				'users.edit',
				'users.delete',
			])
		) {
			managementItems.push({
				label: 'Billing',
				click: () => this.navigateTo(ROUTES.SUBSCRIPTION_BILLING),
			});
			managementItems.push({
				label: 'Staff Management',
				click: () => this.navigateTo(ROUTES.USERS),
			});
		}

		if (hasRole(this.user, 'admin') || hasRole(this.user, 'super-admin')) {
			managementItems.push({
				label: 'Security',
				click: () => this.navigateTo(ROUTES.ROLES_PERMISSIONS),
			});
		}

		if (managementItems.length > 0) {
			managementSubmenu.push(...managementItems);
		}

		if (managementSubmenu.length > 0) {
			template.push({
				label: 'Management',
				submenu: managementSubmenu,
			});
		}

		if (hasPermission(this.user, 'settings.branch.manage')) {
			const settingsSubmenu: Array<MenuItemConstructorOptions> = [
				{
					label: 'General Settings',
					accelerator: 'CommandOrControl+,',
					click: () => this.navigateTo(ROUTES.SETTINGS_GENERAL),
				},
				{
					label: 'Printers',
					click: () => this.navigateTo(ROUTES.PRINTERS),
				},
				{
					label: 'Branch Settings',
					click: () => this.navigateTo(ROUTES.BRANCHES),
				},
				{
					label: 'Terminals',
					click: () => this.navigateTo(ROUTES.TERMINALS),
				},
			];

			template.push({
				label: 'Settings',
				submenu: settingsSubmenu,
			});
		}

		if (hasRole(this.user, 'admin') || hasPermission(this.user, 'system.admin')) {
			const adminSubmenu: Array<MenuItemConstructorOptions> = [
				{
					label: 'Subscriptions',
					click: () => this.navigateTo(ROUTES.SUBSCRIPTIONS),
				},
				{
					label: 'Tenants',
					click: () => this.navigateTo(ROUTES.TENANTS),
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
