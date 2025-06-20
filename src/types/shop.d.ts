interface ShopVerificationParams {
	clientId: string;
	authKey: string;
	os: string;
	hostname: string;
	macAddress: string;
}

interface ShopOptions {
	uuid: string;
	name: string;
}

interface IShop {
	uuid: string;
	clientId: string;
	shopCode: string;
	name: string;
	description?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	phone?: string;
	email?: string;
	taxNumber?: string;
	currencyCode: string;
	currencySymbol: string;
	taxRate: number;
	chargeTax: boolean;
	receiptFooter?: string;
	logoUrl?: string;
	status: 'active' | 'inactive' | 'suspended';
	createdAt?: string;
	updatedAt?: string;
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
	authKey: string;
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

interface CreateShopRequest {
	clientId: string;
	shopCode: string;
	name: string;
	description?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	phone?: string;
	email?: string;
	taxNumber?: string;
	currencyCode?: string;
	currencySymbol?: string;
	taxRate?: number;
	chargeTax?: boolean;
	receiptFooter?: string;
	logoUrl?: string;
}