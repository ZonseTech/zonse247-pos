import * as Yup from 'yup';

export const settingsValidationSchema = Yup.object().shape({
    storeName: Yup.string()
        .required('Store name is required')
        .min(2, 'Store name must be at least 2 characters'),
    storeAddress: Yup.string()
        .required('Store address is required'),
    storePhone: Yup.string()
        .required('Store phone is required')
        .matches(/^[0-9\-\+\(\)\s]*$/, 'Phone number is invalid'),
    storeEmail: Yup.string()
        .required('Store email is required')
        .email('Store email must be valid'),
    currency: Yup.string()
        .required('Currency is required'),
    taxRate: Yup.number()
        .required('Tax rate is required')
        .min(0, 'Tax rate cannot be negative')
        .max(100, 'Tax rate cannot exceed 100%'),
    receiptFooter: Yup.string()
        .max(200, 'Receipt footer cannot exceed 200 characters'),
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
    businessTaxId: Yup.string(),
    serverUrl: Yup.string()
        .url('Server URL must be valid'),
    backupEnabled: Yup.boolean(),
    backupFrequency: Yup.string()
        .oneOf(['daily', 'weekly', 'monthly']),
});
