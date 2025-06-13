import * as Yup from 'yup'
import { Form, Formik } from 'formik'
import { Notify, Report } from 'notiflix'
import { HiOutlinePlus } from 'react-icons/hi'
import { Button, Modal } from '../../../components'
import FormInput from '../../../components/FormInput'
import FormWrapper from '../../../components/FormWrapper'
import usersService from '../../../services/users.service'
import { Fragment, useState } from 'react'
import type { ChangeEvent, FunctionComponent } from 'react'
import FormSelectBox from '../../../components/FormSelectBox'

interface User {
    uuid: string;
    fullname: string;
    username: string;
    password: string;
    repeatPassword?: string;
    status: string;
    role: string;
    permissions: string[];
}

interface UserFormModalProps {
    user?: User;
    isOpen?: boolean;
    onClose?: () => void;
    onUserSaved?: () => void;
}

const UserFormModal: FunctionComponent<UserFormModalProps> = ({
    user,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onUserSaved
}) => {

    console.log(user);


    const [isOpenForm, setIsOpenForm] = useState(false);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    const availablePermissions = [
        { id: 'sales', name: 'Process Sales', description: 'Create and process transactions' },
        { id: 'refunds', name: 'Process Refunds', description: 'Handle return transactions' },
        { id: 'inventory', name: 'Manage Inventory', description: 'Add/edit products and stock' },
        { id: 'reports', name: 'View Reports', description: 'Access sales and inventory reports' },
        { id: 'settings', name: 'Manage Settings', description: 'Modify system settings' },
        { id: 'users', name: 'Manage Users', description: 'Create and manage user accounts' }
    ];

    const rolePermissions = {
        admin: ['sales', 'refunds', 'inventory', 'reports', 'settings', 'users'],
        manager: ['sales', 'refunds', 'inventory', 'reports'],
        cashier: ['sales', 'refunds']
    };

    const roles = [
        {
            label: 'Cashier',
            value: 'cashier'
        },
        {
            label: 'Manager',
            value: 'manager'
        },
        {
            label: 'Admin',
            value: 'admin'
        },
    ];

    const initialUserValues: User = user ? {
        ...user,
        repeatPassword: ''
    } : {
        uuid: '',
        fullname: '',
        username: '',
        password: '',
        repeatPassword: '',
        status: 'active',
        role: '',
        permissions: ['sales', 'refunds']
    };

    const userValidationSchema = Yup.object().shape({
        uuid: Yup.string(),
        fullname: Yup.string()
            .required('Full name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name is too long'),
        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(20, 'Username is too long')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
        password: Yup.string()
            .when('uuid', {
                is: (uuid: string) => !uuid,
                then: () => Yup.string()
                    .required('Password is required')
                    .min(6, 'Password must be at least 6 characters'),
                otherwise: () => Yup.string().notRequired()
            }),
        repeatPassword: Yup.string()
            .when('password', {
                is: (val: string) => val && val.length > 0,
                then: () => Yup.string()
                    .required('Please confirm your password')
                    .oneOf([Yup.ref('password')], 'Passwords must match')
            }),
        role: Yup.string().required('Role is required'),
        permissions: Yup.array()
            .of(Yup.string())
            .min(1, 'At least one permission must be selected')
    });

    const handleSubmit = async (values: User, { resetForm }: any) => {
        try {
            const { repeatPassword, ...submitValues } = values;

            if (user && user.uuid) {
                await usersService.update(user.uuid, submitValues);
                Report.success("Updated!", "User details updated successfully!", "Ok");
            } else {
                await usersService.store(submitValues);
                Report.success("Great!", "User details saved!", "Ok");
            }

            resetForm();
            closeModal();

            if (onUserSaved) {
                onUserSaved();
            }
        } catch (error: any) {
            console.error('Error saving user:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the user';
            Notify.failure(errorMessage);
        }
    };

    const handleRoleChange = (role: string, setFieldValue: Function) => {
        setFieldValue('role', role);
        const newPermissions = rolePermissions[role as keyof typeof rolePermissions] || [];
        setFieldValue('permissions', newPermissions);
    };

    const handlePermissionToggle = (permissionId: string, currentPermissions: string[], setFieldValue: Function) => {
        const newPermissions = currentPermissions.includes(permissionId)
            ? currentPermissions.filter(p => p !== permissionId)
            : [...currentPermissions, permissionId];
        setFieldValue('permissions', newPermissions);
    };

    return (
        <Fragment>
            <Modal
                title={user ? 'Edit User Account' : 'Add User Account'}
                isOpen={isModalOpen}
                onClose={closeModal}
                className='max-w-lg bg-white text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
            >
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialUserValues}
                    validationSchema={userValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <FormInput
                                    type="text"
                                    name="fullname"
                                    label="Full Name"
                                    required
                                    placeholder="Enter full name"
                                />

                                <FormInput
                                    type="text"
                                    name="username"
                                    label="Username"
                                    required
                                    placeholder="Login Username"
                                />

                                <FormInput
                                    type="password"
                                    name="password"
                                    label={user ? "New Password (leave blank to keep current)" : "Password"}
                                    placeholder="Password"
                                    autoComplete="new-password"
                                    required={!user}
                                />

                                {(values.password || !user) && (
                                    <FormInput
                                        type="password"
                                        name="repeatPassword"
                                        label="Repeat Password"
                                        placeholder="Repeat Password"
                                        autoComplete="new-password"
                                        required={!!values.password}
                                    />
                                )}

                                <FormSelectBox
                                    label='Role'
                                    name='role'
                                    required
                                    options={roles}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                        handleRoleChange(e.target.value, setFieldValue);
                                    }}
                                />

                                {values?.role?.length > 0 && <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permissions <span className='text-red-500'>*</span>
                                    </label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {availablePermissions
                                            .filter(permission =>
                                                values.role ? rolePermissions[values.role as keyof typeof rolePermissions]?.includes(permission.id) : false
                                            )
                                            .map((permission) => (
                                                <div key={permission.id} className="flex flex-col items-start">
                                                    <label className="flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.permissions?.includes(permission.id) || false}
                                                            onChange={() => handlePermissionToggle(
                                                                permission.id,
                                                                values.permissions || [],
                                                                setFieldValue
                                                            )}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {permission.name}
                                                        </span>
                                                    </label>
                                                    <div className="ml-6 mt-1">
                                                        <div className="text-xs text-gray-500">
                                                            {permission.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    {(!values.permissions || values.permissions.length === 0) && (
                                        <div className="text-red-500 text-sm mt-1">
                                            At least one permission must be selected
                                        </div>
                                    )}
                                </div>}

                                <Button
                                    type="submit"
                                    block={true}
                                    loading={isSubmitting}
                                    disabled={!values.permissions || values.permissions.length === 0}
                                >
                                    {user ? 'Update User' : 'Create User'}
                                </Button>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    )
}

export default UserFormModal