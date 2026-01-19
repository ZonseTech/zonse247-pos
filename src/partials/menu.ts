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
	private branches: Branch[] = [];
	private currentBranchId: string | null = null;

	constructor(mainWindow: BrowserWindow) {
		this.mainWindow = mainWindow;
	}

	buildMenu(user?: User, branches?: Branch[], currentBranchId?: string): Menu {
		if (
			process.env.NODE_ENV === 'development' ||
			process.env.DEBUG_PROD === 'true'
		) {
			this.setupDevelopmentEnvironment();
		}

		this.user = user || null;
		this.branches = branches || [];
		this.currentBranchId =
			currentBranchId || user?.currentBranchId || user?.branchId || null;
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

	private switchBranch(branchId: string, branchName: string): void {
		this.mainWindow.webContents.send('menu-switch-branch', {
			branchId,
			branchName,
		});
	}

	private buildBranchSubmenu(): Array<MenuItemConstructorOptions> {
		if (!this.user || this.branches.length <= 1) {
			return [];
		}

		const branchItems: Array<MenuItemConstructorOptions> = this.branches.map(
			(branch) => ({
				label: branch.branchName,
				type: 'checkbox' as const,
				checked: branch.branchId === this.currentBranchId,
				click: () => this.switchBranch(branch.branchId, branch.branchName),
			}),
		);

		return [
			{
				label: 'Switch Branch',
				submenu: branchItems,
			},
			{ type: 'separator' },
		];
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

		// Add branch switcher to File menu
		const branchSubmenu = this.buildBranchSubmenu();
		if (branchSubmenu.length > 0) {
			fileSubmenu.push(...branchSubmenu);
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
				click: () => this.performAction('auth:logout'),
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

		// Operations menu (top-level)
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

		// if (this.user) {
		// 	operationsItems.push({
		// 		label: 'Dashboard',
		// 		accelerator: 'CommandOrControl+D',
		// 		click: () => this.navigateTo(ROUTES.DASHBOARD),
		// 	});
		// }

		if (
			hasAnyPermission(this.user, [
				'reports.sales.daily',
				'reports.sales.detailed',
				'payments.view',
			])
		) {
			operationsItems.push({
				label: 'Transactions',
				accelerator: 'CommandOrControl+T',
				click: () => this.navigateTo(ROUTES.SALES),
			});
		}

		if (
			hasAnyPermission(this.user, [
				'products.view',
				'products.create',
				'products.edit',
			])
		) {
			operationsItems.push({
				label: 'Customers',
				click: () => this.navigateTo(ROUTES.CUSTOMERS),
			});
		}

		if (operationsItems.length > 0) {
			template.push({
				label: 'Operations',
				submenu: operationsItems,
			});
		}

		// Inventory menu (top-level)
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
					label: 'Products',
					click: () => this.navigateTo(ROUTES.PRODUCTS),
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
				{ type: 'separator' },
				{
					label: 'Categories',
					click: () => this.navigateTo(ROUTES.CATEGORIES),
				},
			];

			template.push({
				label: 'Inventory',
				submenu: inventoryItems,
			});
		}

		// View menu (for dev tools only)
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

		// Management group (Billing, Users, Security)
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
				label: 'Users',
				click: () => this.navigateTo(ROUTES.USERS),
			});
		}

		if (hasRole(this.user, 'admin') || hasRole(this.user, 'super-admin')) {
			managementItems.push({
				label: 'Security & Roles',
				click: () => this.navigateTo(ROUTES.ROLES_PERMISSIONS),
			});
		}

		if (managementItems.length > 0) {
			managementSubmenu.push({ type: 'separator' });
			managementSubmenu.push({
				label: 'Management',
				submenu: managementItems,
			});
		}

		// Settings group (Branches, Terminals, Printers, Settings)
		if (hasPermission(this.user, 'settings.branch.manage')) {
			const settingsItems: Array<MenuItemConstructorOptions> = [
				{
					label: 'Branches',
					click: () => this.navigateTo(ROUTES.BRANCHES),
				},
				{
					label: 'Terminals',
					click: () => this.navigateTo(ROUTES.TERMINALS),
				},
				{
					label: 'Printers',
					click: () => this.navigateTo(ROUTES.PRINTERS),
				},
				{ type: 'separator' },
				{
					label: 'Settings',
					accelerator: 'CommandOrControl+,',
					click: () => this.navigateTo(ROUTES.SETTINGS),
				},
			];

			managementSubmenu.push({
				label: 'Settings',
				submenu: settingsItems,
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
			const adminSubmenu: Array<MenuItemConstructorOptions> = [];

			// Administration group
			adminSubmenu.push({
				label: 'Administration',
				submenu: [
					{
						label: 'Subscriptions',
						click: () => this.navigateTo(ROUTES.SUBSCRIPTIONS),
					},
					{
						label: 'Tenants',
						click: () => this.navigateTo(ROUTES.TENANTS),
					},
					{
						label: 'Registration Details',
						click: () => this.navigateTo(ROUTES.TENANT_REGISTRATION_DETAILS),
					},
				],
			});

			// System group
			const systemItems: Array<MenuItemConstructorOptions> = [
				{
					label: 'Migrations',
					click: () => this.navigateTo(ROUTES.MIGRATIONS),
				},
			];

			if (hasPermission(this.user, 'system.backup')) {
				systemItems.push({
					label: 'Export DB',
					click: () => this.navigateTo(ROUTES.EXPORT_DB),
				});
			}

			adminSubmenu.push({
				label: 'System',
				submenu: systemItems,
			});

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
