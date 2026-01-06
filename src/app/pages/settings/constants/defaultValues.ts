// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Decodes HTML entities in a string
 * Handles multiple levels of encoding (e.g., &amp;amp;amp;#x2F; -> /)
 */
export const decodeHtmlEntities = (str: string | null | undefined): string => {
    if (!str) return '';
    
    let decoded = str;
    let prevDecoded = '';
    
    // Keep decoding until no more changes (handles multiple encoding levels)
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
 * Safely converts a value to number, handling strings and null/undefined
 */
export const toNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? defaultValue : num;
};

// ==========================================
// DEFAULT VALUES FOR SELECTIVE COLUMNS
// ==========================================

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

export const DEFAULT_SELECTIVE_LOCALIZATION = {
    language: 'en_US',
    timezone: 'Africa/Blantyre',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h' as const,
} as const;

export const DEFAULT_SELECTIVE_SECURITY = {
    pinLength: 4,
    sessionTimeoutMinutes: 15,
    autoLogoutMinutes: 30,
    serverUrl: '',
} as const;

export const DEFAULT_LOCALIZATION_SETTINGS: LocalizationSettings = {
    currencyDecimalPlaces: 2,
    numberSeparator: 'comma',
    showCurrencySymbol: true,
    currencySymbolPosition: 'before',
};

export const DEFAULT_TRANSACTION_SETTINGS: TransactionSettings = {
    autoApplyTax: true,
    taxInclusivePricing: false,
    roundTaxAmount: false,
    roundTotalAmount: false,
    roundToNearest: 0.05,
    minimumTransactionAmount: 0,
    maximumTransactionAmount: 10000000,
    holdTransactionMinutes: 30,
    saveDraftTransactions: true,
};

export const DEFAULT_CUSTOMER_SETTINGS: CustomerSettings = {
    requireCustomerDetails: false,
    defaultCustomerType: 'WALK_IN',
    collectCustomerEmail: true,
    collectCustomerPhone: true,
    collectCustomerAddress: false,
    customerDisplayMode: 'SEARCH',
};

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettings = {
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
    printItemizedReceipt: true,
    receiptFooter: 'Thank you for your business!',
    receiptHeader: '',
    showStoreLogo: false,
    logoUrl: '',
    receiptWidth: 80,
    showTaxBreakdown: true,
    showItemCodes: false,
    showCashierName: true,
    showTerminalId: true,
    qrCodeEnabled: false,
    qrCodeContent: 'receipt-id',
};

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    cashPaymentDefault: true,
    cardPaymentDefault: false,
    splitPaymentEnabled: true,
    maxSplitWays: 3,
    changeCalculationMode: 'AUTO',
    suggestChangeAmounts: true,
    giftCardEnabled: false,
    loyaltyPointsEnabled: false,
    enableCash: true,
    enableCard: true,
    enableMobileMoney: true,
    enableCredit: false,
    enableGiftCard: false,
    roundingEnabled: true,
    roundingAmount: 0.05,
};

export const DEFAULT_MRA_COMPLIANCE_SETTINGS: MraComplianceSettings = {
    mraComplianceMode: 'STRICT',
    requireVatNumber: false,
    vatInclusiveDisplay: true,
    zReportAutoGenerate: true,
    zReportTime: '23:59',
    dailySalesReportTime: '23:59',
};

export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
    showProductImages: true,
    productDisplayMode: 'GRID',
    productsPerPage: 20,
    quickProductSearch: true,
    barcodeScanMode: 'AUTO',
    scaleIntegrationMode: 'DIRECT',
    allowNegativeStock: false,
    lowStockThreshold: 10,
    showStockLevels: true,
    enableStockAlerts: true,
    autoOrderEnabled: false,
};

export const DEFAULT_SYNC_SETTINGS: SyncSettings = {
    enableOfflineMode: true,
    offlineDataRetentionDays: 30,
    syncOnWifiOnly: false,
    autoSyncOnReconnect: true,
    syncBatchSize: 100,
    syncTimeoutSeconds: 60,
    enableCloudSync: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    maxLoginAttempts: 3,
    lockoutMinutes: 15,
    requirePinForSettings: true,
    requirePinForReports: true,
    requirePinForVoid: true,
    requirePinForDiscount: true,
    requirePinForReturn: true,
    auditLogEnabled: true,
};

export const DEFAULT_PERFORMANCE_SETTINGS: PerformanceSettings = {
    cacheExpiryHours: 24,
    maxCacheSizeMB: 100,
    transactionHistoryDays: 90,
    autoCleanupOldData: true,
    imageCompressionQuality: 80,
};

export const DEFAULT_HARDWARE_SETTINGS: HardwareSettings = {
    printerConnectionType: 'USB',
    printerPaperWidth: 80,
    cashDrawerOpenCode: '',
    scannerBeepEnabled: true,
    scannerVibrationEnabled: false,
    screenBrightness: 80,
    screenTimeoutSeconds: 60,
    printerType: 'thermal',
    printerName: '',
    autoPrintReceipt: true,
    paperSize: '80mm',
    enableCashDrawer: true,
    cashDrawerOpenOn: 'payment',
    enableBarcodeScanner: true,
    barcodeScannerPrefix: '',
    enableCardReader: false,
    cardReaderType: 'all',
};

export const DEFAULT_INTEGRATION_SETTINGS: IntegrationSettings = {
    apiBaseUrl: typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : 'https://api.example.com',
    mraApiTimeoutSeconds: 10,
    mraRetryAttempts: 3,
    webhookEnabled: false,
    webhookUrl: '',
    webhookSecret: '',
    apiKeyExpiryDays: 90,
    enableApiAccess: false,
    apiRateLimit: 60,
};

export const DEFAULT_WORKFLOW_SETTINGS: WorkflowSettings = {
    allowReturnWithoutReceipt: false,
    returnPeriodDays: 30,
    requireManagerForVoid: false,
    managerOverridePin: '',
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
};

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
    backupEnabled: true,
    backupFrequency: 'daily',
    autoBackupEnabled: true,
    backupIntervalHours: 24,
    maxBackupFiles: 7,
    backupLocation: 'LOCAL',
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
    theme: 'light',
    fontSize: 'medium',
    navigationMenuType: 'desktop',
    showProductImages: true,
    enableAnimations: true,
    enableNotifications: true,
    enableVirtualKeyboard: true,
    virtualKeyboardLayout: 'qwerty',
    virtualKeyboardTheme: 'default',
    virtualKeyboardSound: false,
    virtualKeyboardHaptic: false,
};

export const DEFAULT_TAX_FEE_SETTINGS: TaxFeeSettings = {
    taxInclusive: true,
    showTaxOnReceipt: true,
    multiTaxEnabled: false,
    serviceFeeEnabled: false,
    serviceFeePercentage: 0,
};

export const DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS: CustomerManagementSettings = {
    enableLoyaltyProgram: false,
    loyaltyPointsPerDollar: 1,
    enableCustomerAccounts: false,
    enableCustomerCredit: false,
    maxCustomerCredit: 10000,
};

export const DEFAULT_REPORTING_SETTINGS: ReportingSettings = {
    eodReportEnabled: true,
    eodReportTime: '23:00',
    emailReports: false,
    reportEmail: '',
};

export const DEFAULT_AUDIT_METADATA = {
    settingsVersion: '2.0.0',
    lastConfiguredBy: '',
    configurationDate: new Date().toISOString(),
} as const;

// ==========================================
// MAPPING FUNCTIONS
// ==========================================

/**
 * Maps API response (hierarchical JSON + selective columns) to flat AppSettings
 */
export const mapApiResponseToSettings = (apiResponse: TerminalSettingsApiResponse | null): Partial<AppSettings> => {
    if (!apiResponse) return {};

    return {
        // Selective Columns - General Information
        storeName: decodeHtmlEntities(apiResponse.storeName) || DEFAULT_GENERAL_SETTINGS.storeName,
        storeAddress: decodeHtmlEntities(apiResponse.storeAddress) || DEFAULT_GENERAL_SETTINGS.storeAddress,
        storePhone: decodeHtmlEntities(apiResponse.storePhone) || DEFAULT_GENERAL_SETTINGS.storePhone,
        storeEmail: decodeHtmlEntities(apiResponse.storeEmail) || DEFAULT_GENERAL_SETTINGS.storeEmail,
        currency: decodeHtmlEntities(apiResponse.currency) || DEFAULT_GENERAL_SETTINGS.currency,
        taxRate: toNumber(apiResponse.taxRate, DEFAULT_GENERAL_SETTINGS.taxRate),
        businessLicense: decodeHtmlEntities(apiResponse.businessLicense) || DEFAULT_GENERAL_SETTINGS.businessLicense,
        businessTaxId: decodeHtmlEntities(apiResponse.businessTaxId) || DEFAULT_GENERAL_SETTINGS.businessTaxId,

        // Selective Columns - Localization
        language: decodeHtmlEntities(apiResponse.language) || DEFAULT_SELECTIVE_LOCALIZATION.language,
        timezone: decodeHtmlEntities(apiResponse.timezone) || DEFAULT_SELECTIVE_LOCALIZATION.timezone,
        dateFormat: decodeHtmlEntities(apiResponse.dateFormat) || DEFAULT_SELECTIVE_LOCALIZATION.dateFormat,
        timeFormat: apiResponse.timeFormat ?? DEFAULT_SELECTIVE_LOCALIZATION.timeFormat,

        // Selective Columns - Security
        pinLength: toNumber(apiResponse.pinLength, DEFAULT_SELECTIVE_SECURITY.pinLength),
        sessionTimeoutMinutes: toNumber(apiResponse.sessionTimeoutMinutes, DEFAULT_SELECTIVE_SECURITY.sessionTimeoutMinutes),
        autoLogoutMinutes: toNumber(apiResponse.autoLogoutMinutes, DEFAULT_SELECTIVE_SECURITY.autoLogoutMinutes),
        serverUrl: decodeHtmlEntities(apiResponse.serverUrl) || DEFAULT_SELECTIVE_SECURITY.serverUrl,

        // JSON Column - Localization Settings
        currencyDecimalPlaces: toNumber(apiResponse.localizationSettings?.currencyDecimalPlaces, DEFAULT_LOCALIZATION_SETTINGS.currencyDecimalPlaces),
        numberSeparator: apiResponse.localizationSettings?.numberSeparator ?? DEFAULT_LOCALIZATION_SETTINGS.numberSeparator,
        showCurrencySymbol: apiResponse.localizationSettings?.showCurrencySymbol ?? DEFAULT_LOCALIZATION_SETTINGS.showCurrencySymbol,
        currencySymbolPosition: apiResponse.localizationSettings?.currencySymbolPosition ?? DEFAULT_LOCALIZATION_SETTINGS.currencySymbolPosition,

        // JSON Column - Transaction Settings
        autoApplyTax: apiResponse.transactionSettings?.autoApplyTax ?? DEFAULT_TRANSACTION_SETTINGS.autoApplyTax,
        taxInclusivePricing: apiResponse.transactionSettings?.taxInclusivePricing ?? DEFAULT_TRANSACTION_SETTINGS.taxInclusivePricing,
        roundTaxAmount: apiResponse.transactionSettings?.roundTaxAmount ?? DEFAULT_TRANSACTION_SETTINGS.roundTaxAmount,
        roundTotalAmount: apiResponse.transactionSettings?.roundTotalAmount ?? DEFAULT_TRANSACTION_SETTINGS.roundTotalAmount,
        roundToNearest: toNumber(apiResponse.transactionSettings?.roundToNearest, DEFAULT_TRANSACTION_SETTINGS.roundToNearest),
        minimumTransactionAmount: toNumber(apiResponse.transactionSettings?.minimumTransactionAmount, DEFAULT_TRANSACTION_SETTINGS.minimumTransactionAmount),
        maximumTransactionAmount: toNumber(apiResponse.transactionSettings?.maximumTransactionAmount, DEFAULT_TRANSACTION_SETTINGS.maximumTransactionAmount),
        holdTransactionMinutes: toNumber(apiResponse.transactionSettings?.holdTransactionMinutes, DEFAULT_TRANSACTION_SETTINGS.holdTransactionMinutes),
        saveDraftTransactions: apiResponse.transactionSettings?.saveDraftTransactions ?? DEFAULT_TRANSACTION_SETTINGS.saveDraftTransactions,

        // JSON Column - Customer Settings
        requireCustomerDetails: apiResponse.customerSettings?.requireCustomerDetails ?? DEFAULT_CUSTOMER_SETTINGS.requireCustomerDetails,
        defaultCustomerType: apiResponse.customerSettings?.defaultCustomerType ?? DEFAULT_CUSTOMER_SETTINGS.defaultCustomerType,
        collectCustomerEmail: apiResponse.customerSettings?.collectCustomerEmail ?? DEFAULT_CUSTOMER_SETTINGS.collectCustomerEmail,
        collectCustomerPhone: apiResponse.customerSettings?.collectCustomerPhone ?? DEFAULT_CUSTOMER_SETTINGS.collectCustomerPhone,
        collectCustomerAddress: apiResponse.customerSettings?.collectCustomerAddress ?? DEFAULT_CUSTOMER_SETTINGS.collectCustomerAddress,
        customerDisplayMode: apiResponse.customerSettings?.customerDisplayMode ?? DEFAULT_CUSTOMER_SETTINGS.customerDisplayMode,

        // JSON Column - Receipt Settings
        receiptNumberPrefix: decodeHtmlEntities(apiResponse.receiptSettings?.receiptNumberPrefix) || DEFAULT_RECEIPT_SETTINGS.receiptNumberPrefix,
        receiptNumberSuffix: decodeHtmlEntities(apiResponse.receiptSettings?.receiptNumberSuffix) || DEFAULT_RECEIPT_SETTINGS.receiptNumberSuffix,
        receiptStartNumber: toNumber(apiResponse.receiptSettings?.receiptStartNumber, DEFAULT_RECEIPT_SETTINGS.receiptStartNumber),
        receiptResetDaily: apiResponse.receiptSettings?.receiptResetDaily ?? DEFAULT_RECEIPT_SETTINGS.receiptResetDaily,
        printDuplicateReceipt: apiResponse.receiptSettings?.printDuplicateReceipt ?? DEFAULT_RECEIPT_SETTINGS.printDuplicateReceipt,
        receiptCopies: toNumber(apiResponse.receiptSettings?.receiptCopies, DEFAULT_RECEIPT_SETTINGS.receiptCopies),
        printOrderKitchen: apiResponse.receiptSettings?.printOrderKitchen ?? DEFAULT_RECEIPT_SETTINGS.printOrderKitchen,
        printOrderBar: apiResponse.receiptSettings?.printOrderBar ?? DEFAULT_RECEIPT_SETTINGS.printOrderBar,
        kitchenPrinterName: decodeHtmlEntities(apiResponse.receiptSettings?.kitchenPrinterName) || DEFAULT_RECEIPT_SETTINGS.kitchenPrinterName,
        barPrinterName: decodeHtmlEntities(apiResponse.receiptSettings?.barPrinterName) || DEFAULT_RECEIPT_SETTINGS.barPrinterName,
        printItemizedReceipt: apiResponse.receiptSettings?.printItemizedReceipt ?? DEFAULT_RECEIPT_SETTINGS.printItemizedReceipt,
        receiptFooter: decodeHtmlEntities(apiResponse.receiptSettings?.receiptFooter) || DEFAULT_RECEIPT_SETTINGS.receiptFooter,
        receiptHeader: decodeHtmlEntities(apiResponse.receiptSettings?.receiptHeader) || DEFAULT_RECEIPT_SETTINGS.receiptHeader,
        showStoreLogo: apiResponse.receiptSettings?.showStoreLogo ?? DEFAULT_RECEIPT_SETTINGS.showStoreLogo,
        logoUrl: decodeHtmlEntities(apiResponse.receiptSettings?.logoUrl) || DEFAULT_RECEIPT_SETTINGS.logoUrl,
        receiptWidth: toNumber(apiResponse.receiptSettings?.receiptWidth, DEFAULT_RECEIPT_SETTINGS.receiptWidth),
        showTaxBreakdown: apiResponse.receiptSettings?.showTaxBreakdown ?? DEFAULT_RECEIPT_SETTINGS.showTaxBreakdown,
        showItemCodes: apiResponse.receiptSettings?.showItemCodes ?? DEFAULT_RECEIPT_SETTINGS.showItemCodes,
        showCashierName: apiResponse.receiptSettings?.showCashierName ?? DEFAULT_RECEIPT_SETTINGS.showCashierName,
        showTerminalId: apiResponse.receiptSettings?.showTerminalId ?? DEFAULT_RECEIPT_SETTINGS.showTerminalId,
        qrCodeEnabled: apiResponse.receiptSettings?.qrCodeEnabled ?? DEFAULT_RECEIPT_SETTINGS.qrCodeEnabled,
        qrCodeContent: apiResponse.receiptSettings?.qrCodeContent ?? DEFAULT_RECEIPT_SETTINGS.qrCodeContent,

        // JSON Column - Payment Settings
        cashPaymentDefault: apiResponse.paymentSettings?.cashPaymentDefault ?? DEFAULT_PAYMENT_SETTINGS.cashPaymentDefault,
        cardPaymentDefault: apiResponse.paymentSettings?.cardPaymentDefault ?? DEFAULT_PAYMENT_SETTINGS.cardPaymentDefault,
        splitPaymentEnabled: apiResponse.paymentSettings?.splitPaymentEnabled ?? DEFAULT_PAYMENT_SETTINGS.splitPaymentEnabled,
        maxSplitWays: toNumber(apiResponse.paymentSettings?.maxSplitWays, DEFAULT_PAYMENT_SETTINGS.maxSplitWays),
        changeCalculationMode: apiResponse.paymentSettings?.changeCalculationMode ?? DEFAULT_PAYMENT_SETTINGS.changeCalculationMode,
        suggestChangeAmounts: apiResponse.paymentSettings?.suggestChangeAmounts ?? DEFAULT_PAYMENT_SETTINGS.suggestChangeAmounts,
        giftCardEnabled: apiResponse.paymentSettings?.giftCardEnabled ?? DEFAULT_PAYMENT_SETTINGS.giftCardEnabled,
        loyaltyPointsEnabled: apiResponse.paymentSettings?.loyaltyPointsEnabled ?? DEFAULT_PAYMENT_SETTINGS.loyaltyPointsEnabled,
        enableCash: apiResponse.paymentSettings?.enableCash ?? DEFAULT_PAYMENT_SETTINGS.enableCash,
        enableCard: apiResponse.paymentSettings?.enableCard ?? DEFAULT_PAYMENT_SETTINGS.enableCard,
        enableMobileMoney: apiResponse.paymentSettings?.enableMobileMoney ?? DEFAULT_PAYMENT_SETTINGS.enableMobileMoney,
        enableCredit: apiResponse.paymentSettings?.enableCredit ?? DEFAULT_PAYMENT_SETTINGS.enableCredit,
        enableGiftCard: apiResponse.paymentSettings?.enableGiftCard ?? DEFAULT_PAYMENT_SETTINGS.enableGiftCard,
        roundingEnabled: apiResponse.paymentSettings?.roundingEnabled ?? DEFAULT_PAYMENT_SETTINGS.roundingEnabled,
        roundingAmount: toNumber(apiResponse.paymentSettings?.roundingAmount, DEFAULT_PAYMENT_SETTINGS.roundingAmount),

        // JSON Column - MRA Compliance Settings
        mraComplianceMode: apiResponse.mraComplianceSettings?.mraComplianceMode ?? DEFAULT_MRA_COMPLIANCE_SETTINGS.mraComplianceMode,
        requireVatNumber: apiResponse.mraComplianceSettings?.requireVatNumber ?? DEFAULT_MRA_COMPLIANCE_SETTINGS.requireVatNumber,
        vatInclusiveDisplay: apiResponse.mraComplianceSettings?.vatInclusiveDisplay ?? DEFAULT_MRA_COMPLIANCE_SETTINGS.vatInclusiveDisplay,
        zReportAutoGenerate: apiResponse.mraComplianceSettings?.zReportAutoGenerate ?? DEFAULT_MRA_COMPLIANCE_SETTINGS.zReportAutoGenerate,
        zReportTime: decodeHtmlEntities(apiResponse.mraComplianceSettings?.zReportTime) || DEFAULT_MRA_COMPLIANCE_SETTINGS.zReportTime,
        dailySalesReportTime: decodeHtmlEntities(apiResponse.mraComplianceSettings?.dailySalesReportTime) || DEFAULT_MRA_COMPLIANCE_SETTINGS.dailySalesReportTime,

        // JSON Column - Inventory Settings
        showProductImages: apiResponse.inventorySettings?.showProductImages ?? DEFAULT_INVENTORY_SETTINGS.showProductImages,
        productDisplayMode: apiResponse.inventorySettings?.productDisplayMode ?? DEFAULT_INVENTORY_SETTINGS.productDisplayMode,
        productsPerPage: toNumber(apiResponse.inventorySettings?.productsPerPage, DEFAULT_INVENTORY_SETTINGS.productsPerPage),
        quickProductSearch: apiResponse.inventorySettings?.quickProductSearch ?? DEFAULT_INVENTORY_SETTINGS.quickProductSearch,
        barcodeScanMode: apiResponse.inventorySettings?.barcodeScanMode ?? DEFAULT_INVENTORY_SETTINGS.barcodeScanMode,
        scaleIntegrationMode: apiResponse.inventorySettings?.scaleIntegrationMode ?? DEFAULT_INVENTORY_SETTINGS.scaleIntegrationMode,
        allowNegativeStock: apiResponse.inventorySettings?.allowNegativeStock ?? DEFAULT_INVENTORY_SETTINGS.allowNegativeStock,
        lowStockThreshold: toNumber(apiResponse.inventorySettings?.lowStockThreshold, DEFAULT_INVENTORY_SETTINGS.lowStockThreshold),
        showStockLevels: apiResponse.inventorySettings?.showStockLevels ?? DEFAULT_INVENTORY_SETTINGS.showStockLevels,
        enableStockAlerts: apiResponse.inventorySettings?.enableStockAlerts ?? DEFAULT_INVENTORY_SETTINGS.enableStockAlerts,
        autoOrderEnabled: apiResponse.inventorySettings?.autoOrderEnabled ?? DEFAULT_INVENTORY_SETTINGS.autoOrderEnabled,

        // JSON Column - Sync Settings
        enableOfflineMode: apiResponse.syncSettings?.enableOfflineMode ?? DEFAULT_SYNC_SETTINGS.enableOfflineMode,
        offlineDataRetentionDays: toNumber(apiResponse.syncSettings?.offlineDataRetentionDays, DEFAULT_SYNC_SETTINGS.offlineDataRetentionDays),
        syncOnWifiOnly: apiResponse.syncSettings?.syncOnWifiOnly ?? DEFAULT_SYNC_SETTINGS.syncOnWifiOnly,
        autoSyncOnReconnect: apiResponse.syncSettings?.autoSyncOnReconnect ?? DEFAULT_SYNC_SETTINGS.autoSyncOnReconnect,
        syncBatchSize: toNumber(apiResponse.syncSettings?.syncBatchSize, DEFAULT_SYNC_SETTINGS.syncBatchSize),
        syncTimeoutSeconds: toNumber(apiResponse.syncSettings?.syncTimeoutSeconds, DEFAULT_SYNC_SETTINGS.syncTimeoutSeconds),
        enableCloudSync: apiResponse.syncSettings?.enableCloudSync ?? DEFAULT_SYNC_SETTINGS.enableCloudSync,

        // JSON Column - Security Settings (extended)
        maxLoginAttempts: toNumber(apiResponse.securitySettings?.maxLoginAttempts, DEFAULT_SECURITY_SETTINGS.maxLoginAttempts),
        lockoutMinutes: toNumber(apiResponse.securitySettings?.lockoutMinutes, DEFAULT_SECURITY_SETTINGS.lockoutMinutes),
        requirePinForSettings: apiResponse.securitySettings?.requirePinForSettings ?? DEFAULT_SECURITY_SETTINGS.requirePinForSettings,
        requirePinForReports: apiResponse.securitySettings?.requirePinForReports ?? DEFAULT_SECURITY_SETTINGS.requirePinForReports,
        requirePinForVoid: apiResponse.securitySettings?.requirePinForVoid ?? DEFAULT_SECURITY_SETTINGS.requirePinForVoid,
        requirePinForDiscount: apiResponse.securitySettings?.requirePinForDiscount ?? DEFAULT_SECURITY_SETTINGS.requirePinForDiscount,
        requirePinForReturn: apiResponse.securitySettings?.requirePinForReturn ?? DEFAULT_SECURITY_SETTINGS.requirePinForReturn,
        auditLogEnabled: apiResponse.securitySettings?.auditLogEnabled ?? DEFAULT_SECURITY_SETTINGS.auditLogEnabled,

        // JSON Column - Performance Settings
        cacheExpiryHours: toNumber(apiResponse.performanceSettings?.cacheExpiryHours, DEFAULT_PERFORMANCE_SETTINGS.cacheExpiryHours),
        maxCacheSizeMB: toNumber(apiResponse.performanceSettings?.maxCacheSizeMB, DEFAULT_PERFORMANCE_SETTINGS.maxCacheSizeMB),
        transactionHistoryDays: toNumber(apiResponse.performanceSettings?.transactionHistoryDays, DEFAULT_PERFORMANCE_SETTINGS.transactionHistoryDays),
        autoCleanupOldData: apiResponse.performanceSettings?.autoCleanupOldData ?? DEFAULT_PERFORMANCE_SETTINGS.autoCleanupOldData,
        imageCompressionQuality: toNumber(apiResponse.performanceSettings?.imageCompressionQuality, DEFAULT_PERFORMANCE_SETTINGS.imageCompressionQuality),

        // JSON Column - Hardware Settings
        printerConnectionType: apiResponse.hardwareSettings?.printerConnectionType ?? DEFAULT_HARDWARE_SETTINGS.printerConnectionType,
        printerPaperWidth: toNumber(apiResponse.hardwareSettings?.printerPaperWidth, DEFAULT_HARDWARE_SETTINGS.printerPaperWidth),
        cashDrawerOpenCode: decodeHtmlEntities(apiResponse.hardwareSettings?.cashDrawerOpenCode) || DEFAULT_HARDWARE_SETTINGS.cashDrawerOpenCode,
        scannerBeepEnabled: apiResponse.hardwareSettings?.scannerBeepEnabled ?? DEFAULT_HARDWARE_SETTINGS.scannerBeepEnabled,
        scannerVibrationEnabled: apiResponse.hardwareSettings?.scannerVibrationEnabled ?? DEFAULT_HARDWARE_SETTINGS.scannerVibrationEnabled,
        screenBrightness: toNumber(apiResponse.hardwareSettings?.screenBrightness, DEFAULT_HARDWARE_SETTINGS.screenBrightness),
        screenTimeoutSeconds: toNumber(apiResponse.hardwareSettings?.screenTimeoutSeconds, DEFAULT_HARDWARE_SETTINGS.screenTimeoutSeconds),
        printerType: apiResponse.hardwareSettings?.printerType ?? DEFAULT_HARDWARE_SETTINGS.printerType,
        printerName: decodeHtmlEntities(apiResponse.hardwareSettings?.printerName) || DEFAULT_HARDWARE_SETTINGS.printerName,
        autoPrintReceipt: apiResponse.hardwareSettings?.autoPrintReceipt ?? DEFAULT_HARDWARE_SETTINGS.autoPrintReceipt,
        paperSize: apiResponse.hardwareSettings?.paperSize ?? DEFAULT_HARDWARE_SETTINGS.paperSize,
        enableCashDrawer: apiResponse.hardwareSettings?.enableCashDrawer ?? DEFAULT_HARDWARE_SETTINGS.enableCashDrawer,
        cashDrawerOpenOn: apiResponse.hardwareSettings?.cashDrawerOpenOn ?? DEFAULT_HARDWARE_SETTINGS.cashDrawerOpenOn,
        enableBarcodeScanner: apiResponse.hardwareSettings?.enableBarcodeScanner ?? DEFAULT_HARDWARE_SETTINGS.enableBarcodeScanner,
        barcodeScannerPrefix: decodeHtmlEntities(apiResponse.hardwareSettings?.barcodeScannerPrefix) || DEFAULT_HARDWARE_SETTINGS.barcodeScannerPrefix,
        enableCardReader: apiResponse.hardwareSettings?.enableCardReader ?? DEFAULT_HARDWARE_SETTINGS.enableCardReader,
        cardReaderType: apiResponse.hardwareSettings?.cardReaderType ?? DEFAULT_HARDWARE_SETTINGS.cardReaderType,

        // JSON Column - Integration Settings
        apiBaseUrl: decodeHtmlEntities(apiResponse.integrationSettings?.apiBaseUrl) || DEFAULT_INTEGRATION_SETTINGS.apiBaseUrl,
        mraApiTimeoutSeconds: toNumber(apiResponse.integrationSettings?.mraApiTimeoutSeconds, DEFAULT_INTEGRATION_SETTINGS.mraApiTimeoutSeconds),
        mraRetryAttempts: toNumber(apiResponse.integrationSettings?.mraRetryAttempts, DEFAULT_INTEGRATION_SETTINGS.mraRetryAttempts),
        webhookEnabled: apiResponse.integrationSettings?.webhookEnabled ?? DEFAULT_INTEGRATION_SETTINGS.webhookEnabled,
        webhookUrl: decodeHtmlEntities(apiResponse.integrationSettings?.webhookUrl) || DEFAULT_INTEGRATION_SETTINGS.webhookUrl,
        webhookSecret: apiResponse.integrationSettings?.webhookSecret ?? DEFAULT_INTEGRATION_SETTINGS.webhookSecret,
        apiKeyExpiryDays: toNumber(apiResponse.integrationSettings?.apiKeyExpiryDays, DEFAULT_INTEGRATION_SETTINGS.apiKeyExpiryDays),
        enableApiAccess: apiResponse.integrationSettings?.enableApiAccess ?? DEFAULT_INTEGRATION_SETTINGS.enableApiAccess,
        apiRateLimit: toNumber(apiResponse.integrationSettings?.apiRateLimit, DEFAULT_INTEGRATION_SETTINGS.apiRateLimit),

        // JSON Column - Workflow Settings
        allowReturnWithoutReceipt: apiResponse.workflowSettings?.allowReturnWithoutReceipt ?? DEFAULT_WORKFLOW_SETTINGS.allowReturnWithoutReceipt,
        returnPeriodDays: toNumber(apiResponse.workflowSettings?.returnPeriodDays, DEFAULT_WORKFLOW_SETTINGS.returnPeriodDays),
        requireManagerForVoid: apiResponse.workflowSettings?.requireManagerForVoid ?? DEFAULT_WORKFLOW_SETTINGS.requireManagerForVoid,
        managerOverridePin: apiResponse.workflowSettings?.managerOverridePin ?? DEFAULT_WORKFLOW_SETTINGS.managerOverridePin,
        autoCloseShift: apiResponse.workflowSettings?.autoCloseShift ?? DEFAULT_WORKFLOW_SETTINGS.autoCloseShift,
        shiftCloseTime: decodeHtmlEntities(apiResponse.workflowSettings?.shiftCloseTime) || DEFAULT_WORKFLOW_SETTINGS.shiftCloseTime,
        dailyOpeningTime: decodeHtmlEntities(apiResponse.workflowSettings?.dailyOpeningTime) || DEFAULT_WORKFLOW_SETTINGS.dailyOpeningTime,
        enableCashManagement: apiResponse.workflowSettings?.enableCashManagement ?? DEFAULT_WORKFLOW_SETTINGS.enableCashManagement,
        requireOpeningFloat: apiResponse.workflowSettings?.requireOpeningFloat ?? DEFAULT_WORKFLOW_SETTINGS.requireOpeningFloat,
        openingFloatAmount: toNumber(apiResponse.workflowSettings?.openingFloatAmount, DEFAULT_WORKFLOW_SETTINGS.openingFloatAmount),
        enableShiftManagement: apiResponse.workflowSettings?.enableShiftManagement ?? DEFAULT_WORKFLOW_SETTINGS.enableShiftManagement,
        enableMultipleUsers: apiResponse.workflowSettings?.enableMultipleUsers ?? DEFAULT_WORKFLOW_SETTINGS.enableMultipleUsers,
        enableReturns: apiResponse.workflowSettings?.enableReturns ?? DEFAULT_WORKFLOW_SETTINGS.enableReturns,
        enableLayaway: apiResponse.workflowSettings?.enableLayaway ?? DEFAULT_WORKFLOW_SETTINGS.enableLayaway,
        enableDiscounts: apiResponse.workflowSettings?.enableDiscounts ?? DEFAULT_WORKFLOW_SETTINGS.enableDiscounts,
        maxDiscountPercentage: toNumber(apiResponse.workflowSettings?.maxDiscountPercentage, DEFAULT_WORKFLOW_SETTINGS.maxDiscountPercentage),

        // JSON Column - Backup Settings
        backupEnabled: apiResponse.backupSettings?.backupEnabled ?? DEFAULT_BACKUP_SETTINGS.backupEnabled,
        backupFrequency: apiResponse.backupSettings?.backupFrequency ?? DEFAULT_BACKUP_SETTINGS.backupFrequency,
        autoBackupEnabled: apiResponse.backupSettings?.autoBackupEnabled ?? DEFAULT_BACKUP_SETTINGS.autoBackupEnabled,
        backupIntervalHours: toNumber(apiResponse.backupSettings?.backupIntervalHours, DEFAULT_BACKUP_SETTINGS.backupIntervalHours),
        maxBackupFiles: toNumber(apiResponse.backupSettings?.maxBackupFiles, DEFAULT_BACKUP_SETTINGS.maxBackupFiles),
        backupLocation: apiResponse.backupSettings?.backupLocation ?? DEFAULT_BACKUP_SETTINGS.backupLocation,

        // JSON Column - Display Settings
        theme: apiResponse.displaySettings?.theme ?? DEFAULT_DISPLAY_SETTINGS.theme,
        fontSize: apiResponse.displaySettings?.fontSize ?? DEFAULT_DISPLAY_SETTINGS.fontSize,
        navigationMenuType: apiResponse.displaySettings?.navigationMenuType ?? DEFAULT_DISPLAY_SETTINGS.navigationMenuType,
        enableAnimations: apiResponse.displaySettings?.enableAnimations ?? DEFAULT_DISPLAY_SETTINGS.enableAnimations,
        enableNotifications: apiResponse.displaySettings?.enableNotifications ?? DEFAULT_DISPLAY_SETTINGS.enableNotifications,
        enableVirtualKeyboard: apiResponse.displaySettings?.enableVirtualKeyboard ?? DEFAULT_DISPLAY_SETTINGS.enableVirtualKeyboard,
        virtualKeyboardLayout: apiResponse.displaySettings?.virtualKeyboardLayout ?? DEFAULT_DISPLAY_SETTINGS.virtualKeyboardLayout,
        virtualKeyboardTheme: apiResponse.displaySettings?.virtualKeyboardTheme ?? DEFAULT_DISPLAY_SETTINGS.virtualKeyboardTheme,
        virtualKeyboardSound: apiResponse.displaySettings?.virtualKeyboardSound ?? DEFAULT_DISPLAY_SETTINGS.virtualKeyboardSound,
        virtualKeyboardHaptic: apiResponse.displaySettings?.virtualKeyboardHaptic ?? DEFAULT_DISPLAY_SETTINGS.virtualKeyboardHaptic,

        // JSON Column - Tax Fee Settings
        taxInclusive: apiResponse.taxFeeSettings?.taxInclusive ?? DEFAULT_TAX_FEE_SETTINGS.taxInclusive,
        showTaxOnReceipt: apiResponse.taxFeeSettings?.showTaxOnReceipt ?? DEFAULT_TAX_FEE_SETTINGS.showTaxOnReceipt,
        multiTaxEnabled: apiResponse.taxFeeSettings?.multiTaxEnabled ?? DEFAULT_TAX_FEE_SETTINGS.multiTaxEnabled,
        serviceFeeEnabled: apiResponse.taxFeeSettings?.serviceFeeEnabled ?? DEFAULT_TAX_FEE_SETTINGS.serviceFeeEnabled,
        serviceFeePercentage: toNumber(apiResponse.taxFeeSettings?.serviceFeePercentage, DEFAULT_TAX_FEE_SETTINGS.serviceFeePercentage),

        // JSON Column - Customer Management Settings
        enableLoyaltyProgram: apiResponse.customerManagementSettings?.enableLoyaltyProgram ?? DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS.enableLoyaltyProgram,
        loyaltyPointsPerDollar: toNumber(apiResponse.customerManagementSettings?.loyaltyPointsPerDollar, DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS.loyaltyPointsPerDollar),
        enableCustomerAccounts: apiResponse.customerManagementSettings?.enableCustomerAccounts ?? DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS.enableCustomerAccounts,
        enableCustomerCredit: apiResponse.customerManagementSettings?.enableCustomerCredit ?? DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS.enableCustomerCredit,
        maxCustomerCredit: toNumber(apiResponse.customerManagementSettings?.maxCustomerCredit, DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS.maxCustomerCredit),

        // JSON Column - Reporting Settings
        eodReportEnabled: apiResponse.reportingSettings?.eodReportEnabled ?? DEFAULT_REPORTING_SETTINGS.eodReportEnabled,
        eodReportTime: decodeHtmlEntities(apiResponse.reportingSettings?.eodReportTime) || DEFAULT_REPORTING_SETTINGS.eodReportTime,
        emailReports: apiResponse.reportingSettings?.emailReports ?? DEFAULT_REPORTING_SETTINGS.emailReports,
        reportEmail: decodeHtmlEntities(apiResponse.reportingSettings?.reportEmail) || DEFAULT_REPORTING_SETTINGS.reportEmail,

        // Audit & Metadata
        settingsVersion: apiResponse.settingsVersion ?? DEFAULT_AUDIT_METADATA.settingsVersion,
        lastConfiguredBy: apiResponse.lastConfiguredBy ?? DEFAULT_AUDIT_METADATA.lastConfiguredBy,
        configurationDate: apiResponse.configurationDate ?? DEFAULT_AUDIT_METADATA.configurationDate,
    };
};

/**
 * Maps flat AppSettings to API request payload (hierarchical JSON + selective columns)
 */
export const mapSettingsToApiPayload = (settings: AppSettings): Partial<TerminalSettingsApiResponse> => {
    return {
        // Selective Columns - General Information
        storeName: settings.storeName,
        storeAddress: settings.storeAddress,
        storePhone: settings.storePhone,
        storeEmail: settings.storeEmail,
        currency: settings.currency,
        taxRate: settings.taxRate,
        businessLicense: settings.businessLicense,
        businessTaxId: settings.businessTaxId,

        // Selective Columns - Localization
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,

        // Selective Columns - Security
        pinLength: settings.pinLength,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        autoLogoutMinutes: settings.autoLogoutMinutes,
        serverUrl: settings.serverUrl,

        // JSON Column - Localization Settings
        localizationSettings: {
            currencyDecimalPlaces: settings.currencyDecimalPlaces,
            numberSeparator: settings.numberSeparator,
            showCurrencySymbol: settings.showCurrencySymbol,
            currencySymbolPosition: settings.currencySymbolPosition,
        },

        // JSON Column - Transaction Settings
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

        // JSON Column - Customer Settings
        customerSettings: {
            requireCustomerDetails: settings.requireCustomerDetails,
            defaultCustomerType: settings.defaultCustomerType,
            collectCustomerEmail: settings.collectCustomerEmail,
            collectCustomerPhone: settings.collectCustomerPhone,
            collectCustomerAddress: settings.collectCustomerAddress,
            customerDisplayMode: settings.customerDisplayMode,
        },

        // JSON Column - Receipt Settings
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

        // JSON Column - Payment Settings
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

        // JSON Column - MRA Compliance Settings
        mraComplianceSettings: {
            mraComplianceMode: settings.mraComplianceMode,
            requireVatNumber: settings.requireVatNumber,
            vatInclusiveDisplay: settings.vatInclusiveDisplay,
            zReportAutoGenerate: settings.zReportAutoGenerate,
            zReportTime: settings.zReportTime,
            dailySalesReportTime: settings.dailySalesReportTime,
        },

        // JSON Column - Inventory Settings
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

        // JSON Column - Sync Settings
        syncSettings: {
            enableOfflineMode: settings.enableOfflineMode,
            offlineDataRetentionDays: settings.offlineDataRetentionDays,
            syncOnWifiOnly: settings.syncOnWifiOnly,
            autoSyncOnReconnect: settings.autoSyncOnReconnect,
            syncBatchSize: settings.syncBatchSize,
            syncTimeoutSeconds: settings.syncTimeoutSeconds,
            enableCloudSync: settings.enableCloudSync,
        },

        // JSON Column - Security Settings
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

        // JSON Column - Performance Settings
        performanceSettings: {
            cacheExpiryHours: settings.cacheExpiryHours,
            maxCacheSizeMB: settings.maxCacheSizeMB,
            transactionHistoryDays: settings.transactionHistoryDays,
            autoCleanupOldData: settings.autoCleanupOldData,
            imageCompressionQuality: settings.imageCompressionQuality,
        },

        // JSON Column - Hardware Settings
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

        // JSON Column - Integration Settings
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

        // JSON Column - Workflow Settings
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

        // JSON Column - Backup Settings
        backupSettings: {
            backupEnabled: settings.backupEnabled,
            backupFrequency: settings.backupFrequency,
            autoBackupEnabled: settings.autoBackupEnabled,
            backupIntervalHours: settings.backupIntervalHours,
            maxBackupFiles: settings.maxBackupFiles,
            backupLocation: settings.backupLocation,
        },

        // JSON Column - Display Settings
        displaySettings: {
            theme: settings.theme,
            fontSize: settings.fontSize,
            navigationMenuType: settings.navigationMenuType,
            showProductImages: settings.showProductImages,
            enableAnimations: settings.enableAnimations,
            enableNotifications: settings.enableNotifications,
            enableVirtualKeyboard: settings.enableVirtualKeyboard,
            virtualKeyboardLayout: settings.virtualKeyboardLayout,
            virtualKeyboardTheme: settings.virtualKeyboardTheme,
            virtualKeyboardSound: settings.virtualKeyboardSound,
            virtualKeyboardHaptic: settings.virtualKeyboardHaptic,
        },

        // JSON Column - Tax Fee Settings
        taxFeeSettings: {
            taxInclusive: settings.taxInclusive,
            showTaxOnReceipt: settings.showTaxOnReceipt,
            multiTaxEnabled: settings.multiTaxEnabled,
            serviceFeeEnabled: settings.serviceFeeEnabled,
            serviceFeePercentage: settings.serviceFeePercentage,
        },

        // JSON Column - Customer Management Settings
        customerManagementSettings: {
            enableLoyaltyProgram: settings.enableLoyaltyProgram,
            loyaltyPointsPerDollar: settings.loyaltyPointsPerDollar,
            enableCustomerAccounts: settings.enableCustomerAccounts,
            enableCustomerCredit: settings.enableCustomerCredit,
            maxCustomerCredit: settings.maxCustomerCredit,
        },

        // JSON Column - Reporting Settings
        reportingSettings: {
            eodReportEnabled: settings.eodReportEnabled,
            eodReportTime: settings.eodReportTime,
            emailReports: settings.emailReports,
            reportEmail: settings.reportEmail,
        },
    };
};

/**
 * Get complete default settings
 */
export const getDefaultSettings = (overrides?: Partial<AppSettings>): AppSettings => ({
    // Selective Columns
    ...DEFAULT_GENERAL_SETTINGS,
    ...DEFAULT_SELECTIVE_LOCALIZATION,
    ...DEFAULT_SELECTIVE_SECURITY,

    // JSON Settings (flattened)
    ...DEFAULT_LOCALIZATION_SETTINGS,
    ...DEFAULT_TRANSACTION_SETTINGS,
    ...DEFAULT_CUSTOMER_SETTINGS,
    ...DEFAULT_RECEIPT_SETTINGS,
    ...DEFAULT_PAYMENT_SETTINGS,
    ...DEFAULT_MRA_COMPLIANCE_SETTINGS,
    ...DEFAULT_INVENTORY_SETTINGS,
    ...DEFAULT_SYNC_SETTINGS,
    ...DEFAULT_SECURITY_SETTINGS,
    ...DEFAULT_PERFORMANCE_SETTINGS,
    ...DEFAULT_HARDWARE_SETTINGS,
    ...DEFAULT_INTEGRATION_SETTINGS,
    ...DEFAULT_WORKFLOW_SETTINGS,
    ...DEFAULT_BACKUP_SETTINGS,
    ...DEFAULT_DISPLAY_SETTINGS,
    ...DEFAULT_TAX_FEE_SETTINGS,
    ...DEFAULT_CUSTOMER_MANAGEMENT_SETTINGS,
    ...DEFAULT_REPORTING_SETTINGS,
    ...DEFAULT_AUDIT_METADATA,

    // Apply overrides
    ...overrides,
});
