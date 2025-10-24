import * as Yup from 'yup';

export const tenantValidationSchema = Yup.object().shape({
    clientCode: Yup.string()
        .notRequired()
        .min(3, 'Client ID must be at least 3 characters')
        .max(20, 'Client ID is too long')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Client ID can only contain letters, numbers, hyphens and underscores'),
    companyName: Yup.string()
        .required('Company name is required')
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name is too long'),
    ownerName: Yup.string()
        .required('Owner name is required')
        .min(2, 'Owner name must be at least 2 characters')
        .max(50, 'Owner name is too long'),
    email: Yup.string()
        .required('Email is required')
        .email('Please enter a valid email address'),
    phone: Yup.string()
        .required('Phone number is required')
        .min(10, 'Phone number must be at least 10 digits'),
    address: Yup.string().max(200, 'Address is too long'),
    subscriptionStatus: Yup.string()
        .required('Subscription status is required')
        .oneOf(['active', 'inactive', 'suspended', 'trial']),
    trialEndsAt: Yup.string().when('subscriptionStatus', {
        is: 'trial',
        then: () => Yup.string().required('Trial end date is required for trial subscriptions'),
        otherwise: () => Yup.string().notRequired()
    }),
    status: Yup.string()
        .required('Status is required')
        .oneOf(['pending', 'active', 'suspended', 'cancelled'])
});