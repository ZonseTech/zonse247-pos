/**
 * Terminal activation request parameters
 */
interface TerminalActivationParams {
    activationCode: string;
}

/**
 * Legacy params for backward compatibility
 */
interface TerminalVerificationParams {
    verificationToken: string;
    os: string;
    hostname: string;
    macAddress: string;
}

type ValidationParams = {
    tenantId: string;
    branchId: string;
    terminalId: string;
    verificationKey: string;
}

/**
 * Branch with subscription data
 */
interface BranchWithSubscription extends Branch {
    branchSubscription?: BranchSubscription | null;
}

/**
 * Terminal with all relations from activation response
 */
interface TerminalWithRelations extends Terminal {
    tenant: Tenant;
    branch: BranchWithSubscription;
}

/**
 * Terminal activation response
 */
interface TerminalActivationResponse {
    success: boolean;
    message: string;
    data?: TerminalWithRelations;
}

/**
 * Save terminal details result
 */
interface SaveTerminalDetailsResult {
    tenant: { saved: boolean; exists: boolean; data?: Tenant };
    subscriptionPlan: { saved: boolean; exists: boolean; data?: SubscriptionPlan };
    branchSubscription: { saved: boolean; exists: boolean; data?: BranchSubscription };
    branch: { saved: boolean; exists: boolean; data?: Branch };
    terminal: { saved: boolean; exists: boolean; data?: Terminal };
}

/**
 * Onboarding step types for tracking progress
 */
type OnboardingStepType =
    | 'TERMINAL_ACTIVATION'
    | 'TERMINAL_DETAILS_SAVE'
    | 'MRA_SETUP'
    | 'CUSTOMERS_SYNC'
    | 'CATEGORIES_SYNC'
    | 'SUBSCRIPTION_PLANS_SYNC'
    | 'PAYMENT_METHODS_SYNC'
    | 'PAYMENT_PROVIDERS_SYNC'
    | 'PRODUCTS_SYNC'
    | 'INVENTORY_SYNC'
    | 'USERS_SYNC'
    | 'SETTINGS_SYNC';

/**
 * Status of an onboarding step
 */
type OnboardingStepStatus =
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'FAILED'
    | 'SKIPPED';

/**
 * Individual onboarding step progress
 */
interface OnboardingStep {
    stepType: OnboardingStepType;
    status: OnboardingStepStatus;
    order: number;
    startedAt?: Date | string | null;
    completedAt?: Date | string | null;
    errorMessage?: string | null;
    retryCount: number;
    metadata?: Record<string, any> | null;
}

/**
 * Complete onboarding progress for a terminal
 */
interface OnboardingProgress {
    progressId: string;
    terminalId: string;
    tenantId?: string | null;
    branchId?: string | null;
    currentStep: OnboardingStepType;
    overallStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    steps: OnboardingStep[];
    completedSteps: number;
    totalSteps: number;
    completionPercentage: number;
    lastUpdatedAt: Date | string;
    createdAt: Date | string;
}

/**
 * Request to update onboarding step progress
 */
interface UpdateOnboardingStepRequest {
    terminalId: string;
    stepType: OnboardingStepType;
    status: OnboardingStepStatus;
    errorMessage?: string;
    metadata?: Record<string, any>;
}

/**
 * Request to initialize onboarding progress
 */
interface InitOnboardingProgressRequest {
    terminalId: string;
    tenantId?: string;
    branchId?: string;
}

/**
 * Default onboarding steps configuration
 */
type OnboardingStepConfig = {
    stepType: OnboardingStepType;
    order: number;
    required: boolean;
    label: string;
    description: string;
};

/**
 * Legacy OnboardingStatus for backward compatibility
 */
interface OnboardingStatus {
    tenant: Omit<Tenant, 'verificationToken'>;
    subscription: any;
    branches: any[];
    terminals: any[];
    onboarding: {
        steps: {
            tenantRegistered: boolean;
            subscriptionActive: boolean;
            branchCreated: boolean;
            terminalSetup: boolean;
        };
        completedSteps: number;
        totalSteps: number;
        completionPercentage: number;
        isComplete: boolean;
    };
}