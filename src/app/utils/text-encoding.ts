/**
 * Text Encoding Utilities
 * 
 * Handles HTML entity decoding and special character normalization
 * for proper display across the application (inventory, products, cart,
 * users, tenants, branches, terminals, printers, categories, etc.)
 */

/**
 * Common HTML entities mapping
 */
const HTML_ENTITIES: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&cent;': '¢',
    '&deg;': '°',
    '&plusmn;': '±',
    '&times;': '×',
    '&divide;': '÷',
    '&frac12;': '½',
    '&frac14;': '¼',
    '&frac34;': '¾',
    // Accented characters
    '&aacute;': 'á',
    '&Aacute;': 'Á',
    '&agrave;': 'à',
    '&Agrave;': 'À',
    '&acirc;': 'â',
    '&Acirc;': 'Â',
    '&atilde;': 'ã',
    '&Atilde;': 'Ã',
    '&auml;': 'ä',
    '&Auml;': 'Ä',
    '&aring;': 'å',
    '&Aring;': 'Å',
    '&eacute;': 'é',
    '&Eacute;': 'É',
    '&egrave;': 'è',
    '&Egrave;': 'È',
    '&ecirc;': 'ê',
    '&Ecirc;': 'Ê',
    '&euml;': 'ë',
    '&Euml;': 'Ë',
    '&iacute;': 'í',
    '&Iacute;': 'Í',
    '&igrave;': 'ì',
    '&Igrave;': 'Ì',
    '&icirc;': 'î',
    '&Icirc;': 'Î',
    '&iuml;': 'ï',
    '&Iuml;': 'Ï',
    '&oacute;': 'ó',
    '&Oacute;': 'Ó',
    '&ograve;': 'ò',
    '&Ograve;': 'Ò',
    '&ocirc;': 'ô',
    '&Ocirc;': 'Ô',
    '&otilde;': 'õ',
    '&Otilde;': 'Õ',
    '&ouml;': 'ö',
    '&Ouml;': 'Ö',
    '&uacute;': 'ú',
    '&Uacute;': 'Ú',
    '&ugrave;': 'ù',
    '&Ugrave;': 'Ù',
    '&ucirc;': 'û',
    '&Ucirc;': 'Û',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&szlig;': 'ß',
};

/**
 * Decodes HTML entities in a string
 * Handles both named entities (&amp;) and numeric entities (&#38; or &#x26;)
 * 
 * @param text - The text containing HTML entities
 * @returns The decoded text with proper characters
 * 
 * @example
 * decodeHtmlEntities('Caf&eacute;') // 'Café'
 * decodeHtmlEntities('&lt;script&gt;') // '<script>'
 * decodeHtmlEntities('&#38;') // '&'
 */
export const decodeHtmlEntities = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';

    let decoded = text;

    // Replace named entities
    Object.entries(HTML_ENTITIES).forEach(([entity, char]) => {
        decoded = decoded.replace(new RegExp(entity, 'gi'), char);
    });

    // Handle numeric entities (decimal: &#38; and hex: &#x26;)
    decoded = decoded.replace(/&#(\d+);/g, (_, dec) =>
        String.fromCharCode(parseInt(dec, 10))
    );
    decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
    );

    return decoded;
};

/**
 * Alias for decodeHtmlEntities - shorter name for convenience
 */
export const decode = decodeHtmlEntities;

/**
 * Encodes special characters to HTML entities
 * Useful for preventing XSS when displaying user input
 * 
 * @param text - The text to encode
 * @returns The encoded text with HTML entities
 */
export const encodeHtmlEntities = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

/**
 * Safely decodes text and handles edge cases
 * Use this as the primary function for displaying names
 * 
 * @param text - The text to decode
 * @param fallback - Fallback value if text is empty
 * @returns The decoded text or fallback
 */
export const safeDecodeText = (text: string | null | undefined, fallback = ''): string => {
    if (!text || typeof text !== 'string') return fallback;
    return decodeHtmlEntities(text.trim());
};

/**
 * Decodes text and capitalizes each word
 * Useful for displaying names properly
 * 
 * @param text - The text to decode and capitalize
 * @returns The decoded and capitalized text
 */
export const decodeAndCapitalize = (text: string | null | undefined): string => {
    const decoded = safeDecodeText(text);
    if (!decoded) return '';

    return decoded
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Normalizes text for ASCII-only output (useful for printers)
 * Removes diacritics and special characters
 * 
 * @param text - The text to normalize
 * @returns ASCII-safe text
 */
export const normalizeToAscii = (text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';

    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^\x20-\x7E]/g, '');   // Keep only printable ASCII
};

/**
 * Processes an object and decodes all string properties
 * Useful for decoding entire records from API
 * 
 * @param obj - The object to process
 * @param keys - Optional array of keys to decode (if empty, decodes all strings)
 * @returns Object with decoded string values
 */
export function decodeObjectStrings<T extends object>(
    obj: T,
    keys?: readonly string[] | string[]
): T {
    if (!obj || typeof obj !== 'object') return obj;

    const result = { ...obj };
    const keysToProcess = keys || Object.keys(obj);

    keysToProcess.forEach(key => {
        const k = key as keyof T;
        const value = result[k];
        if (typeof value === 'string') {
            (result as Record<string, unknown>)[key] = decodeHtmlEntities(value);
        }
    });

    return result;
}

/**
 * Decodes an array of objects
 * 
 * @param items - Array of objects to decode
 * @param keys - Optional array of keys to decode
 * @returns Array with decoded string values
 */
export function decodeArrayStrings<T extends object>(
    items: T[],
    keys?: readonly string[] | string[]
): T[] {
    if (!Array.isArray(items)) return items;
    return items.map(item => decodeObjectStrings<T>(item, keys));
}

/**
 * Display name formatter - decodes and formats a name for display
 * This is the recommended function for displaying names in the UI
 * 
 * @param name - The name to format
 * @param options - Formatting options
 * @returns Formatted display name
 */
export const formatDisplayName = (
    name: string | null | undefined,
    options: {
        capitalize?: boolean;
        fallback?: string;
        maxLength?: number;
    } = {}
): string => {
    const { capitalize = false, fallback = '', maxLength } = options;

    let result = safeDecodeText(name, fallback);

    if (capitalize && result) {
        result = result
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    if (maxLength && result.length > maxLength) {
        result = result.substring(0, maxLength - 3) + '...';
    }

    return result;
};

export default {
    decodeHtmlEntities,
    decode,
    encodeHtmlEntities,
    safeDecodeText,
    decodeAndCapitalize,
    normalizeToAscii,
    decodeObjectStrings,
    decodeArrayStrings,
    formatDisplayName,
};
