import React from 'react';
import { Users, Settings, Edit2, Trash2, Plus } from 'lucide-react';
import { EmptyState } from '../EmptyState';

export const RolesTab: React.FC<RoleTabProps> = ({
    roles,
    onCreateRole,
    onEditRole,
    onDeleteRole,
    onAssignPermissions,
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Roles ({roles.length})</h2>
                <button
                    onClick={onCreateRole}
                    className="bg-green-500 text-white dark:text-gray-100 px-4 py-2 rounded-sm hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Role
                </button>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-sm rounded-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Display Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200">
                        {roles.map((role) => (
                            <tr key={role.roleId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 uppercase">{role.displayName}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500">{role.description || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {role.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${role.isSystemRole
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800 dark:text-gray-400'
                                        }`}>
                                        {role.isSystemRole ? 'System' : 'Custom'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onAssignPermissions(role)}
                                        disabled={role.isSystemRole}
                                        className={`${role.isSystemRole ? 'text-gray-400' : 'text-green-500 hover:text-green-900'} mr-3`}
                                        title="Assign Permissions"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onEditRole(role)}
                                        disabled={role.isSystemRole}
                                        className={`${role.isSystemRole ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-900'} mr-3`}
                                        title="Edit Role"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => onDeleteRole(role.roleId)}
                                        disabled={role.isSystemRole}
                                        className={`${role.isSystemRole ? 'text-gray-400' : 'text-red-500 hover:text-red-900'}`}
                                        title="Delete Role"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {roles.length === 0 && (
                    <EmptyState
                        icon={<Users className="h-12 w-12" />}
                        title="No roles found"
                        description="Get started by creating a new role."
                        action={{ label: "Create Role", onClick: onCreateRole }}
                    />
                )}
            </div>
        </div>
    );
};