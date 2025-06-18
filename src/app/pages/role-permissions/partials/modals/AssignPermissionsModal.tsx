import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { LoadingSpinner } from "../LoadingSpinner";
import roleService from "../../../../services/role.service";
import FormWrapper from '../../../../components/FormWrapper';
import { FunctionComponent, useEffect, useState } from "react";
import { Button, ModalFooter, Modal } from '../../../../components';

type Props = {
    role: Role;
    permissions: Permission[];
    isOpen: boolean;
    onAssign: (selectedPermissions: string[]) => void;
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
    const [loading, setLoading] = useState(true);

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
            const result = await roleService.getRolePermissions(role.uuid);

            const permissionIds = result?.data.map(p => p.uuid);
            setCurrentPermissions(permissionIds);
        } catch (err) {
            console.error('Failed to load current permissions:', err);
            Notify.failure('Failed to load current permissions');
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionToggle = (permissionId: string, values: FormValues, setFieldValue: any) => {
        let newSelected;
        const currentSelected = values.selectedPermissions;

        if (currentSelected.includes(permissionId)) {
            newSelected = currentSelected.filter(id => id !== permissionId);
        } else {
            newSelected = [...currentSelected, permissionId];
        }

        setFieldValue('selectedPermissions', newSelected);
    };

    const handleSelectAll = (setFieldValue: any) => {
        const allPermissionIds = permissions.map(p => p.uuid);
        setFieldValue('selectedPermissions', allPermissionIds);
    };

    const handleClearAll = (setFieldValue: any) => {
        setFieldValue('selectedPermissions', []);
    };

    const handleSubmit = async (values: FormValues) => {
        try {
            await onAssign(values.selectedPermissions);
            onClose();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            Notify.failure('Error assigning permissions: ' + errorMessage);
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
                title="Loading..."
                isOpen={isOpen}
                onClose={onClose}
                className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6'
            >
                <div className="flex justify-center py-8">
                    <LoadingSpinner />
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            title={`Assign Permissions to "${role.name}"`}
            isOpen={isOpen}
            onClose={onClose}
            className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto'
        >
            <div className="mb-4">
                <p className="text-sm text-gray-600 mt-1">
                    Select permissions to assign to this role
                </p>
            </div>

            <Formik
                initialValues={{ selectedPermissions: currentPermissions }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <FormWrapper>
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        {values.selectedPermissions.length} of {permissions.length} permissions selected
                                    </span>
                                    <div className="space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAll(setFieldValue)}
                                            className="text-sm text-green-600 hover:text-green-800"
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleClearAll(setFieldValue)}
                                            className="text-sm text-green-600 hover:text-green-800"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
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
                                                        key={permission.uuid}
                                                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={values.selectedPermissions.includes(permission.uuid)}
                                                            onChange={() => handlePermissionToggle(permission.uuid, values, setFieldValue)}
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
                                                                    {permission.scope as string}
                                                                </span>
                                                                {permission.isSystemPermission && (
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
                        </FormWrapper>

                        <ModalFooter className='mb-0 border-t mt-4'>
                            <div className="flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    layout="outline"
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={isSubmitting}
                                >
                                    Save Permissions
                                </Button>
                            </div>
                        </ModalFooter>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};