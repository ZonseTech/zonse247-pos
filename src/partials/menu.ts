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
			fileSubmenu.push({
				label: 'New Item',
				accelerator: 'CommandOrControl+N',
				click: () => this.navigateTo(ROUTES.INVENTORY_FORM),
			});
			fileSubmenu.push({ type: 'separator' });
		}

		const branchSubmenu = this.buildBranchSubmenu();
		if (branchSubmenu.length > 0) {
			fileSubmenu.push(...branchSubmenu);
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
					label: 'Customers',
					click: () => this.navigateTo(ROUTES.CUSTOMERS),
				}
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

		// Management group (Users/Staffs)
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
				label: 'Staffs',
				click: () => this.navigateTo(ROUTES.USERS),
			});
		}

		if (managementItems.length > 0) {
			managementSubmenu.push({ type: 'separator' });
			managementSubmenu.push(...managementItems);
		}

		if (managementSubmenu.length > 0) {
			template.push({
				label: 'Management',
				submenu: managementSubmenu,
			});
		}

		if (hasPermission(this.user, 'settings.branch.manage')) {
			template.push({
				label: 'Settings',
				accelerator: 'CommandOrControl+,',
				click: () => this.navigateTo(ROUTES.SETTINGS_GENERAL),
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
