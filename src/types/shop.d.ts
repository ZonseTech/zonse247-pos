interface ShopVerificationParams {
	clientId: string;
	authToken: string;
	workstationName: string;
	os: string;
	hostname: string;
	macAddress: string;
}


interface ShopOptions {
	uuid: string;
	name: string;
}


interface IShop {
	id?: number;
	uuid: string;
	client_id: string;
	shop_code: string;
	name: string;
	description?: string;
	address_line1?: string;
	address_line2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country?: string;
	phone?: string;
	email?: string;
	tax_number?: string;
	currency_code: string;
	currency_symbol: string;
	tax_rate: number;
	charge_tax: boolean;
	receipt_footer?: string;
	logo_url?: string;
	status: 'active' | 'inactive' | 'suspended';
	created_at?: string;
	updated_at?: string;
}

interface ShopRegistration {
	shopName: string;
	adminEmail: string;
	adminName: string;
	phone: string;
	address: {
		line1: string;
		line2: string;
	};
	city: string;
	country: string;
	currency: string;
	vatNumber?: string;
	taxRate: number;
	chargeTax: boolean;
}

interface ClientCredentials {
	clientId: string;
	authToken: string;
	shopId: string;
	expiresAt: string;
	permissions: string[];
}

interface WorkstationUser {
	id: string;
	username: string;
	email?: string;
	role: 'admin' | 'cashier' | 'manager';
	permissions: string[];
	isActive: boolean;
	workstationId: string;
	shopId: string;
	createdAt: string;
	lastSync?: string;
}

interface WorkstationSettings {
	id: string;
	name: string;
	shopId: string;
	clientId: string;
	isActivated: boolean;
	deviceInfo: {
		os: string;
		version: string;
		macAddress: string;
		hostname: string;
	};
	syncSettings: {
		lastSync: string;
		autoSync: boolean;
		syncInterval: number
	};
	features: {
		offline: boolean;
		printing: boolean;
		barcode: boolean;
		inventory: boolean;
	};
	createdAt: string;
}

interface CreateShopRequest {
	client_id: string;
	shop_code: string;
	name: string;
	description?: string;
	address_line1?: string;
	address_line2?: string;
	city?: string;
	state?: string;
	postal_code?: string;
	country?: string;
	phone?: string;
	email?: string;
	tax_number?: string;
	currency_code?: string;
	currency_symbol?: string;
	tax_rate?: number;
	charge_tax?: boolean;
	receipt_footer?: string;
	logo_url?: string;
}

interface Setting extends WorkstationSettings {
	uuid: string;
	img: string;
	remove: string;
	app: string;
	tillName: string;
	store: string;
	addressOne: string;
	addressTwo: string;
	contact: string;
	tax: string;
	symbol: string;
	percentage: number;
	chargeTax: boolean;
	footer: string;
	file: string;
}