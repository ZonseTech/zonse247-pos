import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, Modal } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormWrapper from '../../../components/FormWrapper';
import FormSelectBox from '../../../components/FormSelectBox';
import usersService from '../../../services/users.service';
import workstationsService from '../../../services/workstation.service';
import shopsService from '../../../services/shop.service';
import { Fragment, useState, useEffect } from 'react';
import type { FunctionComponent } from 'react';
import { UserStatus } from '../index';
import roleService from '../../../services/role.service';

const UserFormModal: FunctionComponent<UserFormModalProps> = ({
    user,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onUserSaved
}) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [shops, setShops] = useState<ShopOptions[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);
    const [workstations, setWorkstations] = useState<string[]>([]);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    useEffect(() => {
        if (isModalOpen) {
            loadRoles();
            loadShops();
            loadWorkstations();
        }
    }, [isModalOpen]);

    const loadRoles = async () => {
        try {
            setLoadingRoles(true);
            const rolesData = await roleService.list();
            setRoles(rolesData);
        } catch (error) {
            console.error('Error loading roles:', error);
            Notify.failure('Failed to load roles');
        } finally {
            setLoadingRoles(false);
        }
    };

    const loadShops = async () => {
        try {
            setLoadingShops(true);
            const shopsData = await shopsService.list();
            setShops(shopsData.data);
        } catch (error) {
            console.error('Error loading shops:', error);
            Notify.failure('Failed to load shops');
        } finally {
            setLoadingShops(false);
        }
    };

    const loadWorkstations = async () => {
        try {
            const workstationsData = await workstationsService.list();
            setWorkstations(workstationsData.map(ws => ws.till_name + '-' + ws.till_number));
        } catch (error) {
            console.error('Error loading workstations:', error);
        }
    };

    const statusOptions = [
        { label: 'Active', value: UserStatus.ACTIVE },
        { label: 'Inactive', value: UserStatus.INACTIVE },
        { label: 'Suspended', value: UserStatus.SUSPENDED }
    ];

    const roleOptions = roles.map(role => ({
        label: role.name,
        value: role.uuid
    }));

    const shopOptions = shops.map(shop => ({
        label: shop.name,
        value: shop.uuid
    }));

    const initialUserValues = user ? {
        ...user,
        password: '',
    } : {
        uuid: '',
        clientId: '',
        shopId: '',
        username: '',
        password: '',
        fullname: '',
        email: '',
        phone: '',
        role_uuid: '',
        // permissions: [],
        status: UserStatus.ACTIVE,
        accessible_shops: [],
        allowed_workstations: [],
        max_discount_percent: 0,
        can_override_prices: false,
        pin_code: '',
        current_shopId: '',
        force_password_change: false
    };

    const userValidationSchema = Yup.object().shape({
        fullname: Yup.string()
            .required('Full name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username is too long')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
        email: Yup.string()
            .email('Invalid email format')
            .nullable(),
        phone: Yup.string()
            .matches(/^[\+]?[0-9\-\(\)\s]+$/, 'Invalid phone number format')
            .nullable(),
        password: Yup.string()
            .when('uuid', {
                is: (uuid: string) => !uuid,
                then: () => Yup.string()
                    .required('Password is required')
                    .min(6, 'Password must be at least 6 characters'),
                otherwise: () => Yup.string().notRequired()
            }),
        role_uuid: Yup.string().required('Role is required'),
        shopId: Yup.string().required('Shop is required'),
        status: Yup.string().required('Status is required'),
        max_discount_percent: Yup.number()
            .min(0, 'Discount percent cannot be negative')
            .max(100, 'Discount percent cannot exceed 100'),
        pin_code: Yup.string()
            .matches(/^[0-9]{4,6}$/, 'PIN must be 4-6 digits')
            .nullable()
    });

    const handleSubmit = async (values: User, { resetForm }: any) => {
        try {
            const submitValues = { ...values };

            // Remove empty password for updates
            if (user && user.uuid && !submitValues.password) {
                delete submitValues.password;
            }

            // Convert string arrays back to arrays for multi-select fields
            if (typeof submitValues.accessible_shops === 'string') {
                submitValues.accessible_shops = (submitValues.accessible_shops as string).split(',').filter(s => s.trim());
            }
            if (typeof submitValues.allowed_workstations === 'string') {
                submitValues.allowed_workstations = (submitValues.allowed_workstations as string).split(',').filter(s => s.trim());
            }

            if (user && user.uuid) {
                await usersService.update(user.uuid, submitValues);
                Report.success("Updated!", "User details updated successfully!", "Ok");
            } else {
                await usersService.store(submitValues);
                Report.success("Great!", "User created successfully!", "Ok");
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

    const handleShopAccessChange = (shopUuid: string, currentShops: string[], setFieldValue: Function) => {
        const newShops = currentShops.includes(shopUuid)
            ? currentShops.filter(s => s !== shopUuid)
            : [...currentShops, shopUuid];
        setFieldValue('accessible_shops', newShops);
    };

    const handleWorkstationChange = (workstation: string, currentWorkstations: string[], setFieldValue: Function) => {
        const newWorkstations = currentWorkstations.includes(workstation)
            ? currentWorkstations.filter(w => w !== workstation)
            : [...currentWorkstations, workstation];
        setFieldValue('allowed_workstations', newWorkstations);
    };

    return (
        <Fragment>
            <Modal
                title={user ? 'Edit User Account' : 'Create User Account'}
                isOpen={isModalOpen}
                onClose={closeModal}
                className='max-w-4xl bg-white dark:bg-gray-700 text-gray-700 rounded-2xl shadow-2xl p-6 transition-all transform duration-300'
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                                            Basic Information
                                        </h3>

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
                                            placeholder="Login username"
                                        />

                                        <FormInput
                                            type="email"
                                            name="email"
                                            label="Email Address"
                                            placeholder="user@example.com"
                                        />

                                        <FormInput
                                            type="tel"
                                            name="phone"
                                            label="Phone Number"
                                            placeholder="+1234567890"
                                        />

                                        <FormInput
                                            type="password"
                                            name="password"
                                            label={user ? "New Password (leave blank to keep current)" : "Password"}
                                            placeholder="Password"
                                            autoComplete="new-password"
                                            required={!user}
                                        />

                                        <FormInput
                                            type="text"
                                            name="pin_code"
                                            label="PIN Code (4-6 digits)"
                                            placeholder="1234"
                                            maxLength={6}
                                        />
                                    </div>

                                    {/* Role and Access */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                                            Role & Access
                                        </h3>

                                        <FormSelectBox
                                            label='Role'
                                            name='role_uuid'
                                            required
                                            options={roleOptions}
                                            disabled={loadingRoles}
                                        />

                                        <FormSelectBox
                                            label='Primary Shop'
                                            name='shopId'
                                            required
                                            options={shopOptions}
                                            disabled={loadingShops}
                                        />

                                        <FormSelectBox
                                            label='Status'
                                            name='status'
                                            required
                                            options={statusOptions}
                                        />

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Max Discount Percentage
                                            </label>
                                            <FormInput
                                                type="number"
                                                name="max_discount_percent"
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="can_override_prices"
                                                checked={values.can_override_prices || false}
                                                onChange={(e) => setFieldValue('can_override_prices', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="can_override_prices" className="text-sm font-medium text-gray-700">
                                                Can Override Prices
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="force_password_change"
                                                checked={values.force_password_change || false}
                                                onChange={(e) => setFieldValue('force_password_change', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="force_password_change" className="text-sm font-medium text-gray-700">
                                                Force Password Change on Next Login
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Shop Access */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2 mb-4">
                                        Shop Access
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {shops.map((shop) => (
                                            <div key={shop.uuid} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`shop-${shop.uuid}`}
                                                    checked={(values.accessible_shops || []).includes(shop.uuid)}
                                                    onChange={() => handleShopAccessChange(
                                                        shop.uuid,
                                                        values.accessible_shops || [],
                                                        setFieldValue
                                                    )}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                />
                                                <label htmlFor={`shop-${shop.uuid}`} className="text-sm text-gray-700">
                                                    {shop.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Workstation Access */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2 mb-4">
                                        Allowed Workstations
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                        {workstations.map((workstation) => (
                                            <div key={workstation} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`workstation-${workstation}`}
                                                    checked={(values.allowed_workstations || []).includes(workstation)}
                                                    onChange={() => handleWorkstationChange(
                                                        workstation,
                                                        values.allowed_workstations || [],
                                                        setFieldValue
                                                    )}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                />
                                                <label htmlFor={`workstation-${workstation}`} className="text-sm text-gray-700">
                                                    {workstation}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-6 pt-4 border-t">
                                    <Button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white dark:text-gray-100 rounded-lg hover:bg-blue-700"
                                    >
                                        {user ? 'Update User' : 'Create User'}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </Fragment>
    );
};

export default UserFormModal;