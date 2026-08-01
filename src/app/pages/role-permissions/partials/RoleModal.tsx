import * as Yup from 'yup';
import { Notify } from 'notiflix';
import { Form, Formik } from 'formik';
import { FunctionComponent, useEffect, useState } from 'react';
import { Shield, X, Lock } from 'lucide-react';
import { Box, Flex, Text, Badge, Button, Checkbox, ScrollArea, Spinner, Theme } from '@radix-ui/themes';
import * as Dialog from '@radix-ui/react-dialog';
import * as Separator from '@radix-ui/react-separator';
import FormWrapper from '../../../components/FormWrapper';
import FormInput from '../../../components/FormInput';
import FormTextArea from '../../../components/FormTextArea';
import TextInput from '../../../components/TextInput';
import BranchSearch from '../../terminal/partials/BranchSearch';
import { useAuth } from '../../../context/AuthProvider';
import rolePermissionService from '../../../services/role-permission.service';
import { getErrorMessage } from '../../../utils/api-error-handler';

type Props = {
    role?: Role;
    permissions: Permission[];
    isOpen: boolean;
    onSave: (formData: any) => void;
    onClose: () => void;
}

const RoleModal: FunctionComponent<Props> = ({ role, permissions, isOpen, onSave, onClose }) => {
    const isEditing = !!role;
    const isReadOnly = !!role?.isSystemRole;
    const { user } = useAuth();

    const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
    const [rolePermissionMappings, setRolePermissionMappings] = useState<Map<string, string>>(new Map());
    const [loadingPermissions, setLoadingPermissions] = useState(true);
    const [savingPermissions, setSavingPermissions] = useState<Set<string>>(new Set());

    const initialValues = {
        name: role?.name || '',
        displayName: role?.displayName || '',
        description: role?.description || '',
        tenantId: role?.tenantId || user?.tenantId || '',
        branchId: role?.branchId || '',
        isActive: role?.isActive !== undefined ? role.isActive : true,
        isSystemRole: role?.isSystemRole || false,
    };

    const roleValidationSchema = Yup.object({
        name: Yup.string()
            .required('Role name is required')
            .min(2, 'Role name must be at least 2 characters')
            .matches(/^[a-z_]+$/, 'Role name must contain only lowercase letters and underscores'),

        displayName: Yup.string()
            .required('Role display name is required')
            .min(2, 'Role display name must be at least 2 characters'),

        description: Yup.string()
            .max(500, 'Description cannot exceed 500 characters'),

        tenantId: Yup.string(),

        branchId: isEditing
            ? Yup.string()
            : Yup.string().required('Branch is required'),

        isActive: Yup.boolean(),

        isSystemRole: Yup.boolean(),
    });

    useEffect(() => {
        if (role && isOpen) {
            loadCurrentPermissions();
        } else {
            setCurrentPermissions([]);
            setRolePermissionMappings(new Map());
        }
    }, [role, isOpen]);

    const loadCurrentPermissions = async () => {
        if (!role) return;
        setLoadingPermissions(true);
        try {
            const result = await rolePermissionService.getByRoleUuid(role.roleId);
            const rawData = result?.data;
            const rolePermissions: RolePermission[] = Array.isArray(rawData)
                ? rawData
                : Array.isArray((rawData as any)?.rolePermissions)
                    ? (rawData as any).rolePermissions
                    : Array.isArray(result)
                        ? result as any
                        : [];

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
            setLoadingPermissions(false);
        }
    };

    const handlePermissionToggle = async (permissionId: string) => {
        if (!role || isReadOnly) return;

        const isCurrentlySelected = currentPermissions.includes(permissionId);
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

                setCurrentPermissions(prev => prev.filter(id => id !== permissionId));
                const newMappings = new Map(rolePermissionMappings);
                newMappings.delete(permissionId);
                setRolePermissionMappings(newMappings);

                Notify.success(`Permission "${permission.name}" removed from role "${role.name}"`);
            } else {
                const response = await rolePermissionService.create({
                    roleId: role.roleId,
                    permissionId: permissionId
                });

                setCurrentPermissions(prev => [...prev, permissionId]);
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

    const handleSelectAll = async () => {
        if (!role) return;
        const allPermissionIds = permissions.map(p => p.permissionId);
        const permissionsToAdd = allPermissionIds.filter(id => !currentPermissions.includes(id));

        if (permissionsToAdd.length === 0) {
            Notify.info('All permissions are already assigned');
            return;
        }

        try {
            await rolePermissionService.bulkAssign({
                roleId: role.roleId,
                permissionIds: permissionsToAdd
            });

            await loadCurrentPermissions();
            Notify.success(`${permissionsToAdd.length} permissions assigned successfully`);
        } catch (error) {
            console.error('Error assigning all permissions:', error);
            Notify.failure(getErrorMessage(error, 'Error assigning all permissions'));
        }
    };

    const handleClearAll = async () => {
        if (currentPermissions.length === 0) {
            Notify.info('No permissions to remove');
            return;
        }

        try {
            const rolePermissionIds = currentPermissions
                .map(permissionId => rolePermissionMappings.get(permissionId))
                .filter(id => id !== undefined);

            await Promise.all(rolePermissionIds.map(id => rolePermissionService.delete(id)));

            setCurrentPermissions([]);
            setRolePermissionMappings(new Map());

            Notify.success(`${rolePermissionIds.length} permissions removed successfully`);
        } catch (error) {
            console.error('Error removing all permissions:', error);
            Notify.failure(getErrorMessage(error, 'Error removing all permissions'));
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            await onSave(values);
            onClose();
        } catch (error) {
            const errorMessage = getErrorMessage(error, 'An unknown error occurred');
            Notify.failure('Error saving role: ' + errorMessage);
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

    return (
        <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Theme appearance="inherit" accentColor="cyan">
                    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
                    <Dialog.Content
                        className={`fixed z-50 bg-white dark:bg-gray-800 shadow-2xl flex flex-col overflow-hidden
                                   bottom-0 left-0 right-0 rounded-t-2xl max-h-[90vh]
                                   sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                                   sm:rounded-2xl sm:w-[calc(100%-2rem)] ${isEditing ? 'sm:max-w-4xl' : 'sm:max-w-md'} sm:max-h-[85vh]
                                   data-[state=open]:animate-in data-[state=closed]:animate-out
                                   data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
                                   data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95
                                   data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=closed]:zoom-out-95
                                   duration-200`}
                    >
                        <div className="flex justify-center sm:hidden pt-2">
                            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        <Flex
                            justify="between"
                            align="center"
                            px="4"
                            py="3"
                            className="border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
                        >
                            <Flex align="center" gap="3">
                                <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                                    <Shield className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                                </div>
                                <Box>
                                    <Dialog.Title asChild>
                                        <Text size="3" weight="bold" as="p">
                                            {!isEditing ? 'Create New Role' : isReadOnly ? `${role.displayName} (System Role)` : `Edit ${role.displayName}`}
                                        </Text>
                                    </Dialog.Title>
                                    {isReadOnly && (
                                        <Text size="1" color="gray" as="p">
                                            System roles are read-only and can't be modified.
                                        </Text>
                                    )}
                                </Box>
                            </Flex>
                            <Dialog.Close asChild>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </Dialog.Close>
                        </Flex>

                        <ScrollArea scrollbars="vertical" className="flex-1">
                            <Box p="4">
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={roleValidationSchema}
                                    onSubmit={handleSubmit}
                                    enableReinitialize={true}
                                >
                                    {({ isSubmitting, values, errors, touched, setFieldValue }) => (
                                        <Form>
                                            <FormWrapper>
                                                <Flex gap="2">
                                                    <TextInput
                                                        label="Role Name"
                                                        name="name"
                                                        required
                                                        disabled={isReadOnly}
                                                        placeholder="e.g. branch_manager"
                                                    />

                                                    <TextInput
                                                        label="Display Name"
                                                        name="displayName"
                                                        required
                                                        disabled={isReadOnly}
                                                        placeholder="Enter display name"
                                                    />
                                                </Flex>

                                                <FormTextArea
                                                    label="Description"
                                                    id="description"
                                                    name="description"
                                                    disabled={isReadOnly}
                                                    placeholder="Enter role description"
                                                    className="mt-1"
                                                    rows={3}
                                                />

                                                <BranchSearch
                                                    value={values.branchId}
                                                    onChange={(branchId) => setFieldValue('branchId', branchId)}
                                                    tenantId={values.tenantId}
                                                    error={errors.branchId as string}
                                                    touched={touched.branchId as boolean}
                                                    disabled={isReadOnly}
                                                    required={!isEditing}
                                                    label="Branch"
                                                    placeholder={isEditing ? 'Leave blank for a tenant-wide role' : 'Select a branch'}
                                                />
                                                <Text size="1" color="gray" as="p" mt="-2">
                                                    {!isEditing
                                                        ? 'Custom roles must be assigned to a branch.'
                                                        : values.branchId
                                                            ? 'This role only applies within the selected branch.'
                                                            : 'No branch selected — this role applies across the whole tenant.'}
                                                </Text>

                                                <Flex gap="4">
                                                    <FormInput
                                                        type='checkbox'
                                                        label="Active"
                                                        name="isActive"
                                                        disabled={isReadOnly}
                                                        className="mt-1"
                                                    />

                                                    <FormInput
                                                        type='checkbox'
                                                        label="System Role"
                                                        name="isSystemRole"
                                                        disabled
                                                        className="mt-1"
                                                    />
                                                </Flex>
                                            </FormWrapper>

                                            {!isReadOnly && (
                                                <Box pt="4" mt="4" className="border-t border-gray-200 dark:border-gray-700">
                                                    <Flex gap="3">
                                                        <Dialog.Close asChild>
                                                            <Button
                                                                type="button"
                                                                variant="soft"
                                                                color="gray"
                                                                style={{ flex: 1 }}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </Dialog.Close>
                                                        <Button
                                                            type="submit"
                                                            variant="solid"
                                                            loading={isSubmitting}
                                                            style={{ flex: 2 }}
                                                        >
                                                            {isEditing ? 'Update' : 'Create'}
                                                        </Button>
                                                    </Flex>
                                                </Box>
                                            )}
                                        </Form>
                                    )}
                                </Formik>

                                {isEditing && (
                                    <>
                                        <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700 my-5" />

                                        <Flex justify="between" align="center" mb="3" wrap="wrap" gap="2">
                                            <Flex align="center" gap="2">
                                                <Text size="3" weight="bold">Permissions</Text>
                                                {!loadingPermissions && (
                                                    <Text size="2" color="gray">
                                                        {currentPermissions.length} of {permissions.length} assigned
                                                    </Text>
                                                )}
                                            </Flex>
                                            {!isReadOnly && !loadingPermissions && (
                                                <Flex gap="3">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        color="green"
                                                        size="1"
                                                        onClick={handleSelectAll}
                                                        disabled={savingPermissions.size > 0}
                                                    >
                                                        Assign All
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        color="red"
                                                        size="1"
                                                        onClick={handleClearAll}
                                                        disabled={savingPermissions.size > 0}
                                                    >
                                                        Remove All
                                                    </Button>
                                                </Flex>
                                            )}
                                        </Flex>

                                        {isReadOnly && (
                                            <Flex align="center" gap="2" mb="4" p="3" className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <Lock className="w-4 h-4 text-gray-400" />
                                                <Text size="2" color="gray">
                                                    Viewing only — system role permissions can't be changed here.
                                                </Text>
                                            </Flex>
                                        )}

                                        {loadingPermissions ? (
                                            <Flex align="center" justify="center" py="8" gap="3">
                                                <Spinner size="3" />
                                                <Text size="2" color="gray">Loading permissions...</Text>
                                            </Flex>
                                        ) : (
                                            <>
                                                {savingPermissions.size > 0 && (
                                                    <Flex align="center" gap="2" mb="4" p="3" className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                                                        <Spinner size="1" />
                                                        <Text size="2" className="text-sky-800 dark:text-sky-300">
                                                            Updating {savingPermissions.size} permission(s)...
                                                        </Text>
                                                    </Flex>
                                                )}

                                                <Flex direction="column" gap="4">
                                                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                                        <Box key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                            <Flex align="center" gap="2" mb="3">
                                                                <Badge color="purple" variant="soft">{category}</Badge>
                                                                <Text size="2" color="gray">
                                                                    ({categoryPermissions.filter(p => currentPermissions.includes(p.permissionId)).length}/{categoryPermissions.length} assigned)
                                                                </Text>
                                                            </Flex>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                {categoryPermissions.map(permission => {
                                                                    const isBeingSaved = savingPermissions.has(permission.permissionId);
                                                                    const isAssigned = currentPermissions.includes(permission.permissionId);

                                                                    return (
                                                                        <label
                                                                            key={permission.permissionId}
                                                                            className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isBeingSaved
                                                                                ? 'bg-gray-100 dark:bg-gray-700/50 opacity-75'
                                                                                : isAssigned
                                                                                    ? 'hover:bg-green-50 dark:hover:bg-green-900/10 border-green-200 dark:border-green-800'
                                                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                                                                }`}
                                                                        >
                                                                            <Box className="relative mt-0.5">
                                                                                <Checkbox
                                                                                    checked={isAssigned}
                                                                                    onCheckedChange={() => handlePermissionToggle(permission.permissionId)}
                                                                                    disabled={isBeingSaved || isReadOnly}
                                                                                />
                                                                                {isBeingSaved && (
                                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                                        <Spinner size="1" />
                                                                                    </div>
                                                                                )}
                                                                            </Box>
                                                                            <Box className="flex-1 min-w-0">
                                                                                <Text size="2" weight="medium" as="p">
                                                                                    {permission.name}
                                                                                </Text>
                                                                                <Text size="1" color="gray" as="p" mt="1">
                                                                                    {permission.description}
                                                                                </Text>
                                                                                <Flex gap="1" mt="2" wrap="wrap">
                                                                                    <Badge color="orange" variant="soft" size="1">
                                                                                        {permission.scope as string}
                                                                                    </Badge>
                                                                                    {permission.isSystemPermission && (
                                                                                        <Badge color="green" variant="soft" size="1">
                                                                                            System
                                                                                        </Badge>
                                                                                    )}
                                                                                    {isAssigned && (
                                                                                        <Badge color="sky" variant="soft" size="1">
                                                                                            Assigned
                                                                                        </Badge>
                                                                                    )}
                                                                                </Flex>
                                                                            </Box>
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </Box>
                                                    ))}
                                                </Flex>
                                            </>
                                        )}
                                    </>
                                )}
                            </Box>
                        </ScrollArea>
                    </Dialog.Content>
                </Theme>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default RoleModal;
