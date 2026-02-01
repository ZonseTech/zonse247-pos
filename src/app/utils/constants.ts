export enum ROUTES {
	POS = '/pos',
	USERS = '/users',
	USER_FORM = '/users/form',
	MY_PROFILE = '/my-profile',
	ROLES_PERMISSIONS = '/roles-and-permissions',
	DASHBOARD = '/dashboard',
	MOBILE_REPORT = '/mobile-report',
	SALES = '/sales',
	TODAY_SALES = '/today-sales',
	RECEIPTS = '/receipts',
	RECEIPT_DETAILS = '/receipts/:saleId',
	RETURNS = '/returns',
	CATEGORIES = '/categories',
	CUSTOMERS = '/customers',
	ITEMS = '/items',
	INVENTORY = '/inventory',
	INVENTORY_FORM = '/inventory/form',
	TERMINALS = '/terminals',
	TERMINAL_FORM = '/terminals/form',
	PRINTERS = '/printers',
	PRINTER_FORM = '/printers/form',
	PRINT_JOBS = '/printers/jobs',

	PRODUCTS = '/products',
	PRODUCT_FORM = '/products/form',
	SUPPLIERS = '/suppliers',
	SUPPLIER_FORM = '/suppliers/form',
	PURCHASE_ORDERS = '/purchase-orders',
	PURCHASE_ORDER_FORM = '/purchase-orders/form',
	PURCHASE_ORDER_RECEIVE = '/purchase-orders/:id/receive',
	STOCK_MOVEMENTS = '/stock-movements',
	SALES_HISTORY = '/sales-history',

	SUBSCRIPTIONS = '/subscriptions',
	SUBSCRIPTION_BILLING = '/subscriptions/billing',
	BILLING_CHECKOUT_FORM = '/subscriptions/billing/checkout-form',

	TENANTS = '/tenants',
	TENANT_FORM = '/tenants/form',
	TENANT_REGISTRATION_DETAILS = '/tenant-registration-details',

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
	TENANT = 'tenant',
	BRANCH = 'branch',
	TERMINAL = 'terminal',
	SELF = 'self',
}

export enum UserStatus {
	ACTIVE = 'active',
	INACTIVE = 'inactive',
	SUSPENDED = 'suspended',
}
