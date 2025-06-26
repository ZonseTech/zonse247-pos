import {
    AUDIT_LOGS_DB,
    CATEGORIES_DB,
    CLIENT_SUBSCRIPTIONS_DB,
    CLIENTS_DB,
    CUSTOMERS_DB,
    INVENTORY_DB,
    ORDERS_DB,
    PAYMENT_METHODS_DB,
    PAYMENT_SERVICE_PROVIDERS_DB,
    PERMISSIONS_DB,
    ROLE_PERMISSIONS_DB,
    ROLES_DB,
    SHOP_SETTINGS_DB,
    SHOPS_DB,
    SUBSCRIPTION_PLANS_DB,
    TRANSACTIONS_DB,
    USER_PERMISSIONS_DB,
    USER_SESSIONS_DB,
    USERS_DB,
    WORKSTATIONS_DB
} from "../tables";

const tables = [
    {
        id: TRANSACTIONS_DB,
        name: 'Transactions',
        description: 'Records financial transactions and payment processing details',
    },
    {
        id: ORDERS_DB,
        name: 'Orders',
        description: 'Stores customer order details including items, totals, and status',
    },
    {
        id: INVENTORY_DB,
        name: 'Inventory',
        description: 'Manages product stock levels, variants, and inventory movements',
    },
    {
        id: CATEGORIES_DB,
        name: 'Categories',
        description: 'Organizes products into hierarchical categories and groups',
    },
    {
        id: CUSTOMERS_DB,
        name: 'Customers',
        description: 'Stores customer profiles, contact info, and purchase history',
    },
    {
        id: SHOP_SETTINGS_DB,
        name: 'Shop Settings',
        description: 'Configuration and preferences for individual shops',
    },
    {
        id: ROLES_DB,
        name: 'Roles',
        description: 'Defines system roles and their general permissions',
    },
    {
        id: PERMISSIONS_DB,
        name: 'Permissions',
        description: 'Contains all available system permissions and access rights',
    },
    {
        id: ROLE_PERMISSIONS_DB,
        name: 'Role Permissions',
        description: 'Maps permissions to specific roles in the system',
    },
    {
        id: PAYMENT_METHODS_DB,
        name: 'Payment Methods',
        description: 'Stores available payment methods and their configurations',
    },
    {
        id: USERS_DB,
        name: 'Users',
        description: 'Contains user accounts and basic profile information',
    },
    {
        id: CLIENTS_DB,
        name: 'Clients',
        description: 'Maintains client accounts for multi-tenant systems',
    },
    {
        id: CLIENT_SUBSCRIPTIONS_DB,
        name: 'Client Subscriptions',
        description: 'Tracks client subscription status and billing cycles',
    },
    {
        id: SHOPS_DB,
        name: 'Shops',
        description: 'Stores information about physical or online store locations',
    },
    {
        id: WORKSTATIONS_DB,
        name: 'Workstations',
        description: 'Manages POS terminals or workstations in retail environments',
    },
    {
        id: USER_SESSIONS_DB,
        name: 'User Sessions',
        description: 'Tracks active user sessions and authentication tokens',
    },
    {
        id: AUDIT_LOGS_DB,
        name: 'Audit Logs',
        description: 'Records system events and changes for security and compliance',
    },
    {
        id: USER_PERMISSIONS_DB,
        name: 'User Permissions',
        description: 'Manages custom permissions assigned to individual users',
    },
    {
        id: SUBSCRIPTION_PLANS_DB,
        name: 'Subscription Plans',
        description: 'Defines available subscription tiers and their features',
    },
    {
        id: PAYMENT_SERVICE_PROVIDERS_DB,
        name: 'Payment Service Providers',
        description: 'Configurations for integrated payment processors and gateways',
    },
];

export default tables;