/**
 * Utility functions and constants for step list components
 */

/**
 * Syncable step types that have fetch/sync endpoints
 */
export const SYNCABLE_STEPS: OnboardingStepType[] = [
    'CUSTOMERS_SYNC',
    'CATEGORIES_SYNC',
    'SUBSCRIPTION_PLANS_SYNC',
    'PAYMENT_METHODS_SYNC',
    'PAYMENT_PROVIDERS_SYNC',
];

/**
 * Get display name for data item based on step type
 */
export const getItemDisplayName = (item: any, stepType: OnboardingStepType): string => {
    switch (stepType) {
        case 'CUSTOMERS_SYNC':
            return item.name || item.customerName || item.fullName || `Customer ${item.id || item.customerId}`;
        case 'CATEGORIES_SYNC':
            return item.name || item.categoryName || `Category ${item.id || item.categoryId}`;
        case 'SUBSCRIPTION_PLANS_SYNC':
            return item.name || item.planName || `Plan ${item.id || item.planId}`;
        case 'PAYMENT_METHODS_SYNC':
            return item.name || item.methodName || `Method ${item.id || item.paymentMethodId}`;
        case 'PAYMENT_PROVIDERS_SYNC':
            return item.name || item.providerName || `Provider ${item.id || item.providerId}`;
        default:
            return item.name || item.id || 'Unknown';
    }
};

/**
 * Get unique ID for data item based on step type
 */
export const getItemId = (item: any, stepType: OnboardingStepType): string => {
    switch (stepType) {
        case 'CUSTOMERS_SYNC':
            return item.customerId || item.id || String(Math.random());
        case 'CATEGORIES_SYNC':
            return item.categoryId || item.id || String(Math.random());
        case 'SUBSCRIPTION_PLANS_SYNC':
            return item.planId || item.subscriptionPlanId || item.id || String(Math.random());
        case 'PAYMENT_METHODS_SYNC':
            return item.paymentMethodId || item.id || String(Math.random());
        case 'PAYMENT_PROVIDERS_SYNC':
            return item.providerId || item.paymentServiceProviderId || item.id || String(Math.random());
        default:
            return item.id || String(Math.random());
    }
};
