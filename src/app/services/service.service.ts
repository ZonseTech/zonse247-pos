import api from './http.service';

const BASE = 'services';

const serviceService = {
    async create(payload: CreateServiceInput): Promise<Service> {
        return api
            .post<ApiResponse<Service>>(BASE, payload as any)
            .then((res) => res.data.data);
    },

    async list(query: ServiceListQuery = {}): Promise<ServiceListResponse> {
        const params: Record<string, any> = {};
        Object.keys(query).forEach((key) => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });
        return api
            .get<ApiResponse<ServiceListResponse>>(BASE, params)
            .then((res) => res.data.data);
    },

    async get(id: string): Promise<Service> {
        return api
            .get<ApiResponse<Service>>(`${BASE}/${id}`)
            .then((res) => res.data.data);
    },

    async update(id: string, payload: UpdateServiceInput): Promise<Service> {
        return api
            .put<ApiResponse<Service>>(`${BASE}/${id}`, payload as any)
            .then((res) => res.data.data);
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${BASE}/${id}`);
    },
};

export default serviceService;
