interface SubscriptionResponse {
    data: Array<ClientSubscription>;
    message: string;
    success: boolean;
}

interface SubscriptionPlan {
    uuid: string;
    name: string;
    description?: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly' | 'lifetime';
    features?: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ClientSubscription {
    uuid: string;
    client_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'pending';
    starts_at: string;
    ends_at?: string;
    auto_renew: boolean;
    payment_method?: string;
    last_payment_date?: string;
    next_payment_date?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
}

interface CreateSubscriptionRequest {
    client_id: string;
    plan_id: string;
    payment_method?: string;
    auto_renew?: boolean;
    starts_at?: string;
}

interface UpdateSubscriptionRequest {
    status?: ClientSubscription['status'];
    ends_at?: string;
    auto_renew?: boolean;
    payment_method?: string;
    next_payment_date?: string;
}

interface BulkUpdateRequest {
    ids: string[];
    data: Partial<ClientSubscription>;
}

interface ProcessPaymentRequest {
    amount: number;
    payment_method: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

interface SubscriptionStats {
    total: number;
    active: number;
    cancelled: number;
    expired: number;
    past_due: number;
    monthly_revenue: number;
    annual_revenue: number;
}
