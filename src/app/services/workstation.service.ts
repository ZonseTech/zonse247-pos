import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'workstations/all',
    store: 'workstations/post',
    update: 'workstations/update',
    show: 'workstations/workstation',
    delete: 'workstations/workstation',
    sync: 'workstations/sync',
    status: 'workstations/status'
};

const workstationsService = {
    endpoints,
    async list(query = {}): Promise<Workstation[]> {
        return api
            .get<Workstation[]>(endpoints.all, query)
            .then((res) => res.data)
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

    async syncWorkstation(id: string): Promise<{ status: boolean; last_sync: string }> {
        return api
            .post<{ status: boolean; last_sync: string }>(`${endpoints.sync}/${id}`, {} as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async setPrimary(id: string): Promise<Workstation> {
        return api
            .put<Workstation>(`${endpoints.update}/${id}`, { is_primary: true } as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    }
};

export default workstationsService;
