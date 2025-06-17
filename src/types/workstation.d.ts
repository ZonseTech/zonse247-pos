interface Workstation {
    id?: number;
    uuid: string;
    shop_code: string;
    client_id: string;
    till_name: string;
    till_number: string;
    device_id: string;
    device_type: 'desktop' | 'tablet' | 'mobile';
    ip_address: string;
    is_primary: boolean;
    status: 'active' | 'inactive' | 'maintenance';
    registered_at?: string;
    last_activity?: string;
    last_sync?: string | null;
    createdAt?: string;
    updatedAt?: string;
    synced?: number;
}

interface CreateWorkstationRequest {
    shop_code: string;
    client_id: string;
    till_name: string;
    till_number: string;
    device_id?: string;
    device_type?: 'desktop' | 'tablet' | 'mobile';
    ip_address?: string;
    is_primary?: boolean;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}