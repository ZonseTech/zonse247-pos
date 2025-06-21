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
import roleService from '../../../services/role.service';
import { UserStatus } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthProvider';
import clientsService from '../../../services/client.service';

const UserFormModal: FunctionComponent<UserFormModalProps> = ({
    user,
    isOpen: externalIsOpen,
    onClose: externalOnClose,
    onUserSaved
}) => {
    const auth = useAuth()
    const [roles, setRoles] = useState<Role[]>([]);
    const [isOpenForm, setIsOpenForm] = useState(false);
    const [shops, setShops] = useState<ShopOptions[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingClients, setLoadingClients] = useState(true);
    const [loadingShops, setLoadingShops] = useState(true);
    const [workstations, setWorkstations] = useState<string[]>([]);

    const isModalOpen = externalIsOpen !== undefined ? externalIsOpen : isOpenForm;
    const closeModal = externalOnClose || (() => setIsOpenForm(false));

    useEffect(() => {
        if (isModalOpen) {
            loadRoles();
            loadClients();
            loadShops();
            loadWorkstations();
        }
    }, [isModalOpen]);

    const loadRoles = async () => {
        try {
            setLoadingRoles(true);
            const roles = await roleService.list();
            setRoles(roles.data);
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

    const loadClients = async () => {
        try {
            setLoadingClients(true);
            const clientsData = await clientsService.list();
            setClients(clientsData);
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
            setWorkstations(workstationsData.map(ws => ws.tillName + '-' + ws.tillNumber));
        } catch (error) {
            console.error('Error loading workstations:', error);
        }
    };

    const transformServerErrors = (serverErrors: any[]) => {
        if (!Array.isArray(serverErrors)) return {};

        return serverErrors.reduce((acc, error) => {
            if (error.field && error.message) {
                acc[error.field] = error.message;
            }
            return acc;
        }, {});
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

    const clientOptions = clients.map(client => ({
        label: client.companyName,
        value: client.uuid
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
        roleUuid: '',
        status: UserStatus.ACTIVE,
        accessibleShops: [],
        allowedWorkstations: [],
        maxDiscountPercent: 0,
        canOverridePrices: false,
        pinCode: '',
        currentShopId: '',
        forcePasswordChange: false
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
        roleUuid: Yup.string().required('Role is required'),
        shopId: Yup.string().required('Shop is required'),
        status: Yup.string().required('Status is required'),
        maxDiscountPercent: Yup.number()
            .min(0, 'Discount percent cannot be negative')
            .max(100, 'Discount percent cannot exceed 100'),
        pinCode: Yup.string()
            .matches(/^[0-9]{4,6}$/, 'PIN must be 4-6 digits')
            .nullable()
    });

    const handleSubmit = async (values: User, { resetForm, setErrors, setStatus }) => {
        try {
            const submitValues = { ...values, userId: auth.user.uuid };

            if (user && user.uuid && !submitValues.password) {
                delete submitValues.password;
            }

            if (typeof submitValues.accessibleShops === 'string') {
                submitValues.accessibleShops = (submitValues.accessibleShops as string).split(',').filter(s => s.trim());
            }
            if (typeof submitValues.allowedWorkstations === 'string') {
                submitValues.allowedWorkstations = (submitValues.allowedWorkstations as string).split(',').filter(s => s.trim());
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
            console.error('Error saving user:', error?.error?.response);
            const errorMessage = error?.error?.response?.data?.message || 'An error occurred while saving the user';
            const serverErrors = error?.error?.response?.data?.details || null;

            if (serverErrors && Array.isArray(serverErrors)) {
                setStatus(null);
                const formikErrors = transformServerErrors(serverErrors);
                setErrors(formikErrors);
            } else {
                setStatus({ message: errorMessage });
            }

            Notify.failure(errorMessage);
        }
    };

    const handleShopAccessChange = (shopUuid: string, currentShops: string[], setFieldValue: Function) => {
        const newShops = currentShops.includes(shopUuid)
            ? currentShops.filter(s => s !== shopUuid)
            : [...currentShops, shopUuid];
        setFieldValue('accessibleShops', newShops);
    };

    const handleWorkstationChange = (workstation: string, currentWorkstations: string[], setFieldValue: Function) => {
        const newWorkstations = currentWorkstations.includes(workstation)
            ? currentWorkstations.filter(w => w !== workstation)
            : [...currentWorkstations, workstation];
        setFieldValue('allowedWorkstations', newWorkstations);
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
                    {({ isSubmitting, values, setFieldValue, status }) => (
                        <Form>
                            <FormWrapper>
                                {status?.message && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {status.message}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            name="pinCode"
                                            label="PIN Code (4-6 digits)"
                                            placeholder="1234"
                                            maxLength={6}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-400 border-b pb-2">
                                            Role & Access
                                        </h3>

                                        <FormSelectBox
                                            label='Role'
                                            name='roleUuid'
                                            required
                                            options={roleOptions}
                                            disabled={loadingRoles}
                                        />

                                        <FormSelectBox
                                            label='Client'
                                            name='clientId'
                                            required
                                            options={clientOptions}
                                            disabled={loadingClients}
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
                                                name="maxDiscountPercent"
                                                placeholder="0"
                                                min="0"
                                                max="100"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="canOverridePrices"
                                                checked={values.canOverridePrices || false}
                                                onChange={(e) => setFieldValue('canOverridePrices', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="canOverridePrices" className="text-sm font-medium text-gray-700">
                                                Can Override Prices
                                            </label>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="forcePasswordChange"
                                                checked={values.forcePasswordChange || false}
                                                onChange={(e) => setFieldValue('forcePasswordChange', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="forcePasswordChange" className="text-sm font-medium text-gray-700">
                                                Force Password Change on Next Login
                                            </label>
                                        </div>
                                    </div>
                                </div>

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
                                                    checked={(values.accessibleShops || []).includes(shop.uuid)}
                                                    onChange={() => handleShopAccessChange(
                                                        shop.uuid,
                                                        values.accessibleShops || [],
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
                                                    checked={(values.allowedWorkstations || []).includes(workstation)}
                                                    onChange={() => handleWorkstationChange(
                                                        workstation,
                                                        values.allowedWorkstations || [],
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