import api from './http.service';

const permissionEndpoints: Record<string, string> = {
    all: 'permission/all',
    store: 'permission/post',
    update: 'permission/update',
    getById: 'permission/permission',
    delete: 'permission/permission',
    category: 'permission/category',
    scope: 'permission/scope',
    system: 'permission/system',
    categories: 'permission/categories',
    scopes: 'permission/scopes',
};

const permissionService = {
    endpoints: permissionEndpoints,

    async list(): Promise<Array<Permission>> {
        return api
            .get<Array<Permission>>(permissionEndpoints.all)
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

    async getCategories(): Promise<Array<Permission>> {
        return api
            .get<Permission[]>(permissionEndpoints.categories)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getScopes(): Promise<Array<Permission>> {
        return api
            .get<Permission[]>(permissionEndpoints.scopes)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default permissionService;