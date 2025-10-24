import { AxiosError } from 'axios';
import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'branches/all',
    store: 'branches/post',
    update: 'branches/update',
    show: 'branches',
    delete: 'branches',
    list_by_tenant: 'tenant'
};

const shopsService = {
    endpoints,

    async list(query = {}): Promise<ApiResponse> {
        return api
            .get<ApiResponse>(endpoints.all, query)
            .then((res) => res.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

    async listByTenantId(tenantId: string): Promise<ApiResponse> {
        return api
            .get<ApiResponse>(endpoints.list_by_tenant + '/' + tenantId + '/branches')
            .then((res) => res.data)
            .catch((err: AxiosError) => {
                throw err?.response?.data;
            });
    },

    async store(data: Omit<IShop, 'id' | 'created_at' | 'updated_at'>): Promise<IShop> {
        return api
            .post<ApiResponse>(endpoints.store, data as any)
            .then((res) => res.data.data as IShop)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, data: Partial<IShop>): Promise<IShop> {
        return api
            .put<IShop>(`${endpoints.update}/${id}`, data as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async show(id: string): Promise<IShop> {
        return api
            .get<IShop>(`${endpoints.show}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async delete(id: string): Promise<{ status: boolean }> {
        return api
            .delete(`${endpoints.delete}/${id}`)
            .then((res) => res.data as { status: boolean })
            .catch((err) => {
                throw err;
            });
    },
};

export default shopsService;