/**
 * Onboarding step labels for display
 */
export const STEP_LABELS: Record<OnboardingStepType, string> = {
    TERMINAL_ACTIVATION: 'Terminal Activation',
    TERMINAL_DETAILS_SAVE: 'Save Terminal Details',
    MRA_SETUP: 'MRA Setup',
    CUSTOMERS_SYNC: 'Sync Customers',
    CATEGORIES_SYNC: 'Sync Categories',
    SUBSCRIPTION_PLANS_SYNC: 'Sync Subscription Plans',
    PAYMENT_METHODS_SYNC: 'Sync Payment Methods',
    PAYMENT_PROVIDERS_SYNC: 'Sync Payment Providers',
    PRODUCTS_SYNC: 'Sync Products',
    INVENTORY_SYNC: 'Sync Inventory',
    USERS_SYNC: 'Sync Users',
    SETTINGS_SYNC: 'Sync Settings',
};

/**
 * Onboarding step descriptions
 */
export const STEP_DESCRIPTIONS: Record<OnboardingStepType, string> = {
    TERMINAL_ACTIVATION: 'Activate your terminal using the activation code provided by admin',
    TERMINAL_DETAILS_SAVE: 'Save terminal, tenant, and branch configuration locally',
    MRA_SETUP: 'Configure Mauritius Revenue Authority integration',
    CUSTOMERS_SYNC: 'Download and sync customer data from the server',
    CATEGORIES_SYNC: 'Download and sync product categories',
    SUBSCRIPTION_PLANS_SYNC: 'Download subscription plans and features',
    PAYMENT_METHODS_SYNC: 'Download available payment methods',
    PAYMENT_PROVIDERS_SYNC: 'Download payment service providers configuration',
    PRODUCTS_SYNC: 'Download and sync product catalog',
    INVENTORY_SYNC: 'Download and sync inventory levels',
    USERS_SYNC: 'Download user accounts for this terminal',
    SETTINGS_SYNC: 'Download terminal-specific settings',
};

/**
 * Steps that can be skipped by the user
 */
export const OPTIONAL_STEPS: OnboardingStepType[] = [
    'CUSTOMERS_SYNC',
    'INVENTORY_SYNC',
    'MRA_SETUP',
];

/**
 * Get the human-readable label for a step type
 */
export const getStepLabel = (stepType: OnboardingStepType): string => {
    return STEP_LABELS[stepType] || stepType;
};

/**
 * Get the description for a step type
 */
export const getStepDescription = (stepType: OnboardingStepType): string => {
    return STEP_DESCRIPTIONS[stepType] || '';
};

/**
 * Check if a step is optional
 */
export const isStepOptional = (stepType: OnboardingStepType): boolean => {
    return OPTIONAL_STEPS.includes(stepType);
};
