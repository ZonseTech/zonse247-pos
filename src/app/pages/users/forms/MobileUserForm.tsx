import { Form, Formik } from 'formik';
import { Button } from '../../../components';
import type { FunctionComponent } from 'react';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { HiCheck } from 'react-icons/hi';
import {
    BasicInfoFields,
    StaffOptionsFields,
    CalculateAsFields,
    SalaryAttendanceFields,
    BranchRoleFields,
} from './fields';
import { useStaffForm } from '../../../hooks/useStaffForm';

const MobileUserForm: FunctionComponent = () => {
    const {
        navigate,
        loading,
        user,
        userId,
        initialValues,
        validationSchema,
        handleSubmit,
        isEditMode,
        hasPrefilledTenant,
    } = useStaffForm();

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
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                    <Form className="flex flex-col h-full">
                        <div className="fixed top-0 left-0 right-0 z-50">
                            <MobilePageHeader
                                onLeftPress={() => navigate(-1)}
                                title={<span className="text-white font-semibold">{isEditMode ? 'EDIT USER' : 'ADD USER'}</span>}
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
                                <BasicInfoFields isEditMode={isEditMode} />

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
                                            showTenant={hasPrefilledTenant}
                                            tenantDisabled={hasPrefilledTenant}
                                            onTenantChange={(tenantId) => {
                                                setFieldValue('tenantId', tenantId);
                                                setFieldValue('branchId', '');
                                                setFieldValue('roleId', '');
                                            }}
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
