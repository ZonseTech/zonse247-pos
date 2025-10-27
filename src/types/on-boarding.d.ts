interface SubscriptionPlan {
    uuid: string;
    name: string;
    description?: string;
    price: number;
    billingCycle: 'monthly' | 'yearly' | 'lifetime';
    maxShops: number;
    maxUsersPerShop: number;
    maxProducts: number;
    maxTransactionsPerMonth: number;
    features?: Record<string, any>;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface TerminalVerificationParams {
    tenantCode: string;
    authKey: string;
    os: string;
    hostname: string;
    macAddress: string;
}

interface OnboardingStatus {
    tenant: Omit<Tenant, 'authKey'>;
    subscription: any;
    shops: any[];
    workstations: any[];
    onboarding: {
        steps: {
            tenantRegistered: boolean;
            subscriptionActive: boolean;
            shopCreated: boolean;
            workstationSetup: boolean;
        };
        completedSteps: number;
        totalSteps: number;
        completionPercentage: number;
        isComplete: boolean;
    };
}