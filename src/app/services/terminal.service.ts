import { AxiosError } from 'axios';
import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'terminal/all',
    store: 'terminal/post',
    update: 'terminal/update',
    show: 'terminal/workstation',
    delete: 'terminal/workstation',
    sync: 'terminal/sync',
    status: 'terminal/status',
};

const terminalService = {
    endpoints,
    async list(query = {}): Promise<Array<Workstation>> {
        return api
            .get<ApiResponse>(endpoints.all, query)
            .then((res) => res.data.data as Array<Workstation>)
            .catch((err) => {
                throw err;
            });
    },

    async store(data: Workstation): Promise<Workstation> {
        return api
            .post(endpoints.store, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, data: Partial<Workstation>): Promise<Workstation> {
        return api
            .put<Workstation>(`${endpoints.update}/${id}`, data as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async show(id: string): Promise<Workstation> {
        return api
            .get<Workstation>(`${endpoints.show}/${id}`)
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

    async updateStatus(id: string, status: 'active' | 'inactive' | 'maintenance'): Promise<Workstation> {
        return api
            .put<Workstation>(`${endpoints.status}/${id}`, { status } as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async syncWorkstation(id: string): Promise<{ status: boolean; lastSync: string }> {
        return api
            .post<{ status: boolean; lastSync: string }>(`${endpoints.sync}/${id}`, {} as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async setPrimary(id: string): Promise<Workstation> {
        return api
            .put<Workstation>(`${endpoints.update}/${id}`, { isPrimary: true } as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    }
};

export default terminalService;
