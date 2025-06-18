export enum ROUTES {
	POS = '/pos',
	USERS = '/users',
	ROLES_PERMISSIONS = '/roles-and-permissions',
	DASHBOARD = '/dashboard',
	TRANSACTIONS = '/transactions',
	PRODUCTS = '/products',
	WORK_STATIONS = '/work-stations',
	SUBSCRIPTION = '/subscription',
	CLIENTS = '/clients',
	SHOPS = '/shops',
	SYNC_DATA = '/sync-data',
	EXPORT_DB = '/export-db',
	MIGRATIONS = '/migrations',
	LOGIN = '/login',
	LANDING_PAGE = '/landing-page',
	GET_STARTED = '/sign-in',
}

export enum PermissionScope {
	USER = 'user',
	GLOBAL = 'global',
	CLIENT = 'client',
	SHOP = 'shop',
	WORKSTATION = 'workstation',
	SELF = 'self'
}