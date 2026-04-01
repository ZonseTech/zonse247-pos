import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button, FormFieldCard, OfflinePlaceholder } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import tenantService from '../../services/tenant.service';
import CountryPicker from '../../components/CountryPicker';
import { SelectMenuOption } from '../../../types/country';
import { COUNTRIES } from '../../utils/countries';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { DEFAULT_COUNTRY_CODE } from '../../constants';
import { tenantValidationSchema } from '../../schemas/tenant.schema';
import { getInitialFormValues } from '../../utils/mergeDeep';
import { capitalizeEachWord } from '../../utils';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useConnectivity } from '../../hooks/useConnectivity';
import MobilePlanSkeleton from '../../components/loader/MobilePlanSkeleton';
import { getErrorMessage } from '../../utils/api-error-handler';
import {
    businessTypes,
    msonkhoStatuses,
    statuses,
} from '../../utils/tenant-status';

const TenantFormModal: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();
    const { isOnline } = useConnectivity();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tenant, setTenant] = useState<Tenant | null>(null);

    const { tenantId } = location.state || {};

    useEffect(() => {
        const fetchTenant = async () => {
            if (tenantId) {
                setLoading(true);
                try {
                    const tenantData = await tenantService.show(tenantId);
                    setTenant(tenantData);
                } catch (error: any) {
                    console.error('Error fetching tenant:', error);
                    const errorMessage = getErrorMessage(error, 'Failed to load tenant details');
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTenant();
    }, [tenantId, navigate]);

    const defaultTenantValues: any = {
        tenantCode: '',
        businessName: '',
        tradingName: '',
        tin: '',
        businessType: 'PRODUCT_BASED',
        ownerName: '',
        email: '',
        phoneNumber: '',
        address: '',
        country: 'MW',
        mraPortalUsername: '',
        msonkhoOnlineStatus: 'PENDING',
        registeredAt: '',
        subscriptionStatus: 'trial',
        trialEndsAt: '',
        verificationToken: '',
        status: 'pending'
    };

    const initialTenantValues = getInitialFormValues(defaultTenantValues, {
        ...tenant as unknown as TenantFormValues,
        country: tenant?.country?.replace('Malawi', 'MW') ?? 'MW',
        registeredAt: (tenant?.registeredAt) ?? '',
        trialEndsAt: (tenant?.trialEndsAt) ?? '',
        businessType: tenant?.businessType ?? 'PRODUCT_BASED',
        msonkhoOnlineStatus: tenant?.msonkhoOnlineStatus ?? 'PENDING',
        status: tenant?.status ?? 'pending',
    }, 'tenantId');

    const handleSubmit = async (values: TenantFormValues, { resetForm }: any) => {
        try {
            if (tenant && tenant.tenantId) {
                await tenantService.update(tenant.tenantId, values);
                Report.success("Updated!", "Tenant details updated successfully!", "Ok", () => {
                    navigate(ROUTES.TENANTS);
                });
            } else {
                await tenantService.store(values);
                Report.success("Great!", "Tenant details saved!", "Ok", () => {
                    resetForm();
                    navigate(ROUTES.TENANTS);
                });
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, 'An error occurred while saving the tenant');
            Notify.failure(errorMessage);
        }
    };

    if (loading) return <MobilePlanSkeleton />

    if (!isOnline) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <OfflinePlaceholder
                        title="Tenant Management Unavailable Offline"
                        description="Creating or editing tenants requires an internet connection to sync with the server. Please connect to the internet and try again."
                        variant="cloud"
                    />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize={true}
                initialValues={initialTenantValues}
                validationSchema={tenantValidationSchema}
            >
                {({ isSubmitting, values, setFieldValue }) => (
                    <Form className="flex flex-col h-full">
                        {isMobile ? (
                            <MobilePageHeader
                                title={tenant ? 'EDIT TENANT' : 'NEW TENANT'}
                                className="bg-white dark:bg-gray-800"
                                rightContent={
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        theme='success'
                                    >
                                        {tenant ? 'UPDATE' : 'SAVE'}
                                    </Button>
                                }
                            />
                        ) : (
                            <PageHeader
                                title={tenant ? 'EDIT TENANT' : 'NEW TENANT'}
                                description='Required fields are marked with an asterisk (*)'
                            />
                        )}

                        <div className="flex-1 overflow-y-auto max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <FormWrapper>
                                <FormInput
                                    type="hidden"
                                    name="verificationToken"
                                    readOnly
                                />

                                <div className="py-4 space-y-4">
                                    <FormFieldCard>
                                        <FormInput
                                            type="text"
                                            name="businessName"
                                            label="Business Name"
                                            required
                                            placeholder="Enter business name"
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                const formattedName = capitalizeEachWord(e.target.value);
                                                setFieldValue('businessName', formattedName);
                                            }}
                                        />
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {values.tenantId && (
                                                <FormInput
                                                    type="text"
                                                    name="tenantCode"
                                                    label="Tenant Code"
                                                    readOnly
                                                    placeholder="Unique tenant identifier"
                                                />
                                            )}

                                            <FormInput
                                                type="text"
                                                name="tradingName"
                                                label="Trading Name"
                                                placeholder="Enter trading name (optional)"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const formattedName = capitalizeEachWord(e.target.value);
                                                    setFieldValue('tradingName', formattedName);
                                                }}
                                            />

                                            <FormInput
                                                type="text"
                                                name="tin"
                                                label="TIN (Tax ID)"
                                                required
                                                placeholder="Enter tax identification number"
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <FormSearchableSelect
                                                label="Business Type"
                                                name="businessType"
                                                required
                                                options={businessTypes}
                                                placeholder="Select business type..."
                                            />

                                            <FormInput
                                                type="text"
                                                name="ownerName"
                                                label="Owner Name"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const formattedName = capitalizeEachWord(e.target.value);
                                                    setFieldValue('ownerName', formattedName);
                                                }}
                                                required
                                                placeholder="Enter owner full name"
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <FormInput
                                                type="email"
                                                name="email"
                                                label="Email"
                                                required
                                                placeholder="contact@company.com"
                                            />

                                            <FormInput
                                                type="tel"
                                                name="phoneNumber"
                                                label="Phone"
                                                required
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <CountryPicker
                                                id={'countries'}
                                                open={isOpen}
                                                onToggle={() => setIsOpen(!isOpen)}
                                                onChange={val => setFieldValue('country', val)}
                                                selectedValue={COUNTRIES.find(
                                                    option => option.value === (values.country || DEFAULT_COUNTRY_CODE)
                                                ) as SelectMenuOption}
                                            />

                                            <FormInput
                                                type="text"
                                                name="address"
                                                label="Address"
                                                required
                                                className='capitalize'
                                                placeholder="Enter full address"
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <FormInput
                                                type="text"
                                                name="mraPortalUsername"
                                                label="MRA Portal Username"
                                                placeholder="Enter MRA portal username"
                                            />

                                            <FormSearchableSelect
                                                label="Msonkho Online Status"
                                                name="msonkhoOnlineStatus"
                                                required
                                                options={msonkhoStatuses}
                                                placeholder="Select status..."
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div className="flex flex-col">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Subscription Plan
                                                </label>
                                                <Dropdown
                                                    options={subscriptionPlans}
                                                    selectedValue={values.subscriptionPlan}
                                                    onSelect={(option) => setFieldValue('subscriptionPlan', option?.value || '')}
                                                    placeholder="Select subscription plan..."
                                                    isLoading={loadingPlans}
                                                    loadingMessage="Loading plans..."
                                                    emptyStateMessage="No subscription plans available"
                                                    searchable={true}
                                                    searchPlaceholder="Search plans..."
                                                    allowClear={false}
                                                />
                                            </div>

                                            <FormSearchableSelect
                                                label="Subscription Status"
                                                name="subscriptionStatus"
                                                required
                                                options={subscriptionStatuses}
                                                placeholder="Select status..."
                                            />
                                        </div>
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {values.subscriptionStatus === 'trial' && (
                                                <FormInput
                                                    type="date"
                                                    name="trialEndsAt"
                                                    label="Trial Ends At"
                                                    required
                                                    placeholderText='Select trial end date'
                                                    className='min-w-full'
                                                />
                                            )}

                                            <FormSearchableSelect
                                                label="Account Status"
                                                name="status"
                                                required
                                                options={statuses}
                                                placeholder="Select status..."
                                            />
                                        </div>
                                    </FormFieldCard>
                                </div>

                                <div className="hidden lg:flex pt-4 border-t border-gray-200 dark:border-gray-700 items-center justify-end">
                                    <Button
                                        type="submit"
                                        loading={isSubmitting}
                                        className="px-8"
                                        theme='success'
                                    >
                                        {tenant ? 'Update Tenant' : 'Create Tenant'}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </div>
                    </Form>
                )}
            </Formik>
        </AppLayout>
    );
};

export default TenantFormModal;