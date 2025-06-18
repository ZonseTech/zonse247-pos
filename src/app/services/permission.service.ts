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
            .get<ApiResponse<Array<Permission>>>(permissionEndpoints.all)
            .then((res) => res.data)
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
            .get<Permission[]>(`${permissionEndpoints.category}/${category}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByScope(scope: string): Promise<Array<Permission>> {
        return api
            .get<Permission[]>(`${permissionEndpoints.scope}/${scope}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getSystemPermissions(): Promise<Array<Permission>> {
        return api
            .get<Permission[]>(permissionEndpoints.system)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getCategories(): Promise<ApiResponse<Array<PermissionCategory>>> {
        return api
            .get<ApiResponse<Array<PermissionCategory>>>(permissionEndpoints.categories)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getScopes(): Promise<ApiResponse<Array<PermissionScope>>> {
        return api
            .get<ApiResponse<Array<PermissionScope>>>(permissionEndpoints.scopes)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default permissionService;