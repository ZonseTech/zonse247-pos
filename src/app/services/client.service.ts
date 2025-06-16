import api from './http.service';

const endpoints: Record<string, string> = {
    all: 'clients/all',
    store: 'clients/post',
    update: 'clients/update',
    show: 'clients/client',
    delete: 'clients/client',
};

const clientsService = {
    endpoints,

    async list(query = {}): Promise<Client[]> {
        return api
            .get<Client[]>(endpoints.all, query)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async store(data: Client): Promise<Client> {
        return api
            .post(endpoints.store, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, data: Record<string, any>) {
        return api
            .put(`${endpoints.update}/${id}`, data)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async show(id: string): Promise<Client> {
        return api
            .get<Client>(`${endpoints.show}/${id}`)
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

export default clientsService;