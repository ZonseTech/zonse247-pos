import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import TenantSearch from '../branch/partials/TenantSearch';
import BranchSearch from './partials/BranchSearch';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import terminalService from '../../services/terminal.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { isAdminRole } from '../../constants/roles';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import * as Yup from 'yup';
import { capitalizeEachWord } from '../../utils';

const TerminalForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(false);
    const [terminal, setTerminal] = useState<Terminal | null>(null);

    const { terminalId } = location.state || {};
    const { user: authUser } = useAuth();

    // Check if user can select tenant (only admin roles)
    const canSelectTenant = useMemo(() => {
        return isAdminRole(authUser?.roleId, authUser?.roleName);
    }, [authUser?.roleId, authUser?.roleName]);

    useEffect(() => {
        const fetchTerminal = async () => {
            if (terminalId) {
                setLoading(true);
                try {
                    const terminalData = await terminalService.show(terminalId);
                    setTerminal(terminalData);
                } catch (error: any) {
                    console.error('Error fetching terminal:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load terminal details';
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTerminal();
    }, [terminalId]);

    const activationStatusOptions = [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Activated', value: 'ACTIVATED' },
        { label: 'Deactivated', value: 'DEACTIVATED' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Blocked', value: 'BLOCKED' }
    ];

    const defaultTerminalValues: Partial<Terminal> = {
        terminalId: '',
        tenantId: authUser?.tenantId || '',
        branchId: authUser?.branchId || '',
        terminalCode: '',
        terminalLabel: '',
        terminalPosition: 1,
        deviceId: '',
        osName: '',
        osVersion: '',
        osBuild: '',
        macAddress: '',
        posProductId: '',
        posProductVersion: '',
        offlineMaxTransactionAgeHours: 24,
        offlineMaxCumulativeAmount: 10000,
        isPrimary: false,
        isBlocked: false,
        activationStatus: 'PENDING'
    };

    const initialTerminalValues = terminal ? { ...terminal } : defaultTerminalValues;

    const terminalValidationSchema = Yup.object().shape({
        terminalCode: Yup.string()
            .required('Terminal code is required')
            .min(2, 'Code must be at least 2 characters')
            .max(20, 'Code is too long')
            .matches(/^[A-Za-z0-9-_]+$/, 'Code can only contain letters, numbers, hyphens, and underscores'),
        terminalLabel: Yup.string()
            .required('Terminal label is required')
            .min(3, 'Label must be at least 3 characters')
            .max(100, 'Label is too long'),
        tenantId: Yup.string().required('Tenant is required'),
        branchId: Yup.string().required('Branch is required'),
        terminalPosition: Yup.number()
            .min(1, 'Position must be at least 1')
            .max(99, 'Position cannot exceed 99'),
        deviceId: Yup.string().max(255, 'Device ID is too long'),
        osName: Yup.string().max(50, 'OS name is too long'),
        osVersion: Yup.string().max(50, 'OS version is too long'),
        osBuild: Yup.string().max(50, 'OS build is too long'),
        macAddress: Yup.string()
            .matches(
                /^$|^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
                'Invalid MAC address format (e.g., A4:7C:C3:49:D2:CC)'
            )
            .max(17, 'MAC address is too long'),
        posProductId: Yup.string().max(100, 'POS product ID is too long'),
        posProductVersion: Yup.string().max(50, 'POS version is too long'),
        offlineMaxTransactionAgeHours: Yup.number()
            .min(0, 'Must be 0 or higher')
            .max(168, 'Cannot exceed 168 hours (7 days)'),
        offlineMaxCumulativeAmount: Yup.number()
            .min(0, 'Must be 0 or higher'),
        activationStatus: Yup.string().required('Activation status is required'),
        isPrimary: Yup.boolean(),
        isBlocked: Yup.boolean()
    });

    const handleSubmit = async (values: Partial<Terminal>, { resetForm }: any) => {
        try {
            if (terminal && terminal.terminalId) {
                await terminalService.update(terminal.terminalId, values as UpdateTerminalRequest);
                Report.success("Updated!", "Terminal details updated successfully!", "Ok", () => {
                    navigate(ROUTES.TERMINALS);
                });
            } else {
                await terminalService.store(values as CreateTerminalRequest);
                Report.success("Great!", "Terminal created successfully!", "Ok", () => {
                    resetForm();
                    navigate(ROUTES.TERMINALS);
                });
            }
        } catch (error: any) {
            const errorMessage = error?.error?.response?.data?.message || error?.error?.message || 'An error occurred while saving the terminal';
            Notify.failure(errorMessage);
        }
    };

    const handleLabelChange = (label: string, setFieldValue: Function) => {
        const formattedLabel = capitalizeEachWord(label);
        setFieldValue('terminalLabel', formattedLabel);
    };

    const handleGenerateDeviceId = (setFieldValue: Function) => {
        const deviceId = terminalService.generateDeviceId('DEVICE');
        setFieldValue('deviceId', deviceId);
        Notify.success('Device ID generated');
    };

    const handleDelete = () => {
        if (!terminal) return;

        Report.warning(
            'Delete Terminal',
            'Are you sure you want to delete this terminal? This action cannot be undone.',
            'Delete',
            async () => {
                try {
                    await terminalService.delete(terminal.terminalId);
                    Notify.success('Terminal deleted successfully');
                    navigate(ROUTES.TERMINALS);
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Failed to delete terminal';
                    Notify.failure(errorMessage);
                }
            }
        );
    };

    if (loading) return <MobilePlanSkeleton />;

    return (
        <Fragment>
            <AppLayout>
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialTerminalValues}
                    validationSchema={terminalValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form className="flex flex-col h-full">
                            {isMobile ? (
                                <MobilePageHeader
                                    title={terminal ? 'EDIT TERMINAL' : 'NEW TERMINAL'}
                                    className="bg-white dark:bg-gray-800"
                                    rightContent={
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            theme='success'
                                        >
                                            {terminal ? 'UPDATE' : 'SAVE'}
                                        </Button>
                                    }
                                />
                            ) : (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                                    <PageHeader
                                        title={terminal ? 'EDIT TERMINAL' : 'NEW TERMINAL'}
                                        description='Required fields are marked with an asterisk (*)'
                                    />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <FormWrapper>
                                    <div className="py-4 space-y-4">
                                        {/* Basic Information - Admin only */}
                                        {canSelectTenant && (
                                            <FormFieldCard title="Basic Information">
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => {
                                                        setFieldValue('tenantId', tenantId);
                                                        setFieldValue('branchId', '');
                                                    }}
                                                    error={errors.tenantId}
                                                    touched={touched.tenantId}
                                                />

                                                <BranchSearch
                                                    value={values.branchId}
                                                    onChange={(branchId) => setFieldValue('branchId', branchId)}
                                                    tenantId={values.tenantId}
                                                    error={errors.branchId}
                                                    touched={touched.branchId}
                                                />
                                            </FormFieldCard>
                                        )}

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="text"
                                                    name="terminalCode"
                                                    label="Terminal Code"
                                                    required
                                                    placeholder="e.g., TR001, POS-01"
                                                    maxLength={20}
                                                />

                                                <FormInput
                                                    type="text"
                                                    name="terminalLabel"
                                                    label="Terminal Label"
                                                    required
                                                    placeholder="Enter terminal label"
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                        handleLabelChange(e.target.value, setFieldValue);
                                                    }}
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="number"
                                                    name="terminalPosition"
                                                    label="Terminal Position"
                                                    placeholder="1"
                                                    min="1"
                                                    max="99"
                                                />

                                                <FormSearchableSelect
                                                    label="Activation Status"
                                                    name="activationStatus"
                                                    required
                                                    options={activationStatusOptions}
                                                    placeholder="Select status..."
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="flex items-center">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.isPrimary}
                                                        name='isPrimary'
                                                        onChange={(e) => setFieldValue('isPrimary', e.target.checked)}
                                                        className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Set as primary terminal
                                                    </span>
                                                </label>
                                            </div>
                                        </FormFieldCard>

                                        {/* Device Information */}
                                        <FormFieldCard title="Device Information">
                                            <div className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <FormInput
                                                        type="text"
                                                        name="deviceId"
                                                        label="Device ID"
                                                        placeholder="Device ID (auto-generated)"
                                                    />
                                                </div>
                                                {!terminal && (
                                                    <Button
                                                        type="button"
                                                        theme="neutral"
                                                        onClick={() => handleGenerateDeviceId(setFieldValue)}
                                                        className="mb-0"
                                                    >
                                                        Generate
                                                    </Button>
                                                )}
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="text"
                                                    name="osName"
                                                    label="OS Name"
                                                    placeholder="e.g., Windows, Linux, Android"
                                                />

                                                <FormInput
                                                    type="text"
                                                    name="osVersion"
                                                    label="OS Version"
                                                    placeholder="e.g., 11, 22.04, 13"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="text"
                                                    name="osBuild"
                                                    label="OS Build"
                                                    placeholder="e.g., build-001"
                                                />

                                                <FormInput
                                                    type="text"
                                                    name="macAddress"
                                                    label="MAC Address"
                                                    placeholder="A4:7C:C3:49:D2:CC"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        {/* POS Configuration */}
                                        <FormFieldCard title="POS Configuration">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="text"
                                                    name="posProductId"
                                                    label="POS Product ID"
                                                    placeholder="POS product identifier"
                                                />

                                                <FormInput
                                                    type="text"
                                                    name="posProductVersion"
                                                    label="POS Version"
                                                    placeholder="e.g., 1.0.0"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="number"
                                                    name="offlineMaxTransactionAgeHours"
                                                    label="Offline Max Transaction Age (Hours)"
                                                    placeholder="24"
                                                    min="0"
                                                    max="168"
                                                />

                                                <FormInput
                                                    type="number"
                                                    name="offlineMaxCumulativeAmount"
                                                    label="Offline Max Cumulative Amount"
                                                    placeholder="10000"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        {/* Security Settings */}
                                        <FormFieldCard title="Security Settings">
                                            <div>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.isBlocked}
                                                        name='isBlocked'
                                                        onChange={(e) => setFieldValue('isBlocked', e.target.checked)}
                                                        className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Block this terminal
                                                    </span>
                                                </label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    Blocked terminals cannot process transactions
                                                </p>
                                            </div>
                                        </FormFieldCard>
                                    </div>

                                    {/* Mobile Delete Button */}
                                    {terminal && (
                                        <div className="pb-4 lg:hidden">
                                            <Button
                                                type="button"
                                                theme="danger"
                                                className="w-full"
                                                onClick={handleDelete}
                                            >
                                                Delete Terminal
                                            </Button>
                                        </div>
                                    )}

                                    {/* Desktop Actions Footer */}
                                    <div className="hidden lg:flex pt-4 border-t border-gray-200 dark:border-gray-700 items-center justify-between">
                                        {terminal ? (
                                            <Button
                                                type="button"
                                                theme="danger"
                                                onClick={handleDelete}
                                            >
                                                Delete Terminal
                                            </Button>
                                        ) : (
                                            <div></div>
                                        )}
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            className="px-8"
                                            theme='success'
                                        >
                                            {terminal ? 'Update Terminal' : 'Create Terminal'}
                                        </Button>
                                    </div>
                                </FormWrapper>
                            </div>
                        </Form>
                    )}
                </Formik>
            </AppLayout>
        </Fragment>
    );
};

export default TerminalForm;
