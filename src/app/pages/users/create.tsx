import { Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import TenantSearch from '../branch/partials/TenantSearch';
import BranchSearch from '../terminal/partials/BranchSearch';
import { RoleSearch } from './partials/RoleSearch';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import usersService from '../../services/users.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { ROLE_IDS } from '../../constants/roles';
import * as Yup from 'yup';
import { parseApiError, mapErrorToFormikErrors, isDuplicateError } from '../../utils/api-error-handler';
import { User, Mail, Phone, Building2, Shield, Lock, Percent, UserCog, ArrowLeft } from 'lucide-react';

const UserForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const { userId } = location.state || {};
    const { user: authUser } = useAuth();

    // Check if user can select tenant (only super admin and admin)
    const canSelectTenant = useMemo(() => {
        if (!authUser?.roleId) return false;
        const adminRoles = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN];
        return adminRoles.includes(authUser.roleId as typeof adminRoles[number]);
    }, [authUser?.roleId]);

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
    ];

    const defaultUserValues: Partial<CreateUserRequest> = {
        username: '',
        password: '',
        fullname: '',
        email: '',
        phone: '',
        tenantId: authUser?.tenantId || '',
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

    // Create user validation - matches API requirements
    const createUserValidationSchema = Yup.object().shape({
        username: Yup.string()
            .required('Username is required')
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must not exceed 30 characters')
            .matches(/^[a-zA-Z0-9]+$/, 'Username must only contain alphanumeric characters'),
        password: Yup.string()
            .required('Password is required')
            .min(4, 'Password must be at least 4 characters')
            .max(128, 'Password must not exceed 128 characters'),
        fullname: Yup.string()
            .required('Full name is required')
            .min(2, 'Full name must be at least 2 characters')
            .max(50, 'Full name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]+$/, 'Full name must only contain letters and spaces'),
        email: Yup.string()
            .required('Email is required')
            .email('Please provide a valid email address'),
        phone: Yup.string()
            .matches(
                /^(\+265|265|0[89])\d{7,9}$/,
                'Please provide a valid phone number (e.g., +265123456789, 265123456789, or 0912345678)'
            )
            .nullable()
            .notRequired(),
        dateOfBirth: Yup.date()
            .max(new Date(), 'Date of birth cannot be in the future')
            .min(new Date('1900-01-01'), 'Please provide a valid date of birth')
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

    // Update user validation - all fields optional per API
    const updateUserValidationSchema = Yup.object().shape({
        username: Yup.string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must not exceed 30 characters')
            .matches(/^[a-zA-Z0-9]+$/, 'Username must only contain alphanumeric characters'),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password must not exceed 128 characters')
            .nullable(),
        fullname: Yup.string()
            .min(2, 'Full name must be at least 2 characters')
            .max(50, 'Full name must not exceed 50 characters')
            .matches(/^[a-zA-Z\s]+$/, 'Full name must only contain letters and spaces'),
        email: Yup.string()
            .email('Please provide a valid email address'),
        phone: Yup.string()
            .matches(
                /^[+]?[1-9][\d]{0,15}$/,
                'Please provide a valid phone number'
            )
            .nullable()
            .notRequired(),
        dateOfBirth: Yup.date()
            .max(new Date(), 'Date of birth cannot be in the future')
            .min(new Date('1900-01-01'), 'Please provide a valid date of birth')
            .nullable()
            .notRequired(),
        status: Yup.string()
            .oneOf(['active', 'inactive', 'suspended'], 'Status must be either active, inactive, or suspended'),
        tenantId: Yup.string(),
        branchId: Yup.string(),
        roleId: Yup.string(),
        pinCode: Yup.string()
            .matches(/^\d{4,6}$/, 'PIN must be 4-6 digits')
            .nullable(),
        maxDiscountPercent: Yup.number()
            .min(0, 'Discount percentage must be 0 or higher')
            .max(100, 'Discount percentage cannot exceed 100'),
    });

    // Use appropriate schema based on create/edit mode
    const userValidationSchema = userId ? updateUserValidationSchema : createUserValidationSchema;

    const handleSubmit = async (values: any, { setErrors, setSubmitting }: FormikHelpers<any>) => {
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
                    email: values.email,
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

            // Parse and handle API errors
            const parsedError = parseApiError(error);

            // Check for duplicate errors
            if (isDuplicateError(parsedError.message)) {
                if (parsedError.message.toLowerCase().includes('username')) {
                    setErrors({ username: 'This username is already taken' });
                    Notify.failure('Username already exists');
                } else if (parsedError.message.toLowerCase().includes('email')) {
                    setErrors({ email: 'This email is already registered' });
                    Notify.failure('Email already exists');
                } else {
                    Report.failure('Duplicate Entry', parsedError.message, 'Okay');
                }
            } else if (parsedError.errors && Object.keys(parsedError.errors).length > 0) {
                // Map API field errors to Formik errors
                const formikErrors = mapErrorToFormikErrors(parsedError.errors);
                setErrors(formikErrors);
                Notify.failure('Please fix the highlighted errors');
            } else {
                // Show general error message
                Report.failure('Error', parsedError.message, 'Okay');
            }
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    // Enhanced skeleton loader for loading state
    if (loading && !user && userId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
                    {/* Header Skeleton */}
                    <div className="mb-6">
                        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2" />
                        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>

                    {/* Form Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        {/* Section 1 Skeleton */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-blue-200 dark:bg-blue-900/50 rounded-full animate-pulse" />
                                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-11">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2 Skeleton */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-emerald-200 dark:bg-emerald-900/50 rounded-full animate-pulse" />
                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="grid grid-cols-1 gap-4 ml-11">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 3 Skeleton */}
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-purple-200 dark:bg-purple-900/50 rounded-full animate-pulse" />
                                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-11">
                                {[...Array(2)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons Skeleton */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                            <div className="h-10 w-32 bg-blue-200 dark:bg-blue-900/50 rounded-lg animate-pulse" />
                        </div>
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
                            icon={<UserCog className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />}
                            action={
                                <Button
                                    type="button"
                                    onClick={() => navigate(ROUTES.USERS)}
                                    className="text-sm sm:text-base flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Back to Users</span>
                                    <span className="sm:hidden">Back</span>
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
                                    {/* Section 1: Basic Information */}
                                    <div className="py-4 sm:py-6 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-200 dark:from-blue-600 dark:to-blue-900"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 shadow-sm">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    Basic Information
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">User account credentials and contact details</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <FormInput
                                                label="Username"
                                                name="username"
                                                placeholder="Enter alphanumeric username"
                                                required
                                                disabled={!!userId}
                                            />
                                            {!userId && (
                                                <FormInput
                                                    label="Password"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Minimum 4 characters"
                                                    required
                                                />
                                            )}
                                            <FormInput
                                                label="Full Name"
                                                name="fullname"
                                                placeholder="Letters and spaces only"
                                                required
                                            />
                                            <FormInput
                                                label="Email"
                                                name="email"
                                                type="email"
                                                placeholder="user@example.com"
                                                required={!userId}
                                            />
                                            <FormInput
                                                label="Phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="e.g., +265123456789 or 0912345678"
                                            />
                                        </div>
                                    </div>

                                    {/* Section 2: Tenant & Branch Assignment */}
                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-emerald-200 dark:from-emerald-600 dark:to-emerald-900"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 shadow-sm">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    Organization Assignment
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Assign user to tenant and branch</p>
                                            </div>
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
                                                    disabled={!canSelectTenant}
                                                    disabledMessage="Auto-assigned based on your account"
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

                                    {/* Section 3: Role & Permissions */}
                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="absolute left-3 sm:left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-200 dark:from-purple-600 dark:to-purple-900"></div>

                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-400 shadow-sm">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    Role & Permissions
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Define user access level and status</p>
                                            </div>
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

                                    {/* Section 4: Security Settings */}
                                    <div className="pb-6 sm:pb-8 relative">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 border-2 border-amber-500 dark:border-amber-600 text-amber-600 dark:text-amber-400 shadow-sm">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    Security Settings
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">PIN code and discount permissions</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ml-8 sm:ml-11">
                                            <FormInput
                                                label="PIN Code"
                                                name="pinCode"
                                                type="password"
                                                placeholder="4-6 digit PIN for quick access"
                                                maxLength={6}
                                            />
                                            <FormInput
                                                label="Max Discount Percentage"
                                                name="maxDiscountPercent"
                                                type="number"
                                                placeholder="0-100"
                                                min={0}
                                                max={100}
                                            />
                                            {!userId && (
                                                <div className="sm:col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <label className="flex items-center space-x-3 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.forcePasswordChange}
                                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                                setFieldValue('forcePasswordChange', e.target.checked)
                                                            }
                                                            className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                                        />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Force password change on first login
                                                            </span>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                User will be required to set a new password when they first log in
                                                            </p>
                                                        </div>
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <Button
                                            type="button"
                                            theme="danger"
                                            onClick={() => navigate(ROUTES.USERS)}
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            theme="success"
                                            disabled={isSubmitting || loading}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <User className="w-4 h-4" />
                                                    <span>{userId ? 'Update User' : 'Create User'}</span>
                                                </>
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
