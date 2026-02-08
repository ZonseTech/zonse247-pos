/**
 * API Error Handler Utility
 *
 * This module provides utilities for parsing and handling API errors
 * following the zonse247-pos-api error schema and conventions.
 */

/**
 * Database error codes from the API (Prisma error codes)
 */
export enum DbErrorCode {
	UNIQUE_CONSTRAINT = 'P2002',
	FOREIGN_KEY_CONSTRAINT = 'P2003',
	RECORD_NOT_FOUND = 'P2025',
	NULL_CONSTRAINT = 'P2011',
	REQUIRED_RELATION = 'P2014',
	TOO_MANY_DB_CONNECTIONS = 'P2028',
	CONNECTION_REFUSED = 'P1001',
	TIMEOUT = 'P2024',
	INVALID_DATA = 'P2009',
	VALUE_TOO_LONG = 'P2000',
	TRANSACTION_NOT_STARTED = 'P2034',
	TRANSACTION_WRITE_CONFLICT = 'P2034',
	DEADLOCK = 'P2034',
}

/**
 * Custom API error codes
 */
export enum ApiErrorCode {
	DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
	INVALID_REFERENCE = 'INVALID_REFERENCE',
	NOT_FOUND = 'NOT_FOUND',
	NULL_CONSTRAINT = 'NULL_CONSTRAINT',
	RELATION_ERROR = 'RELATION_ERROR',
	CONNECTION_LIMIT = 'CONNECTION_LIMIT',
	CONNECTION_REFUSED = 'CONNECTION_REFUSED',
	TIMEOUT = 'TIMEOUT',
	VALUE_TOO_LONG = 'VALUE_TOO_LONG',
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
	DEADLOCK = 'DEADLOCK',
	WRITE_CONFLICT = 'WRITE_CONFLICT',
	TRANSACTION_ERROR = 'TRANSACTION_ERROR',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Parsed API error structure
 */
export interface ParsedApiError {
	message: string;
	code: string;
	field?: string;
	statusCode: number;
	isRetryable: boolean;
	errors?: Record<string, string>;
	originalError?: unknown;
}

/**
 * Field-specific error messages for products
 */
export const ProductErrorMessages = {
	SKU_EXISTS: (sku: string) =>
		`A product with SKU "${sku}" already exists in this branch.`,
	BARCODE_EXISTS: (barcode: string, productName?: string) =>
		productName
			? `Barcode "${barcode}" is already assigned to product "${productName}".`
			: `Barcode "${barcode}" is already in use by another product.`,
	PRODUCT_NOT_FOUND: (id: string) => `Product with ID "${id}" was not found.`,
	CATEGORY_NOT_FOUND: (id: string) =>
		`Category with ID "${id}" does not exist.`,
	INVALID_PRICE: 'Selling price must be a positive number.',
	INVALID_QUANTITY: 'Quantity must be a non-negative number.',
	INVALID_BARCODE_FORMAT: 'Barcode format is invalid.',
	DUPLICATE_BARCODES_IN_REQUEST: (barcode: string) =>
		`Duplicate barcode "${barcode}" found in the request.`,
	NAME_REQUIRED: 'Product name is required.',
	NAME_TOO_LONG: 'Product name is too long (max 255 characters).',
	SKU_REQUIRED: 'SKU is required.',
	SKU_TOO_LONG: 'SKU is too long (max 100 characters).',
	DESCRIPTION_TOO_LONG: 'Description is too long (max 1000 characters).',
	UNIT_TOO_LONG: 'Unit is too long (max 50 characters).',
	PRIMARY_BARCODE_TOO_LONG: 'Primary barcode is too long (max 100 characters).',
};

/**
 * Field-specific error messages for inventory
 */
export const InventoryErrorMessages = {
	INSUFFICIENT_STOCK: (
		productName: string,
		available: number,
		requested: number,
	) =>
		`Insufficient stock for "${productName}". Available: ${available}, Requested: ${requested}.`,
	NEGATIVE_STOCK_NOT_ALLOWED: (productName: string) =>
		`Negative stock is not allowed for "${productName}".`,
	INVENTORY_NOT_FOUND: (productId: string) =>
		`Inventory record for product "${productId}" was not found.`,
	INVALID_ADJUSTMENT: 'Adjustment value must be a valid number.',
	REORDER_EXCEEDS_MAX: (reorderPoint: number, maxStock: number) =>
		`Reorder point (${reorderPoint}) cannot exceed maximum stock (${maxStock}).`,
	MIN_EXCEEDS_MAX: (minStock: number, maxStock: number) =>
		`Minimum stock (${minStock}) cannot exceed maximum stock (${maxStock}).`,
	BARCODE_REQUIRED: 'Barcode is required.',
	BARCODE_TOO_LONG: 'Barcode is too long (max 100 characters).',
	NAME_REQUIRED: 'Item name is required.',
	COST_PRICE_REQUIRED: 'Cost price is required.',
	SELL_PRICE_REQUIRED: 'Sell price is required.',
	QUANTITY_REQUIRED: 'Quantity is required.',
	EXPIRY_DATE_REQUIRED: 'Expiration date is required.',
};

/**
 * Friendly field name mapping
 */
const fieldNameMap: Record<string, string> = {
	sku: 'SKU',
	primary_barcode: 'Primary Barcode',
	primaryBarcode: 'Primary Barcode',
	barcode: 'Barcode',
	name: 'Name',
	email: 'Email',
	phone: 'Phone Number',
	product_id: 'Product',
	productId: 'Product',
	tenant_id: 'Tenant',
	branch_id: 'Branch',
	category_id: 'Category',
	categoryId: 'Category',
	supplier_id: 'Supplier',
	supplierId: 'Supplier',
	unique_branch_sku: 'SKU (within this branch)',
	unique_product_barcode: 'Product Barcode',
	sellingPrice: 'Selling Price',
	costPrice: 'Cost Price',
	quantity: 'Quantity',
	minStock: 'Minimum Stock',
	maxStock: 'Maximum Stock',
	reorderLevel: 'Reorder Level',
	expirationDate: 'Expiration Date',
	manufactureDate: 'Manufacture Date',
	description: 'Description',
	unit: 'Unit',
	weight: 'Weight',
	brand: 'Brand',
};

/**
 * Get friendly field name
 */
export function getFriendlyFieldName(field: string): string {
	return (
		fieldNameMap[field] ||
		field
			.replace(/_/g, ' ')
			.replace(/([A-Z])/g, ' $1')
			.trim()
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	);
}

/**
 * Parse unique constraint field from error
 */
function parseUniqueConstraintField(error: any): string {
	// Check meta.target (Prisma format)
	const target = error?.meta?.target;
	if (Array.isArray(target)) {
		return target.map(getFriendlyFieldName).join(' and ');
	}
	if (typeof target === 'string') {
		return getFriendlyFieldName(target);
	}

	// Try to extract from message
	const message = error?.message || '';
	const match = message.match(
		/Unique constraint failed on the fields?: \(`(.+?)`\)/,
	);
	if (match) {
		return match[1]
			.split(',')
			.map((f: string) => getFriendlyFieldName(f.trim().replace(/`/g, '')))
			.join(' and ');
	}

	// Check for common field patterns in message
	if (message.toLowerCase().includes('sku')) return 'SKU';
	if (message.toLowerCase().includes('barcode')) return 'Barcode';
	if (message.toLowerCase().includes('email')) return 'Email';
	if (message.toLowerCase().includes('name')) return 'Name';

	return 'field';
}

/**
 * Parse foreign key field from error
 */
function parseForeignKeyField(error: any): string {
	const fieldName = error?.meta?.field_name || error?.field;
	if (typeof fieldName === 'string') {
		const entityName = fieldName
			.replace('_fkey', '')
			.replace(/_id$/, '')
			.replace(/Id$/, '')
			.replace(/_/g, ' ');
		return entityName.charAt(0).toUpperCase() + entityName.slice(1);
	}
	return 'related record';
}

/**
 * Parse API error response
 */
export function parseApiError(error: unknown): ParsedApiError {
	const defaultError: ParsedApiError = {
		message: 'An unexpected error occurred. Please try again.',
		code: ApiErrorCode.UNKNOWN_ERROR,
		statusCode: 500,
		isRetryable: false,
		originalError: error,
	};

	if (!error) {
		return defaultError;
	}

	const axiosError = error as any;
	const responseData = axiosError?.response?.data;
	const statusCode = axiosError?.response?.status || 500;

	// If there's a structured error response from the API
	if (responseData) {
		const apiMessage = responseData.message || responseData.error;
		const apiCode = responseData.code;
		const apiField = responseData.field;
		// Handle both 'errors' and 'data' as field-specific errors
		// API may return { success: false, message: "...", data: { fieldName: "error message" } }
		const apiErrors =
			responseData.errors ||
			(responseData.data &&
				typeof responseData.data === 'object' &&
				!Array.isArray(responseData.data)
				? responseData.data
				: undefined);

		// Handle specific API error codes
		if (
			apiCode === ApiErrorCode.DUPLICATE_ENTRY ||
			apiCode === DbErrorCode.UNIQUE_CONSTRAINT
		) {
			const field = apiField || parseUniqueConstraintField(responseData);
			return {
				message:
					apiMessage ||
					`A record with this ${field} already exists. Please use a different value.`,
				code: ApiErrorCode.DUPLICATE_ENTRY,
				field,
				statusCode: 409,
				isRetryable: false,
				originalError: error,
			};
		}

		if (
			apiCode === ApiErrorCode.INVALID_REFERENCE ||
			apiCode === DbErrorCode.FOREIGN_KEY_CONSTRAINT
		) {
			const entity = apiField || parseForeignKeyField(responseData);
			return {
				message:
					apiMessage ||
					`The specified ${entity} does not exist. Please select a valid ${entity.toLowerCase()}.`,
				code: ApiErrorCode.INVALID_REFERENCE,
				field: entity,
				statusCode: 400,
				isRetryable: false,
				originalError: error,
			};
		}

		if (
			apiCode === ApiErrorCode.NOT_FOUND ||
			apiCode === DbErrorCode.RECORD_NOT_FOUND
		) {
			return {
				message:
					apiMessage ||
					'The requested record was not found or has been deleted.',
				code: ApiErrorCode.NOT_FOUND,
				statusCode: 404,
				isRetryable: false,
				originalError: error,
			};
		}

		if (apiCode === ApiErrorCode.VALIDATION_ERROR || statusCode === 400) {
			return {
				message:
					apiMessage ||
					'Invalid data provided. Please check your input and try again.',
				code: ApiErrorCode.VALIDATION_ERROR,
				errors: apiErrors,
				statusCode: 400,
				isRetryable: false,
				originalError: error,
			};
		}

		if (apiCode === ApiErrorCode.BUSINESS_LOGIC_ERROR || statusCode === 422) {
			return {
				message:
					apiMessage ||
					'The operation cannot be completed due to business rules.',
				code: ApiErrorCode.BUSINESS_LOGIC_ERROR,
				statusCode: 422,
				isRetryable: false,
				originalError: error,
			};
		}

		if (
			apiCode === ApiErrorCode.DEADLOCK ||
			apiCode === ApiErrorCode.WRITE_CONFLICT
		) {
			return {
				message:
					apiMessage ||
					'A database conflict occurred. Please try your operation again.',
				code: apiCode,
				statusCode: 409,
				isRetryable: true,
				originalError: error,
			};
		}

		if (apiCode === ApiErrorCode.TIMEOUT || statusCode === 504) {
			return {
				message: apiMessage || 'The operation took too long. Please try again.',
				code: ApiErrorCode.TIMEOUT,
				statusCode: 504,
				isRetryable: true,
				originalError: error,
			};
		}

		if (statusCode === 503) {
			return {
				message:
					apiMessage ||
					'The service is temporarily unavailable. Please try again later.',
				code: ApiErrorCode.CONNECTION_REFUSED,
				statusCode: 503,
				isRetryable: true,
				originalError: error,
			};
		}

		// Generic response with message
		if (apiMessage) {
			return {
				message: apiMessage,
				code: apiCode || ApiErrorCode.UNKNOWN_ERROR,
				field: apiField,
				errors: apiErrors,
				statusCode,
				isRetryable: statusCode >= 500,
				originalError: error,
			};
		}
	}

	// Handle Error instance
	if (error instanceof Error) {
		const message = error.message;

		// Check for specific error patterns
		if (
			message.includes('Duplicate') ||
			message.includes('already exists') ||
			message.includes('already assigned')
		) {
			return {
				message,
				code: ApiErrorCode.DUPLICATE_ENTRY,
				statusCode: 409,
				isRetryable: false,
				originalError: error,
			};
		}

		if (message.includes('not found') || message.includes('Not found')) {
			return {
				message,
				code: ApiErrorCode.NOT_FOUND,
				statusCode: 404,
				isRetryable: false,
				originalError: error,
			};
		}

		if (
			message.includes('Insufficient') ||
			message.includes('negative stock')
		) {
			return {
				message,
				code: ApiErrorCode.BUSINESS_LOGIC_ERROR,
				statusCode: 422,
				isRetryable: false,
				originalError: error,
			};
		}

		if (
			message.includes('Network') ||
			message.includes('network') ||
			message.includes('ECONNREFUSED')
		) {
			return {
				message:
					'Unable to connect to the server. Please check your internet connection.',
				code: ApiErrorCode.CONNECTION_REFUSED,
				statusCode: 503,
				isRetryable: true,
				originalError: error,
			};
		}

		if (message.includes('timeout') || message.includes('Timeout')) {
			return {
				message: 'The request timed out. Please try again.',
				code: ApiErrorCode.TIMEOUT,
				statusCode: 504,
				isRetryable: true,
				originalError: error,
			};
		}

		return {
			message,
			code: ApiErrorCode.UNKNOWN_ERROR,
			statusCode: 500,
			isRetryable: false,
			originalError: error,
		};
	}

	return defaultError;
}

/**
 * Get user-friendly error message for display
 */
export function getErrorMessage(
	error: unknown,
	fallbackMessage?: string,
): string {
	const parsed = parseApiError(error);
	return (
		parsed.message ||
		fallbackMessage ||
		'An unexpected error occurred. Please try again.'
	);
}

/**
 * Get field-specific error from parsed error
 */
export function getFieldError(
	parsedError: ParsedApiError,
	fieldName: string,
): string | undefined {
	if (parsedError.errors && parsedError.errors[fieldName]) {
		return parsedError.errors[fieldName];
	}
	if (
		parsedError.field &&
		parsedError.field.toLowerCase() === fieldName.toLowerCase()
	) {
		return parsedError.message;
	}
	return undefined;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
	const parsed = parseApiError(error);
	return parsed.isRetryable;
}

/**
 * Map API error to Formik field errors
 */
export function mapErrorToFormikErrors(error: unknown): Record<string, string> {
	const parsed = parseApiError(error);
	const formikErrors: Record<string, string> = {};

	// If we have field-specific errors, use them
	if (parsed.errors) {
		Object.entries(parsed.errors).forEach(([key, value]) => {
			// Normalize the field key (handle snake_case to camelCase)
			const normalizedKey = key.replace(/_([a-z])/g, (_, letter) =>
				letter.toUpperCase(),
			);
			formikErrors[normalizedKey] = value;
			// Also add with original key in case form uses it
			if (normalizedKey !== key) {
				formikErrors[key] = value;
			}
		});
	}

	// If there's a specific field error
	if (parsed.field) {
		const fieldKey =
			Object.keys(fieldNameMap).find(
				(key) =>
					fieldNameMap[key].toLowerCase() === parsed.field?.toLowerCase(),
			) || parsed.field.toLowerCase().replace(/ /g, '');

		formikErrors[fieldKey] = parsed.message;
	}

	return formikErrors;
}

/**
 * Format field errors into a user-friendly message for display
 */
export function formatFieldErrorsMessage(
	errors: Record<string, string> | undefined,
): string {
	if (!errors || Object.keys(errors).length === 0) {
		return '';
	}

	const errorMessages = Object.entries(errors).map(([field, message]) => {
		const friendlyName = getFriendlyFieldName(field);
		return `• ${friendlyName}: ${message}`;
	});

	return errorMessages.join('\n');
}

/**
 * Get a summary of validation errors for display in alerts/reports
 * Uses the API's message directly and indicates if there are field errors
 */
export function getValidationErrorSummary(error: unknown): {
	title: string;
	message: string;
	hasFieldErrors: boolean;
} {
	const parsed = parseApiError(error);
	const hasFieldErrors = parsed.errors && Object.keys(parsed.errors).length > 0;

	// Always use the API's message directly
	return {
		title: hasFieldErrors ? 'Validation Error' : 'Error',
		message: parsed.message,
		hasFieldErrors: !!hasFieldErrors,
	};
}

/**
 * Check if error is a duplicate/conflict error
 */
export function isDuplicateError(error: unknown): boolean {
	const parsed = parseApiError(error);
	return (
		parsed.code === ApiErrorCode.DUPLICATE_ENTRY || parsed.statusCode === 409
	);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
	const parsed = parseApiError(error);
	return (
		parsed.code === ApiErrorCode.VALIDATION_ERROR || parsed.statusCode === 400
	);
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
	const parsed = parseApiError(error);
	return parsed.code === ApiErrorCode.NOT_FOUND || parsed.statusCode === 404;
}

/**
 * Format error for logging
 */
export function formatErrorForLogging(error: unknown): string {
	const parsed = parseApiError(error);
	return JSON.stringify(
		{
			message: parsed.message,
			code: parsed.code,
			field: parsed.field,
			statusCode: parsed.statusCode,
			errors: parsed.errors,
		},
		null,
		2,
	);
}
