import { RoleModel } from "../models/role.model";
import { ClientService } from "./client.service";
import { PermissionModel } from "../models/permission.model";
import { RolePermissionModel } from "../models/role-permission.model";

export class RolePermissionService {

    static async getAllRolePermissions(query: any = {}): Promise<RolePermission[]> {
        try {
            const conditions: any = {};

            if (query.role_uuid) {
                conditions.role_uuid = query.role_uuid;
            }

            if (query.permission_uuid) {
                conditions.permission_uuid = query.permission_uuid;
            }

            return await RolePermissionModel.findAll(conditions);
        } catch (error: any) {
            throw new Error(`Failed to retrieve role permissions: ${error.message}`);
        }
    }

    static async createRolePermission(data: CreateRolePermissionRequest): Promise<RolePermission> {
        const validationError = ClientService.validateRequired(data, ['role_uuid', 'permission_uuid']);
        if (validationError) {
            throw new Error(validationError);
        }

        const role = await RoleModel.findById(data.role_uuid);
        if (!role) {
            throw new Error('Role not found');
        }

        const permission = await PermissionModel.findByUuid(data.permission_uuid);
        if (!permission) {
            throw new Error('Permission not found');
        }

        const existingAssignment = await RolePermissionModel.findByRoleAndPermissionUuid(data.role_uuid, data.permission_uuid);
        if (existingAssignment) {
            throw new Error('Role permission assignment already exists');
        }

        return RolePermissionModel.create(data);
    }

    static async deleteRolePermission(id: string): Promise<{ status: boolean }> {
        if (!id) {
            throw new Error('Role permission ID is required');
        }

        const existingRolePermission = await RolePermissionModel.findById(id);
        if (!existingRolePermission) {
            throw new Error('Role permission not found');
        }

        const numDeleted = await RolePermissionModel.delete(id);
        if (numDeleted === 0) {
            throw new Error('Failed to delete role permission');
        }

        return { status: true };
    }

    static async bulkAssignPermissions(data: BulkRolePermissionRequest): Promise<{ assigned: number, skipped: number }> {
        const validationError = ClientService.validateRequired(data, ['role_uuid', 'permission_uuids']);
        if (validationError) {
            throw new Error(validationError);
        }

        if (!Array.isArray(data.permission_uuids) || data.permission_uuids.length === 0) {
            throw new Error('Permission UUIDs must be a non-empty array');
        }

        const role = await RoleModel.findById(data.role_uuid);
        if (!role) {
            throw new Error('Role not found');
        }

        let assignedCount = 0;
        let skippedCount = 0;

        for (const permissionUuid of data.permission_uuids) {
            const permission = await PermissionModel.findByUuid(permissionUuid);
            if (!permission) {
                throw new Error(`Permission with UUID ${permissionUuid} not found`);
            }

            const existingAssignment = await RolePermissionModel.findByRoleAndPermissionUuid(data.role_uuid, permissionUuid);
            if (existingAssignment) {
                skippedCount++;
                continue;
            }

            await RolePermissionModel.create({
                role_uuid: data.role_uuid,
                permission_uuid: permissionUuid
            });
            assignedCount++;
        }

        return { assigned: assignedCount, skipped: skippedCount };
    }

    static async bulkRemovePermissions(data: BulkRolePermissionRequest): Promise<{ removed: number, notFound: number }> {
        const validationError = ClientService.validateRequired(data, ['role_uuid', 'permission_uuids']);
        if (validationError) {
            throw new Error(validationError);
        }

        if (!Array.isArray(data.permission_uuids) || data.permission_uuids.length === 0) {
            throw new Error('Permission UUIDs must be a non-empty array');
        }

        const role = await RoleModel.findById(data.role_uuid);
        if (!role) {
            throw new Error('Role not found');
        }

        let removedCount = 0;
        let notFoundCount = 0;

        for (const permissionUuid of data.permission_uuids) {
            const numDeleted = await RolePermissionModel.deleteByRoleAndPermissionUuid(data.role_uuid, permissionUuid);
            if (numDeleted > 0) {
                removedCount++;
            } else {
                notFoundCount++;
            }
        }

        return { removed: removedCount, notFound: notFoundCount };
    }

    static async getRolePermissionsByRoleUuid(roleUuid: string): Promise<RolePermission[]> {
        if (!roleUuid) {
            throw new Error('Role UUID is required');
        }

        return await RolePermissionModel.findByRoleUuid(roleUuid);
    }

    static async getRolePermissionsByPermissionUuid(permissionUuid: string): Promise<RolePermission[]> {
        if (!permissionUuid) {
            throw new Error('Permission UUID is required');
        }

        return await RolePermissionModel.findByPermissionUuid(permissionUuid);
    }

    static async checkRolePermissionExists(roleUuid: string, permissionUuid: string): Promise<boolean> {
        if (!roleUuid || !permissionUuid) {
            throw new Error('Role UUID and Permission UUID are required');
        }

        const assignment = await RolePermissionModel.findByRoleAndPermissionUuid(roleUuid, permissionUuid);
        return !!assignment;
    }

    static async getRolePermissionsWithDetails(roleUuid: string): Promise<Array<RolePermission & { role?: Role, permission?: Permission }>> {
        if (!roleUuid) {
            throw new Error('Role UUID is required');
        }

        const rolePermissions = await RolePermissionModel.findByRoleUuid(roleUuid);
        const detailedRolePermissions = [];

        for (const rp of rolePermissions) {
            const role = await RoleModel.findById(rp.role_uuid);
            const permission = await PermissionModel.findByUuid(rp.permission_uuid);

            detailedRolePermissions.push({
                ...rp,
                role,
                permission
            });
        }

        return detailedRolePermissions;
    }

    static async getPermissionRolesWithDetails(permissionUuid: string): Promise<Array<RolePermission & { role?: Role, permission?: Permission }>> {
        if (!permissionUuid) {
            throw new Error('Permission UUID is required');
        }

        const rolePermissions = await RolePermissionModel.findByPermissionUuid(permissionUuid);
        const detailedRolePermissions = [];

        for (const rp of rolePermissions) {
            const role = await RoleModel.findById(rp.role_uuid);
            const permission = await PermissionModel.findByUuid(rp.permission_uuid);

            detailedRolePermissions.push({
                ...rp,
                role,
                permission
            });
        }

        return detailedRolePermissions;
    }

    static async syncRolePermissions(roleUuid: string, permissionUuids: string[]): Promise<{ added: number, removed: number }> {
        if (!roleUuid) {
            throw new Error('Role UUID is required');
        }

        if (!Array.isArray(permissionUuids)) {
            throw new Error('Permission UUIDs must be an array');
        }

        const role = await RoleModel.findById(roleUuid);
        if (!role) {
            throw new Error('Role not found');
        }

        const currentRolePermissions = await RolePermissionModel.findByRoleUuid(roleUuid);
        const currentPermissionUuids = currentRolePermissions.map(rp => rp.permission_uuid);

        const permissionsToAdd = permissionUuids.filter(uuid => !currentPermissionUuids.includes(uuid));
        const permissionsToRemove = currentPermissionUuids.filter(uuid => !permissionUuids.includes(uuid));

        let addedCount = 0;
        let removedCount = 0;

        for (const permissionUuid of permissionsToAdd) {
            const permission = await PermissionModel.findByUuid(permissionUuid);
            if (!permission) {
                throw new Error(`Permission with UUID ${permissionUuid} not found`);
            }

            await RolePermissionModel.create({
                role_uuid: roleUuid,
                permission_uuid: permissionUuid
            });
            addedCount++;
        }

        for (const permissionUuid of permissionsToRemove) {
            const numDeleted = await RolePermissionModel.deleteByRoleAndPermissionUuid(roleUuid, permissionUuid);
            if (numDeleted > 0) {
                removedCount++;
            }
        }

        return { added: addedCount, removed: removedCount };
    }
}