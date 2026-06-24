interface Till {
	id: number;
	userId: string;
	name: string;
}

type Mode = 'dark' | 'light' | string | undefined | null;

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

// Note: Printer interface is now defined in printer.d.ts for API-managed printers
// The old simple Printer interface has been replaced with a more comprehensive one

type CartTableFooterProps = {
	cart: Record[];
	discount: number;
	setDiscount: (value: number) => void;
	clearCart: () => void;
	subtotal: number;
	tax: number;
	total: number;
};
