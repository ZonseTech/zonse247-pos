import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import TenantSearch from '../branch/partials/TenantSearch';
import BranchSearch from '../terminal/partials/BranchSearch';
import { RoleSearch } from './partials/RoleSearch';
import { Fragment, useState, useEffect } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import usersService from '../../services/users.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import * as Yup from 'yup';

const UserForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const { userId } = location.state || {};

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                setLoading(true);
                try {
                    const userData = await usersService.show(userId);
                    setUser(userData);
                } catch (error: any) {
                    console.error('Error fetching user:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load user details';
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUser();
    }, [userId]);

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Locked', value: 'locked' }
    ];

    const defaultUserValues: Partial<CreateUserRequest> = {
        username: '',
        password: '',
        fullname: '',
        email: '',
        phone: '',
        tenantId: '',
        branchId: '',
        roleId: '',
        pinCode: '',
        maxDiscountPercent: 0,
        status: 'active',
        forcePasswordChange: true,
        accessibleBranches: [],
        allowedTerminals: [],
    };

    const initialUserValues = user ? {
        username: user.username || '',
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        tenantId: user.tenantId || '',
        branchId: user.branchId || '',
        roleId: user.roleId || '',
        pinCode: user.pinCode || '',
        maxDiscountPercent: user.maxDiscountPercent || 0,
        status: user.status || 'active',
        forcePasswordChange: user.forcePasswordChange || false,
        accessibleBranches: user.accessibleBranches || [],
        allowedTerminals: user.allowedTerminals || [],
    } : defaultUserValues;

    const userValidationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username is too long')
            .matches(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
        password: !userId ? Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/,
                'Password must contain uppercase, lowercase, and number'
            ) : Yup.string().notRequired(),
        fullname: Yup.string()
            .required('Full name is required')
            .min(2, 'Full name must be at least 2 characters')
            .max(100, 'Full name is too long'),
        email: Yup.string()
            .email('Invalid email address')
            .max(100, 'Email is too long'),
        phone: Yup.string()
            .matches(
                /^(\+265|265|0[89])\d{7,9}$/,
                'Phone number must start with +265, 265, 09, or 08 (e.g., +265123456789, 0912345678)'
            )
            .max(20, 'Phone number is too long')
            .nullable()
            .notRequired(),
        tenantId: Yup.string().required('Tenant is required'),
        branchId: Yup.string().required('Branch is required'),
        roleId: Yup.string().required('Role is required'),
        pinCode: Yup.string()
            .matches(/^\d{4,6}$/, 'PIN must be 4-6 digits')
            .nullable(),
        maxDiscountPercent: Yup.number()
            .min(0, 'Discount percentage must be 0 or higher')
            .max(100, 'Discount percentage cannot exceed 100'),
    });

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            if (userId) {
                const updateData: UpdateUserRequest = {
                    fullname: values.fullname,
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                    roleId: values.roleId,
                    currentBranchId: values.branchId,
                    pinCode: values.pinCode || undefined,
                    maxDiscountPercent: values.maxDiscountPercent,
                    status: values.status,
                    accessibleBranches: values.accessibleBranches || [],
                    allowedTerminals: values.allowedTerminals || [],
                };
                await usersService.update(userId, updateData);
                Report.success('Success', 'User updated successfully', 'Okay', () => {
                    navigate(ROUTES.USERS);
                });
            } else {
                const createData: CreateUserRequest = {
                    username: values.username,
                    password: values.password,
                    fullname: values.fullname,
                    email: values.email || undefined,
                    phone: values.phone || undefined,
                    tenantId: values.tenantId,
                    branchId: values.branchId,
                    roleId: values.roleId,
                    pinCode: values.pinCode || undefined,
                    maxDiscountPercent: values.maxDiscountPercent,
                    status: values.status,
                    forcePasswordChange: values.forcePasswordChange,
                    accessibleBranches: values.accessibleBranches || [],
                    allowedTerminals: values.allowedTerminals || [],
                };
                await usersService.store(createData);
                Report.success('Success', 'User created successfully', 'Okay', () => {
                    navigate(ROUTES.USERS);
                });
            }
        } catch (error: any) {
            console.error('Error saving user:', error);
            const errorMessage = error?.response?.data?.message || `Failed to ${userId ? 'update' : 'create'} user`;
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user && userId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading user details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <Fragment>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
                    <div className='sticky top-0 z-10 bg-white dark:bg-gray-800'>
                        <PageHeader
                            title={userId ? 'Edit User' : 'Add User'}
                            description='Required fields are marked with an asterisk (*)'
                            action={
                                <Button
                                    type="button"
                                    theme='danger'
                                    onClick={() => navigate(ROUTES.USERS)}
                                    className="text-sm sm:text-base"
                                >
                                    <span className="hidden sm:inline">Cancel</span>
                                    <span className="sm:hidden">×</span>
                                </Button>
                            }
                        />
                    </div>

                    <Formik
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        initialValues={initialUserValues}
                        validationSchema={userValidationSchema}
                    >
                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                            <Form>
                                <FormWrapper>
                                    <div className="py-4 sm:py-6 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                                                1
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                Basic Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <FormInput
                                                label="Username"
                                                name="username"
                                                placeholder="Enter username"
                                                required
                                                disabled={!!userId}
                                            />
                                            {!userId && (
                                                <FormInput
                                                    label="Password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Enter password"
                                                    required
                                                />
                                            )}
                                            <FormInput
                                                label="Full Name"
                                                name="fullname"
                                                placeholder="Enter full name"
                                                required
                                            />
                                            <FormInput
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="Enter email address"
                                            />
                                            <FormInput
                                                label="Phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>

                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                                                2
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                Tenant & Branch Assignment
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <div>
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => {
                                                        setFieldValue('tenantId', tenantId);
                                                        setFieldValue('branchId', '');
                                                    }}
                                                    error={errors.tenantId as string}
                                                    touched={touched.tenantId as boolean}
                                                />
                                            </div>

                                            <div>
                                                <BranchSearch
                                                    value={values.branchId}
                                                    onChange={(branchId) => {
                                                        setFieldValue('branchId', branchId);
                                                    }}
                                                    tenantId={values.tenantId}
                                                    error={errors.branchId as string}
                                                    touched={touched.branchId as boolean}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                                                3
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                Role & Permissions
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Role <span className="text-red-500">*</span>
                                                </label>
                                                <RoleSearch
                                                    selectedRoleId={values.roleId}
                                                    onRoleSelect={(role) => {
                                                        setFieldValue('roleId', role?.roleId || '');
                                                    }}
                                                    tenantId={values.tenantId}
                                                    disabled={!values.tenantId}
                                                />
                                                {touched.roleId && errors.roleId && typeof errors.roleId === 'string' && (
                                                    <div className="text-red-500 text-sm mt-1">{errors.roleId}</div>
                                                )}
                                            </div>

                                            <FormSelectBox
                                                label="Status"
                                                name="status"
                                                options={statusOptions}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                                                4
                                            </div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                Security Settings
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <FormInput
                                                label="PIN Code"
                                                name="pinCode"
                                                type="password"
                                                placeholder="Enter 4-6 digit PIN"
                                                maxLength={6}
                                            />
                                            <FormInput
                                                label="Max Discount Percentage"
                                                name="maxDiscountPercent"
                                                type="number"
                                                placeholder="0"
                                                min={0}
                                                max={100}
                                            />
                                            {!userId && (
                                                <div className="sm:col-span-2 flex items-center">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.forcePasswordChange}
                                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                setFieldValue('forcePasswordChange', e.target.checked)
                                                            }
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Force password change on first login
                                                        </span>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-300 dark:border-gray-600">
                                        <Button
                                            type="button"
                                            theme="neutral"
                                            onClick={() => navigate(ROUTES.USERS)}
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            theme="primary"
                                            disabled={isSubmitting || loading}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="hidden sm:inline">Saving...</span>
                                                    <span className="sm:hidden">...</span>
                                                </>
                                            ) : (
                                                userId ? 'Update User' : 'Create User'
                                            )}
                                        </Button>
                                    </div>
                                </FormWrapper>
                            </Form>
                        )}
                    </Formik>
                </div>
            </AppLayout>
        </Fragment>
    );
};

export default UserForm;
