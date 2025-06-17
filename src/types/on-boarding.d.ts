interface SubscriptionPlan {
    id?: number;
    uuid: string;
    name: string;
    description?: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly' | 'lifetime';
    max_shops: number;
    max_users_per_shop: number;
    max_products: number;
    max_transactions_per_month: number;
    features?: Record<string, any>;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

interface VerifyClientRequest {
    client_id: string;
    auth_key: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    error?: string;
}

interface OnboardingStatus {
    client: Omit<Client, 'auth_key'>;
    subscription: ClientSubscription | null;
    shops: Shop[];
    workstations: Workstation[];
    onboarding: {
        steps: {
            client_registered: boolean;
            subscription_active: boolean;
            shop_created: boolean;
            workstation_setup: boolean;
        };
        completed_steps: number;
        total_steps: number;
        completion_percentage: number;
        is_complete: boolean;
    };
}