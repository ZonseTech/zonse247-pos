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
	productUuid: string;
	name: string;
	categoryUuid: string;
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
