/**
 * General Settings - Display and UI preferences
 */
interface GeneralSettings {
    dateFormat: string;
    showProductImages: boolean;
    productDisplayMode: 'GRID' | 'LIST' | 'COMPACT';
    barcodeScanMode: 'AUTO' | 'MANUAL' | 'BOTH';
    enableStockAlerts: boolean;
    enableVirtualKeyboard: boolean;
    virtualKeyboardLayout: 'qwerty' | 'numeric' | 'alphanumeric';
    virtualKeyboardTheme: 'default' | 'dark' | 'light';
    virtualKeyboardSound: boolean;
    virtualKeyboardHaptic: boolean;
}

/**
 * Receipt Settings - Store info and receipt display options
 */
interface ReceiptDisplaySettings {
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
    orderItemsBy: 'orderAdded' | 'name' | 'category';
    messageTemplate: string;
    whatsappShareApp: 'whatsapp' | 'whatsappBusiness';
}

/**
 * Business Settings - Transaction and business rules
 */
interface BusinessSettings {
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
}

/**
 * Security Settings - Authentication and sync settings
 */
interface SecurityDisplaySettings {
    autoSyncOnReconnect: boolean;
    requirePinForVoid: boolean;
    requirePinForReturn: boolean;
    enableNotifications: boolean;
    apiBaseUrl: string;
}

/**
 * Combined Terminal Display Settings - API request/response format
 */
interface TerminalDisplaySettings {
    general: GeneralSettings;
    receipt: ReceiptDisplaySettings;
    business: BusinessSettings;
    security: SecurityDisplaySettings;
}

interface TerminalSettings {
    id: string;
    terminalId: string;
    generalSettings: GeneralSettings | null;
    receiptSettings: ReceiptDisplaySettings | null;
    businessSettings: BusinessSettings | null;
    securitySettings: SecurityDisplaySettings | null;
    settingsVersion: string;
    isActive: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

interface CreateTerminalSettingsRequest {
    terminalId: string;
    general?: Partial<GeneralSettings>;
    receipt?: Partial<ReceiptDisplaySettings>;
    business?: Partial<BusinessSettings>;
    security?: Partial<SecurityDisplaySettings>;
}

interface UpdateTerminalSettingsRequest {
    general?: Partial<GeneralSettings>;
    receipt?: Partial<ReceiptDisplaySettings>;
    business?: Partial<BusinessSettings>;
    security?: Partial<SecurityDisplaySettings>;
}

interface InitializationState {
    isAccountVerified: boolean;
    isLoading: boolean;
    error: string | null;
    retryCount: number;
}

interface InitializationResult {
    success: boolean;
    verified?: boolean;
    error?: string;
}

type SettingsGroupName = 'general' | 'receipt' | 'business' | 'security';
