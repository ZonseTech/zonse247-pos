// misselleneous tables
export const HOLD_ORDERS_DB = 'hold_orders';
export const SERVICE_PROVIDERS_DB = 'service_provider';
export const SYNC_STATUS_TABLE = 'sync_status';

// Core system tables
export const CLIENTS_DB = 'clients';
export const SHOPS_DB = 'shops';
export const WORKSTATIONS_DB = 'workstations';
export const USER_SESSIONS_DB = 'user_sessions';
export const USERS_DB = 'users';
export const ROLES_DB = 'roles';
export const PERMISSIONS_DB = 'permissions';
export const ROLE_PERMISSIONS_DB = 'role_permissions';
export const USER_PERMISSIONS_DB = 'user_permissions';

// Business tables (shop-specific)
export const CATEGORIES_DB = 'categories';
export const CUSTOMERS_DB = 'customers';
export const INVENTORY_DB = 'inventory';
export const TRANSACTIONS_DB = 'transactions';
export const ORDERS_DB = 'orders';
export const PAYMENT_METHODS_DB = 'payment_methods';

// Settings and configuration
export const SHOP_SETTINGS_DB = 'shop_settings';
export const SUBSCRIPTION_PLANS_DB = 'subscription_plans';
export const CLIENT_SUBSCRIPTIONS_DB = 'client_subscriptions';
export const AUDIT_LOGS_DB = 'audit_logs';

export default [
	SYNC_STATUS_TABLE,
	PAYMENT_METHODS_DB,
	HOLD_ORDERS_DB,
	INVENTORY_DB,
	ORDERS_DB,
	TRANSACTIONS_DB,
	USERS_DB,
	SHOPS_DB,
	CLIENTS_DB,
	WORKSTATIONS_DB,
	USER_SESSIONS_DB,
	CATEGORIES_DB,
	CUSTOMERS_DB,
	SHOP_SETTINGS_DB,
	SUBSCRIPTION_PLANS_DB,
	CLIENT_SUBSCRIPTIONS_DB,
	AUDIT_LOGS_DB,
];

export const TABLE_NAMES = {
	// miscellaneous tables
	HOLD_ORDERS: 'hold_orders',
	SERVICE_PROVIDERS: 'service_provider',
	SYNC_STATUS_TABLE: 'sync_status',

	// Core system tables
	CLIENTS: 'clients',
	SHOPS: 'shops',
	WORKSTATIONS: 'workstations',
	USER_SESSIONS: 'user_sessions',
	USERS: 'users',
	ROLES: 'roles',
	PERMISSIONS: 'permissions',
	ROLE_PERMISSIONS: 'role_permissions',
	USER_PERMISSIONS: 'user_permissions',

	// Business tables (shop-specific)
	CATEGORIES: 'categories',
	CUSTOMERS: 'customers',
	INVENTORY: 'inventory',
	TRANSACTIONS: 'transactions',
	ORDERS: 'orders',
	PAYMENT_METHODS: 'payment_methods',

	// Settings and configuration
	SHOP_SETTINGS: 'shop_settings',
	SUBSCRIPTION_PLANS: 'subscription_plans',
	CLIENT_SUBSCRIPTIONS: 'client_subscriptions',
	AUDIT_LOGS: 'audit_logs',
} as const;

export type TableName = typeof TABLE_NAMES[keyof typeof TABLE_NAMES];
