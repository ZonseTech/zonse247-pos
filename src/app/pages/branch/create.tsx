import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, FormFieldCard, OfflinePlaceholder } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import TenantSearch from './partials/TenantSearch';
import SubscriptionPlanSelector from './partials/SubscriptionPlanSelector';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import branchService from '../../services/branch.service';
import districtService from '../../services/district.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useBranchPermissions } from '../../hooks/useBranchPermissions';
import { businessTypes } from '../../utils/tenant-status';
import { capitalizeEachWord, hasRole } from '../../utils';
import * as Yup from 'yup';
import { useConnectivity } from '../../hooks/useConnectivity';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import { getErrorMessage } from '../../utils/api-error-handler';

interface BranchFormValuesType extends Partial<Branch> {
    subscriptionPlanId?: string;
    subscriptionMonths?: number;
}

const BranchForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { isOnline } = useConnectivity();
    const permissions = useBranchPermissions();
    const [loading, setLoading] = useState(false);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [districtOptions, setDistrictOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(true);

    const { branchId, tenantId: stateTenantId } = location.state || {};
    const { user: authUser } = useAuth();

    const effectiveTenantId = stateTenantId || authUser?.tenantId || '';

    const canEdit = useMemo(() => {
        if (!branchId) return permissions.canCreateBranch;
        return permissions.canEditBranch(branchId);
    }, [branchId, permissions]);

    const canDelete = useMemo(() => {
        if (!branchId) return false;
        return permissions.canDeleteBranch(branchId);
    }, [branchId, permissions]);

    const isViewOnly = branchId && !canEdit;

    const canSelectTenant = useMemo(() => {
        return hasRole(authUser, 'admin');
    }, [authUser]);

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

    const branchValidationSchema = Yup.object().shape({
        tenantId: canSelectTenant ? Yup.string()
            .required('Tenant is required') : Yup.string(),
        branchName: Yup.string()
            .required('Business name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(255, 'Name is too long'),
        subscriptionPlanId: !branchId ? Yup.string()
            .required('Subscription plan is required') : Yup.string(),
        districtId: Yup.string()
            .required('District is required'),
        location: Yup.string()
            .max(255, 'Location is too long'),
        businessType: Yup.string()
            .required('Business type is required'),
        currencyCode: Yup.string()
            .required('Currency is required'),
        phoneNumber: Yup.string()
            .required('Phone number is required')
            .matches(/^[\+]?[0-9\s\-\(\)]*$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string()
            .email('Invalid email format')
            .max(255, 'Email is too long'),
    });

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
            if (branchId) {
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
            }
        };

        fetchBranch();
    }, [branchId]);

    // For admins creating new branch, don't default to their tenant - let them pick
    const defaultTenantId = canSelectTenant ? (stateTenantId || '') : effectiveTenantId;

    const defaultBranchValues: BranchFormValuesType = {
        branchId: '',
        tenantId: defaultTenantId,
        branchName: '',
        subscriptionPlanId: '',
        subscriptionMonths: 1,
        districtId: '',
        location: '',
        businessType: 'PRODUCT_BASED',
        phoneNumber: '',
        email: '',
        currencyCode: 'MWK',
        currencySymbol: 'K',
        taxRate: 0.00,
        chargeTax: false,
        isVirtualWarehouse: false,
        isActive: true,
        synced: 0,
        mraApprovalStatus: 'PENDING',
        status: 'active'
    };

    const initialBranchValues: BranchFormValuesType = branch ? { ...branch } : defaultBranchValues;

    const handleSubmit = async (values: BranchFormValuesType, { resetForm }: any) => {
        try {
            if (branch && branch.branchId) {
                await branchService.update(branch.branchId, values as UpdateBranchRequest);
                Report.success("Updated!", "Branch details updated successfully!", "Ok", () => {
                    navigate(ROUTES.BRANCHES);
                });
            } else {
                await branchService.store(values as CreateBranchRequest);
                Report.success("Great!", "Branch created successfully!", "Ok", () => {
                    resetForm();
                    navigate(ROUTES.BRANCHES);
                });
            }
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
                    navigate(ROUTES.BRANCHES);
                } catch (error: any) {
                    const errorMessage = getErrorMessage(error, 'Failed to delete branch');
                    Notify.failure(errorMessage);
                }
            }
        );
    };

    if (loading) return <MobilePlanSkeleton />

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Branch Management Unavailable Offline"
                        description="Creating or editing branches requires an internet connection to sync with the server. Please connect to the internet and try again."
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
                    initialValues={initialBranchValues}
                    validationSchema={branchValidationSchema}
                >
                    {({ isSubmitting, setFieldValue, submitForm, values, errors, touched }) => (
                        <Form className="flex flex-col h-full">
                            {isMobile ? (
                                <MobilePageHeader
                                    title={isViewOnly ? 'VIEW BRANCH' : (branch ? 'EDIT BRANCH' : 'NEW BRANCH')}
                                    className="bg-white dark:bg-gray-800"
                                    rightContent={
                                        !isViewOnly && (
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                theme='success'
                                            >
                                                {branch ? 'UPDATE' : 'SAVE'}
                                            </Button>
                                        )
                                    }
                                />
                            ) : (
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full">
                                    <PageHeader
                                        title={isViewOnly ? 'VIEW BRANCH' : (branch ? 'EDIT BRANCH' : 'NEW BRANCH')}
                                        description={isViewOnly ? 'You have view-only access to this branch' : 'Required fields are marked with an asterisk (*)'}
                                    />
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                <FormWrapper>
                                    <div className="py-4 space-y-4">
                                        {canSelectTenant && (
                                            <FormFieldCard>
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => setFieldValue('tenantId', tenantId)}
                                                    error={errors.tenantId as string}
                                                    touched={touched.tenantId as boolean}
                                                    disabled={isViewOnly}
                                                />
                                            </FormFieldCard>
                                        )}

                                        <FormFieldCard>
                                            <FormInput
                                                type="text"
                                                name="branchName"
                                                label="Business Name"
                                                required={!isViewOnly}
                                                disabled={isViewOnly}
                                                placeholder="Enter business name"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    handleNameChange(e.target.value, setFieldValue);
                                                }}
                                            />
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormSearchableSelect
                                                    label="District"
                                                    name="districtId"
                                                    required={!isViewOnly}
                                                    disabled={isViewOnly}
                                                    options={districtOptions}
                                                    placeholder="Search and select district..."
                                                    isLoading={loadingDistricts}
                                                />

                                                <FormInput
                                                    type="text"
                                                    name="location"
                                                    label="Location"
                                                    disabled={isViewOnly}
                                                    placeholder="Enter location"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormSearchableSelect
                                                    label="Business Type"
                                                    name="businessType"
                                                    required={!isViewOnly}
                                                    disabled={isViewOnly}
                                                    options={businessTypes}
                                                    placeholder="Select business type..."
                                                />

                                                <FormSearchableSelect
                                                    label="Currency"
                                                    name="currencyCode"
                                                    required={!isViewOnly}
                                                    disabled={isViewOnly}
                                                    options={currencyOptions}
                                                    placeholder="Select currency..."
                                                />
                                            </div>
                                        </FormFieldCard>

                                        <FormFieldCard>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="tel"
                                                    name="phoneNumber"
                                                    label="Phone Number"
                                                    required={!isViewOnly}
                                                    disabled={isViewOnly}
                                                    placeholder="Enter phone number"
                                                />

                                                <FormInput
                                                    type="email"
                                                    name="email"
                                                    label="Email"
                                                    disabled={isViewOnly}
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </FormFieldCard>

                                        {/* Subscription Plan Selection - Only for new branch */}
                                        {!branch && (
                                            <SubscriptionPlanSelector
                                                selectedPlanId={values.subscriptionPlanId || ''}
                                                subscriptionMonths={values.subscriptionMonths || 1}
                                                onPlanChange={(planId) => setFieldValue('subscriptionPlanId', planId)}
                                                onDurationChange={(months) => setFieldValue('subscriptionMonths', months)}
                                                error={errors.subscriptionPlanId as string}
                                                touched={touched.subscriptionPlanId as boolean}
                                            />
                                        )}
                                    </div>

                                    {/* Mobile Delete Button - Only show if user can delete */}
                                    {branch && canDelete && (
                                        <div className="pb-4 lg:hidden">
                                            <Button
                                                type="button"
                                                theme="danger"
                                                className="w-full"
                                                onClick={handleDelete}
                                            >
                                                Delete Branch
                                            </Button>
                                        </div>
                                    )}

                                    {/* Desktop Actions Footer */}
                                    <div className="hidden lg:flex pt-4 border-t border-gray-200 dark:border-gray-700 items-center justify-between">
                                        {branch && canDelete ? (
                                            <Button
                                                type="button"
                                                theme="danger"
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
                                                theme='success'
                                            >
                                                {branch ? 'Update Branch' : 'Create Branch'}
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
