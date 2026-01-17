import { Form, Formik } from 'formik';
import { Notify, Report } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import FormTextArea from '../../components/FormTextArea';
import TenantSearch from './partials/TenantSearch';
import { Fragment, useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, FunctionComponent } from 'react';
import branchService from '../../services/branch.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { useAuth } from '../../context/AuthProvider';
import { ROLE_IDS } from '../../constants/roles';
import * as Yup from 'yup';
import { capitalizeEachWord } from '../../utils';

const BranchForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [branch, setBranch] = useState<Branch | null>(null);

    const { branchId } = location.state || {};
    const { user: authUser } = useAuth();

    // Check if user can select tenant (only admins and super admins)
    const canSelectTenant = useMemo(() => {
        if (!authUser?.roleId) return false;
        const adminRoles = [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.TENANT_OWNER];
        return adminRoles.includes(authUser.roleId as typeof adminRoles[number]);
    }, [authUser?.roleId]);

    useEffect(() => {
        const fetchBranch = async () => {
            if (branchId) {
                setLoading(true);
                try {
                    const branchData = await branchService.show(branchId);
                    setBranch(branchData);
                } catch (error: any) {
                    console.error('Error fetching branch:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load branch details';
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBranch();
    }, [branchId]);

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Suspended', value: 'suspended' }
    ];

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

    const getCurrencySymbol = (code: string): string => {
        const symbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'MWK': 'K',
            'ZAR': 'R',
            'KES': 'KSh',
            'UGX': 'USh',
            'TZS': 'TSh'
        };
        return symbols[code] || '$';
    };

    const defaultBranchValues: Partial<Branch> = {
        branchId: '',
        tenantId: authUser?.tenantId || '',
        branchName: '',
        siteId: '',
        siteName: '',
        description: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        district: '',
        city: '',
        state: '',
        postalCode: '',
        phoneNumber: '',
        email: '',
        currencyCode: 'MWK',
        currencySymbol: 'K',
        taxRate: '0',
        chargeTax: false,
        receiptFooter: '',
        logoUrl: '',
        isVirtualWarehouse: false,
        isActive: true,
        synced: 0,
        mraApprovalStatus: 'PENDING',
        status: 'active'
    };

    const initialBranchValues = branch ? { ...branch } : defaultBranchValues;

    const branchValidationSchema = Yup.object().shape({
        branchName: Yup.string()
            .required('Branch name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        tenantId: Yup.string().required('Tenant is required'),
        siteId: Yup.string(),
        siteName: Yup.string(),
        description: Yup.string().max(500, 'Description is too long'),
        addressLine1: Yup.string().max(255, 'Address line 1 is too long'),
        addressLine2: Yup.string().max(255, 'Address line 2 is too long'),
        addressLine3: Yup.string().max(255, 'Address line 3 is too long'),
        district: Yup.string().max(100, 'District name is too long'),
        city: Yup.string().max(100, 'City name is too long'),
        state: Yup.string().max(100, 'State name is too long'),
        postalCode: Yup.string().max(20, 'Postal code is too long'),
        phoneNumber: Yup.string()
            .matches(/^[\+]?[0-9\s\-\(\)]*$/, 'Invalid phone number format')
            .max(20, 'Phone number is too long'),
        email: Yup.string()
            .email('Invalid email format')
            .max(255, 'Email is too long'),
        currencyCode: Yup.string().required('Currency is required'),
        taxRate: Yup.number()
            .required('Tax rate is required')
            .min(0, 'Tax rate must be 0 or higher')
            .max(100, 'Tax rate cannot exceed 100%'),
        chargeTax: Yup.boolean(),
        receiptFooter: Yup.string().max(500, 'Receipt footer is too long'),
        logoUrl: Yup.string(),
        isVirtualWarehouse: Yup.boolean(),
        status: Yup.string().required('Status is required')
    });

    const handleSubmit = async (values: Partial<Branch>, { resetForm }: any) => {
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
            const errorMessage = error?.error?.response?.data?.message || error?.error?.message || 'An error occurred while saving the branch';
            Notify.failure(errorMessage);
        }
    };

    const handleNameChange = (name: string, setFieldValue: Function) => {
        const formattedName = capitalizeEachWord(name);
        setFieldValue('branchName', formattedName);
    };

    const handleCurrencyChange = (currencyCode: string, setFieldValue: Function) => {
        setFieldValue('currencyCode', currencyCode);
        setFieldValue('currencySymbol', getCurrencySymbol(currencyCode));
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading branch details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <Fragment>
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className='sticky top-0 z-10 bg-white dark:bg-gray-800 '>
                        <PageHeader
                            title={branch ? 'Edit Branch' : 'Add Branch'}
                            description='Required fields are marked with an asterisk (*)'
                            action={
                                <Button
                                    type="button"
                                    theme='danger'
                                    onClick={() => navigate(ROUTES.BRANCHES)}
                                >
                                    Cancel
                                </Button>
                            }
                        />
                    </div>

                    <Formik
                        onSubmit={handleSubmit}
                        enableReinitialize={true}
                        initialValues={initialBranchValues}
                        validationSchema={branchValidationSchema}
                    >
                        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                            <Form>
                                <FormWrapper>
                                    <div className="py-6 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                1
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Basic Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <div className="md:col-span-2">
                                                <TenantSearch
                                                    value={values.tenantId}
                                                    onChange={(tenantId) => setFieldValue('tenantId', tenantId)}
                                                    error={errors.tenantId}
                                                    touched={touched.tenantId}
                                                    disabled={!canSelectTenant}
                                                    disabledMessage="Auto-assigned based on your account"
                                                />
                                            </div>

                                            <FormInput
                                                type="text"
                                                name="branchName"
                                                label="Branch Name"
                                                required
                                                placeholder="Enter branch name"
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    handleNameChange(e.target.value, setFieldValue);
                                                }}
                                            />

                                            <FormSelectBox
                                                label="Status"
                                                name="status"
                                                required
                                                options={statusOptions}
                                            />

                                            <FormInput
                                                type="text"
                                                name="siteId"
                                                label="Site ID"
                                                placeholder="Site ID (optional)"
                                            />

                                            <FormInput
                                                type="text"
                                                name="siteName"
                                                label="Site Name"
                                                placeholder="Site name (optional)"
                                            />

                                            <div className="md:col-span-2">
                                                <FormTextArea
                                                    name="description"
                                                    label="Description"
                                                    placeholder="Branch description (optional)"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location Section */}
                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                2
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Location
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormInput
                                                type="text"
                                                name="addressLine1"
                                                label="Address Line 1"
                                                placeholder="Street address"
                                            />

                                            <FormInput
                                                type="text"
                                                name="addressLine2"
                                                label="Address Line 2"
                                                placeholder="Apartment, suite, etc. (optional)"
                                            />

                                            <FormInput
                                                type="text"
                                                name="addressLine3"
                                                label="Address Line 3"
                                                placeholder="Additional address info (optional)"
                                            />

                                            <FormInput
                                                type="text"
                                                name="district"
                                                label="District"
                                                placeholder="District"
                                            />

                                            <FormInput
                                                type="text"
                                                name="city"
                                                label="City"
                                                placeholder="City"
                                            />

                                            <FormInput
                                                type="text"
                                                name="state"
                                                label="State/Province"
                                                placeholder="State or province"
                                            />

                                            <FormInput
                                                type="text"
                                                name="postalCode"
                                                label="Postal Code"
                                                placeholder="ZIP/Postal code"
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Section */}
                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                3
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Contact Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormInput
                                                type="tel"
                                                name="phoneNumber"
                                                label="Phone Number"
                                                placeholder="Phone number"
                                            />

                                            <FormInput
                                                type="email"
                                                name="email"
                                                label="Email Address"
                                                placeholder="Email address"
                                            />
                                        </div>
                                    </div>

                                    {/* Tax & Currency Section */}
                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                4
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Tax & Currency
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormSelectBox
                                                label="Currency"
                                                name="currencyCode"
                                                required
                                                options={currencyOptions}
                                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                    handleCurrencyChange(e.target.value, setFieldValue);
                                                }}
                                            />

                                            <FormInput
                                                type="number"
                                                name="taxRate"
                                                label="Tax Rate (%)"
                                                required
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                            />

                                            <div className="md:col-span-2">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.chargeTax}
                                                        name='chargeTax'
                                                        onChange={(e) => setFieldValue('chargeTax', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Charge tax on transactions
                                                    </span>
                                                </label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    Enable this to automatically apply tax to all transactions
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pb-8 relative">
                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                5
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Additional Settings
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 ml-11">
                                            <FormInput
                                                type="url"
                                                name="logoUrl"
                                                label="Logo URL"
                                                placeholder="https://example.com/logo.png (optional)"
                                            />

                                            <FormTextArea
                                                name="receiptFooter"
                                                label="Receipt Footer"
                                                placeholder="Text to display at the bottom of receipts (optional)"
                                                rows={3}
                                            />

                                            <div>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={values.isVirtualWarehouse}
                                                        name='isVirtualWarehouse'
                                                        onChange={(e) => setFieldValue('isVirtualWarehouse', e.target.checked)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Virtual Warehouse
                                                    </span>
                                                </label>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">
                                                    Enable this if this branch operates as a virtual warehouse
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end">
                                        <Button
                                            type="submit"
                                            loading={isSubmitting}
                                            className="px-8"
                                            theme='success'
                                        >
                                            {branch ? 'Update Branch' : 'Create Branch'}
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

export default BranchForm;
