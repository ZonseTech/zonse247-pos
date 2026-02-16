import * as Yup from 'yup';

export const settingsValidationSchema = Yup.object().shape({
    terminalId: Yup.string(),
    dateFormat: Yup.string(),
    showProductImages: Yup.boolean(),
    productDisplayMode: Yup.string().oneOf(['GRID', 'LIST', 'COMPACT']),
    barcodeScanMode: Yup.string().oneOf(['AUTO', 'MANUAL', 'CAMERA']),
    enableStockAlerts: Yup.boolean(),
    enableVirtualKeyboard: Yup.boolean(),
    virtualKeyboardLayout: Yup.string().oneOf(['qwerty', 'numeric', 'alphanumeric']),
    virtualKeyboardTheme: Yup.string().oneOf(['default', 'dark', 'light']),
    virtualKeyboardSound: Yup.boolean(),
    virtualKeyboardHaptic: Yup.boolean(),
    storeName: Yup.string()
        .required('Store name is required')
        .min(2, 'Store name must be at least 2 characters'),
    storePhone: Yup.string()
        .matches(/^[0-9\-\+\(\)\s]*$/, 'Phone number is invalid'),
    storeAddress: Yup.string(),
    storeWebsite: Yup.string()
        .url('Website URL must be valid')
        .nullable(),
    taxTitle: Yup.string(),
    businessTaxId: Yup.string(),
    logoUrl: Yup.string()
        .url('Logo URL must be valid')
        .nullable(),
    receiptHeader: Yup.string(),
    showPhoneOnReceipt: Yup.boolean(),
    showAddressOnReceipt: Yup.boolean(),
    showTaxOnReceipt: Yup.boolean(),
    showWebsiteOnReceipt: Yup.boolean(),
    showStoreLogo: Yup.boolean(),
    showListPrice: Yup.boolean(),
    showRateInReceipt: Yup.boolean(),
    showTotalMoneySaved: Yup.boolean(),
    showCashierName: Yup.boolean(),
    showCustomerPhone: Yup.boolean(),
    showCustomerAddress: Yup.boolean(),
    thankYouNote: Yup.string()
        .max(200, 'Thank you note cannot exceed 200 characters'),
    useAppLanguage: Yup.boolean(),
    showTotalItemCount: Yup.boolean(),
    showChangeReturn: Yup.boolean(),
    showPaymentDetails: Yup.boolean(),
    showPoweredBy: Yup.boolean(),
    orderItemsBy: Yup.string().oneOf(['name', 'orderAdded']),
    messageTemplate: Yup.string(),
    whatsappShareApp: Yup.string().oneOf(['whatsapp', 'whatsappBusiness']),
    receiptNumberPrefix: Yup.string()
        .max(10, 'Receipt prefix cannot exceed 10 characters'),
    autoApplyTax: Yup.boolean(),
    taxInclusivePricing: Yup.boolean(),
    taxRate: Yup.number()
        .min(0, 'Tax rate cannot be negative')
        .max(100, 'Tax rate cannot exceed 100%'),
    enableDiscounts: Yup.boolean(),
    requirePinForDiscount: Yup.boolean(),
    maxDiscountPercentage: Yup.number()
        .min(0, 'Max discount cannot be negative')
        .max(100, 'Max discount cannot exceed 100%'),
    roundingEnabled: Yup.boolean(),
    tableManagementEnabled: Yup.boolean(),
    inventoryHealthScoreEnabled: Yup.boolean(),
    autoSyncOnReconnect: Yup.boolean(),
    requirePinForVoid: Yup.boolean(),
    requirePinForReturn: Yup.boolean(),
    enableNotifications: Yup.boolean(),
    apiBaseUrl: Yup.string()
        .url('API Base URL must be valid')
        .nullable(),
});
