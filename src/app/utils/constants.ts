export enum ROUTES {
	POS = '/pos',
	USERS = '/users',
	USER_FORM = '/users/form',
	MY_PROFILE = '/my-profile',
	ROLES_PERMISSIONS = '/roles-and-permissions',
	DASHBOARD = '/dashboard',
	TRANSACTIONS = '/transactions',
	CATEGORIES = '/categories',
	PRODUCTS = '/products',
	TERMINALS = '/terminals',
	TERMINAL_FORM = '/terminals/form',

	SUBSCRIPTIONS = '/subscriptions',
	SUBSCRIPTION_BILLING = '/subscriptions/billing',
	BILLING_CHECKOUT_FORM = '/subscriptions/billing/checkout-form',

	TENANTS = '/tenants',
	TENANT_FORM = '/tenants/form',

	BRANCHES = '/branches',
	BRANCH_FORM = '/branches/form',

	SYNC_DATA = '/sync-data',
	EXPORT_DB = '/export-db',
	MIGRATIONS = '/migrations',
	LOGIN = '/login',
	SETTINGS = '/settings',
	LANDING_PAGE = '/landing-page',
	GET_STARTED = '/sign-in',
}

export enum PermissionScope {
	USER = 'user',
	GLOBAL = 'global',
	CLIENT = 'client',
	SHOP = 'shop',
	WORKSTATION = 'workstation',
	SELF = 'self',
}

export enum UserStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
}
