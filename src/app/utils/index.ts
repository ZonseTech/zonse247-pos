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

export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'decimal',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
		.format(amount || 0)
		.replace(/^/, 'MK');
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
