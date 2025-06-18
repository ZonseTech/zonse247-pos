import { useState, useEffect, type FC } from 'react';
import rolePermissionService from '../../../../services/role-permission.service';
import { Shield } from 'lucide-react';
import { LoadingSpinner } from '../LoadingSpinner';

export const AssignmentsTab: FC<AssignmentTabProps> = ({
    roles,
    permissions,
    onBulkAssign,
}) => {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadRolePermissions = async (roleUuid: string): Promise<void> => {
        setLoading(true);
        try {
            const rolePermissionData = await rolePermissionService.getByRoleUuid(roleUuid);
            const permissionUuids = rolePermissionData.map(rp => rp.permissionUuid);
            const assignedPermissions = permissions.filter(p => permissionUuids.includes(p.uuid));
            setRolePermissions(assignedPermissions);
        } catch (err) {
            console.error('Failed to load role permissions:', err);
            setRolePermissions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedRole) {
            loadRolePermissions(selectedRole);
        } else {
            setRolePermissions([]);
        }
    }, [selectedRole, permissions]);

    return (
        <div>
            <div className="mb-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Permission Assignments</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">Choose a role...</option>
                        {roles.map(role => (
                            <option key={role.uuid} value={role.uuid}>{role.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedRole && (
                <div className="bg-white dark:bg-gray-700 shadow-sm rounded-sm px-0 py-6">
                    {loading ? (
                        <LoadingSpinner />
                    ) : (
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Assigned Permissions ({rolePermissions.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rolePermissions.map(permission => (
                                    <div key={permission.uuid} className="border rounded-sm p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">{permission.name}</h4>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Assigned
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                                        <div className="flex gap-2">
                                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                {permission.category}
                                            </span>
                                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                                {permission.scope as string}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {rolePermissions.length === 0 && (
                                <div className="text-center py-8">
                                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No permissions assigned</h3>
                                    <p className="mt-1 text-sm text-gray-500">This role has no permissions assigned yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}