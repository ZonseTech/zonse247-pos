import { FunctionComponent, useState } from "react";

export const RoleModal: FunctionComponent<{ role, onSave, onClose }> = ({ role, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: role?.name || '',
        description: role?.description || '',
        clientId: role?.clientId || '',
        shopId: role?.shopId || '',
        active: role?.active !== undefined ? role.active : true,
        isSystem: role?.isSystem || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-700">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {role ? 'Edit Role' : 'Create New Role'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter role name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter role description"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Client ID
                            </label>
                            <input
                                type="text"
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter client ID"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shop ID
                            </label>
                            <input
                                type="text"
                                value={formData.shopId}
                                onChange={(e) => setFormData({ ...formData, shopId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter shop ID"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.isSystem}
                                    onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">System Role</span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
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
                                {role ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}