import * as Yup from 'yup';

const phonePatterns: Record<string, { pattern: RegExp; message: string; minLength: number; maxLength: number }> = {
    'US': {
        pattern: /^[+]?1?[-.\s]?(\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
        message: 'US phone number must be 10 digits (e.g., +1 234-567-8900)',
        minLength: 10,
        maxLength: 15
    },
    'GB': {
        pattern: /^[+]?44?[-.\s]?[0-9]{10}$/,
        message: 'UK phone number must be valid (e.g., +44 20 1234 5678)',
        minLength: 10,
        maxLength: 15
    },
    'MW': {
        pattern: /^[+]?265?[-.\s]?[0-9]{9}$/,
        message: 'Malawi phone number must be 9 digits (e.g., +265 999 123 456)',
        minLength: 9,
        maxLength: 15
    },
    'ZA': {
        pattern: /^[+]?27?[-.\s]?[0-9]{9}$/,
        message: 'South Africa phone number must be 9 digits (e.g., +27 82 123 4567)',
        minLength: 9,
        maxLength: 15
    },
    'IN': {
        pattern: /^[+]?91?[-.\s]?[0-9]{10}$/,
        message: 'India phone number must be 10 digits (e.g., +91 98765 43210)',
        minLength: 10,
        maxLength: 15
    }
};

export const tenantValidationSchema = Yup.object().shape({
    tenantCode: Yup.string()
        .notRequired()
        .min(3, 'Tenant code must be at least 3 characters')
        .max(20, 'Tenant code is too long')
        .matches(/^[a-zA-Z0-9_-]+$/, 'Tenant code can only contain letters, numbers, hyphens and underscores'),

    businessName: Yup.string()
        .required('Business name is required')
        .min(2, 'Business name must be at least 2 characters')
        .max(100, 'Business name is too long'),

    tradingName: Yup.string()
        .notRequired()
        .max(100, 'Trading name is too long'),

    tin: Yup.string()
        .required('TIN (Tax ID) is required')
        .min(9, 'TIN must be at least 9 characters')
        .max(20, 'TIN is too long')
        .matches(/^[a-zA-Z0-9]+$/, 'TIN can only contain letters and numbers'),

    businessType: Yup.string()
        .required('Business type is required')
        .oneOf(['PRODUCT_BASED', 'SERVICE_BASED'], 'Invalid business type'),

    ownerName: Yup.string()
        .required('Owner name is required')
        .min(2, 'Owner name must be at least 2 characters')
        .max(100, 'Owner name is too long'),

    email: Yup.string()
        .required('Email is required')
        .email('Please enter a valid email address')
        .max(100, 'Email is too long'),

    country: Yup.string()
        .notRequired()
        .length(2, 'Country code must be 2 characters')
        .matches(/^[A-Z]{2}$/, 'Country code must be uppercase letters'),

    phoneNumber: Yup.string()
        .required('Phone number is required')
        .test('phone-country-validation', function (value) {
            const { country } = this.parent;

            if (!value) return false;

            if (country && phonePatterns[country]) {
                const { pattern, message, minLength, maxLength } = phonePatterns[country];

                const digitsOnly = value.replace(/\D/g, '');
                if (digitsOnly.length < minLength || digitsOnly.length > maxLength) {
                    return this.createError({ message });
                }

                if (!pattern.test(value)) {
                    return this.createError({ message });
                }

                return true;
            }

            const digitsOnly = value.replace(/\D/g, '');
            if (digitsOnly.length < 10) {
                return this.createError({ message: 'Phone number must be at least 10 digits' });
            }
            if (digitsOnly.length > 20) {
                return this.createError({ message: 'Phone number is too long' });
            }
            if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(value)) {
                return this.createError({ message: 'Please enter a valid phone number' });
            }

            return true;
        }),

    address: Yup.string()
        .required('Address is required')
        .max(250, 'Address is too long'),

    mraPortalUsername: Yup.string()
        .notRequired()
        .min(3, 'MRA portal username must be at least 3 characters')
        .max(50, 'MRA portal username is too long'),

    msonkhoOnlineStatus: Yup.string()
        .required('Msonkho online status is required')
        .oneOf(['VERIFIED', 'PENDING', 'FAILED'], 'Invalid Msonkho online status'),

    subscriptionPlan: Yup.string()
        .required('Subscription plan is required')
        .oneOf(['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'], 'Invalid subscription plan'),

    subscriptionStatus: Yup.string()
        .required('Subscription status is required')
        .oneOf(['ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL'], 'Invalid subscription status'),

    trialEndsAt: Yup.string().when('subscriptionStatus', {
        is: 'TRIAL',
        then: () => Yup.string()
            .required('Trial end date is required for trial subscriptions')
            .test('is-future-date', 'Trial end date must be in the future', function (value) {
                if (!value) return false;
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return selectedDate >= today;
            }),
        otherwise: () => Yup.string().notRequired()
    }),

    registeredAt: Yup.string()
        .notRequired(),

    verificationToken: Yup.string()
        .notRequired(),

    status: Yup.string()
        .required('Account status is required')
        .oneOf(['pending', 'active', 'suspended', 'cancelled'], 'Invalid account status')
});