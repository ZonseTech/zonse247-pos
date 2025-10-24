// default-auth-key-1761310617487

import {
	APP_SETUP_DB,
	CATEGORIES_DB,
	TENANT_SUBSCRIPTIONS_TABLE,
	TENANT_TABLE,
	CUSTOMERS_DB,
	PAYMENT_METHODS_DB,
	PAYMENT_SERVICE_PROVIDERS_DB,
	PERMISSIONS_DB,
	ROLE_PERMISSIONS_DB,
	ROLES_DB,
	SHOP_SETTINGS_DB,
	BRANCHES_TABLE,
	SUBSCRIPTION_PLANS_TABLE,
	USERS_DB,
	TERMINALS_TABLE,
} from '../tables';
import bcrypt from 'bcryptjs';
import { sealDBModel } from '..';
import { DEFAULT_PERMISSIONS } from './permission.seed';
import { DEFAULT_ROLE_PERMISSIONS } from './role-permissions.seed';
import config from '../../../config';

const now = new Date();

const checkOrCreateDefaultRoles = async () => {
	try {
		const superAdminRole = await sealDBModel.findById(ROLES_DB, 'super-admin');
		if (!superAdminRole) {
			const defaultSuperAdminRole: Role = {
				uuid: 'super-admin',
				tenantId: '-1',
				shopUuid: '-1',
				name: 'super_admin',
				displayName: 'Super Administrator',
				description: 'System super administrator with full access',
				isSystemRole: true,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			await sealDBModel.insert(ROLES_DB, defaultSuperAdminRole);
		}

		const adminRole = await sealDBModel.findById(ROLES_DB, 'admin');
		if (!adminRole) {
			const defaultAdminRole: Role = {
				uuid: 'admin',
				tenantId: '-1',
				shopUuid: '-1',
				name: 'admin',
				displayName: 'Administrator',
				description: 'Shop administrator with full shop access',
				isSystemRole: true,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			await sealDBModel.insert(ROLES_DB, defaultAdminRole);
		}

		const managerRole = await sealDBModel.findById(ROLES_DB, 'manager');
		if (!managerRole) {
			const defaultManagerRole: Role = {
				uuid: 'manager',
				tenantId: '-1',
				shopUuid: '-1',
				name: 'manager',
				displayName: 'Manager',
				description: 'Shop manager with limited administrative access',
				isSystemRole: true,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			await sealDBModel.insert(ROLES_DB, defaultManagerRole);
		}

		const cashierRole = await sealDBModel.findById(ROLES_DB, 'cashier');
		if (!cashierRole) {
			const defaultCashierRole: Role = {
				uuid: 'cashier',
				tenantId: '-1',
				shopUuid: '-1',
				name: 'cashier',
				displayName: 'Cashier',
				description: 'Basic cashier role for sales operations',
				isSystemRole: true,
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};
			await sealDBModel.insert(ROLES_DB, defaultCashierRole);
		}
	} catch (err) {
		console.error('Error creating default roles:', err);
	}
};

const checkOrCreateDefaultPermissions = async () => {
	try {

		for (const permission of DEFAULT_PERMISSIONS) {
			const existing = await sealDBModel.findById<Permission>(PERMISSIONS_DB, permission.uuid);
			if (!existing) {
				await sealDBModel.insert(PERMISSIONS_DB, permission);
			}
		}
	} catch (err) {
		console.error('Error creating default permissions:', err);
	}
};

const checkOrCreateDefaultRolePermissions = async () => {
	try {

		for (const rp of DEFAULT_ROLE_PERMISSIONS) {
			const existingId = `${rp.roleUuid}-${rp.permissionUuid}`;
			const existing = await sealDBModel.findById(ROLE_PERMISSIONS_DB, existingId);
			if (!existing) {
				const rolePermission: RolePermission = {
					uuid: existingId,
					roleUuid: rp.roleUuid,
					permissionUuid: rp.permissionUuid,
					createdAt: new Date()
				};
				await sealDBModel.insert(ROLE_PERMISSIONS_DB, rolePermission);
			}
		}
	} catch (err) {
		console.error('Error creating default role permissions:', err);
	}
};

const checkOrCreateDefaultTenant = async () => {
	try {
		const tenant = await sealDBModel.findById(TENANT_TABLE, '-1');
		if (tenant) return;

		const defaultTenant: Tenant = {
			tenantId: '-1',
			tenantCode: 'DEFAULT_CLIENT',
			businessName: 'Default Company',
			tradingName: 'Default Trading Name',
			tin: '000000000',
			businessType: 'PRODUCT_BASED',
			ownerName: 'System Administrator',
			email: 'admin@example.com',
			phoneNumber: '+1234567890',
			address: '123 Business Street',
			country: 'MW',
			mraPortalUsername: 'admin',
			msonkhoOnlineStatus: 'PENDING',
			subscriptionPlan: 'TRIAL',
			subscriptionStatus: 'TRIAL',
			authKey: `default-auth-key-${Date.now()}`,
			status: 'active',
			registeredAt: now,
			activatedAt: now,
			trialEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
			isVatRegistered: false,
			taxOfficeCode: null,
			synced: false,
			createdAt: now,
			updatedAt: now
		};

		await sealDBModel.insert(TENANT_TABLE, defaultTenant);
		console.log('✅ Default tenant created successfully');
	} catch (err) {
		console.error('❌ Error creating default tenant:', err);
	}
};

const checkOrCreateDefaultBranch = async () => {
	try {
		const branch = await sealDBModel.findById(BRANCHES_TABLE, '-1');
		if (branch) return;

		const defaultBranch: Branch = {
			branchId: '-1',
			tenantId: '-1',
			branchName: 'Default Branch',
			branchCode: 'BR001',
			addressLine1: '123 Main Street',
			city: 'Lilongwe',
			district: 'Lilongwe Urban',
			phoneNumber: '+265999000111',
			email: 'branch@example.com',
			currencySymbol: 'K',
			currencyCode: 'MKW',
			taxRate: 0.00,
			chargeTax: false,
			status: 'active',
			isActive: true,
			isVirtualWarehouse: false,
			synced: false,
			mraApprovalStatus: 'PENDING',
			createdAt: now,
			updatedAt: now
		};

		await sealDBModel.insert(BRANCHES_TABLE, defaultBranch);
		console.log('✅ Default branch created successfully.');
	} catch (err) {
		console.error('❌ Error creating default branch:', err);
	}
};

const checkOrCreateDefaultWorkStation = async () => {
	try {
		const workstation = await sealDBModel.findById(TERMINALS_TABLE, '-1');
		if (workstation) return;

		const defaultWorkStation: Workstation = {
			uuid: '-1',
			shopCode: 'SHOP001',
			tenantId: '-1',
			tillName: 'Main Till',
			tillNumber: 'TILL001',
			deviceId: 'DEFAULT_DEVICE',
			deviceType: 'desktop',
			ipAddress: '127.0.0.1',
			isPrimary: true,
			status: 'active',
			registeredAt: new Date().toISOString(),
			lastActivity: new Date().toISOString(),
			lastSync: new Date().toISOString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			synced: 0
		};

		await sealDBModel.insert(TERMINALS_TABLE, defaultWorkStation);
	} catch (err) {
		console.error('Error creating default workstation:', err);
	}
};

const checkOrCreateDefaultSubscriptionPlans = async () => {
	try {
		const plans = [
			{
				uuid: 'basic-monthly',
				name: 'Basic Monthly',
				description: 'Basic POS features with monthly billing',
				price: 29.99,
				billingCycle: 'monthly' as const,
				features: ['Basic POS', 'Up to 1000 products', 'Basic reports', 'Email support'],
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			},
			{
				uuid: 'pro-monthly',
				name: 'Pro Monthly',
				description: 'Advanced POS features with monthly billing',
				price: 59.99,
				billingCycle: 'monthly' as const,
				features: ['Advanced POS', 'Unlimited products', 'Advanced reports', 'Inventory management', 'Priority support'],
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			},
			{
				uuid: 'enterprise-yearly',
				name: 'Enterprise Yearly',
				description: 'Full-featured POS with yearly billing',
				price: 599.99,
				billingCycle: 'yearly' as const,
				features: ['All features', 'Multi-location', 'API access', 'Custom integrations', '24/7 support'],
				isActive: true,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
		];

		for (const plan of plans) {
			const existing = await sealDBModel.findById(SUBSCRIPTION_PLANS_TABLE, plan.uuid);
			if (!existing) {
				await sealDBModel.insert(SUBSCRIPTION_PLANS_TABLE, plan);
			}
		}
	} catch (err) {
		console.error('Error creating default subscription plans:', err);
	}
};

const checkOrCreateDefaultTenantSubscriptions = async () => {
	try {
		const subscription = await sealDBModel.findById(TENANT_SUBSCRIPTIONS_TABLE, '-1');
		if (subscription) return;

		const defaultSubscription: ClientSubscription = {
			uuid: '-1',
			tenantId: '-1',
			planId: 'basic-monthly',
			status: 'active',
			maxShops: 5,
			startsAt: new Date().toISOString(),
			endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			autoRenew: true,
			paymentMethod: 'trial',
			synced: 0,
			lastPaymentDate: new Date().toISOString(),
			nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await sealDBModel.insert(TENANT_SUBSCRIPTIONS_TABLE, defaultSubscription);
	} catch (err) {
		console.error('Error creating default client subscription:', err);
	}
};

const checkOrCreateDefaultUser = async () => {
	try {
		const saltRounds = 10;
		const user = await sealDBModel.findById(USERS_DB, '-1');

		if (user) return;

		const hash = await bcrypt.hash('admin', saltRounds);

		const adminUser: User = {
			uuid: '-1',
			username: 'admin',
			fullname: 'Zonse247 Admin',
			password: hash,
			tenantId: '-1',
			shopUuid: '-1',
			roleUuid: 'super-admin',
			accessibleShops: ["*"],
			allowedWorkstations: ["*"],
			email: 'zonse247@gmail.com',
			status: 'active',
			synced: 0,
		};

		await sealDBModel.insert(USERS_DB, adminUser);
	} catch (error) {
		console.error(error);
	}
};

const checkOrCreateDefaultCustomer = async () => {
	try {
		const customer = await sealDBModel.findById(CUSTOMERS_DB, '-1');

		if (customer) return;

		const defaultCustomer: Customer = {
			uuid: '-1',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
			name: 'Walk in customer',
		};

		await sealDBModel.insert(CUSTOMERS_DB, defaultCustomer);
	} catch (err) {
		console.error(err);
	}
};

const checkOrCreateSetupStatus = async () => {
	try {
		const setup = await sealDBModel.findById(APP_SETUP_DB, '-1');

		if (setup) return;

		const setupData: SetupParams = {
			uuid: '-1',
			isCompleted: false,
			accountActivated: false,
			shopConfigured: false,
			workstationSetup: false,
		};

		await sealDBModel.insert(APP_SETUP_DB, setupData);
	} catch (err) {
		console.error(err);
	}
};

async function checkOrCreateDefaultSettings(): Promise<void> {
	try {
		const settings = await sealDBModel.findById(SHOP_SETTINGS_DB, '-1');

		if (settings) return;

		const defaultSettings: WorkstatSettings = {
			uuid: '-1',
			tenantId: '-1',
			shopUuid: '-1',
			workstationUuid: '-1',
			app: config.app.name,
			store: 'Main Till',
			addressLine1: '123 Business Street',
			addressLine2: '123 Business Street',
			country: "Malawi",
			city: 'Lilongwe',
			contact: config.app.contact,
			tax: '0.00',
			symbol: 'MK',
			footer: 'Footer',
			status: "active"
		};

		await sealDBModel.insert(SHOP_SETTINGS_DB, defaultSettings);
	} catch (err) {
		console.error(err);
	}
}

async function checkAndCreateDefaultCategory(): Promise<void> {
	try {
		const category = await sealDBModel.findById(CATEGORIES_DB, '-1');

		if (category) return;

		const defaultCategory: Category = {
			uuid: '-1',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
			name: 'Consumables',
		};

		await sealDBModel.insert(CATEGORIES_DB, defaultCategory);
	} catch (err) {
		console.error(err);
	}
}

async function checkOrCreateDefaultPaymentMethods(): Promise<void> {
	const DEFAULT_PAYMENT_METHODS: Array<PaymentMethod> = [
		{
			name: 'Cash',
			uuid: '1',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
		{
			name: 'Mobile Transfer',
			uuid: '2',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
	];

	try {
		const paymentMethod = await sealDBModel.findById(PAYMENT_METHODS_DB, '1');

		if (paymentMethod) return;

		const insertOperations = DEFAULT_PAYMENT_METHODS.map((method) =>
			sealDBModel.insert(PAYMENT_METHODS_DB, method)
		);
		await Promise.all(insertOperations);
	} catch (err) {
		console.error('Failed to setup payment methods:', err);
	}
}

async function checkOrCreateDefaultPaymentServiceProviders(): Promise<void> {
	const p: Array<PaymentServiceProvider> = [
		{
			name: 'Airtel Money',
			uuid: '1',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
		{
			name: 'TNM Mpamba',
			uuid: '2',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
		{
			name: 'National Bank',
			uuid: '3',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
		{
			name: 'FDH',
			uuid: '4',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
		{
			name: 'Standard Bank',
			uuid: '5',
			tenantId: '-1',
			shopUuid: '-1',
			userUuid: '-1',
		},
	];

	try {
		const psps = await sealDBModel.findById(PAYMENT_SERVICE_PROVIDERS_DB, '-1');

		if (psps) return;

		const insertOperations = p.map((method) =>
			sealDBModel.insert(PAYMENT_SERVICE_PROVIDERS_DB, method)
		);
		await Promise.all(insertOperations);
	} catch (err) {
		console.error('Failed to setup payment methods:', err);
	}
}

const seedDatabase = async () => {
	try {
		checkOrCreateDefaultRoles()
		checkOrCreateDefaultPermissions()
		checkOrCreateDefaultRolePermissions()
		checkOrCreateDefaultBranch()
		checkOrCreateDefaultTenant()
		checkOrCreateDefaultWorkStation()
		checkOrCreateDefaultSubscriptionPlans()
		checkOrCreateDefaultTenantSubscriptions()

		checkOrCreateDefaultUser();
		checkOrCreateDefaultCustomer();
		checkAndCreateDefaultCategory();
		checkOrCreateDefaultPaymentMethods();
		checkOrCreateDefaultPaymentServiceProviders()
		checkOrCreateDefaultSettings();
		checkOrCreateSetupStatus();

		console.log('Seed migrated successfully');
		return true;
	} catch (error) {
		console.error('Error seeding database:', error);
		return false;
	}
};

export { seedDatabase };
