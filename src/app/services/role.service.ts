import api from "./http.service";

const roleEndpoints: Record<string, string> = {
    all: 'roles/all',
    store: 'roles/post',
    update: 'roles/update',
    getById: 'roles/role',
    delete: 'roles/role',
    client: 'roles/client',
    shop: 'roles/shop',
    system: 'roles/system',
    active: 'roles/active',
    activate: 'roles/activate',
    deactivate: 'roles/deactivate',
    permissions: 'roles/role',
};

const roleService = {
    endpoints: roleEndpoints,

    async list(): Promise<ApiResponse<Array<Role>>> {
        return api
            .get<ApiResponse<Array<Role>>>(roleEndpoints.all)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async create(role: Role): Promise<Role> {
        return api
            .post(roleEndpoints.store, role)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, role: Role): Promise<ApiResponse<Role>> {
        return api
            .put<ApiResponse<Role>>(`${roleEndpoints.update}/${id}`, role as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getById(id: string): Promise<Role> {
        return api
            .get<Role>(`${roleEndpoints.getById}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async delete(id: string): Promise<any> {
        return api
            .delete(`${roleEndpoints.delete}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByClientId(clientId: string): Promise<Array<Role>> {
        return api
            .get<Role[]>(`${roleEndpoints.client}/${clientId}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByShopId(shopId: string): Promise<Array<Role>> {
        return api
            .get<Role[]>(`${roleEndpoints.shop}/${shopId}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getSystemRoles(): Promise<Array<Role>> {
        return api
            .get<Role[]>(roleEndpoints.system)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getActiveRoles(): Promise<Array<Role>> {
        return api
            .get<Role[]>(roleEndpoints.active)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async activate(id: string): Promise<Role> {
        return api
            .put<Role>(`${roleEndpoints.activate}/${id}`, {} as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async deactivate(id: string): Promise<Role> {
        return api
            .put<Role>(`${roleEndpoints.deactivate}/${id}`, {} as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getRolePermissions(id: string): Promise<ApiResponse<Array<Role>>> {
        return api
            .get<ApiResponse<Array<Role>>>(`${roleEndpoints.permissions}/${id}/permissions`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async assignPermissions(id: string, permissionUuids: Array<string>): Promise<Role> {
        return api
            .post<Role>(`${roleEndpoints.permissions}/${id}/permissions`, { permissionUuids } as any)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async removePermission(id: string, permissionId: string): Promise<any> {
        return api
            .delete(`${roleEndpoints.permissions}/${id}/permissions/${permissionId}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default roleService;