import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import { Fragment, useState, useEffect } from 'react';
import type { FunctionComponent } from 'react';
import clientsService from '../../services/client.service';
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

const TenantFormModal: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [client, setClient] = useState<Client | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const { id } = location.state || {};

    useEffect(() => {
        const fetchClient = async () => {
            if (id) {
                setLoading(true);
                try {
                    const clientData = await clientsService.show(id);
                    setClient(clientData);
                } catch (error: any) {
                    console.error('Error fetching client:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load client details';
                    Notify.failure(errorMessage);
                    navigate(ROUTES.TENANTS);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchClient();
    }, [id, navigate]);

    const businessTypes = [
        { label: 'Product Based', value: 'PRODUCT_BASED' },
        { label: 'Service Based', value: 'SERVICE_BASED' }
    ];

    const subscriptionStatuses = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Cancelled', value: 'CANCELLED' },
        { label: 'Trial', value: 'TRIAL' }
    ];

    const statuses = [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Cancelled', value: 'cancelled' }
    ];

    const msonkhoStatuses = [
        { label: 'Verified', value: 'VERIFIED' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Failed', value: 'FAILED' }
    ];

    const subscriptionPlans = [
        { label: 'Basic', value: 'BASIC' },
        { label: 'Standard', value: 'STANDARD' },
        { label: 'Premium', value: 'PREMIUM' },
        { label: 'Enterprise', value: 'ENTERPRISE' }
    ];

    const initialClientValues = client ? {
        uuid: client.uuid || '',
        clientCode: client.clientCode || '',
        businessName: client.businessName || '',
        tin: client.tin || '',
        businessType: client.businessType || 'PRODUCT_BASED',
        ownerName: client.ownerName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        country: client.country?.replace('Malawi', 'MW') || 'MW',
        mraPortalUsername: client.mraPortalUsername || '',
        msonkhoOnlineStatus: client.msonkhoOnlineStatus || 'PENDING',
        subscriptionPlan: client.subscriptionPlan || '',
        registeredAt: client.registeredAt || '',
        subscriptionStatus: client.subscriptionStatus || 'TRIAL',
        trialEndsAt: client.trialEndsAt || '',
        authKey: client.authKey || '',
        status: client.status || 'pending'
    } : {
        uuid: '',
        clientCode: '',
        businessName: '',
        tin: '',
        businessType: 'PRODUCT_BASED',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        country: 'MW',
        mraPortalUsername: '',
        msonkhoOnlineStatus: 'PENDING',
        subscriptionPlan: '',
        registeredAt: '',
        subscriptionStatus: 'TRIAL',
        trialEndsAt: '',
        authKey: '',
        status: 'pending'
    };

    const handleSubmit = async (values: Client, { resetForm }: any) => {
        try {
            if (client && client.uuid) {
                await clientsService.update(client.uuid, values);
                Report.success("Updated!", "Client details updated successfully!", "Ok", () => {
                    navigate(ROUTES.TENANTS);
                });
            } else {
                await clientsService.store(values);
                Report.success("Great!", "Client details saved!", "Ok", () => {
                    resetForm();
                    navigate(ROUTES.TENANTS);
                });
            }
        } catch (error: any) {
            console.error('Error saving client:', error);
            const errorMessage = error?.response?.data?.message || 'An error occurred while saving the client';
            Notify.failure(errorMessage);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading client details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <Fragment>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className='mb-6 border-b border-gray-300 dark:border-gray-600'>
                        <PageHeader
                            title={client ? 'Edit Tenant' : 'Add Tenant'}
                            description='Required fields are marked with an asterisk (*)'
                        />
                    </div>

                    <Formik
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        initialValues={initialClientValues}
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
                                            {values.uuid && (
                                                <FormInput
                                                    type="text"
                                                    name="clientCode"
                                                    label="Client Code"
                                                    readOnly
                                                    placeholder="Unique client identifier"
                                                />
                                            )}

                                            <FormInput
                                                type="text"
                                                name="businessName"
                                                label="Business Name"
                                                required
                                                placeholder="Enter business name"
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

                                            <FormInput
                                                type="tel"
                                                name="phone"
                                                label="Phone"
                                                required
                                                placeholder="Enter phone number"
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
                                                type="text"
                                                name="address"
                                                label="Address"
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

                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                        <Button
                                            type="button"
                                            theme='danger'
                                            onClick={() => navigate(ROUTES.TENANTS)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            className="px-8"
                                            theme='success'
                                        >
                                            {client ? 'Update Tenant' : 'Create Tenant'}
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