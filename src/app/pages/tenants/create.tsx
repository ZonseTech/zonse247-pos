import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import { Fragment, useState, useEffect } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import tenantService from '../../services/tenant.service';
import CountryPicker from '../../components/CountryPicker';
import { SelectMenuOption } from '../../../types/country';
import { COUNTRIES } from '../../utils/countries';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useLocation } from 'react-router';
import { DEFAULT_COUNTRY_CODE } from '../../constants';
import { tenantValidationSchema } from '../../schemas/tenant.schema';
import { getInitialFormValues } from '../../utils/mergeDeep';
import { capitalizeEachWord, formatDateForInput } from '../../utils';
import {
    businessTypes,
    msonkhoStatuses,
    statuses,
    subscriptionPlans,
    subscriptionStatuses
} from '../../utils/tenant-status';

const TenantFormModal: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
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
                    const errorMessage = error?.response?.data?.message || 'Failed to load tenant details';
                    Notify.failure(errorMessage);
                    // navigate(ROUTES.TENANTS);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTenant();
    }, [tenantId, navigate]);

    const defaultTenantValues: TenantFormValues = {
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
        subscriptionPlan: 'BASIC',
        registeredAt: '',
        subscriptionStatus: 'TRIAL',
        trialEndsAt: '',
        authKey: '',
        status: 'pending'
    };

    const initialTenantValues = getInitialFormValues(defaultTenantValues, {
        ...tenant as unknown as TenantFormValues,
        country: tenant?.country?.replace('Malawi', 'MW') ?? 'MW',
        registeredAt: formatDateForInput(tenant?.registeredAt) ?? '',
        trialEndsAt: formatDateForInput(tenant?.trialEndsAt) ?? '',
        businessType: tenant?.businessType ?? 'PRODUCT_BASED',
        msonkhoOnlineStatus: tenant?.msonkhoOnlineStatus ?? 'PENDING',
        subscriptionStatus: tenant?.subscriptionStatus ?? 'TRIAL',
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
            console.error('Error saving tenant:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the tenant';
            Notify.failure(errorMessage);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading tenant details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <Fragment>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className='sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600'>
                        <div className='flex justify-between items-center'>
                            <PageHeader
                                title={tenant ? 'Edit Tenant' : 'Add Tenant'}
                                description='Required fields are marked with an asterisk (*)'
                            />

                            <Button
                                type="button"
                                theme='danger'
                                onClick={() => navigate(ROUTES.TENANTS)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <Formik
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        initialValues={initialTenantValues}
                        validationSchema={tenantValidationSchema}
                    >
                        {({ isSubmitting, values, setFieldValue }) => (
                            <Form>
                                <FormWrapper>
                                    <FormInput
                                        type="hidden"
                                        name="authKey"
                                        readOnly
                                    />

                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                1
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Business Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
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
                                                name="businessName"
                                                label="Business Name"
                                                required
                                                placeholder="Enter business name"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const formattedName = capitalizeEachWord(e.target.value);
                                                    setFieldValue('businessName', formattedName);
                                                }}
                                            />

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

                                            <FormSelectBox
                                                label="Business Type"
                                                name="businessType"
                                                required
                                                options={businessTypes}
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
                                    </div>

                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                2
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Contact Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormInput
                                                type="email"
                                                name="email"
                                                label="Email"
                                                required
                                                placeholder="contact@company.com"
                                            />

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
                                                type="tel"
                                                name="phoneNumber"
                                                label="Phone"
                                                required
                                                placeholder="Enter phone number"
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
                                    </div>

                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                3
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                MRA Integration
                                            </h3>
                                        </div>

                                        <div className="ml-11">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormInput
                                                    type="text"
                                                    name="mraPortalUsername"
                                                    label="MRA Portal Username"
                                                    placeholder="Enter MRA portal username"
                                                />

                                                <FormSelectBox
                                                    label="Msonkho Online Status"
                                                    name="msonkhoOnlineStatus"
                                                    required
                                                    options={msonkhoStatuses}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                4
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Subscription & Status
                                            </h3>
                                        </div>

                                        <div className="ml-11">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <FormSelectBox
                                                    label="Subscription Plan"
                                                    name="subscriptionPlan"
                                                    options={subscriptionPlans}
                                                />

                                                <FormSelectBox
                                                    label="Subscription Status"
                                                    name="subscriptionStatus"
                                                    required
                                                    options={subscriptionStatuses}
                                                />

                                                {values.subscriptionStatus === 'TRIAL' && (
                                                    <FormInput
                                                        type="date"
                                                        name="trialEndsAt"
                                                        label="Trial Ends At"
                                                        required
                                                        placeholderText='Select trial end date'
                                                        className='min-w-full'
                                                    />
                                                )}

                                                <FormSelectBox
                                                    label="Account Status"
                                                    name="status"
                                                    required
                                                    options={statuses}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className=" pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
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
                            </Form>
                        )}
                    </Formik>
                </div>
            </AppLayout>
        </Fragment>
    );
};

export default TenantFormModal;