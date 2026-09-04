import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

const TENANT_DECODE_FIELDS = ['companyName', 'ownerName', 'address', 'city', 'state', 'country'] as const;

const endpoints: Record<string, string> = {
    all: 'tenants',
    store: 'tenants',
    update: 'tenants',
    show: 'tenants',
    delete: 'tenants/tenant',
    register: 'tenants/register-tenant',
    updateTenant: 'tenants/update-tenant',
};

interface TenantListResult {
    tenants: Tenant[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

const tenantsService = {
    endpoints,
    async list(query: TenantQueryParams = {}): Promise<TenantListResult> {
        try {
            const response = await api.get<ApiResponse<{ tenants: Array<Tenant>; pagination: TenantListResult['pagination'] }>>(endpoints.all, query);
            const data = response.data.data;
            return {
                tenants: decodeArrayStrings(data?.tenants || [], TENANT_DECODE_FIELDS),
                pagination: data?.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: query.limit || 50 },
            };
        } catch (err) {
            console.error('Error fetching tenants:', err);
            throw err;
        }
    },

    async store(data: TenantFormValues): Promise<Tenant> {
        try {
            const response = await api.post<ApiResponse<Tenant>>(endpoints.store, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            throw err;
        }
    },

    async update(id: string, data: Partial<TenantFormValues>): Promise<Tenant> {
        try {
            const response = await api.put<ApiResponse<Tenant>>(`${endpoints.update}/${id}`, data as any);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error updating tenant:', err);
            throw err;
        }
    },

    async show(id: string): Promise<Tenant> {
        try {
            const response = await api.get<ApiResponse<Tenant>>(`${endpoints.show}/${id}`);
            return decodeObjectStrings(response.data.data!, TENANT_DECODE_FIELDS);
        } catch (err) {
            console.error('Error fetching tenant:', err);
            throw err;
        }
    },

    async delete(id: string): Promise<{ status: boolean }> {
        try {
            const response = await api.delete<ApiResponse<{ status: boolean }>>(`${endpoints.delete}/${id}`);
            return response.data.data || { status: true };
        } catch (err) {
            console.error('Error deleting tenant:', err);
            throw err;
        }
    },

};


export default tenantsService;