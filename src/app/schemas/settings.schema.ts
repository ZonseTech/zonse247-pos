import * as Yup from 'yup';

export const settingsValidationSchema = Yup.object().shape({
    // Receipt Settings - Store Info
    storeName: Yup.string()
        .required('Business name is required')
        .min(2, 'Business name must be at least 2 characters'),
    storePhone: Yup.string()
        .matches(/^[0-9\-\+\(\)\s]*$/, 'Phone number is invalid'),
    storeAddress: Yup.string(),
    storeEmail: Yup.string()
        .email('Email must be valid'),
    storeWebsite: Yup.string()
        .url('Website URL must be valid'),
    showPhoneOnReceipt: Yup.boolean(),
    showAddressOnReceipt: Yup.boolean(),
    showTaxOnReceipt: Yup.boolean(),
    showWebsiteOnReceipt: Yup.boolean(),
    showStoreLogo: Yup.boolean(),

    // Receipt Settings - Tax
    taxTitle: Yup.string(),
    businessTaxId: Yup.string(),

    // Receipt Settings - Receipt Options
    receiptHeader: Yup.string(),
    receiptFooter: Yup.string()
        .max(200, 'Receipt footer cannot exceed 200 characters'),
    logoUrl: Yup.string()
        .url('Logo URL must be valid'),
    showCashierName: Yup.boolean(),

    // General Settings
    currency: Yup.string()
        .required('Currency is required'),
    taxRate: Yup.number()
        .required('Tax rate is required')
        .min(0, 'Tax rate cannot be negative')
        .max(100, 'Tax rate cannot exceed 100%'),
    autoLogoutMinutes: Yup.number()
        .required('Auto logout time is required')
        .min(5, 'Auto logout must be at least 5 minutes')
        .max(120, 'Auto logout cannot exceed 120 minutes'),
    enableReceiptPrinting: Yup.boolean(),
    enableNotifications: Yup.boolean(),
    enableDiscounts: Yup.boolean(),
    maxDiscountPercentage: Yup.number()
        .min(0, 'Max discount cannot be negative')
        .max(100, 'Max discount cannot exceed 100%'),
    businessLicense: Yup.string(),
    serverUrl: Yup.string()
        .url('Server URL must be valid'),
    backupEnabled: Yup.boolean(),
    backupFrequency: Yup.string()
        .oneOf(['daily', 'weekly', 'monthly']),
});
