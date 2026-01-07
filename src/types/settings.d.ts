// ==========================================
// HIERARCHICAL JSON SETTINGS TYPES
// ==========================================

/**
 * Localization Settings (JSON)
 */
type LocalizationSettings = {
    currencyDecimalPlaces: number;
    numberSeparator: 'comma' | 'period' | 'space';
    showCurrencySymbol: boolean;
    currencySymbolPosition: 'before' | 'after';
};

/**
 * Transaction Processing Settings (JSON)
 */
type TransactionSettings = {
    autoApplyTax: boolean;
    taxInclusivePricing: boolean;
    roundTaxAmount: boolean;
    roundTotalAmount: boolean;
    roundToNearest: number;
    minimumTransactionAmount: number;
    maximumTransactionAmount: number;
    holdTransactionMinutes: number;
    saveDraftTransactions: boolean;
};

/**
 * Customer Settings (JSON)
 */
type CustomerSettings = {
    requireCustomerDetails: boolean;
    defaultCustomerType: string;
    collectCustomerEmail: boolean;
    collectCustomerPhone: boolean;
    collectCustomerAddress: boolean;
    customerDisplayMode: 'SEARCH' | 'LIST' | 'BOTH';
};

/**
 * Receipt & Printing Settings (JSON)
 */
type ReceiptSettings = {
    receiptNumberPrefix: string;
    receiptNumberSuffix: string;
    receiptStartNumber: number;
    receiptResetDaily: boolean;
    printDuplicateReceipt: boolean;
    receiptCopies: number;
    printOrderKitchen: boolean;
    printOrderBar: boolean;
    kitchenPrinterName: string;
    barPrinterName: string;
    printItemizedReceipt: boolean;
    receiptFooter: string;
    receiptHeader: string;
    showStoreLogo: boolean;
    logoUrl: string;
    receiptWidth: number;
    showTaxBreakdown: boolean;
    showItemCodes: boolean;
    showCashierName: boolean;
    showTerminalId: boolean;
    qrCodeEnabled: boolean;
    qrCodeContent: 'receipt-id' | 'url' | 'none';
};

/**
 * Payment Processing Settings (JSON)
 */
type PaymentSettings = {
    cashPaymentDefault: boolean;
    cardPaymentDefault: boolean;
    splitPaymentEnabled: boolean;
    maxSplitWays: number;
    changeCalculationMode: 'AUTO' | 'MANUAL';
    suggestChangeAmounts: boolean;
    giftCardEnabled: boolean;
    loyaltyPointsEnabled: boolean;
    enableCash: boolean;
    enableCard: boolean;
    enableMobileMoney: boolean;
    enableCredit: boolean;
    enableGiftCard: boolean;
    roundingEnabled: boolean;
    roundingAmount: number;
};

/**
 * VAT/MRA Compliance Settings (JSON)
 */
type MraComplianceSettings = {
    mraComplianceMode: 'STRICT' | 'RELAXED' | 'TEST';
    requireVatNumber: boolean;
    vatInclusiveDisplay: boolean;
    zReportAutoGenerate: boolean;
    zReportTime: string;
    dailySalesReportTime: string;
};

/**
 * Inventory & Product Settings (JSON)
 */
type InventorySettings = {
    showProductImages: boolean;
    productDisplayMode: 'GRID' | 'LIST' | 'COMPACT';
    productsPerPage: number;
    quickProductSearch: boolean;
    barcodeScanMode: 'AUTO' | 'MANUAL' | 'BOTH';
    scaleIntegrationMode: 'DIRECT' | 'MANUAL';
    allowNegativeStock: boolean;
    lowStockThreshold: number;
    showStockLevels: boolean;
    enableStockAlerts: boolean;
    autoOrderEnabled: boolean;
};

/**
 * Offline & Sync Settings (JSON)
 */
type SyncSettings = {
    enableOfflineMode: boolean;
    offlineDataRetentionDays: number;
    syncOnWifiOnly: boolean;
    autoSyncOnReconnect: boolean;
    syncBatchSize: number;
    syncTimeoutSeconds: number;
    enableCloudSync: boolean;
};

/**
 * Security & Access Control (JSON) - extended settings
 */
type SecuritySettings = {
    maxLoginAttempts: number;
    lockoutMinutes: number;
    requirePinForSettings: boolean;
    requirePinForReports: boolean;
    requirePinForVoid: boolean;
    requirePinForDiscount: boolean;
    requirePinForReturn: boolean;
    auditLogEnabled: boolean;
};

/**
 * Performance & Storage (JSON)
 */
type PerformanceSettings = {
    cacheExpiryHours: number;
    maxCacheSizeMB: number;
    transactionHistoryDays: number;
    autoCleanupOldData: boolean;
    imageCompressionQuality: number;
};

/**
 * Hardware & Device Settings (JSON)
 */
type HardwareSettings = {
    printerConnectionType: 'BLUETOOTH' | 'USB' | 'NETWORK';
    printerPaperWidth: number;
    cashDrawerOpenCode: string;
    scannerBeepEnabled: boolean;
    scannerVibrationEnabled: boolean;
    screenBrightness: number;
    screenTimeoutSeconds: number;
    printerType: 'thermal' | 'inkjet' | 'laser' | 'none';
    printerName: string;
    autoPrintReceipt: boolean;
    paperSize: '58mm' | '80mm' | 'A4';
    enableCashDrawer: boolean;
    cashDrawerOpenOn: 'sale' | 'payment' | 'manual';
    enableBarcodeScanner: boolean;
    barcodeScannerPrefix: string;
    enableCardReader: boolean;
    cardReaderType: 'stripe' | 'chip' | 'contactless' | 'all';
};

/**
 * Integration & API Settings (JSON)
 */
type IntegrationSettings = {
    apiBaseUrl: string;
    mraApiTimeoutSeconds: number;
    mraRetryAttempts: number;
    webhookEnabled: boolean;
    webhookUrl: string;
    webhookSecret: string;
    apiKeyExpiryDays: number;
    enableApiAccess: boolean;
    apiRateLimit: number;
};

/**
 * Business Rules & Workflow (JSON)
 */
type WorkflowSettings = {
    allowReturnWithoutReceipt: boolean;
    returnPeriodDays: number;
    requireManagerForVoid: boolean;
    managerOverridePin: string;
    autoCloseShift: boolean;
    shiftCloseTime: string;
    dailyOpeningTime: string;
    enableCashManagement: boolean;
    requireOpeningFloat: boolean;
    openingFloatAmount: number;
    enableShiftManagement: boolean;
    enableMultipleUsers: boolean;
    enableReturns: boolean;
    enableLayaway: boolean;
    enableDiscounts: boolean;
    maxDiscountPercentage: number;
};

/**
 * Backup & Recovery (JSON)
 */
type BackupSettings = {
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    autoBackupEnabled: boolean;
    backupIntervalHours: number;
    maxBackupFiles: number;
    backupLocation: 'LOCAL' | 'CLOUD' | 'BOTH';
};

/**
 * Display & UI Settings (JSON)
 */
type DisplaySettings = {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    navigationMenuType: 'desktop' | 'web';
    showProductImages: boolean;
    enableAnimations: boolean;
    enableNotifications: boolean;
    enableVirtualKeyboard: boolean;
    virtualKeyboardLayout: 'qwerty' | 'numeric' | 'alphanumeric';
    virtualKeyboardTheme: 'default' | 'dark' | 'light';
    virtualKeyboardSound: boolean;
    virtualKeyboardHaptic: boolean;
};

/**
 * Taxes & Fees Settings (JSON)
 */
type TaxFeeSettings = {
    taxInclusive: boolean;
    showTaxOnReceipt: boolean;
    multiTaxEnabled: boolean;
    serviceFeeEnabled: boolean;
    serviceFeePercentage: number;
};

/**
 * Customer Management Settings (JSON)
 */
type CustomerManagementSettings = {
    enableLoyaltyProgram: boolean;
    loyaltyPointsPerDollar: number;
    enableCustomerAccounts: boolean;
    enableCustomerCredit: boolean;
    maxCustomerCredit: number;
};

/**
 * Reporting Settings (JSON)
 */
type ReportingSettings = {
    eodReportEnabled: boolean;
    eodReportTime: string;
    emailReports: boolean;
    reportEmail: string;
};

// ==========================================
// TERMINAL SETTINGS API RESPONSE TYPE
// Matches the Prisma TerminalSettings model
// ==========================================

/**
 * API Response Type for Terminal Settings
 * Uses Hierarchical JSON + Selective Columns pattern
 */
type TerminalSettingsApiResponse = {
    id: string;
    terminalId: string;

    // ==========================================
    // SELECTIVE COLUMNS (Frequently queried fields)
    // ==========================================

    // General Information (Selective Columns)
    storeName: string | null;
    storeAddress: string | null;
    storePhone: string | null;
    storeEmail: string | null;
    currency: string;
    taxRate: number | string; // API may return as string
    businessLicense: string | null;
    businessTaxId: string | null;

    // Localization & Display Settings (Selective Columns)
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';

    // Security & Access Control (Selective Columns - frequently used)
    pinLength: number;
    sessionTimeoutMinutes: number;
    autoLogoutMinutes: number;
    serverUrl: string | null;

    // ==========================================
    // HIERARCHICAL JSON COLUMNS (Grouped settings)
    // ==========================================
    localizationSettings: LocalizationSettings | null;
    transactionSettings: TransactionSettings | null;
    customerSettings: CustomerSettings | null;
    receiptSettings: ReceiptSettings | null;
    paymentSettings: PaymentSettings | null;
    mraComplianceSettings: MraComplianceSettings | null;
    inventorySettings: InventorySettings | null;
    syncSettings: SyncSettings | null;
    securitySettings: SecuritySettings | null;
    performanceSettings: PerformanceSettings | null;
    hardwareSettings: HardwareSettings | null;
    integrationSettings: IntegrationSettings | null;
    workflowSettings: WorkflowSettings | null;
    backupSettings: BackupSettings | null;
    displaySettings: DisplaySettings | null;
    taxFeeSettings: TaxFeeSettings | null;
    customerManagementSettings: CustomerManagementSettings | null;
    reportingSettings: ReportingSettings | null;

    // ==========================================
    // AUDIT & METADATA
    // ==========================================
    settingsVersion: string;
    lastConfiguredBy: string | null;
    configurationDate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

// ==========================================
// FLAT APP SETTINGS TYPE (For UI/Forms)
// ==========================================

/**
 * Flattened settings type used in the application UI
 * All nested JSON settings are flattened for easy form binding
 */
type AppSettings = {
    terminalId: string;

    // General Information (Selective Columns)
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    currency: string;
    taxRate: number;
    businessLicense: string;
    businessTaxId: string;

    // Localization & Display Settings (Selective Columns)
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';

    // Localization Settings (from JSON)
    currencyDecimalPlaces: number;
    numberSeparator: 'comma' | 'period' | 'space';
    showCurrencySymbol: boolean;
    currencySymbolPosition: 'before' | 'after';

    // Transaction Processing Settings (from JSON)
    autoApplyTax: boolean;
    taxInclusivePricing: boolean;
    roundTaxAmount: boolean;
    roundTotalAmount: boolean;
    roundToNearest: number;
    minimumTransactionAmount: number;
    maximumTransactionAmount: number;
    holdTransactionMinutes: number;
    saveDraftTransactions: boolean;

    // Customer Settings (from JSON)
    requireCustomerDetails: boolean;
    defaultCustomerType: string;
    collectCustomerEmail: boolean;
    collectCustomerPhone: boolean;
    collectCustomerAddress: boolean;
    customerDisplayMode: 'SEARCH' | 'LIST' | 'BOTH';

    // Receipt & Printing Settings (from JSON)
    receiptNumberPrefix: string;
    receiptNumberSuffix: string;
    receiptStartNumber: number;
    receiptResetDaily: boolean;
    printDuplicateReceipt: boolean;
    receiptCopies: number;
    printOrderKitchen: boolean;
    printOrderBar: boolean;
    kitchenPrinterName: string;
    barPrinterName: string;
    printItemizedReceipt: boolean;
    receiptFooter: string;
    receiptHeader: string;
    showStoreLogo: boolean;
    logoUrl: string;
    receiptWidth: number;
    showTaxBreakdown: boolean;
    showItemCodes: boolean;
    showCashierName: boolean;
    showTerminalId: boolean;
    qrCodeEnabled: boolean;
    qrCodeContent: 'receipt-id' | 'url' | 'none';

    // Payment Processing Settings (from JSON)
    cashPaymentDefault: boolean;
    cardPaymentDefault: boolean;
    splitPaymentEnabled: boolean;
    maxSplitWays: number;
    changeCalculationMode: 'AUTO' | 'MANUAL';
    suggestChangeAmounts: boolean;
    giftCardEnabled: boolean;
    loyaltyPointsEnabled: boolean;
    enableCash: boolean;
    enableCard: boolean;
    enableMobileMoney: boolean;
    enableCredit: boolean;
    enableGiftCard: boolean;
    roundingEnabled: boolean;
    roundingAmount: number;

    // VAT/MRA Compliance Settings (from JSON)
    mraComplianceMode: 'STRICT' | 'RELAXED' | 'TEST';
    requireVatNumber: boolean;
    vatInclusiveDisplay: boolean;
    zReportAutoGenerate: boolean;
    zReportTime: string;
    dailySalesReportTime: string;

    // Inventory & Product Settings (from JSON)
    showProductImages: boolean;
    productDisplayMode: 'GRID' | 'LIST' | 'COMPACT';
    productsPerPage: number;
    quickProductSearch: boolean;
    barcodeScanMode: 'AUTO' | 'MANUAL' | 'BOTH';
    scaleIntegrationMode: 'DIRECT' | 'MANUAL';
    allowNegativeStock: boolean;
    lowStockThreshold: number;
    showStockLevels: boolean;
    enableStockAlerts: boolean;
    autoOrderEnabled: boolean;

    // Offline & Sync Settings (from JSON)
    enableOfflineMode: boolean;
    offlineDataRetentionDays: number;
    syncOnWifiOnly: boolean;
    autoSyncOnReconnect: boolean;
    syncBatchSize: number;
    syncTimeoutSeconds: number;
    enableCloudSync: boolean;

    // Security & Access Control (Selective + JSON)
    pinLength: number;
    sessionTimeoutMinutes: number;
    autoLogoutMinutes: number;
    serverUrl: string;
    maxLoginAttempts: number;
    lockoutMinutes: number;
    requirePinForSettings: boolean;
    requirePinForReports: boolean;
    requirePinForVoid: boolean;
    requirePinForDiscount: boolean;
    requirePinForReturn: boolean;
    auditLogEnabled: boolean;

    // Performance & Storage (from JSON)
    cacheExpiryHours: number;
    maxCacheSizeMB: number;
    transactionHistoryDays: number;
    autoCleanupOldData: boolean;
    imageCompressionQuality: number;

    // Hardware & Device Settings (from JSON)
    printerConnectionType: 'BLUETOOTH' | 'USB' | 'NETWORK';
    printerPaperWidth: number;
    cashDrawerOpenCode: string;
    scannerBeepEnabled: boolean;
    scannerVibrationEnabled: boolean;
    screenBrightness: number;
    screenTimeoutSeconds: number;
    printerType: 'thermal' | 'inkjet' | 'laser' | 'none';
    printerName: string;
    autoPrintReceipt: boolean;
    paperSize: '58mm' | '80mm' | 'A4';
    enableCashDrawer: boolean;
    cashDrawerOpenOn: 'sale' | 'payment' | 'manual';
    enableBarcodeScanner: boolean;
    barcodeScannerPrefix: string;
    enableCardReader: boolean;
    cardReaderType: 'stripe' | 'chip' | 'contactless' | 'all';

    // Integration & API Settings (from JSON)
    apiBaseUrl: string;
    mraApiTimeoutSeconds: number;
    mraRetryAttempts: number;
    webhookEnabled: boolean;
    webhookUrl: string;
    webhookSecret: string;
    apiKeyExpiryDays: number;
    enableApiAccess: boolean;
    apiRateLimit: number;

    // Business Rules & Workflow (from JSON)
    allowReturnWithoutReceipt: boolean;
    returnPeriodDays: number;
    requireManagerForVoid: boolean;
    managerOverridePin: string;
    autoCloseShift: boolean;
    shiftCloseTime: string;
    dailyOpeningTime: string;
    enableCashManagement: boolean;
    requireOpeningFloat: boolean;
    openingFloatAmount: number;
    enableShiftManagement: boolean;
    enableMultipleUsers: boolean;
    enableReturns: boolean;
    enableLayaway: boolean;
    enableDiscounts: boolean;
    maxDiscountPercentage: number;

    // Backup & Recovery (from JSON)
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    autoBackupEnabled: boolean;
    backupIntervalHours: number;
    maxBackupFiles: number;
    backupLocation: 'LOCAL' | 'CLOUD' | 'BOTH';

    // Display & UI (from JSON)
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    navigationMenuType: 'desktop' | 'web';
    enableAnimations: boolean;
    enableNotifications: boolean;
    enableVirtualKeyboard: boolean;
    virtualKeyboardLayout: 'qwerty' | 'numeric' | 'alphanumeric';
    virtualKeyboardTheme: 'default' | 'dark' | 'light';
    virtualKeyboardSound: boolean;
    virtualKeyboardHaptic: boolean;

    // Taxes & Fees (from JSON)
    taxInclusive: boolean;
    showTaxOnReceipt: boolean;
    multiTaxEnabled: boolean;
    serviceFeeEnabled: boolean;
    serviceFeePercentage: number;

    // Customer Management (from JSON)
    enableLoyaltyProgram: boolean;
    loyaltyPointsPerDollar: number;
    enableCustomerAccounts: boolean;
    enableCustomerCredit: boolean;
    maxCustomerCredit: number;

    // Reporting (from JSON)
    eodReportEnabled: boolean;
    eodReportTime: string;
    emailReports: boolean;
    reportEmail: string;

    // Audit & Metadata
    settingsVersion: string;
    lastConfiguredBy: string;
    configurationDate: string;
}

interface InitializationState {
    isAccountVerified: boolean
    isLoading: boolean
    error: string | null
    retryCount: number
}

interface InitializationResult {
    success: boolean
    verified?: boolean
    error?: string
}
