/**
 * Decodes HTML entities in a string
 */
export const decodeHtmlEntities = (str: string | null | undefined): string => {
    if (!str) return '';

    let decoded = str;
    let prevDecoded = '';

    while (decoded !== prevDecoded) {
        prevDecoded = decoded;
        decoded = decoded
            .replace(/&amp;/g, '&')
            .replace(/&#x2F;/g, '/')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&#x27;/g, "'")
            .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
    }

    return decoded;
};

/**
 * Safely converts a value to number
 */
export const toNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
};
