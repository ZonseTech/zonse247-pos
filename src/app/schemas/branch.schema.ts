import * as Yup from 'yup';

export const getBranchValidationSchema = (canSelectTenant: boolean, isEditMode: boolean) => Yup.object().shape({
    tenantId: canSelectTenant ? Yup.string()
        .required('Tenant is required') : Yup.string(),
    branchName: Yup.string()
        .required('Business name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(255, 'Name is too long'),
    subscriptionPlanId: !isEditMode ? Yup.string()
        .required('Subscription plan is required') : Yup.string(),
    districtId: Yup.string()
        .required('District is required'),
    location: Yup.string()
        .max(255, 'Location is too long'),
    businessType: Yup.string()
        .required('Business type is required'),
    currencyCode: Yup.string()
        .required('Currency is required'),
    phoneNumber: Yup.string()
        .required('Phone number is required')
        .matches(/^[\+]?[0-9\s\-\(\)]*$/, 'Invalid phone number format')
        .max(20, 'Phone number is too long'),
    email: Yup.string()
        .email('Invalid email format')
        .max(255, 'Email is too long'),
});
