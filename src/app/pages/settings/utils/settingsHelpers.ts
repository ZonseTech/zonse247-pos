/**
 * Check if settings have been modified from defaults
 */
export const hasModifications = (current: AppSettings, defaults: AppSettings): boolean => {
    return JSON.stringify(current) !== JSON.stringify(defaults);
};

/**
 * Get only modified fields from settings
 */
export const getModifiedFields = (
    current: AppSettings,
    defaults: AppSettings
): Partial<AppSettings> => {
    const modified: Partial<AppSettings> = {};

    Object.keys(current).forEach((key) => {
        const typedKey = key as keyof AppSettings;
        if (current[typedKey] !== defaults[typedKey]) {
            (modified as any)[typedKey] = current[typedKey];
        }
    });

    return modified;
};

/**
 * Validate API base URL format
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Sanitize settings before submission
 * Removes empty strings, normalizes values
 */
export const sanitizeSettings = (settings: AppSettings): AppSettings => {
    const sanitized = { ...settings };

    Object.keys(sanitized).forEach((key) => {
        const typedKey = key as keyof AppSettings;
        const value = sanitized[typedKey];

        if (typeof value === 'string') {
            (sanitized as any)[typedKey] = value.trim();
        }
    });

    return sanitized;
};

/**
 * Calculate settings complexity score for performance monitoring
 */
export const calculateComplexityScore = (settings: AppSettings): number => {
    let score = 0;

    if (settings.enableOfflineMode) score += 10;
    if (settings.enableCloudSync) score += 10;
    if (settings.mraComplianceMode === 'STRICT') score += 15;
    // if (settings.trackInventory) score += 10;
    if (settings.enableLoyaltyProgram) score += 5;
    if (settings.multiTaxEnabled) score += 5;
    if (settings.webhookEnabled) score += 5;

    // Performance settings
    score += Math.min(settings.maxCacheSizeMB / 10, 10);
    score += Math.min(settings.transactionHistoryDays / 10, 10);

    return score;
};

/**
 * Group settings by category for better organization
 */
export const groupSettingsByCategory = (settings: AppSettings): Record<string, Partial<AppSettings>> => {
    return {
        general: {
            storeName: settings.storeName,
            storeAddress: settings.storeAddress,
            storePhone: settings.storePhone,
            storeEmail: settings.storeEmail,
            currency: settings.currency,
            taxRate: settings.taxRate,
        },
        localization: {
            language: settings.language,
            timezone: settings.timezone,
            dateFormat: settings.dateFormat,
            timeFormat: settings.timeFormat,
        },
        transaction: {
            autoApplyTax: settings.autoApplyTax,
            taxInclusivePricing: settings.taxInclusivePricing,
            roundTotalAmount: settings.roundTotalAmount,
            minimumTransactionAmount: settings.minimumTransactionAmount,
            maximumTransactionAmount: settings.maximumTransactionAmount,
        },
        // Add more categories as needed
    };
};

/**
 * Export settings to JSON for backup
 */
export const exportSettings = (settings: AppSettings): string => {
    return JSON.stringify(settings, null, 2);
};

/**
 * Import settings from JSON backup
 */
export const importSettings = (jsonString: string): AppSettings | null => {
    try {
        const parsed = JSON.parse(jsonString);
        // Validate structure
        if (parsed && typeof parsed === 'object' && parsed.storeName) {
            return parsed as AppSettings;
        }
        return null;
    } catch {
        return null;
    }
};

/**
 * Deep merge settings with defaults
 * Useful for partial updates
 */
export const mergeSettings = (
    current: Partial<AppSettings>,
    defaults: AppSettings
): AppSettings => {
    return {
        ...defaults,
        ...current,
    };
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (settings: Partial<AppSettings>): string[] => {
    const errors: string[] = [];
    const required = ['storeName', 'storeEmail', 'storePhone', 'storeAddress', 'currency'];

    required.forEach((field) => {
        if (!(settings as any)[field]) {
            errors.push(`${field} is required`);
        }
    });

    return errors;
};
