import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report } from 'notiflix';
import type { FormikHelpers } from 'formik';
import usersService from '../services/users.service';
import { useAuth } from '../context/AuthProvider';
import { createStaffValidationSchema, updateStaffValidationSchema } from '../schemas/user.schema';
import { parseApiError, mapErrorToFormikErrors, isDuplicateError, getErrorMessage } from '../utils/api-error-handler';
import { ROUTES } from '../utils/constants';
import { hasRole } from '../utils';

export interface StaffFormValues {
    fullname: string;
    email: string;
    phone: string;
    tenantId: string;
    branchId: string;
    roleId: string;
    trackAttendance: boolean;
    allowAppAccess: boolean;
    calculateAs: string;
    staffSalary: string;
    avgShiftHours: string;
    joiningDate: string;
    allowSelfAttendance: boolean;
    attendanceType: string;
}

export interface UseStaffFormReturn {
    navigate: ReturnType<typeof useNavigate>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    user: User | null;
    userId: string | undefined;
    initialValues: StaffFormValues;
    validationSchema: typeof createStaffValidationSchema | typeof updateStaffValidationSchema;
    handleSubmit: (values: StaffFormValues, helpers: FormikHelpers<StaffFormValues>) => Promise<void>;
    isEditMode: boolean;
    canSelectTenant: boolean;
    hasPrefilledTenant: boolean;
}

export const useStaffForm = (): UseStaffFormReturn => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const { userId, tenantId: stateTenantId } = (location.state as { userId?: string; tenantId?: string }) || {};
    const { user: authUser } = useAuth();

    const effectiveTenantId = stateTenantId || authUser?.tenantId || '';

    const canSelectTenant = useMemo(() => {
        return hasRole(authUser, 'admin');
    }, [authUser]);

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                setLoading(true);
                try {
                    const userData = await usersService.show(userId);
                    setUser(userData);
                } catch (error: any) {
                    console.error('Error fetching user:', error);
                    const errorMessage = getErrorMessage(error, 'Failed to load user details');
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchUser();
    }, [userId]);

    const defaultUserValues: StaffFormValues = {
        fullname: '',
        email: '',
        phone: '',
        tenantId: effectiveTenantId,
        branchId: stateTenantId ? '' : (authUser?.branchId || ''),
        roleId: '',
        trackAttendance: true,
        allowAppAccess: false,
        calculateAs: 'monthly',
        staffSalary: '',
        avgShiftHours: '',
        joiningDate: '',
        allowSelfAttendance: false,
        attendanceType: 'single',
    };

    const initialValues: StaffFormValues = user ? {
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        tenantId: user.tenantId || '',
        branchId: user.branchId || '',
        roleId: user.roleId || '',
        trackAttendance: user.trackAttendance !== undefined ? user.trackAttendance : true,
        allowAppAccess: user.allowAppAccess || Boolean(user.roleId),
        calculateAs: user.calculateAs || 'monthly',
        staffSalary: String(user.staffSalary || ''),
        avgShiftHours: String(user.avgShiftHours || ''),
        joiningDate: user.joiningDate ? (typeof user.joiningDate === 'string' ? user.joiningDate : user.joiningDate.toISOString().split('T')[0]) : '',
        allowSelfAttendance: user.allowSelfAttendance || false,
        attendanceType: user.attendanceType || 'single',
    } : defaultUserValues;

    const validationSchema = userId ? updateStaffValidationSchema : createStaffValidationSchema;

    const handleSubmit = async (values: StaffFormValues, { setErrors, setSubmitting }: FormikHelpers<StaffFormValues>) => {
        setLoading(true);
        try {
            const staffData = {
                fullname: values.fullname,
                email: values.email,
                phone: values.phone || undefined,
                tenantId: values.tenantId,
                trackAttendance: values.trackAttendance,
                allowAppAccess: values.allowAppAccess,
                ...(values.trackAttendance && {
                    calculateAs: values.calculateAs,
                    staffSalary: values.staffSalary || undefined,
                    avgShiftHours: values.calculateAs !== 'hourly' ? values.avgShiftHours || undefined : undefined,
                    joiningDate: values.joiningDate || undefined,
                    allowSelfAttendance: values.allowSelfAttendance,
                    attendanceType: values.allowSelfAttendance ? values.attendanceType : undefined,
                }),
                ...(values.allowAppAccess && {
                    branchId: values.branchId,
                    roleId: values.roleId,
                }),
            };

            if (userId) {
                await usersService.update(userId, staffData as UpdateUserRequest);
                Report.success('Success', 'Staff updated successfully', 'Okay', () => {
                    // Do nothing
                });
            } else {
                const response = await usersService.storeLive(staffData as CreateUserRequest);
                const generatedPassword = response?.generatedPassword;

                if (generatedPassword) {
                    Report.success(
                        'Account Created',
                        `Staff account created successfully!\n\n<b>Generated Password:</b>\n<code style="background:#f3f4f6;padding:8px 12px;border-radius:6px;display:block;margin-top:8px;font-size:16px;letter-spacing:1px;">${generatedPassword}</code>\n\n<small style="color:#6b7280;">Please share this password with the staff member. They can change it after logging in.</small>`,
                        'Got it',
                        () => {
                            navigate(ROUTES.USERS);
                        }
                    );
                } else {
                    Report.success('Success', 'Staff created successfully', 'Okay', () => {
                        navigate(ROUTES.USERS);
                    });
                }
            }
        } catch (error: any) {
            console.error('Error saving staff:', error);

            const actualError = error?.error || error;
            const parsedError = parseApiError(actualError);
            const responseData = actualError?.response?.data;

            if (responseData?.error === 'Validation Error' && responseData?.details?.length > 0) {
                const detailsList = responseData.details.join('\n• ');
                Report.failure(
                    'Validation Error',
                    `${responseData.message}:\n\n• ${detailsList}`,
                    'Okay'
                );
            }
            else if (isDuplicateError(parsedError.message)) {
                if (parsedError.message.toLowerCase().includes('email')) {
                    setErrors({ email: 'This email is already registered' });
                    Notify.failure('Email already exists');
                } else {
                    Report.failure('Duplicate Entry', parsedError.message, 'Okay');
                }
            } else if (parsedError.errors && Object.keys(parsedError.errors).length > 0) {
                const formikErrors = mapErrorToFormikErrors(parsedError.errors);
                setErrors(formikErrors);
                Notify.failure('Please fix the highlighted errors');
            } else {
                Report.failure('Error', parsedError.message, 'Okay');
            }
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return {
        navigate,
        loading,
        setLoading,
        user,
        userId,
        initialValues,
        validationSchema,
        handleSubmit,
        isEditMode: !!userId,
        canSelectTenant,
        hasPrefilledTenant: !!stateTenantId,
    };
};
