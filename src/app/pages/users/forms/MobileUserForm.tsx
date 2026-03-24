import { Form, Formik } from 'formik';
import type { FunctionComponent } from 'react';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { HiCheck } from 'react-icons/hi';
import { Box, Button, Flex, Separator, Skeleton, Text } from '@radix-ui/themes';
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
            <Flex direction="column" className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
                <Box className="fixed top-0 left-0 right-0 z-50">
                    <MobilePageHeader
                        title={<Text weight="bold" className="text-white">Loading...</Text>}
                        className="bg-sky-500 dark:bg-sky-700"
                    />
                </Box>
                <Box className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                    <Box className="h-full overflow-y-auto" p="4">
                        <Flex direction="column" gap="4">
                            {[...Array(6)].map((_, i) => (
                                <Flex key={i} direction="column" gap="2">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-12 rounded-lg" />
                                </Flex>
                            ))}
                        </Flex>
                    </Box>
                </Box>
            </Flex>
        );
    }

    return (
        <Flex direction="column" className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={validationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                    <Form className="flex flex-col h-full">
                        <Box className="fixed top-0 left-0 right-0 z-50">
                            <MobilePageHeader
                                onLeftPress={() => navigate(-1)}
                                title={<Text weight="bold" className="text-white">{isEditMode ? 'EDIT USER' : 'ADD USER'}</Text>}
                                rightContent={
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting || loading}
                                        loading={isSubmitting || loading}
                                        variant="ghost"
                                        highContrast
                                    >
                                        <HiCheck className="w-5 h-5 text-white" />
                                        <Text size="2" weight="medium" className="text-white">SAVE</Text>
                                    </Button>
                                }
                                theme='sky'
                            />
                        </Box>

                        <Box className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                            <Box className="h-full overflow-y-auto pb-20" p="4">
                                <Flex direction="column" gap="4">
                                    <BasicInfoFields isEditMode={isEditMode} />

                                    <StaffOptionsFields
                                        trackAttendance={values.trackAttendance}
                                        allowAppAccess={values.allowAppAccess}
                                        onTrackAttendanceChange={(value) => setFieldValue('trackAttendance', value)}
                                        onAllowAppAccessChange={(value) => setFieldValue('allowAppAccess', value)}
                                    />

                                    {values.trackAttendance && (
                                        <>
                                            <Flex align="center" gap="2" py="3">
                                                <Separator size="4" />
                                                <Text size="1" weight="bold" className="uppercase tracking-wider whitespace-nowrap">
                                                    Attendance & Salary
                                                </Text>
                                                <Separator size="4" />
                                            </Flex>

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
                                            <Flex align="center" gap="2" py="3">
                                                <Separator size="4" />
                                                <Text size="1" weight="bold" className="uppercase tracking-wider whitespace-nowrap">
                                                    Access & Permissions
                                                </Text>
                                                <Separator size="4" />
                                            </Flex>

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
                                </Flex>
                            </Box>
                        </Box>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};

export default MobileUserForm;
