import { AxiosError } from 'axios';
import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'shops/all',
    store: 'shops/post',
    update: 'shops/update',
    show: 'shops/shop',
    delete: 'shops/shop',
    list_by_client: 'client'
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

    async listByClient(clientId: string): Promise<ApiResponse> {
        return api
            .get<ApiResponse>(endpoints.list_by_client + '/' + clientId + '/shops')
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