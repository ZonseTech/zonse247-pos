interface Client {
    id?: number;
    uuid: string;
    client_id: string;
    company_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address?: string;
    country?: string;
    timezone: string;
    subscription_status: 'active' | 'inactive' | 'suspended' | 'trial';
    trial_ends_at?: string;
    auth_key: string;
    status: 'pending' | 'active' | 'suspended' | 'cancelled';
    registered_at?: string;
    activated_at?: string;
    created_at?: string;
    updated_at?: string;
}

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

interface ClientSubscription {
    id?: number;
    uuid: string;
    client_id: string;
    plan_id: string;
    status: 'active' | 'cancelled' | 'expired' | 'past_due';
    starts_at: string;
    ends_at?: string;
    auto_renew: boolean;
    payment_method?: string;
    last_payment_date?: string;
    next_payment_date?: string;
    created_at?: string;
    updated_at?: string;
}

interface IShop {
    id?: number;
    uuid: string;
    client_id: string;
    shop_code: string;
    name: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    currency_code: string;
    currency_symbol: string;
    tax_rate: number;
    charge_tax: boolean;
    receipt_footer?: string;
    logo_url?: string;
    status: 'active' | 'inactive' | 'suspended';
    created_at?: string;
    updated_at?: string;
}

interface Workstation {
    id?: number;
    uuid: string;
    shop_id: string;
    client_id: string;
    till_name: string;
    till_number: string;
    device_id?: string;
    device_type: 'desktop' | 'tablet' | 'mobile' | 'web';
    ip_address?: string;
    last_sync?: string;
    status: 'active' | 'inactive' | 'maintenance';
    is_primary: boolean;
    registered_at?: string;
    last_activity?: string;
    created_at?: string;
    updated_at?: string;
}

interface RegisterClientRequest {
    company_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address?: string;
    country?: string;
    timezone?: string;
}

interface CreateSubscriptionRequest {
    client_id: string;
    plan_id: string;
    payment_method?: string;
    auto_renew?: boolean;
}

interface CreateShopRequest {
    client_id: string;
    shop_code: string;
    name: string;
    description?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    phone?: string;
    email?: string;
    tax_number?: string;
    currency_code?: string;
    currency_symbol?: string;
    tax_rate?: number;
    charge_tax?: boolean;
    receipt_footer?: string;
    logo_url?: string;
}

interface CreateWorkstationRequest {
    shop_id: string;
    client_id: string;
    till_name: string;
    till_number: string;
    device_id?: string;
    device_type?: 'desktop' | 'tablet' | 'mobile' | 'web';
    ip_address?: string;
    is_primary?: boolean;
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