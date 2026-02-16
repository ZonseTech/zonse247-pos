import { decodeHtmlEntities, toNumber } from '../../../utils';

// Re-export helpers for convenience
export { decodeHtmlEntities, toNumber };

// ==========================================
// SETTINGS TYPES (Specific to Settings UI)
// ==========================================

export type GeneralSettings = {
    dateFormat: string;
    showProductImages: boolean;
    productDisplayMode: 'GRID' | 'LIST' | 'COMPACT';
    barcodeScanMode: 'AUTO' | 'MANUAL' | 'CAMERA';
    enableStockAlerts: boolean;
    enableVirtualKeyboard: boolean;
    virtualKeyboardLayout: 'qwerty' | 'numeric' | 'alphanumeric';
    virtualKeyboardTheme: 'default' | 'dark' | 'light';
    virtualKeyboardSound: boolean;
    virtualKeyboardHaptic: boolean;
};

export type ReceiptSettingsType = {
    storeName: string;
    storePhone: string;
    storeAddress: string;
    storeWebsite: string;
    taxTitle: string;
    businessTaxId: string;
    logoUrl: string;
    receiptHeader: string;
    showPhoneOnReceipt: boolean;
    showAddressOnReceipt: boolean;
    showTaxOnReceipt: boolean;
    showWebsiteOnReceipt: boolean;
    showStoreLogo: boolean;
    showListPrice: boolean;
    showRateInReceipt: boolean;
    showTotalMoneySaved: boolean;
    showCashierName: boolean;
    showCustomerPhone: boolean;
    showCustomerAddress: boolean;
    thankYouNote: string;
    useAppLanguage: boolean;
    showTotalItemCount: boolean;
    showChangeReturn: boolean;
    showPaymentDetails: boolean;
    showPoweredBy: boolean;
    orderItemsBy: 'name' | 'orderAdded';
    messageTemplate: string;
    whatsappShareApp: 'whatsapp' | 'whatsappBusiness';
};

export type BusinessSettings = {
    receiptNumberPrefix: string;
    autoApplyTax: boolean;
    taxInclusivePricing: boolean;
    taxRate: number;
    enableDiscounts: boolean;
    requirePinForDiscount: boolean;
    maxDiscountPercentage: number;
    roundingEnabled: boolean;
    tableManagementEnabled: boolean;
    inventoryHealthScoreEnabled: boolean;
};

export type SecuritySettingsType = {
    autoSyncOnReconnect: boolean;
    requirePinForVoid: boolean;
    requirePinForReturn: boolean;
    enableNotifications: boolean;
    apiBaseUrl: string;
};

export type SettingsAppSettings = GeneralSettings & ReceiptSettingsType & BusinessSettings & SecuritySettingsType;

export type SettingsApiResponse = {
    id?: string;
    terminalId?: string;
    dateFormat?: string;
    showProductImages?: boolean;
    productDisplayMode?: 'GRID' | 'LIST' | 'COMPACT';
    barcodeScanMode?: 'AUTO' | 'MANUAL' | 'CAMERA';
    enableStockAlerts?: boolean;
    enableVirtualKeyboard?: boolean;
    virtualKeyboardLayout?: 'qwerty' | 'numeric' | 'alphanumeric';
    virtualKeyboardTheme?: 'default' | 'dark' | 'light';
    virtualKeyboardSound?: boolean;
    virtualKeyboardHaptic?: boolean;
    storeName?: string | null;
    storePhone?: string | null;
    storeAddress?: string | null;
    storeWebsite?: string | null;
    taxTitle?: string | null;
    businessTaxId?: string | null;
    logoUrl?: string | null;
    receiptHeader?: string | null;
    showPhoneOnReceipt?: boolean;
    showAddressOnReceipt?: boolean;
    showTaxOnReceipt?: boolean;
    showWebsiteOnReceipt?: boolean;
    showStoreLogo?: boolean;
    showListPrice?: boolean;
    showRateInReceipt?: boolean;
    showTotalMoneySaved?: boolean;
    showCashierName?: boolean;
    showCustomerPhone?: boolean;
    showCustomerAddress?: boolean;
    thankYouNote?: string | null;
    useAppLanguage?: boolean;
    showTotalItemCount?: boolean;
    showChangeReturn?: boolean;
    showPaymentDetails?: boolean;
    showPoweredBy?: boolean;
    orderItemsBy?: 'name' | 'orderAdded';
    messageTemplate?: string | null;
    whatsappShareApp?: 'whatsapp' | 'whatsappBusiness';
    receiptNumberPrefix?: string | null;
    autoApplyTax?: boolean;
    taxInclusivePricing?: boolean;
    taxRate?: number | string;
    enableDiscounts?: boolean;
    requirePinForDiscount?: boolean;
    maxDiscountPercentage?: number | string;
    roundingEnabled?: boolean;
    tableManagementEnabled?: boolean;
    inventoryHealthScoreEnabled?: boolean;
    autoSyncOnReconnect?: boolean;
    requirePinForVoid?: boolean;
    requirePinForReturn?: boolean;
    enableNotifications?: boolean;
    apiBaseUrl?: string | null;
};

// Backward compatibility aliases
export type AppSettings = SettingsAppSettings;
export type TerminalSettingsApiResponse = SettingsApiResponse;

// ==========================================
// DEFAULT VALUES
// ==========================================

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
    dateFormat: 'DD/MM/YYYY',
    showProductImages: true,
    productDisplayMode: 'GRID',
    barcodeScanMode: 'AUTO',
    enableStockAlerts: true,
    enableVirtualKeyboard: true,
    virtualKeyboardLayout: 'qwerty',
    virtualKeyboardTheme: 'default',
    virtualKeyboardSound: false,
    virtualKeyboardHaptic: false,
};

export const DEFAULT_RECEIPT_SETTINGS: ReceiptSettingsType = {
    storeName: 'My Store',
    storePhone: '',
    storeAddress: '',
    storeWebsite: '',
    taxTitle: 'VAT',
    businessTaxId: '',
    logoUrl: '',
    receiptHeader: '',
    showPhoneOnReceipt: true,
    showAddressOnReceipt: true,
    showTaxOnReceipt: true,
    showWebsiteOnReceipt: false,
    showStoreLogo: false,
    showListPrice: true,
    showRateInReceipt: true,
    showTotalMoneySaved: false,
    showCashierName: true,
    showCustomerPhone: false,
    showCustomerAddress: false,
    thankYouNote: 'Thank you for your purchase!',
    useAppLanguage: true,
    showTotalItemCount: true,
    showChangeReturn: true,
    showPaymentDetails: true,
    showPoweredBy: true,
    orderItemsBy: 'orderAdded',
    messageTemplate: 'Total Bill Amount is #total',
    whatsappShareApp: 'whatsapp',
};

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
    receiptNumberPrefix: 'RCP',
    autoApplyTax: true,
    taxInclusivePricing: false,
    taxRate: 16.5,
    enableDiscounts: true,
    requirePinForDiscount: true,
    maxDiscountPercentage: 20,
    roundingEnabled: true,
    tableManagementEnabled: false,
    inventoryHealthScoreEnabled: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySettingsType = {
    autoSyncOnReconnect: true,
    requirePinForVoid: true,
    requirePinForReturn: true,
    enableNotifications: true,
    apiBaseUrl: typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
        ? import.meta.env.VITE_API_URL
        : 'https://api.example.com',
};

// ==========================================
// MAPPING FUNCTIONS
// ==========================================

/**
 * Maps API response to flat SettingsAppSettings
 */
export const mapApiResponseToSettings = (apiResponse: SettingsApiResponse | null): SettingsAppSettings => {
    if (!apiResponse) return getDefaultSettings();

    return {
        dateFormat: decodeHtmlEntities(apiResponse.dateFormat) || DEFAULT_GENERAL_SETTINGS.dateFormat,
        showProductImages: apiResponse.showProductImages ?? DEFAULT_GENERAL_SETTINGS.showProductImages,
        productDisplayMode: apiResponse.productDisplayMode ?? DEFAULT_GENERAL_SETTINGS.productDisplayMode,
        barcodeScanMode: apiResponse.barcodeScanMode ?? DEFAULT_GENERAL_SETTINGS.barcodeScanMode,
        enableStockAlerts: apiResponse.enableStockAlerts ?? DEFAULT_GENERAL_SETTINGS.enableStockAlerts,
        enableVirtualKeyboard: apiResponse.enableVirtualKeyboard ?? DEFAULT_GENERAL_SETTINGS.enableVirtualKeyboard,
        virtualKeyboardLayout: apiResponse.virtualKeyboardLayout ?? DEFAULT_GENERAL_SETTINGS.virtualKeyboardLayout,
        virtualKeyboardTheme: apiResponse.virtualKeyboardTheme ?? DEFAULT_GENERAL_SETTINGS.virtualKeyboardTheme,
        virtualKeyboardSound: apiResponse.virtualKeyboardSound ?? DEFAULT_GENERAL_SETTINGS.virtualKeyboardSound,
        virtualKeyboardHaptic: apiResponse.virtualKeyboardHaptic ?? DEFAULT_GENERAL_SETTINGS.virtualKeyboardHaptic,
        storeName: decodeHtmlEntities(apiResponse.storeName) || DEFAULT_RECEIPT_SETTINGS.storeName,
        storePhone: decodeHtmlEntities(apiResponse.storePhone) || DEFAULT_RECEIPT_SETTINGS.storePhone,
        storeAddress: decodeHtmlEntities(apiResponse.storeAddress) || DEFAULT_RECEIPT_SETTINGS.storeAddress,
        storeWebsite: decodeHtmlEntities(apiResponse.storeWebsite) || DEFAULT_RECEIPT_SETTINGS.storeWebsite,
        taxTitle: decodeHtmlEntities(apiResponse.taxTitle) || DEFAULT_RECEIPT_SETTINGS.taxTitle,
        businessTaxId: decodeHtmlEntities(apiResponse.businessTaxId) || DEFAULT_RECEIPT_SETTINGS.businessTaxId,
        logoUrl: decodeHtmlEntities(apiResponse.logoUrl) || DEFAULT_RECEIPT_SETTINGS.logoUrl,
        receiptHeader: decodeHtmlEntities(apiResponse.receiptHeader) || DEFAULT_RECEIPT_SETTINGS.receiptHeader,
        showPhoneOnReceipt: apiResponse.showPhoneOnReceipt ?? DEFAULT_RECEIPT_SETTINGS.showPhoneOnReceipt,
        showAddressOnReceipt: apiResponse.showAddressOnReceipt ?? DEFAULT_RECEIPT_SETTINGS.showAddressOnReceipt,
        showTaxOnReceipt: apiResponse.showTaxOnReceipt ?? DEFAULT_RECEIPT_SETTINGS.showTaxOnReceipt,
        showWebsiteOnReceipt: apiResponse.showWebsiteOnReceipt ?? DEFAULT_RECEIPT_SETTINGS.showWebsiteOnReceipt,
        showStoreLogo: apiResponse.showStoreLogo ?? DEFAULT_RECEIPT_SETTINGS.showStoreLogo,
        showListPrice: apiResponse.showListPrice ?? DEFAULT_RECEIPT_SETTINGS.showListPrice,
        showRateInReceipt: apiResponse.showRateInReceipt ?? DEFAULT_RECEIPT_SETTINGS.showRateInReceipt,
        showTotalMoneySaved: apiResponse.showTotalMoneySaved ?? DEFAULT_RECEIPT_SETTINGS.showTotalMoneySaved,
        showCashierName: apiResponse.showCashierName ?? DEFAULT_RECEIPT_SETTINGS.showCashierName,
        showCustomerPhone: apiResponse.showCustomerPhone ?? DEFAULT_RECEIPT_SETTINGS.showCustomerPhone,
        showCustomerAddress: apiResponse.showCustomerAddress ?? DEFAULT_RECEIPT_SETTINGS.showCustomerAddress,
        thankYouNote: decodeHtmlEntities(apiResponse.thankYouNote) || DEFAULT_RECEIPT_SETTINGS.thankYouNote,
        useAppLanguage: apiResponse.useAppLanguage ?? DEFAULT_RECEIPT_SETTINGS.useAppLanguage,
        showTotalItemCount: apiResponse.showTotalItemCount ?? DEFAULT_RECEIPT_SETTINGS.showTotalItemCount,
        showChangeReturn: apiResponse.showChangeReturn ?? DEFAULT_RECEIPT_SETTINGS.showChangeReturn,
        showPaymentDetails: apiResponse.showPaymentDetails ?? DEFAULT_RECEIPT_SETTINGS.showPaymentDetails,
        showPoweredBy: apiResponse.showPoweredBy ?? DEFAULT_RECEIPT_SETTINGS.showPoweredBy,
        orderItemsBy: apiResponse.orderItemsBy ?? DEFAULT_RECEIPT_SETTINGS.orderItemsBy,
        messageTemplate: decodeHtmlEntities(apiResponse.messageTemplate) || DEFAULT_RECEIPT_SETTINGS.messageTemplate,
        whatsappShareApp: apiResponse.whatsappShareApp ?? DEFAULT_RECEIPT_SETTINGS.whatsappShareApp,
        receiptNumberPrefix: decodeHtmlEntities(apiResponse.receiptNumberPrefix) || DEFAULT_BUSINESS_SETTINGS.receiptNumberPrefix,
        autoApplyTax: apiResponse.autoApplyTax ?? DEFAULT_BUSINESS_SETTINGS.autoApplyTax,
        taxInclusivePricing: apiResponse.taxInclusivePricing ?? DEFAULT_BUSINESS_SETTINGS.taxInclusivePricing,
        taxRate: toNumber(apiResponse.taxRate, DEFAULT_BUSINESS_SETTINGS.taxRate),
        enableDiscounts: apiResponse.enableDiscounts ?? DEFAULT_BUSINESS_SETTINGS.enableDiscounts,
        requirePinForDiscount: apiResponse.requirePinForDiscount ?? DEFAULT_BUSINESS_SETTINGS.requirePinForDiscount,
        maxDiscountPercentage: toNumber(apiResponse.maxDiscountPercentage, DEFAULT_BUSINESS_SETTINGS.maxDiscountPercentage),
        roundingEnabled: apiResponse.roundingEnabled ?? DEFAULT_BUSINESS_SETTINGS.roundingEnabled,
        tableManagementEnabled: apiResponse.tableManagementEnabled ?? DEFAULT_BUSINESS_SETTINGS.tableManagementEnabled,
        inventoryHealthScoreEnabled: apiResponse.inventoryHealthScoreEnabled ?? DEFAULT_BUSINESS_SETTINGS.inventoryHealthScoreEnabled,
        autoSyncOnReconnect: apiResponse.autoSyncOnReconnect ?? DEFAULT_SECURITY_SETTINGS.autoSyncOnReconnect,
        requirePinForVoid: apiResponse.requirePinForVoid ?? DEFAULT_SECURITY_SETTINGS.requirePinForVoid,
        requirePinForReturn: apiResponse.requirePinForReturn ?? DEFAULT_SECURITY_SETTINGS.requirePinForReturn,
        enableNotifications: apiResponse.enableNotifications ?? DEFAULT_SECURITY_SETTINGS.enableNotifications,
        apiBaseUrl: decodeHtmlEntities(apiResponse.apiBaseUrl) || DEFAULT_SECURITY_SETTINGS.apiBaseUrl,
    };
};

/**
 * Maps flat SettingsAppSettings to API request payload
 */
export const mapSettingsToApiPayload = (settings: SettingsAppSettings): SettingsApiResponse => {
    return {
        dateFormat: settings.dateFormat,
        showProductImages: settings.showProductImages,
        productDisplayMode: settings.productDisplayMode,
        barcodeScanMode: settings.barcodeScanMode,
        enableStockAlerts: settings.enableStockAlerts,
        enableVirtualKeyboard: settings.enableVirtualKeyboard,
        virtualKeyboardLayout: settings.virtualKeyboardLayout,
        virtualKeyboardTheme: settings.virtualKeyboardTheme,
        virtualKeyboardSound: settings.virtualKeyboardSound,
        virtualKeyboardHaptic: settings.virtualKeyboardHaptic,
        storeName: settings.storeName,
        storePhone: settings.storePhone,
        storeAddress: settings.storeAddress,
        storeWebsite: settings.storeWebsite,
        taxTitle: settings.taxTitle,
        businessTaxId: settings.businessTaxId,
        logoUrl: settings.logoUrl,
        receiptHeader: settings.receiptHeader,
        showPhoneOnReceipt: settings.showPhoneOnReceipt,
        showAddressOnReceipt: settings.showAddressOnReceipt,
        showTaxOnReceipt: settings.showTaxOnReceipt,
        showWebsiteOnReceipt: settings.showWebsiteOnReceipt,
        showStoreLogo: settings.showStoreLogo,
        showListPrice: settings.showListPrice,
        showRateInReceipt: settings.showRateInReceipt,
        showTotalMoneySaved: settings.showTotalMoneySaved,
        showCashierName: settings.showCashierName,
        showCustomerPhone: settings.showCustomerPhone,
        showCustomerAddress: settings.showCustomerAddress,
        thankYouNote: settings.thankYouNote,
        useAppLanguage: settings.useAppLanguage,
        showTotalItemCount: settings.showTotalItemCount,
        showChangeReturn: settings.showChangeReturn,
        showPaymentDetails: settings.showPaymentDetails,
        showPoweredBy: settings.showPoweredBy,
        orderItemsBy: settings.orderItemsBy,
        messageTemplate: settings.messageTemplate,
        whatsappShareApp: settings.whatsappShareApp,
        receiptNumberPrefix: settings.receiptNumberPrefix,
        autoApplyTax: settings.autoApplyTax,
        taxInclusivePricing: settings.taxInclusivePricing,
        taxRate: settings.taxRate,
        enableDiscounts: settings.enableDiscounts,
        requirePinForDiscount: settings.requirePinForDiscount,
        maxDiscountPercentage: settings.maxDiscountPercentage,
        roundingEnabled: settings.roundingEnabled,
        tableManagementEnabled: settings.tableManagementEnabled,
        inventoryHealthScoreEnabled: settings.inventoryHealthScoreEnabled,
        autoSyncOnReconnect: settings.autoSyncOnReconnect,
        requirePinForVoid: settings.requirePinForVoid,
        requirePinForReturn: settings.requirePinForReturn,
        enableNotifications: settings.enableNotifications,
        apiBaseUrl: settings.apiBaseUrl,
    };
};

/**
 * Get complete default settings
 */
export const getDefaultSettings = (overrides?: Partial<SettingsAppSettings>): SettingsAppSettings => ({
    ...DEFAULT_GENERAL_SETTINGS,
    ...DEFAULT_RECEIPT_SETTINGS,
    ...DEFAULT_BUSINESS_SETTINGS,
    ...DEFAULT_SECURITY_SETTINGS,
    ...overrides,
});
