import api from './http.service';

const permissionEndpoints: Record<string, string> = {
    all: 'permissions/all',
    store: 'permissions/post',
    update: 'permissions/update',
    getById: 'permissions/permission',
    delete: 'permissions/permission',
    category: 'permissions/category',
    scope: 'permissions/scope',
    system: 'permissions/system',
    categories: 'permissions/categories',
    scopes: 'permissions/scopes',
};

const permissionService = {
    endpoints: permissionEndpoints,

    async list(): Promise<ApiResponse<Array<Permission>>> {
        return api
            .get<ApiResponse<any>>(permissionEndpoints.all)
            .then((res) => {
                const response = res.data;
                if (response.data && !Array.isArray(response.data)) {
                    response.data = response.data.permissions || [];
                }
                return response;
            })
            .catch((err) => {
                throw err;
            });
    },

    async create(permission: Record<string, any>): Promise<Record<string, any>> {
        return api
            .post(permissionEndpoints.store, permission)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async update(id: string, permission: Record<string, any>): Promise<Record<string, any>> {
        return api
            .put(`${permissionEndpoints.update}/${id}`, permission)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getById(id: string): Promise<Record<string, any>> {
        return api
            .get(`${permissionEndpoints.getById}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async delete(id: string): Promise<any> {
        return api
            .delete(`${permissionEndpoints.delete}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByCategory(category: string): Promise<Array<Permission>> {
        return api
            .get<any>(`${permissionEndpoints.category}/${category}`)
            .then((res) => {
                const data = res.data;
                if (Array.isArray(data)) return data;
                if (data?.data) return Array.isArray(data.data) ? data.data : (data.data.permissions || []);
                return [];
            })
            .catch((err) => {
                throw err;
            });
    },

    async getByScope(scope: string): Promise<Array<Permission>> {
        return api
            .get<any>(`${permissionEndpoints.scope}/${scope}`)
            .then((res) => {
                const data = res.data;
                if (Array.isArray(data)) return data;
                if (data?.data) return Array.isArray(data.data) ? data.data : (data.data.permissions || []);
                return [];
            })
            .catch((err) => {
                throw err;
            });
    },

    async getSystemPermissions(): Promise<Array<Permission>> {
        return api
            .get<any>(permissionEndpoints.system)
            .then((res) => {
                const data = res.data;
                if (Array.isArray(data)) return data;
                if (data?.data) return Array.isArray(data.data) ? data.data : (data.data.permissions || []);
                return [];
            })
            .catch((err) => {
                throw err;
            });
    },

    async getCategories(): Promise<ApiResponse<Array<PermissionCategory>>> {
        return api
            .get<ApiResponse<any>>(permissionEndpoints.categories)
            .then((res) => {
                const response = res.data;
                if (response.data && !Array.isArray(response.data)) {
                    response.data = response.data.categories || response.data.permissionCategories || [];
                }
                return response;
            })
            .catch((err) => {
                throw err;
            });
    },

    async getScopes(): Promise<ApiResponse<Array<PermissionScope>>> {
        return api
            .get<ApiResponse<any>>(permissionEndpoints.scopes)
            .then((res) => {
                const response = res.data;
                if (response.data && !Array.isArray(response.data)) {
                    response.data = response.data.scopes || response.data.permissionScopes || [];
                }
                return response;
            })
            .catch((err) => {
                throw err;
            });
    },
};

export default permissionService;