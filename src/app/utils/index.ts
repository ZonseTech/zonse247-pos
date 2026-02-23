export * from './settings.helper';

export const hasPermission = (user: User, permField: string): boolean => {
	if (!user) return false;
	return user?.permissions?.includes(permField);
};

export const hasRole = (user: User, role: string): boolean => {
	if (!user) return false;
	return user?.roleName === role;
};

export const hasAnyPermission = (user: User, permissions: Array<string>) => {
	return permissions.some(permission => hasPermission(user, permission));
};

export const formatCurrency = (amount: number, addCurrency?: boolean, prefix = 'MK') => {
	const formatted = new Intl.NumberFormat('en-US', {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount || 0);

	return addCurrency ? `${prefix}${formatted}` : formatted;
};

export const formatCurrencyShort = (value: number, prefix = 'MK'): string => {
	if (value >= 1000000) {
		return `${prefix} ${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `${prefix} ${(value / 1000).toFixed(1)}K`;
	}
	return `${prefix} ${value.toFixed(0)}`;
};

export const formatCurrencyFull = (value: number, prefix = 'MK'): string => {
	return `${prefix} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatQuantity = (value: number): string => {
	return new Intl.NumberFormat('en-US').format(value);
};

export const formatFileSize = (bytes: number) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isCurrentMonth = (date) => {
	const now = new Date();
	return (
		date.getFullYear() === now.getFullYear() &&
		date.getMonth() === now.getMonth()
	);
};

export const isFutureMonth = (date) => {
	const now = new Date();
	return (
		date.getFullYear() > now.getFullYear() ||
		(date.getFullYear() === now.getFullYear() &&
			date.getMonth() > now.getMonth())
	);
};

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleString('en-US', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour12: false,
	});
};

export const formatDateForInput = (date?: Date | null): string => {
	if (!date) return '';
	const d = new Date(date);
	return d.toISOString().split('T')[0];
};

export const generateReferenceNumber = () => {
	const generateString: Array<string | number> = [];

	const ALPHABET = [
		'a',
		'b',
		'c',
		'd',
		'e',
		'f',
		'g',
		'h',
		'i',
		'j',
		'k',
		'l',
		'm',
		'n',
		'o',
		'p',
		'r',
		's',
		't',
		'u',
		'v',
		'w',
		'x',
		'y',
		'z',
	];

	const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const MONTHS = [
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'10',
		'11',
		'12',
	];

	const CAPITALIZED_ALPHABET = ALPHABET.map((letter) => letter.toUpperCase());

	const ALPHA_NUMERIC_POOL = [...CAPITALIZED_ALPHABET, ...NUMBERS];

	for (let i = 0; i < 7; i++) {
		const value =
			ALPHA_NUMERIC_POOL[
			Math.floor(Math.random() * ALPHA_NUMERIC_POOL.length + 0)
			];
		generateString.push(value);
	}

	const date = new Date();
	const year = date.getFullYear();
	const month = MONTHS[date.getMonth()];

	return `${generateString.join('')}-${year}-${month}`;
};

export const toCamelCase = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj.map((v) => toCamelCase(v));
	} else if (obj !== null && obj !== undefined && typeof obj === 'object') {
		return Object.keys(obj).reduce((result, key) => {
			const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
				letter.toUpperCase()
			);
			result[camelKey] = toCamelCase(obj[key]);
			return result;
		}, {} as any);
	}
	return obj;
};

export const toSnakeCase = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj.map((v) => toSnakeCase(v));
	} else if (obj !== null && obj !== undefined && typeof obj === 'object') {
		return Object.keys(obj).reduce((result, key) => {
			const snakeKey = key.replace(
				/[A-Z]/g,
				(letter) => `_${letter.toLowerCase()}`
			);
			result[snakeKey] = toSnakeCase(obj[key]);
			return result;
		}, {} as any);
	}
	return obj;
};

export const capitalizeEachWord = (name: string) => {
	if (!name) return '';

	const prefixes = ['mc', 'mac', 'o\'', 'de', 'van', 'von', 'di', 'le', 'la'];

	return name
		.toLowerCase()
		.split(' ')
		.map(word => {
			for (const prefix of prefixes) {
				if (word.startsWith(prefix) && word.length > prefix.length) {
					if (prefix === 'o\'') {
						return "O'" + word.charAt(2).toUpperCase() + word.slice(3);
					}
					return prefix.charAt(0).toUpperCase() + prefix.slice(1) +
						word.charAt(prefix.length).toUpperCase() + word.slice(prefix.length + 1);
				}
			}

			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(' ');
};

export function isElectron() {
	return !!(
		(typeof process !== 'undefined' && process.versions && process.versions.electron) ||
		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('Electron'))
	);
}

export * from './api-error-handler';