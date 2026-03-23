import { Form, Formik } from 'formik';
import type { FunctionComponent } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import PageHeader from '../../../components/page/PageHeader';
import { ROUTES } from '../../../utils/constants';
import { UserCog, User, Clock, Shield, Briefcase, Building2 } from 'lucide-react';
import { Box, Flex, Grid, Text } from '@radix-ui/themes';
import FormInput from '../../../components/FormInput';
import BranchSearch from '../../terminal/partials/BranchSearch';
import TenantSearch from '../../branch/partials/TenantSearch';
import { RoleSearch } from '../partials/RoleSearch';
import SectionCard from '../../../components/card/SectionCard';
import FormSkeleton from '../../../components/skeleton/FormSkeleton';
import {
    CalculateAsSelector,
    ToggleOption,
    AttendanceTypeSelector,
    FormActions
} from '../../../components/form';
import type { CalculateAsType, AttendanceType } from '../../../components/form';
import { useStaffForm } from '../../../hooks/useStaffForm';

const DesktopUserForm: FunctionComponent = () => {
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
            <AppLayout>
                <FormSkeleton sections={2} fieldsPerSection={4} showSidebar={true} />
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Box className="max-w-7xl mx-auto" px={{ initial: "4", sm: "6", lg: "8" }} py="6">
                <PageHeader
                    title={isEditMode ? 'Edit Staff' : 'Add Staff'}
                    description='Manage staff information, attendance and app access'
                    icon={<UserCog className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                />

                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form>
                            <Grid columns={{ initial: "1", lg: "3" }} gap="6" mt="6">
                                <Box className="lg:col-span-2">
                                    <Flex direction="column" gap="6">
                                        <SectionCard
                                            title="Basic Information"
                                            icon={User}
                                            iconColor="bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400"
                                        >
                                            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                                                <Box className="sm:col-span-2">
                                                    <FormInput
                                                        label="Staff Name"
                                                        name="fullname"
                                                        placeholder="Enter full name"
                                                        required
                                                    />
                                                </Box>
                                                <FormInput
                                                    label="Email Address"
                                                    name="email"
                                                    type="email"
                                                    placeholder="staff@example.com"
                                                    required={!isEditMode}
                                                />
                                                <FormInput
                                                    label="Phone Number"
                                                    name="phone"
                                                    type="tel"
                                                    placeholder="+265 xxx xxx xxx"
                                                />
                                            </Grid>
                                        </SectionCard>

                                        {values.trackAttendance && (
                                            <SectionCard
                                                title="Attendance & Salary"
                                                icon={Clock}
                                                iconColor="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                            >
                                                <Flex direction="column" gap="5">
                                                    <CalculateAsSelector
                                                        value={values.calculateAs}
                                                        onChange={(value: CalculateAsType) => setFieldValue('calculateAs', value)}
                                                    />

                                                    <Grid columns={{ initial: "1", sm: "3" }} gap="4">
                                                        <FormInput
                                                            label="Staff Salary"
                                                            name="staffSalary"
                                                            type="number"
                                                            placeholder="Amount"
                                                        />
                                                        {values.calculateAs !== 'hourly' && (
                                                            <FormInput
                                                                label="Avg. Shift Hours"
                                                                name="avgShiftHours"
                                                                type="number"
                                                                placeholder="e.g., 8"
                                                                min={1}
                                                                max={24}
                                                            />
                                                        )}
                                                        <FormInput
                                                            label="Joining Date"
                                                            name="joiningDate"
                                                            type="date"
                                                        />
                                                    </Grid>

                                                    <AttendanceTypeSelector
                                                        allowSelfAttendance={values.allowSelfAttendance}
                                                        attendanceType={values.attendanceType}
                                                        onAllowSelfAttendanceChange={(checked) => setFieldValue('allowSelfAttendance', checked)}
                                                        onAttendanceTypeChange={(type: AttendanceType) => setFieldValue('attendanceType', type)}
                                                    />
                                                </Flex>
                                            </SectionCard>
                                        )}

                                        {values.allowAppAccess && (
                                            <SectionCard
                                                title="Access & Permissions"
                                                icon={Shield}
                                                iconColor="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                                            >
                                                <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                                                    <Box>
                                                        <BranchSearch
                                                            value={values.branchId}
                                                            onChange={(value) => setFieldValue('branchId', value)}
                                                            tenantId={values.tenantId}
                                                            error={errors.branchId as string}
                                                            touched={touched.branchId as boolean}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Text as="label" size="2" weight="medium" mb="1" className="block">
                                                            Role <Text color="red" asChild><span>*</span></Text>
                                                        </Text>
                                                        <RoleSearch
                                                            selectedRoleId={values.roleId}
                                                            onRoleSelect={(role) => setFieldValue('roleId', role?.roleId || '')}
                                                            tenantId={values.tenantId}
                                                            disabled={!values.tenantId}
                                                            error={errors.roleId as string}
                                                            touched={touched.roleId as boolean}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </SectionCard>
                                        )}
                                    </Flex>
                                </Box>

                                <Flex direction="column" gap="6">
                                    <SectionCard
                                        title="Staff Options"
                                        icon={Briefcase}
                                        iconColor="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400"
                                    >
                                        <Flex direction="column" gap="1">
                                            <ToggleOption
                                                checked={values.trackAttendance}
                                                onChange={(checked) => {
                                                    if (!checked && !values.allowAppAccess) return;
                                                    setFieldValue('trackAttendance', checked);
                                                }}
                                                title="Track Attendance"
                                                description="Monitor staff attendance and salary"
                                            />
                                            <ToggleOption
                                                checked={values.allowAppAccess}
                                                onChange={(checked) => {
                                                    if (!checked && !values.trackAttendance) {
                                                        setFieldValue('trackAttendance', true);
                                                    }
                                                    setFieldValue('allowAppAccess', checked);
                                                }}
                                                title="Allow App Access"
                                                description="Staff can login and use the app"
                                            />
                                        </Flex>
                                    </SectionCard>

                                    <SectionCard
                                        title={hasPrefilledTenant ? "Tenant & Branch" : "Branch"}
                                        icon={Building2}
                                        iconColor="bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400"
                                    >
                                        <Flex direction="column" gap="4">
                                            {hasPrefilledTenant && (
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => {
                                                        setFieldValue('tenantId', tenantId);
                                                        setFieldValue('branchId', '');
                                                        setFieldValue('roleId', '');
                                                    }}
                                                    error={errors.tenantId as string}
                                                    touched={touched.tenantId as boolean}
                                                    disabled={hasPrefilledTenant}
                                                />
                                            )}
                                            <BranchSearch
                                                value={values.branchId}
                                                onChange={(value) => setFieldValue('branchId', value)}
                                                tenantId={values.tenantId}
                                                error={errors.branchId as string}
                                                touched={touched.branchId as boolean}
                                            />
                                        </Flex>
                                    </SectionCard>

                                    <FormActions
                                        isSubmitting={isSubmitting}
                                        isLoading={loading}
                                        submitLabel={isEditMode ? 'Update Staff' : 'Create Staff'}
                                        submitIcon={<User className="w-4 h-4" />}
                                        onCancel={() => navigate(ROUTES.USERS)}
                                    />
                                </Flex>
                            </Grid>
                        </Form>
                    )}
                </Formik>
            </Box>
        </AppLayout>
    );
};

export default DesktopUserForm;
