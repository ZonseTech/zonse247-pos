type AppSettings = {
    // General Information
    storeName: string;
    storeAddress: string;
    storePhone: string;
    storeEmail: string;
    currency: string;
    taxRate: number;
    businessLicense: string;
    businessTaxId: string;

    // Localization & Display Settings
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currencyDecimalPlaces: number;
    numberSeparator: 'comma' | 'period' | 'space';
    showCurrencySymbol: boolean;
    currencySymbolPosition: 'before' | 'after';

    // Transaction Processing Settings
    autoApplyTax: boolean;
    taxInclusivePricing: boolean;
    roundTaxAmount: boolean;
    roundTotalAmount: boolean;
    roundToNearest: number;
    minimumTransactionAmount: number;
    maximumTransactionAmount: number;
    holdTransactionMinutes: number;
    saveDraftTransactions: boolean;

    // Customer Settings
    requireCustomerDetails: boolean;
    defaultCustomerType: string;
    collectCustomerEmail: boolean;
    collectCustomerPhone: boolean;
    collectCustomerAddress: boolean;
    customerDisplayMode: 'SEARCH' | 'LIST' | 'BOTH';

    // Receipt & Printing Settings
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

    // Payment Processing Settings
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

    // VAT/MRA Compliance Settings
    mraComplianceMode: 'STRICT' | 'RELAXED' | 'TEST';
    requireVatNumber: boolean;
    vatInclusiveDisplay: boolean;
    zReportAutoGenerate: boolean;
    zReportTime: string;
    dailySalesReportTime: string;

    // Inventory & Product Settings
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

    // Offline & Sync Settings
    enableOfflineMode: boolean;
    offlineDataRetentionDays: number;
    syncOnWifiOnly: boolean;
    autoSyncOnReconnect: boolean;
    syncBatchSize: number;
    syncTimeoutSeconds: number;
    enableCloudSync: boolean;

    // Security & Access Control
    pinLength: number;
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    lockoutMinutes: number;
    requirePinForSettings: boolean;
    requirePinForReports: boolean;
    requirePinForVoid: boolean;
    requirePinForDiscount: boolean;
    requirePinForReturn: boolean;
    auditLogEnabled: boolean;
    serverUrl: string;

    // Performance & Storage
    cacheExpiryHours: number;
    maxCacheSizeMB: number;
    transactionHistoryDays: number;
    autoCleanupOldData: boolean;
    imageCompressionQuality: number;

    // Hardware & Device Settings
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

    // Integration & API Settings
    apiBaseUrl: string;
    mraApiTimeoutSeconds: number;
    mraRetryAttempts: number;
    webhookEnabled: boolean;
    webhookUrl: string;
    webhookSecret: string;
    apiKeyExpiryDays: number;
    enableApiAccess: boolean;
    apiRateLimit: number;

    // Business Rules & Workflow
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

    // Backup & Recovery
    backupEnabled: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    autoBackupEnabled: boolean;
    backupIntervalHours: number;
    maxBackupFiles: number;
    backupLocation: 'LOCAL' | 'CLOUD' | 'BOTH';

    // Display & UI
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

    // Taxes & Fees
    taxInclusive: boolean;
    showTaxOnReceipt: boolean;
    multiTaxEnabled: boolean;
    serviceFeeEnabled: boolean;
    serviceFeePercentage: number;

    // Customer Management
    enableLoyaltyProgram: boolean;
    loyaltyPointsPerDollar: number;
    enableCustomerAccounts: boolean;
    enableCustomerCredit: boolean;
    maxCustomerCredit: number;

    // Reporting
    eodReportEnabled: boolean;
    eodReportTime: string;
    emailReports: boolean;
    reportEmail: string;

    // Audit & Metadata
    settingsVersion: string;
    lastConfiguredBy: string;
    configurationDate: string;
    autoLogoutMinutes: number;
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
