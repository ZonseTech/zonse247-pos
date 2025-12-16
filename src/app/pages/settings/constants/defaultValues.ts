export const DEFAULT_GENERAL_SETTINGS = {
    storeName: 'My Store',
    storeAddress: '123 Main St',
    storePhone: '+265-1-234-567',
    storeEmail: 'store@example.com',
    currency: 'MWK',
    taxRate: 16.5,
    businessLicense: 'LIC-12345',
    businessTaxId: 'TAX-98765',
} as const;

export const DEFAULT_LOCALIZATION_SETTINGS = {
    language: 'en_US',
    timezone: 'Africa/Blantyre',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h' as const,
    currencyDecimalPlaces: 2,
    numberSeparator: 'comma' as const,
    showCurrencySymbol: true,
    currencySymbolPosition: 'before' as const,
} as const;

export const DEFAULT_TRANSACTION_SETTINGS = {
    autoApplyTax: true,
    taxInclusivePricing: false,
    roundTaxAmount: false,
    roundTotalAmount: false,
    roundToNearest: 0.05,
    minimumTransactionAmount: 0,
    maximumTransactionAmount: 10000000,
    holdTransactionMinutes: 30,
    saveDraftTransactions: true,
} as const;

export const DEFAULT_CUSTOMER_SETTINGS = {
    requireCustomerDetails: false,
    defaultCustomerType: 'WALK_IN',
    collectCustomerEmail: true,
    collectCustomerPhone: true,
    collectCustomerAddress: false,
    customerDisplayMode: 'SEARCH' as const,
} as const;

export const DEFAULT_RECEIPT_SETTINGS = {
    receiptNumberPrefix: 'RCP',
    receiptNumberSuffix: '',
    receiptStartNumber: 1,
    receiptResetDaily: false,
    printDuplicateReceipt: false,
    receiptCopies: 1,
    printOrderKitchen: false,
    printOrderBar: false,
    kitchenPrinterName: '',
    barPrinterName: '',
    printKitchenOnPaid: false,
    printBarOnPaid: false,
    enableReceiptPrinting: true,
    autoPrintReceipt: true,
    printItemizedReceipt: true,
    receiptFooter: 'Thank you for your business!',
    receiptHeader: '',
    showStoreLogo: false,
    showReceiptLogo: true,
    logoUrl: '',
    receiptWidth: 80,
    showTaxBreakdown: true,
    showItemCodes: false,
    showCashierName: true,
    showTerminalId: true,
    qrCodeEnabled: false,
    qrCodeContent: 'receipt-id',
} as const;

export const DEFAULT_PAYMENT_SETTINGS = {
    enableCashPayment: true,
    enableCardPayment: true,
    enableMobileMoneyPayment: true,
    enableGiftCard: false,
    defaultPaymentMethod: 'CASH',
    cashRoundingEnabled: false,
    cashRoundingAmount: 0.05,
    cashPaymentDefault: true,
    cardPaymentDefault: false,
    enableCard: true,
    enableMobileMoney: true,
    enableCash: true,
    enableCredit: false,
    giftCardEnabled: false,
    splitPaymentEnabled: true,
    maxSplitWays: 3,
    changeCalculationMode: 'AUTO' as const,
    suggestChangeAmounts: true,
    roundingEnabled: true,
    roundingAmount: 0.05,
} as const;

export const DEFAULT_MRA_SETTINGS = {
    mraComplianceMode: 'STRICT' as const,
    zReportAutoGenerate: true,
    zReportTime: '23:59',
    dailySalesReportTime: '23:59',
    mraApiTimeoutSeconds: 10,
    mraRetryAttempts: 3,
    requireVatNumber: false,
    vatInclusiveDisplay: true,
} as const;

export const DEFAULT_INVENTORY_SETTINGS = {
    trackInventory: true,
    lowStockThreshold: 10,
    enableStockAlerts: true,
    autoDeductStock: true,
    allowNegativeStock: false,
    batchTrackingEnabled: false,
    expiryDateTrackingEnabled: false,
    serialNumberTrackingEnabled: false,
    enableProductVariants: true,
    productSearchMode: 'NAME_AND_SKU' as const,
    productDisplayMode: 'GRID' as const,
    showStockLevels: true,
    autoOrderEnabled: false,
} as const;

export const DEFAULT_OFFLINE_SETTINGS = {
    enableOfflineMode: true,
    syncOnWifiOnly: false,
    autoSyncOnReconnect: true,
    enableCloudSync: true,
    offlineDataRetentionDays: 30,
    syncBatchSize: 100,
    syncTimeoutSeconds: 60,
} as const;

export const DEFAULT_SECURITY_SETTINGS = {
    sessionTimeoutMinutes: 30,
    pinLength: 4,
    maxLoginAttempts: 3,
    lockoutMinutes: 15,
    requirePinForSettings: true,
    requirePinForReports: true,
    requirePinForVoid: true,
    requirePinForDiscount: true,
    requirePinForReturn: true,
    auditLogEnabled: true,
    managerOverridePin: '',
    serverUrl: 'https://api.example.com',
} as const;

export const DEFAULT_PERFORMANCE_SETTINGS = {
    cacheExpiryHours: 24,
    maxCacheSizeMB: 100,
    transactionHistoryDays: 90,
    autoCleanupOldData: true,
    imageCompressionQuality: 80,
} as const;

export const DEFAULT_HARDWARE_SETTINGS = {
    printerType: 'thermal' as const,
    printerConnectionType: 'USB' as const,
    printerName: '',
    paperSize: 'A4',
    printerPaperWidth: 80,
    enableCashDrawer: true,
    cashDrawerOpenOn: 'payment' as const,
    cashDrawerOpenCode: '',
    enableBarcodeScanner: true,
    barcodeScanMode: 'AUTO' as const,
    barcodeScannerPrefix: '',
    scannerBeepEnabled: true,
    scannerVibrationEnabled: false,
    enableCardReader: false,
    cardReaderType: 'all' as const,
    scaleIntegrationEnabled: false,
    scaleIntegrationMode: 'DIRECT' as const,
} as const;

export const DEFAULT_INTEGRATION_SETTINGS = {
    apiBaseUrl: typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : 'https://api.example.com',
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    apiKeyExpiryDays: 90,
    enableApiAccess: false,
    apiRateLimit: 60,
} as const;

export const DEFAULT_BUSINESS_RULES = {
    allowReturnWithoutReceipt: false,
    returnPeriodDays: 30,
    requireManagerForVoid: false,
    autoCloseShift: true,
    shiftCloseTime: '23:59',
    dailyOpeningTime: '08:00',
    enableCashManagement: true,
    requireOpeningFloat: true,
    openingFloatAmount: 1000,
    enableShiftManagement: true,
    enableMultipleUsers: true,
    enableReturns: true,
    enableLayaway: false,
    enableDiscounts: true,
    maxDiscountPercentage: 20,
} as const;

export const DEFAULT_BACKUP_SETTINGS = {
    backupEnabled: true,
    backupFrequency: 'daily' as const,
    autoBackupEnabled: true,
    backupIntervalHours: 24,
    maxBackupFiles: 7,
    backupLocation: 'LOCAL' as const,
} as const;

export const DEFAULT_DISPLAY_SETTINGS = {
    theme: 'light' as const,
    fontSize: 'medium' as const,
    navigationMenuType: 'desktop' as const,
    showProductImages: true,
    enableAnimations: true,
    enableNotifications: true,
    screenBrightness: 80,
    screenTimeoutSeconds: 60,
    enableVirtualKeyboard: true,
    virtualKeyboardLayout: 'qwerty' as const,
    virtualKeyboardTheme: 'default' as const,
    virtualKeyboardSound: false,
    virtualKeyboardHaptic: false,
} as const;

export const DEFAULT_TAX_SETTINGS = {
    taxInclusive: true,
    showTaxOnReceipt: true,
    multiTaxEnabled: false,
    serviceFeeEnabled: false,
    serviceFeePercentage: 0,
} as const;

export const DEFAULT_CUSTOMER_MANAGEMENT = {
    enableLoyaltyProgram: false,
    loyaltyPointsEnabled: false,
    loyaltyPointsPerDollar: 1,
    enableCustomerAccounts: false,
    enableCustomerCredit: false,
    maxCustomerCredit: 10000,
} as const;

export const DEFAULT_REPORTING_SETTINGS = {
    eodReportEnabled: true,
    eodReportTime: '23:00',
    emailReports: false,
    reportEmail: '',
} as const;

export const DEFAULT_AUDIT_SETTINGS = {
    settingsVersion: '1.0.0',
    lastConfiguredBy: '',
    configurationDate: new Date().toISOString(),
    autoLogoutMinutes: 30,
} as const;

export const DEFAULT_PRODUCT_DISPLAY = {
    productsPerPage: 20,
    quickProductSearch: true,
} as const;

/**
 * Complete default settings - combines all categories
 */
export const getDefaultSettings = (overrides?: Partial<AppSettings>): AppSettings => ({
    ...DEFAULT_GENERAL_SETTINGS,
    ...DEFAULT_LOCALIZATION_SETTINGS,
    ...DEFAULT_TRANSACTION_SETTINGS,
    ...DEFAULT_CUSTOMER_SETTINGS,
    ...DEFAULT_RECEIPT_SETTINGS,
    ...DEFAULT_PAYMENT_SETTINGS,
    ...DEFAULT_MRA_SETTINGS,
    ...DEFAULT_INVENTORY_SETTINGS,
    ...DEFAULT_OFFLINE_SETTINGS,
    ...DEFAULT_SECURITY_SETTINGS,
    ...DEFAULT_PERFORMANCE_SETTINGS,
    ...DEFAULT_HARDWARE_SETTINGS,
    ...DEFAULT_INTEGRATION_SETTINGS,
    ...DEFAULT_BUSINESS_RULES,
    ...DEFAULT_BACKUP_SETTINGS,
    ...DEFAULT_DISPLAY_SETTINGS,
    ...DEFAULT_TAX_SETTINGS,
    ...DEFAULT_CUSTOMER_MANAGEMENT,
    ...DEFAULT_REPORTING_SETTINGS,
    ...DEFAULT_AUDIT_SETTINGS,
    ...DEFAULT_PRODUCT_DISPLAY,
    ...overrides,
});

/**
 * Maps API response to settings structure
 * Provides backwards compatibility with old API format
 */
export const mapApiResponseToSettings = (apiResponse: any): Partial<AppSettings> => {
    if (!apiResponse) return {};

    return {
        storeName: apiResponse.store || apiResponse.storeName,
        storeAddress: apiResponse.addressLine1 || apiResponse.storeAddress,
        storePhone: apiResponse.contact || apiResponse.storePhone,
        taxRate: apiResponse.tax ? Number(apiResponse.tax) : undefined,
        ...apiResponse,
    };
};
