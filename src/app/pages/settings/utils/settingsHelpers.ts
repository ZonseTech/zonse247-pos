import { mapSettingsToApiPayload, SettingsAppSettings } from '../constants/defaultValues';

/**
 * Check if settings have been modified from defaults
 */
export const hasModifications = (current: SettingsAppSettings, defaults: SettingsAppSettings): boolean => {
    return JSON.stringify(current) !== JSON.stringify(defaults);
};

/**
 * Get only modified fields from settings
 */
export const getModifiedFields = (
    current: SettingsAppSettings,
    defaults: SettingsAppSettings
): Partial<SettingsAppSettings> => {
    const modified: Partial<SettingsAppSettings> = {};

    Object.keys(current).forEach((key) => {
        const typedKey = key as keyof SettingsAppSettings;
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
export const sanitizeSettings = (settings: SettingsAppSettings): SettingsAppSettings => {
    const sanitized = { ...settings };

    Object.keys(sanitized).forEach((key) => {
        const typedKey = key as keyof SettingsAppSettings;
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
 * Maps to the hierarchical JSON structure used by the API
 */
export const groupSettingsByCategory = (settings: AppSettings): Record<string, any> => {
    return {
        // Selective Columns
        general: {
            storeName: settings.storeName,
            storeAddress: settings.storeAddress,
            storePhone: settings.storePhone,
            storeEmail: settings.storeEmail,
            currency: settings.currency,
            taxRate: settings.taxRate,
            businessLicense: settings.businessLicense,
            businessTaxId: settings.businessTaxId,
        },
        selectiveLocalization: {
            language: settings.language,
            timezone: settings.timezone,
            dateFormat: settings.dateFormat,
            timeFormat: settings.timeFormat,
        },
        selectiveSecurity: {
            pinLength: settings.pinLength,
            sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
            autoLogoutMinutes: settings.autoLogoutMinutes,
            serverUrl: settings.serverUrl,
        },

        // JSON Column Groups
        localizationSettings: {
            currencyDecimalPlaces: settings.currencyDecimalPlaces,
            numberSeparator: settings.numberSeparator,
            showCurrencySymbol: settings.showCurrencySymbol,
            currencySymbolPosition: settings.currencySymbolPosition,
        },
        transactionSettings: {
            autoApplyTax: settings.autoApplyTax,
            taxInclusivePricing: settings.taxInclusivePricing,
            roundTaxAmount: settings.roundTaxAmount,
            roundTotalAmount: settings.roundTotalAmount,
            roundToNearest: settings.roundToNearest,
            minimumTransactionAmount: settings.minimumTransactionAmount,
            maximumTransactionAmount: settings.maximumTransactionAmount,
            holdTransactionMinutes: settings.holdTransactionMinutes,
            saveDraftTransactions: settings.saveDraftTransactions,
        },
        customerSettings: {
            requireCustomerDetails: settings.requireCustomerDetails,
            defaultCustomerType: settings.defaultCustomerType,
            collectCustomerEmail: settings.collectCustomerEmail,
            collectCustomerPhone: settings.collectCustomerPhone,
            collectCustomerAddress: settings.collectCustomerAddress,
            customerDisplayMode: settings.customerDisplayMode,
        },
        receiptSettings: {
            receiptNumberPrefix: settings.receiptNumberPrefix,
            receiptNumberSuffix: settings.receiptNumberSuffix,
            receiptStartNumber: settings.receiptStartNumber,
            receiptResetDaily: settings.receiptResetDaily,
            printDuplicateReceipt: settings.printDuplicateReceipt,
            receiptCopies: settings.receiptCopies,
            printOrderKitchen: settings.printOrderKitchen,
            printOrderBar: settings.printOrderBar,
            kitchenPrinterName: settings.kitchenPrinterName,
            barPrinterName: settings.barPrinterName,
            printItemizedReceipt: settings.printItemizedReceipt,
            receiptFooter: settings.receiptFooter,
            receiptHeader: settings.receiptHeader,
            showStoreLogo: settings.showStoreLogo,
            logoUrl: settings.logoUrl,
            receiptWidth: settings.receiptWidth,
            showTaxBreakdown: settings.showTaxBreakdown,
            showItemCodes: settings.showItemCodes,
            showCashierName: settings.showCashierName,
            showTerminalId: settings.showTerminalId,
            qrCodeEnabled: settings.qrCodeEnabled,
            qrCodeContent: settings.qrCodeContent,
        },
        paymentSettings: {
            cashPaymentDefault: settings.cashPaymentDefault,
            cardPaymentDefault: settings.cardPaymentDefault,
            splitPaymentEnabled: settings.splitPaymentEnabled,
            maxSplitWays: settings.maxSplitWays,
            changeCalculationMode: settings.changeCalculationMode,
            suggestChangeAmounts: settings.suggestChangeAmounts,
            giftCardEnabled: settings.giftCardEnabled,
            loyaltyPointsEnabled: settings.loyaltyPointsEnabled,
            enableCash: settings.enableCash,
            enableCard: settings.enableCard,
            enableMobileMoney: settings.enableMobileMoney,
            enableCredit: settings.enableCredit,
            enableGiftCard: settings.enableGiftCard,
            roundingEnabled: settings.roundingEnabled,
            roundingAmount: settings.roundingAmount,
        },
        mraComplianceSettings: {
            mraComplianceMode: settings.mraComplianceMode,
            requireVatNumber: settings.requireVatNumber,
            vatInclusiveDisplay: settings.vatInclusiveDisplay,
            zReportAutoGenerate: settings.zReportAutoGenerate,
            zReportTime: settings.zReportTime,
            dailySalesReportTime: settings.dailySalesReportTime,
        },
        inventorySettings: {
            showProductImages: settings.showProductImages,
            productDisplayMode: settings.productDisplayMode,
            productsPerPage: settings.productsPerPage,
            quickProductSearch: settings.quickProductSearch,
            barcodeScanMode: settings.barcodeScanMode,
            scaleIntegrationMode: settings.scaleIntegrationMode,
            allowNegativeStock: settings.allowNegativeStock,
            lowStockThreshold: settings.lowStockThreshold,
            showStockLevels: settings.showStockLevels,
            enableStockAlerts: settings.enableStockAlerts,
            autoOrderEnabled: settings.autoOrderEnabled,
        },
        syncSettings: {
            enableOfflineMode: settings.enableOfflineMode,
            offlineDataRetentionDays: settings.offlineDataRetentionDays,
            syncOnWifiOnly: settings.syncOnWifiOnly,
            autoSyncOnReconnect: settings.autoSyncOnReconnect,
            syncBatchSize: settings.syncBatchSize,
            syncTimeoutSeconds: settings.syncTimeoutSeconds,
            enableCloudSync: settings.enableCloudSync,
        },
        securitySettings: {
            maxLoginAttempts: settings.maxLoginAttempts,
            lockoutMinutes: settings.lockoutMinutes,
            requirePinForSettings: settings.requirePinForSettings,
            requirePinForReports: settings.requirePinForReports,
            requirePinForVoid: settings.requirePinForVoid,
            requirePinForDiscount: settings.requirePinForDiscount,
            requirePinForReturn: settings.requirePinForReturn,
            auditLogEnabled: settings.auditLogEnabled,
        },
        performanceSettings: {
            cacheExpiryHours: settings.cacheExpiryHours,
            maxCacheSizeMB: settings.maxCacheSizeMB,
            transactionHistoryDays: settings.transactionHistoryDays,
            autoCleanupOldData: settings.autoCleanupOldData,
            imageCompressionQuality: settings.imageCompressionQuality,
        },
        hardwareSettings: {
            printerConnectionType: settings.printerConnectionType,
            printerPaperWidth: settings.printerPaperWidth,
            cashDrawerOpenCode: settings.cashDrawerOpenCode,
            scannerBeepEnabled: settings.scannerBeepEnabled,
            scannerVibrationEnabled: settings.scannerVibrationEnabled,
            screenBrightness: settings.screenBrightness,
            screenTimeoutSeconds: settings.screenTimeoutSeconds,
            printerType: settings.printerType,
            printerName: settings.printerName,
            autoPrintReceipt: settings.autoPrintReceipt,
            paperSize: settings.paperSize,
            enableCashDrawer: settings.enableCashDrawer,
            cashDrawerOpenOn: settings.cashDrawerOpenOn,
            enableBarcodeScanner: settings.enableBarcodeScanner,
            barcodeScannerPrefix: settings.barcodeScannerPrefix,
            enableCardReader: settings.enableCardReader,
            cardReaderType: settings.cardReaderType,
        },
        integrationSettings: {
            apiBaseUrl: settings.apiBaseUrl,
            mraApiTimeoutSeconds: settings.mraApiTimeoutSeconds,
            mraRetryAttempts: settings.mraRetryAttempts,
            webhookEnabled: settings.webhookEnabled,
            webhookUrl: settings.webhookUrl,
            webhookSecret: settings.webhookSecret,
            apiKeyExpiryDays: settings.apiKeyExpiryDays,
            enableApiAccess: settings.enableApiAccess,
            apiRateLimit: settings.apiRateLimit,
        },
        workflowSettings: {
            allowReturnWithoutReceipt: settings.allowReturnWithoutReceipt,
            returnPeriodDays: settings.returnPeriodDays,
            requireManagerForVoid: settings.requireManagerForVoid,
            managerOverridePin: settings.managerOverridePin,
            autoCloseShift: settings.autoCloseShift,
            shiftCloseTime: settings.shiftCloseTime,
            dailyOpeningTime: settings.dailyOpeningTime,
            enableCashManagement: settings.enableCashManagement,
            requireOpeningFloat: settings.requireOpeningFloat,
            openingFloatAmount: settings.openingFloatAmount,
            enableShiftManagement: settings.enableShiftManagement,
            enableMultipleUsers: settings.enableMultipleUsers,
            enableReturns: settings.enableReturns,
            enableLayaway: settings.enableLayaway,
            enableDiscounts: settings.enableDiscounts,
            maxDiscountPercentage: settings.maxDiscountPercentage,
        },
        backupSettings: {
            backupEnabled: settings.backupEnabled,
            backupFrequency: settings.backupFrequency,
            autoBackupEnabled: settings.autoBackupEnabled,
            backupIntervalHours: settings.backupIntervalHours,
            maxBackupFiles: settings.maxBackupFiles,
            backupLocation: settings.backupLocation,
        },
        displaySettings: {
            theme: settings.theme,
            fontSize: settings.fontSize,
            navigationMenuType: settings.navigationMenuType,
            enableAnimations: settings.enableAnimations,
            enableNotifications: settings.enableNotifications,
            enableVirtualKeyboard: settings.enableVirtualKeyboard,
            virtualKeyboardLayout: settings.virtualKeyboardLayout,
            virtualKeyboardTheme: settings.virtualKeyboardTheme,
            virtualKeyboardSound: settings.virtualKeyboardSound,
            virtualKeyboardHaptic: settings.virtualKeyboardHaptic,
        },
        taxFeeSettings: {
            taxInclusive: settings.taxInclusive,
            showTaxOnReceipt: settings.showTaxOnReceipt,
            multiTaxEnabled: settings.multiTaxEnabled,
            serviceFeeEnabled: settings.serviceFeeEnabled,
            serviceFeePercentage: settings.serviceFeePercentage,
        },
        customerManagementSettings: {
            enableLoyaltyProgram: settings.enableLoyaltyProgram,
            loyaltyPointsPerDollar: settings.loyaltyPointsPerDollar,
            enableCustomerAccounts: settings.enableCustomerAccounts,
            enableCustomerCredit: settings.enableCustomerCredit,
            maxCustomerCredit: settings.maxCustomerCredit,
        },
        reportingSettings: {
            eodReportEnabled: settings.eodReportEnabled,
            eodReportTime: settings.eodReportTime,
            emailReports: settings.emailReports,
            reportEmail: settings.reportEmail,
        },
    };
};

/**
 * Export settings to JSON for backup (as API payload format)
 */
export const exportSettings = (settings: AppSettings): string => {
    const apiPayload = mapSettingsToApiPayload(settings);
    return JSON.stringify(apiPayload, null, 2);
};

/**
 * Export settings as flat format for backup
 */
export const exportSettingsFlat = (settings: AppSettings): string => {
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

/**
 * Get specific JSON column settings from flat AppSettings
 * Useful for partial API updates
 */
export const getSettingsGroupPayload = <K extends keyof TerminalSettingsApiResponse>(
    settings: AppSettings,
    groupName: K
): Record<K, TerminalSettingsApiResponse[K]> => {
    const apiPayload = mapSettingsToApiPayload(settings);
    return { [groupName]: apiPayload[groupName] } as Record<K, TerminalSettingsApiResponse[K]>;
};

/**
 * List of all JSON column names for batch updates
 */
export const JSON_SETTINGS_COLUMNS = [
    'localizationSettings',
    'transactionSettings',
    'customerSettings',
    'receiptSettings',
    'paymentSettings',
    'mraComplianceSettings',
    'inventorySettings',
    'syncSettings',
    'securitySettings',
    'performanceSettings',
    'hardwareSettings',
    'integrationSettings',
    'workflowSettings',
    'backupSettings',
    'displaySettings',
    'taxFeeSettings',
    'customerManagementSettings',
    'reportingSettings',
] as const;

/**
 * List of all selective column names
 */
export const SELECTIVE_COLUMNS = [
    'storeName',
    'storeAddress',
    'storePhone',
    'storeEmail',
    'currency',
    'taxRate',
    'businessLicense',
    'businessTaxId',
    'language',
    'timezone',
    'dateFormat',
    'timeFormat',
    'pinLength',
    'sessionTimeoutMinutes',
    'autoLogoutMinutes',
    'serverUrl',
] as const;
