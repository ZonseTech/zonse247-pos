import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { LoadingSpinner } from "../LoadingSpinner";
import rolePermissionService from "../../../../services/role-permission.service";
import FormWrapper from '../../../../components/FormWrapper';
import { FunctionComponent, useEffect, useState } from "react";
import { Button, ModalFooter, Modal } from '../../../../components';
import { getErrorMessage } from '../../../../utils/api-error-handler';

type Props = {
    role: Role;
    permissions: Permission[];
    isOpen: boolean;
    onAssign: (selectedPermissions: string[]) => Promise<void>;
    onClose: () => void;
}

type FormValues = {
    selectedPermissions: string[];
};

export const AssignPermissionsModal: FunctionComponent<Props> = ({
    role,
    permissions,
    isOpen,
    onAssign,
    onClose
}) => {
    const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
    const [rolePermissionMappings, setRolePermissionMappings] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);
    const [savingPermissions, setSavingPermissions] = useState<Set<string>>(new Set());

    const initialValues: FormValues = {
        selectedPermissions: currentPermissions,
    };

    const validationSchema = Yup.object({
        selectedPermissions: Yup.array().of(Yup.string()),
    });

    useEffect(() => {
        if (role && isOpen) {
            loadCurrentPermissions();
        }
    }, [role, isOpen]);

    const loadCurrentPermissions = async () => {
        setLoading(true);
        try {
            const result = await rolePermissionService.getByRoleUuid(role.roleId);
            const rolePermissions = result?.data || [];

            const permissionIds: string[] = [];
            const mappings = new Map<string, string>();

            rolePermissions.forEach(rp => {
                const permissionId = rp.permissionId;
                if (permissionId) {
                    permissionIds.push(permissionId);
                    mappings.set(permissionId, rp.rolePermissionId);
                }
            });

            setCurrentPermissions(permissionIds);
            setRolePermissionMappings(mappings);
        } catch (err) {
            console.error('Failed to load current permissions:', err);
            Notify.failure('Failed to load current permissions');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = async (permissionId: string, values: FormValues, setFieldValue: any) => {
        const isCurrentlySelected = values.selectedPermissions.includes(permissionId);
        const permission = permissions.find(p => p.permissionId === permissionId);

        if (!permission) {
            Notify.failure('Permission not found');
            return;
        }

        setSavingPermissions(prev => new Set(prev).add(permissionId));

        try {
            if (isCurrentlySelected) {
                const rolePermissionId = rolePermissionMappings.get(permissionId);
                if (!rolePermissionId) {
                    throw new Error('Role-permission relationship not found');
                }

                await rolePermissionService.delete(rolePermissionId);

                const newSelected = values.selectedPermissions.filter(id => id !== permissionId);
                setFieldValue('selectedPermissions', newSelected);
                setCurrentPermissions(newSelected);

                const newMappings = new Map(rolePermissionMappings);
                newMappings.delete(permissionId);
                setRolePermissionMappings(newMappings);

                Notify.success(`Permission "${permission.name}" removed from role "${role.name}"`);
            } else {
                const response = await rolePermissionService.create({
                    roleId: role.roleId,
                    permissionId: permissionId
                });

                const newSelected = [...values.selectedPermissions, permissionId];
                setFieldValue('selectedPermissions', newSelected);
                setCurrentPermissions(newSelected);

                const newMappings = new Map(rolePermissionMappings);
                newMappings.set(permissionId, response.data?.rolePermissionId || response.data?.id);
                setRolePermissionMappings(newMappings);

                Notify.success(`Permission "${permission.name}" assigned to role "${role.name}"`);
            }

        } catch (error) {
            console.error('Error updating permission:', error);
            const action = isCurrentlySelected ? 'removing' : 'assigning';
            Notify.failure(`Error ${action} permission: ${getErrorMessage(error, 'An unknown error occurred')}`);
        } finally {
            setSavingPermissions(prev => {
                const newSet = new Set(prev);
                newSet.delete(permissionId);
                return newSet;
            });
        }
    };

    const handleSelectAll = async (setFieldValue: any, currentSelected: string[]) => {
        const allPermissionIds = permissions.map(p => p.permissionId);
        const permissionsToAdd = allPermissionIds.filter(id => !currentSelected.includes(id));

        if (permissionsToAdd.length === 0) {
            Notify.info('All permissions are already assigned');
            return;
        }

        try {
            await rolePermissionService.bulkAssign({
                roleId: role.roleId,
                permissionIds: permissionsToAdd
            });

            setFieldValue('selectedPermissions', allPermissionIds);
            setCurrentPermissions(allPermissionIds);

            await loadCurrentPermissions();

            Notify.success(`${permissionsToAdd.length} permissions assigned successfully`);
        } catch (error) {
            console.error('Error assigning all permissions:', error);
            Notify.failure(getErrorMessage(error, 'Error assigning all permissions'));
        }
    };

    const handleClearAll = async (setFieldValue: any, currentSelected: string[]) => {
        if (currentSelected.length === 0) {
            Notify.info('No permissions to remove');
            return;
        }

        try {
            const rolePermissionIds = currentSelected
                .map(permissionId => rolePermissionMappings.get(permissionId))
                .filter(id => id !== undefined);

            if (rolePermissionIds.length !== currentSelected.length) {
                throw new Error('Some role-permission relationships not found');
            }

            await Promise.all(rolePermissionIds.map(id => rolePermissionService.delete(id)));

            setFieldValue('selectedPermissions', []);
            setCurrentPermissions([]);
            setRolePermissionMappings(new Map());

            Notify.success(`${currentSelected.length} permissions removed successfully`);
        } catch (error) {
            console.error('Error removing all permissions:', error);
            Notify.failure(getErrorMessage(error, 'Error removing all permissions'));
        }
    };

    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);

    if (loading) {
        return (
            <Modal
                title="Loading permissions..."
                isOpen={isOpen}
                onClose={onClose}
                className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6'
            >
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600">Loading current role permissions...</span>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            title={`Manage Permissions for "${role.name}"`}
            isOpen={isOpen}
            onClose={onClose}
            className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto'
        >
            <div className="mb-4">
                <p className="text-sm text-gray-600 mt-1">
                    Toggle permissions to assign or remove them from this role. Changes are saved automatically.
                </p>
            </div>

            <Formik
                initialValues={{ selectedPermissions: currentPermissions }}
                validationSchema={validationSchema}
                onSubmit={() => { }}
                enableReinitialize={true}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <FormWrapper>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        {values.selectedPermissions.length} of {permissions.length} permissions assigned
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAll(setFieldValue, values.selectedPermissions)}
                                            className="text-sm text-green-500 hover:text-green-800 disabled:opacity-50"
                                            disabled={savingPermissions.size > 0}
                                        >
                                            Assign All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleClearAll(setFieldValue, values.selectedPermissions)}
                                            className="text-sm text-red-500 hover:text-red-800 disabled:opacity-50"
                                            disabled={savingPermissions.size > 0}
                                        >
                                            Remove All
                                        </button>
                                    </div>
                                </div>

                                {savingPermissions.size > 0 && (
                                    <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span className="text-sm text-sky-800">
                                                Updating {savingPermissions.size} permission(s)...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                        <div key={category} className="border rounded-lg p-4">
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm mr-2">
                                                    {category}
                                                </span>
                                                <span className="text-sm font-normal text-gray-500">
                                                    ({categoryPermissions.filter(p => values.selectedPermissions.includes(p.permissionId)).length}/{categoryPermissions.length} assigned)
                                                </span>
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {categoryPermissions.map(permission => {
                                                    const isBeingSaved = savingPermissions.has(permission.permissionId);
                                                    const isAssigned = values.selectedPermissions.includes(permission.permissionId);

                                                    return (
                                                        <label
                                                            key={permission.permissionId}
                                                            className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${isBeingSaved
                                                                ? 'bg-gray-100 opacity-75'
                                                                : isAssigned
                                                                    ? 'hover:bg-green-50 border-green-200'
                                                                    : 'hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            <div className="relative">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isAssigned}
                                                                    onChange={() => handlePermissionToggle(permission.permissionId, values, setFieldValue)}
                                                                    disabled={isBeingSaved}
                                                                    className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-500 disabled:opacity-50"
                                                                />
                                                                {isBeingSaved && (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <div className="w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {permission.name}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {permission.description}
                                                                </div>
                                                                <div className="flex gap-1 mt-2">
                                                                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                                                        {permission.scope as string}
                                                                    </span>
                                                                    {permission.isSystemPermission && (
                                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                                                            System
                                                                        </span>
                                                                    )}
                                                                    {isAssigned && (
                                                                        <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                                                                            Assigned
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </FormWrapper>

                        <ModalFooter className='mb-0 border-t mt-4'>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    All changes are saved automatically
                                </span>
                                <Button
                                    type="button"
                                    layout="outline"
                                    onClick={onClose}
                                    disabled={savingPermissions.size > 0}
                                >
                                    {savingPermissions.size > 0 ? 'Saving...' : 'Close'}
                                </Button>
                            </div>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};