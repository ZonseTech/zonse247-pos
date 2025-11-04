export enum ROUTES {
	POS = '/pos',
	USERS = '/users',
	MY_PROFILE = '/my-profile',
	ROLES_PERMISSIONS = '/roles-and-permissions',
	DASHBOARD = '/dashboard',
	TRANSACTIONS = '/transactions',
	CATEGORIES = '/categories',
	PRODUCTS = '/products',
	TERMINALS = '/terminals',

	SUBSCRIPTIONS = '/subscriptions',
	SUBSCRIPTION_BILLING = '/subscriptions/billing',
	SUBSCRIPTION_PLAN_FORM = '/subscription-plans/form',

	TENANTS = '/tenants',
	TENANT_FORM = '/tenants/form',

	BRANCHES = '/branches',
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
