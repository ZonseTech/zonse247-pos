import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, FormFieldCard, OfflinePlaceholder } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
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
import { hasRole } from '../../utils';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import * as Yup from 'yup';
import { capitalizeEachWord } from '../../utils';
import { useConnectivity } from '../../hooks/useConnectivity';

const TerminalForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { isOnline } = useConnectivity();
    const [loading, setLoading] = useState(false);
    const [terminal, setTerminal] = useState<Terminal | null>(null);

    const { terminalId, tenantId: stateTenantId } = location.state || {};
    const { user: authUser } = useAuth();

    const effectiveTenantId = stateTenantId || authUser?.tenantId || '';

    const canSelectTenant = useMemo(() => {
        return hasRole(authUser, 'admin');
    }, [authUser]);

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

    const defaultTerminalValues: Partial<Terminal> = {
        terminalId: '',
        tenantId: effectiveTenantId,
        branchId: stateTenantId ? '' : (authUser?.branchId || ''),
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

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Terminal Management Unavailable Offline"
                        description="Creating or editing terminals requires an internet connection to sync with the server. Please connect to the internet and try again."
                        variant="cloud"
                    />
                </div>
            </AppLayout>
        );
    }

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
                                        {canSelectTenant && stateTenantId && (
                                            <FormFieldCard title="Tenant & Branch">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    <TenantSearch
                                                        value={values.tenantId}
                                                        onChange={(tenantId) => {
                                                            setFieldValue('tenantId', tenantId);
                                                            setFieldValue('branchId', '');
                                                        }}
                                                        error={errors.tenantId}
                                                        touched={touched.tenantId}
                                                        disabled
                                                    />

                                                    <BranchSearch
                                                        value={values.branchId}
                                                        onChange={(branchId) => setFieldValue('branchId', branchId)}
                                                        tenantId={values.tenantId}
                                                        error={errors.branchId}
                                                        touched={touched.branchId}
                                                    />
                                                </div>
                                            </FormFieldCard>
                                        )}

                                        {!stateTenantId && (
                                            <FormFieldCard title="Branch">
                                                <BranchSearch
                                                    value={values.branchId}
                                                    onChange={(branchId) => setFieldValue('branchId', branchId)}
                                                    tenantId={values.tenantId}
                                                    error={errors.branchId}
                                                    touched={touched.branchId}
                                                />
                                            </FormFieldCard>
                                        )}

                                        <FormFieldCard title="Terminal Information">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

                                                <FormInput
                                                    type="number"
                                                    name="terminalPosition"
                                                    label="Terminal Position"
                                                    placeholder="1"
                                                    min="1"
                                                    max="99"
                                                />
                                            </div>
                                        </FormFieldCard>
                                    </div>

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
