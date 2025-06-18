import React from 'react';
import { Shield, Edit2, Trash2, Plus } from 'lucide-react';
import { EmptyState } from '../EmptyState';

export const PermissionsTab: React.FC<PermissionTabProps> = ({
    permissions,
    onCreatePermission,
    onEditPermission,
    onDeletePermission,
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Permissions ({permissions.length})</h2>
                <button
                    onClick={onCreatePermission}
                    className="bg-green-600 text-white dark:text-gray-100 px-4 py-2 rounded-sm hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Permission
                </button>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-sm rounded-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permission
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Display Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Scope
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
                        {permissions.map((permission) => (
                            <tr key={permission.uuid} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                    <div className="text-sm text-gray-500">{permission.description || '-'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{permission.displayName}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                        {permission.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                        {(permission.scope as string) || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${permission.isSystemPermission
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800 dark:text-gray-400'
                                        }`}>
                                        {permission.isSystemPermission ? 'System' : 'Custom'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => onEditPermission(permission)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        title="Edit Permission"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDeletePermission(permission.uuid)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete Permission"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {permissions.length === 0 && (
                    <EmptyState
                        icon={<Shield className="h-12 w-12" />}
                        title="No permissions found"
                        description="Get started by creating a new permission."
                        action={{ label: "Create Permission", onClick: onCreatePermission }}
                    />
                )}
            </div>
        </div>
    );
};