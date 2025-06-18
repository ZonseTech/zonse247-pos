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

interface VerifyClientRequest {
    clientId: string;
    authKey: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}

interface OnboardingStatus {
    client: Omit<Client, 'authKey'>;
    subscription: any;
    shops: any[];
    workstations: any[];
    onboarding: {
        steps: {
            clientRegistered: boolean;
            subscriptionActive: boolean;
            shop_Ceated: boolean;
            workstation_Setup: boolean;
        };
        completedSteps: number;
        totalSteps: number;
        completionPercentage: number;
        isComplete: boolean;
    };
}