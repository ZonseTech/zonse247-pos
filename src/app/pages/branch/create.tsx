import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '@radix-ui/themes';
import { OfflinePlaceholder } from '../../components';
import TextInput from '../../components/TextInput';
import SelectField from '../../components/SelectField';
import FormWrapper from '../../components/FormWrapper';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import branchService from '../../services/branch.service';
import districtService from '../../services/district.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useBranchPermissions } from '../../hooks/useBranchPermissions';
import { businessTypes } from '../../utils/tenant-status';
import { capitalizeEachWord } from '../../utils';
import { getBranchValidationSchema } from '../../schemas/branch.schema';
import { useConnectivity } from '../../hooks/useConnectivity';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import { getErrorMessage } from '../../utils/api-error-handler';

const currencyOptions = [
    { label: 'USD - $', value: 'USD' },
    { label: 'EUR - €', value: 'EUR' },
    { label: 'GBP - £', value: 'GBP' },
    { label: 'MWK - K', value: 'MWK' },
    { label: 'ZAR - R', value: 'ZAR' },
    { label: 'KES - KSh', value: 'KES' },
    { label: 'UGX - USh', value: 'UGX' },
    { label: 'TZS - TSh', value: 'TZS' }
];

const branchValidationSchema = getBranchValidationSchema(false, true);

const BranchForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { isOnline } = useConnectivity();
    const permissions = useBranchPermissions();
    const [loading, setLoading] = useState(true);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [districtOptions, setDistrictOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(true);

    const { branchId } = location.state || {};

    const canEdit = useMemo(() => permissions.canEditBranch(branchId), [branchId, permissions]);
    const canDelete = useMemo(() => permissions.canDeleteBranch(branchId), [branchId, permissions]);
    const isViewOnly = !canEdit;

    useEffect(() => {
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            try {
                const options = await districtService.getOptions();
                setDistrictOptions(options);
            } catch (error: any) {
                console.error('Error fetching districts:', error);
            } finally {
                setLoadingDistricts(false);
            }
        };

        fetchDistricts();
    }, []);

    useEffect(() => {
        const fetchBranch = async () => {
            if (!branchId) return;
            setLoading(true);
            try {
                const branchData = await branchService.show(branchId);
                setBranch(branchData);
            } catch (error: any) {
                console.error('Error fetching branch:', error);
                const errorMessage = getErrorMessage(error, 'Failed to load branch details');
                Notify.failure(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchBranch();
    }, [branchId]);

    const handleSubmit = async (values: Partial<Branch>) => {
        if (!branch) return;
        try {
            await branchService.update(branch.branchId, values as UpdateBranchRequest);
            Report.success("Updated!", "Branch details updated successfully!", "Ok", () => {
                navigate(ROUTES.ACCOUNT_INFO_BRANCHES);
            });
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'An error occurred while saving the branch');
            Notify.failure(errorMessage);
        }
    };

    const handleNameChange = (name: string, setFieldValue: Function) => {
        const formattedName = capitalizeEachWord(name);
        setFieldValue('branchName', formattedName);
    };

    const handleDelete = () => {
        if (!branch) return;

        Report.warning(
            'Delete Branch',
            'Are you sure you want to delete this branch? This action cannot be undone.',
            'Delete',
            async () => {
                try {
                    await branchService.delete(branch.branchId);
                    Notify.success('Branch deleted successfully');
                    navigate(ROUTES.ACCOUNT_INFO_BRANCHES);
                } catch (error: any) {
                    const errorMessage = getErrorMessage(error, 'Failed to delete branch');
                    Notify.failure(errorMessage);
                }
            }
        );
    };

    if (loading || !branch) return <MobilePlanSkeleton />

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Branch Management Unavailable Offline"
                        description="Editing branches requires an internet connection to sync with the server. Please connect to the internet and try again."
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
                    initialValues={branch}
                    validationSchema={branchValidationSchema}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form className="flex flex-col h-full">
                            {isMobile ? (
                                <MobilePageHeader
                                    title={isViewOnly ? 'VIEW BRANCH' : 'EDIT BRANCH'}
                                    className="bg-white dark:bg-gray-800"
                                    rightContent={
                                        !isViewOnly && (
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                size="2"
                                            >
                                                UPDATE
                                            </Button>
                                        )
                                    }
                                />
                            ) : (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                                    <PageHeader
                                        title={isViewOnly ? 'VIEW BRANCH' : 'EDIT BRANCH'}
                                        description={isViewOnly ? 'You have view-only access to this branch' : 'Required fields are marked with an asterisk (*)'}
                                    />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <FormWrapper>
                                    <div className="py-4 space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <TextInput
                                                name="branchName"
                                                label="Branch Name"
                                                required={!isViewOnly}
                                                disabled={isViewOnly}
                                                placeholder="Enter branch name"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    handleNameChange(e.target.value, setFieldValue);
                                                }}
                                            />

                                            <SelectField
                                                label="Business Type"
                                                name="businessType"
                                                required={!isViewOnly}
                                                disabled={isViewOnly}
                                                options={businessTypes}
                                                placeholder="Select business type..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <TextInput
                                                type="tel"
                                                name="phoneNumber"
                                                label="Phone Number"
                                                required={!isViewOnly}
                                                disabled={isViewOnly}
                                                placeholder="Enter phone number"
                                            />

                                            <TextInput
                                                type="email"
                                                name="email"
                                                label="Email"
                                                disabled={isViewOnly}
                                                placeholder="Enter email address"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <SelectField
                                                label="District"
                                                name="districtId"
                                                required={!isViewOnly}
                                                disabled={isViewOnly || loadingDistricts}
                                                options={districtOptions}
                                                placeholder={loadingDistricts ? 'Loading districts...' : 'Select district...'}
                                            />

                                            <TextInput
                                                name="location"
                                                label="Location"
                                                disabled={isViewOnly}
                                                placeholder="Enter location"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <SelectField
                                                label="Currency"
                                                name="currencyCode"
                                                required={!isViewOnly}
                                                disabled={isViewOnly}
                                                options={currencyOptions}
                                                placeholder="Select currency..."
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Delete Button - Only show if user can delete */}
                                    {canDelete && (
                                        <div className="pb-4 lg:hidden">
                                            <Button
                                                type="button"
                                                color="red"
                                                variant="soft"
                                                className="w-full"
                                                onClick={handleDelete}
                                            >
                                                Delete Branch
                                            </Button>
                                        </div>
                                    )}

                                    {/* Desktop Actions Footer */}
                                    <div className="hidden lg:flex pt-4 border-t border-gray-200 dark:border-gray-700 items-center justify-between">
                                        {canDelete ? (
                                            <Button
                                                type="button"
                                                color="red"
                                                variant="soft"
                                                onClick={handleDelete}
                                            >
                                                Delete Branch
                                            </Button>
                                        ) : (
                                            <div></div>
                                        )}
                                        {!isViewOnly && (
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                className="px-8"
                                            >
                                                Update Branch
                                            </Button>
                                        )}
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

export default BranchForm;
