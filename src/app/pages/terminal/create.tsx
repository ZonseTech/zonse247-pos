import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '@radix-ui/themes';
import { OfflinePlaceholder } from '../../components';
import TextInput from '../../components/TextInput';
import FormWrapper from '../../components/FormWrapper';
import BranchSearch from './partials/BranchSearch';
import { Fragment, useState, useEffect } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import terminalService from '../../services/terminal.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import { terminalValidationSchema } from '../../schemas/terminal.schema';
import { capitalizeEachWord } from '../../utils';
import { useConnectivity } from '../../hooks/useConnectivity';
import { getErrorMessage } from '../../utils/api-error-handler';

const TerminalForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { isOnline } = useConnectivity();
    const [loading, setLoading] = useState(true);
    const [terminal, setTerminal] = useState<Terminal | null>(null);

    const { terminalId } = location.state || {};

    useEffect(() => {
        const fetchTerminal = async () => {
            if (!terminalId) return;
            setLoading(true);
            try {
                const terminalData = await terminalService.show(terminalId);
                setTerminal(terminalData);
            } catch (error: any) {
                console.error('Error fetching terminal:', error);
                const errorMessage = getErrorMessage(error, 'Failed to load terminal details');
                Notify.failure(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchTerminal();
    }, [terminalId]);

    const handleSubmit = async (values: Partial<Terminal>) => {
        if (!terminal) return;
        try {
            await terminalService.update(terminal.terminalId, values as UpdateTerminalRequest);
            Report.success("Updated!", "Terminal details updated successfully!", "Ok", () => {
                navigate(ROUTES.ACCOUNT_INFO_TERMINALS);
            });
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'An error occurred while saving the terminal');
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
                    navigate(ROUTES.ACCOUNT_INFO_TERMINALS);
                } catch (error: any) {
                    const errorMessage = getErrorMessage(error, 'Failed to delete terminal');
                    Notify.failure(errorMessage);
                }
            }
        );
    };

    if (loading || !terminal) return <MobilePlanSkeleton />;

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Terminal Management Unavailable Offline"
                        description="Editing terminals requires an internet connection to sync with the server. Please connect to the internet and try again."
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
                    initialValues={terminal}
                    validationSchema={terminalValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form className="flex flex-col h-full">
                            {isMobile ? (
                                <MobilePageHeader
                                    title="EDIT TERMINAL"
                                    className="bg-white dark:bg-gray-800"
                                    rightContent={
                                        <Button type="submit" loading={isSubmitting} size="2">
                                            UPDATE
                                        </Button>
                                    }
                                />
                            ) : (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                                    <PageHeader
                                        title="EDIT TERMINAL"
                                        description="Required fields are marked with an asterisk (*)"
                                    />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <FormWrapper>
                                    <div className="py-4 space-y-4">
                                        <BranchSearch
                                            value={values.branchId}
                                            onChange={(branchId) => setFieldValue('branchId', branchId)}
                                            tenantId={values.tenantId}
                                            error={errors.branchId as string}
                                            touched={touched.branchId as boolean}
                                        />

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <TextInput
                                                name="terminalLabel"
                                                label="Terminal Label"
                                                required
                                                placeholder="Enter terminal label"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    handleLabelChange(e.target.value, setFieldValue);
                                                }}
                                            />

                                            <TextInput
                                                type="number"
                                                name="terminalPosition"
                                                label="Terminal Position"
                                                placeholder="1"
                                                min="1"
                                                max="99"
                                            />
                                        </div>
                                    </div>

                                    <div className="pb-4 lg:hidden">
                                        <Button
                                            type="button"
                                            color="red"
                                            variant="soft"
                                            className="w-full"
                                            onClick={handleDelete}
                                        >
                                            Delete Terminal
                                        </Button>
                                    </div>

                                    <div className="hidden lg:flex pt-4 border-t border-gray-200 dark:border-gray-700 items-center justify-between">
                                        <Button
                                            type="button"
                                            color="red"
                                            variant="soft"
                                            onClick={handleDelete}
                                        >
                                            Delete Terminal
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            className="px-8"
                                        >
                                            Update Terminal
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
