interface ShopVerificationParams {
	clientId: string;
	authToken: string;
	workstationName: string;
	os: string;
	hostname: string;
	macAddress: string;
}

// interface Shop {
// 	id: string;
// 	name: string;
// 	email: string;
// 	phone: string;
// 	address: {
// 		line1: string;
// 		line2: string;
// 		city: string;
// 		country: string;
// 	};
// 	vatNumber?: string;
// 	currency: {
// 		symbol: string;
// 		code: string;
// 	};
// 	tax: {
// 		rate: number;
// 		enabled: boolean;
// 	};
// 	logo?: string;
// 	footer?: string;
// 	createdAt: string;
// 	status: 'active' | 'inactive' | 'suspended';
// }

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