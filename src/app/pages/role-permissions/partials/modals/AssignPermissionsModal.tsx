import { FunctionComponent, useEffect, useState } from "react";
import roleService from "../../../../services/role.service";
import { LoadingSpinner } from "../LoadingSpinner";

export const AssignPermissionsModal: FunctionComponent<{ role, permissions, onAssign, onClose }> = ({ role, permissions, onAssign, onClose }) => {
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [currentPermissions, setCurrentPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCurrentPermissions();
    }, [role]);

    const loadCurrentPermissions = async () => {
        try {
            const data = await roleService.getRolePermissions(role.id);
            const permissionIds = data.map(p => p.id);
            setCurrentPermissions(permissionIds);
            setSelectedPermissions(permissionIds);
        } catch (err) {
            console.error('Failed to load current permissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permissionId)) {
                return prev.filter(id => id !== permissionId);
            } else {
                return [...prev, permissionId];
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAssign(selectedPermissions);
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {});

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Assign Permissions to "{role.name}"
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Select permissions to assign to this role
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-medium text-gray-700">
                                {selectedPermissions.length} of {permissions.length} permissions selected
                            </span>
                            <div className="space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedPermissions(permissions.map(p => p.id))}
                                    className="text-sm text-green-600 hover:text-green-800"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPermissions([])}
                                    className="text-sm text-green-600 hover:text-green-800"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(groupedPermissions).map(([category, categoryPermissions]: any) => (
                                <div key={category} className="border rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">
                                            {category}
                                        </span>
                                        <span className="text-sm font-normal text-gray-500">
                                            ({categoryPermissions.length} permissions)
                                        </span>
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {categoryPermissions.map(permission => (
                                            <label
                                                key={permission.id}
                                                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={() => handlePermissionToggle(permission.id)}
                                                    className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {permission.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {permission.description}
                                                    </div>
                                                    <div className="flex gap-1 mt-2">
                                                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                                            {permission.scope}
                                                        </span>
                                                        {permission.isSystem && (
                                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                System
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white dark:text-gray-100 bg-green-600 border border-transparent rounded-lg hover:bg-green-700"
                        >
                            Save Permissions
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}