
interface ClientQueryParams {
    status?: string;
    subscriptionStatus?: string;
    country?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

interface RegisterClientRequest {
    companyName: string;
    ownerName: string;
    email: string;
    phone: string;
    address?: string;
    country?: string;
    timezone?: string;
}

interface VerifyClientRequest {
    clientId: string;
    authKey: string;
}

interface Client {
    uuid: string;
    clientId: string;
    companyName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    timezone: string;
    subscription_status: string;
    trial_ends_at: string;
    authKey: string;
    status: string;
    registered_at: string;
    activated_at?: string;
    createdAt?: string;
    updatedAt?: string;
    synced?: number;
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
    companyName: string;
    ownerName: string;
    email: string;
    phone: string;
    address?: string;
    country?: string;
    timezone?: string;
}

interface VerifyClientRequest {
    clientId: string;
    authKey: string;
}

