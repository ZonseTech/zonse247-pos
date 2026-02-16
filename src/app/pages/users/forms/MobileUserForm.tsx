import { Form, Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../../components';
import { useState, useEffect } from 'react';
import type { FunctionComponent } from 'react';
import usersService from '../../../services/users.service';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../../utils/constants';
import { useAuth } from '../../../context/AuthProvider';
import { createStaffValidationSchema, updateStaffValidationSchema } from '../../../schemas/user.schema';
import { parseApiError, mapErrorToFormikErrors, isDuplicateError } from '../../../utils/api-error-handler';
import { HiCheck } from 'react-icons/hi';
import {
    BasicInfoFields,
    StaffOptionsFields,
    CalculateAsFields,
    SalaryAttendanceFields,
    BranchRoleFields,
} from './fields';

const MobileUserForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const { userId } = location.state || {};
    const { user: authUser } = useAuth();

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

    const defaultUserValues = {
        fullname: '',
        email: '',
        phone: '',
        tenantId: authUser?.tenantId || '',
        branchId: '',
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

    const initialUserValues = user ? {
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        tenantId: user.tenantId || '',
        branchId: user.branchId || '',
        roleId: user.roleId || '',
        trackAttendance: user.trackAttendance !== undefined ? user.trackAttendance : true,
        allowAppAccess: user.allowAppAccess || false,
        calculateAs: user.calculateAs || 'monthly',
        staffSalary: user.staffSalary || '',
        avgShiftHours: user.avgShiftHours || '',
        joiningDate: user.joiningDate || '',
        allowSelfAttendance: user.allowSelfAttendance || false,
        attendanceType: user.attendanceType || 'single',
    } : defaultUserValues;

    const userValidationSchema = userId ? updateStaffValidationSchema : createStaffValidationSchema;

    const handleSubmit = async (values: any, { setErrors, setSubmitting }: FormikHelpers<any>) => {
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
                const response = await usersService.store(staffData as CreateUserRequest);
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

    if (loading && !user && userId) {
        return (
            <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 z-50">
                    <MobilePageHeader
                        title={<span className="text-white font-semibold">Loading...</span>}
                        className="bg-sky-500 dark:bg-sky-700"
                    />
                </div>
                <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                    <div className="h-full overflow-y-auto p-4">
                        <div className="space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize={true}
                initialValues={initialUserValues}
                validationSchema={userValidationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                    <Form className="flex flex-col h-full">
                        <div className="fixed top-0 left-0 right-0 z-50">
                            <MobilePageHeader
                                onLeftPress={() => navigate(-1)}
                                title={<span className="text-white font-semibold">{userId ? 'EDIT USER' : 'ADD USER'}</span>}
                                rightContent={
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || loading}
                                        loading={isSubmitting || loading}
                                    >
                                        <HiCheck className="w-5 h-5 text-white" />
                                        <span className="text-white text-sm font-medium">SAVE</span>
                                    </Button>
                                }
                                theme='sky'
                            />
                        </div>

                        <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                            <div className="h-full overflow-y-auto pb-20 p-4 space-y-4">
                                <BasicInfoFields isEditMode={!!userId} />

                                <StaffOptionsFields
                                    trackAttendance={values.trackAttendance}
                                    allowAppAccess={values.allowAppAccess}
                                    onTrackAttendanceChange={(value) => setFieldValue('trackAttendance', value)}
                                    onAllowAppAccessChange={(value) => setFieldValue('allowAppAccess', value)}
                                />

                                {values.trackAttendance && (
                                    <>
                                        <div className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                                <h4 className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                                    Attendance & Salary
                                                </h4>
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                        </div>

                                        <CalculateAsFields
                                            value={values.calculateAs}
                                            onChange={(value) => setFieldValue('calculateAs', value)}
                                        />

                                        <SalaryAttendanceFields
                                            calculateAs={values.calculateAs}
                                            allowSelfAttendance={values.allowSelfAttendance}
                                            attendanceType={values.attendanceType}
                                            onAllowSelfAttendanceChange={(value) => setFieldValue('allowSelfAttendance', value)}
                                            onAttendanceTypeChange={(value) => setFieldValue('attendanceType', value)}
                                        />
                                    </>
                                )}

                                {values.allowAppAccess && (
                                    <>
                                        <div className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                                <h4 className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                                                    Access & Permissions
                                                </h4>
                                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                                            </div>
                                        </div>

                                        <BranchRoleFields
                                            branchId={values.branchId}
                                            roleId={values.roleId}
                                            tenantId={values.tenantId}
                                            branchError={errors.branchId as string}
                                            branchTouched={touched.branchId as boolean}
                                            roleError={errors.roleId as string}
                                            roleTouched={touched.roleId as boolean}
                                            onBranchChange={(value) => setFieldValue('branchId', value)}
                                            onRoleChange={(value) => setFieldValue('roleId', value)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default MobileUserForm;
