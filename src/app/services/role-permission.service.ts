import api from "./http.service";

const rolePermissionEndpoints: Record<string, string> = {
    all: 'role-permissions/all',
    store: 'role-permissions/post',
    delete: 'role-permissions/delete',
    bulkAssign: 'role-permissions/bulk/assign',
    bulkRemove: 'role-permissions/bulk/remove',
    role: 'role-permissions/role',
    permission: 'role-permissions/permission',
    checkAssignment: 'role-permissions/role',
};

const rolePermissionService = {
    endpoints: rolePermissionEndpoints,

    async getAll(): Promise<RolePermission[]> {
        return api
            .get<RolePermission[]>(rolePermissionEndpoints.all)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async create(rolePermission: Record<string, any>): Promise<Record<string, any>> {
        return api
            .post(rolePermissionEndpoints.store, rolePermission)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async delete(id: string): Promise<any> {
        return api
            .delete(`${rolePermissionEndpoints.delete}/${id}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async bulkAssign(assignments: Record<string, any>): Promise<Record<string, any>> {
        return api
            .post(rolePermissionEndpoints.bulkAssign, assignments)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async bulkRemove(removals: Record<string, any>): Promise<any> {
        return api
            .delete(rolePermissionEndpoints.bulkRemove, { data: removals })
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByRoleUuid(roleUuid: string): Promise<ApiResponse<RolePermission[]>> {
        return api
            .get<ApiResponse<RolePermission[]>>(`${rolePermissionEndpoints.role}/${roleUuid}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async getByPermissionUuid(permissionUuid: string): Promise<ApiResponse<RolePermission[]>> {
        return api
            .get<ApiResponse<RolePermission[]>>(`${rolePermissionEndpoints.permission}/${permissionUuid}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },

    async checkAssignment(roleUuid: string, permissionUuid: string): Promise<Record<string, any>> {
        return api
            .get(`${rolePermissionEndpoints.role}/${roleUuid}/permission/${permissionUuid}`)
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default rolePermissionService;