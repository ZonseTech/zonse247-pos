
interface ClientQueryParams {
    status?: string;
    subscription_status?: string;
    country?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
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

interface VerifyClientRequest {
    client_id: string;
    auth_key: string;
}

interface Client {
    uuid: string;
    client_id: string;
    company_name: string;
    owner_name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    timezone: string;
    subscription_status: string;
    trial_ends_at: string;
    auth_key: string;
    status: string;
    registered_at: string;
    activated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    synced?: number;
}

interface OnboardingStatus {
    client: Omit<Client, 'auth_key'>;
    subscription: any;
    shops: any[];
    workstations: any[];
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

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}



interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
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

interface VerifyClientRequest {
    client_id: string;
    auth_key: string;
}



// interface Client {
//     id?: number;
//     uuid: string;
//     client_id: string;
//     company_name: string;
//     owner_name: string;
//     email: string;
//     phone: string;
//     address?: string;
//     country?: string;
//     timezone: string;
//     subscription_status: 'active' | 'inactive' | 'suspended' | 'trial';
//     trial_ends_at?: string;
//     auth_key: string;
//     status: 'pending' | 'active' | 'suspended' | 'cancelled';
//     registered_at?: string;
//     activated_at?: string;
//     created_at?: string;
//     updated_at?: string;
// }
