interface Till {
	id: number;
	uuid: string;
	name: string;
}

type Mode = 'dark' | 'light' | string;

interface TextInputProps {
	id?: string;
	name: string;
	label: string;
	type:
	| 'date'
	| 'email'
	| 'number'
	| 'password'
	| 'search'
	| 'tel'
	| 'text'
	| 'url'
	| 'time'
	| 'week'
	| 'month'
	| 'file'
	| 'checkbox'
	| 'datetime-local';
}

type DataTypes = string | number | undefined | null | boolean;

interface HoldOrder {
	uuid: string;
	reference: string;
	items: Array<CartItem>;
	total: number;
	totalItems: number;
	date: Date | string;
	status: string;
	userId?: string;
	till?: string;
}

interface CartItem {
	barcode: number | string;
	productId: string;
	name: string;
	categoryId: string;
	sellPrice: number;
	purchasePrice: number;
	variancePrice?: number;
	quantity: number;
	categoryDetails?: Category;
}

interface AppSettings {
	theme: 'light' | 'dark';
	apiUrl: string;
	features: {
		enableFeatureA: boolean;
		enableFeatureB: boolean;
	};
	version: string;
}

type Transaction = {
	uuid: string;
	refNumber?: string;
	discount: number;
	customer?: Customer;
	customerId?: string;
	status?: string;
	subtotal: number;
	tax: number;
	date: string;
	createdAt?: string;
	updatedAt?: string;
	paymentId?: string;
	paymentMethod?: PaymentMethod;
	transactionId?: string;
	phoneNumber: string;
	serviceProviderId: number;
	total: number;
	paid: number;
	changeAmount: number;
	till: string;
	userId: string;
	items?: CartItem[];
	user?: User;
	synced?: 1 | 0;
};

type OrderItem = {
	synced?: 1 | 0;
	uuid: string;
	productId: string;
	transactionId: string;
	quantity: number;
	purchasePrice: number;
	sellPrice: number;
	createdAt?: string;
};

type ServiceProvider = {
	name: string;
	uuid: string;
};

type TransactionValues = {
	paymentMethodId?: string;
	serviceProviderId?: number;
	transactionId?: string;
	phoneNumber?: string;
	amountPaid: string | number;
};

type PaymentMethod = {
	uuid: string;
	name: string;
	icon?: string;
	clientUuid: string;
	shopUuid: string;
	userUuid: string;
};

interface Printer {
	name: string;
	status: string;
	isDefault: boolean;
	location?: string;
	model?: string;
}

type CartTableFooterProps = {
	cart: Record[];
	discount: number;
	setDiscount: (value: number) => void;
	clearCart: () => void;
	subtotal: number;
	tax: number;
	total: number;
};

type MonthlySales = {
	date: number;
	totalAmount: number;
};

type TopProduct = {
	uuid: string;
	name: string;
	quantity: number;
	summedSellPrice: number;
	categoryName: string;
};

type DashboardCounts = {
	totalSales: string;
	stock: number;
	totalUsers: number;
	allCustomers: number;
	expiredProducts: number;
	myTotalTransactions: number;
};
