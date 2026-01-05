import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Truck } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import { ROUTES } from '../../utils/constants';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useSettings } from '../../hooks/useSettings';

const SupplierForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setup } = useSettings();
    const { create, update, getById } = useSuppliers();

    const supplierId = (location.state as any)?.supplierId;
    const isEditMode = !!supplierId;

    const [loading, setLoading] = useState(false);
    const [supplier, setSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadSupplier();
        }
    }, [supplierId]);

    const loadSupplier = async () => {
        if (!supplierId) return;

        setLoading(true);
        try {
            const supplierData = await getById(supplierId);
            if (supplierData) {
                setSupplier(supplierData);
            }
        } catch (error: any) {
            console.error('Error fetching supplier:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load supplier details';
            Notify.failure(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const paymentTermsOptions = [
        { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' },
        { label: 'Net 7 Days', value: 'NET_7' },
        { label: 'Net 15 Days', value: 'NET_15' },
        { label: 'Net 30 Days', value: 'NET_30' },
        { label: 'Net 60 Days', value: 'NET_60' },
        { label: 'Net 90 Days', value: 'NET_90' }
    ];

    const statusOptions = [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Blocked', value: 'BLOCKED' }
    ];

    const defaultSupplierValues = {
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: 'NET_30',
        creditLimit: 0,
        status: 'ACTIVE' as SupplierStatus,
    };

    const initialSupplierValues = supplier ? {
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || 'NET_30',
        creditLimit: supplier.creditLimit || 0,
        status: supplier.status,
    } : defaultSupplierValues;

    const supplierValidationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Supplier name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        contactPerson: Yup.string().max(100, 'Contact person name is too long'),
        email: Yup.string().email('Invalid email address').max(100, 'Email is too long'),
        phone: Yup.string()
            .required('Phone number is required')
            .max(20, 'Phone number is too long'),
        address: Yup.string().max(500, 'Address is too long'),
        taxId: Yup.string().max(50, 'Tax ID is too long'),
        paymentTerms: Yup.string().required('Payment terms are required'),
        creditLimit: Yup.number()
            .min(0, 'Credit limit must be 0 or higher'),
        status: Yup.string().required('Status is required'),
    });

    const handleSubmit = async (values: typeof defaultSupplierValues, { resetForm }: any) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                creditLimit: Number(values.creditLimit),
            };

            if (isEditMode) {
                await update(supplierId, payload as any);
                Report.success('Success', 'Supplier updated successfully', 'Okay', () => {
                    navigate(ROUTES.SUPPLIERS);
                });
            } else {
                await create(payload as any);
                Confirm.show(
                    'Supplier Saved',
                    'Supplier created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Suppliers',
                    () => {
                        resetForm();
                    },
                    () => {
                        navigate(ROUTES.SUPPLIERS);
                    }
                );
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} supplier`;
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !supplier && supplierId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading supplier details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                <div className='sticky top-0 z-10 bg-white dark:bg-gray-800'>
                    <PageHeader
                        title={isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                        description={isEditMode ? 'Update supplier information' : 'Required fields are marked with an asterisk (*)'}
                        icon={<Truck className="w-8 h-8 text-blue-600" />}
                    />
                </div>

                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialSupplierValues}
                    validationSchema={supplierValidationSchema}
                >
                    {({ isSubmitting, values }) => (
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
                                        <FormInput
                                            label="Supplier Name"
                                            name="name"
                                            placeholder="ABC Wholesale Ltd"
                                            required
                                        />

                                        <FormInput
                                            label="Contact Person"
                                            name="contactPerson"
                                            placeholder="John Doe"
                                        />

                                        <FormInput
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="contact@supplier.com"
                                        />

                                        <FormInput
                                            label="Phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+265 1 234 567"
                                            required
                                        />

                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Address"
                                                name="address"
                                                placeholder="Street address, city, country"
                                            />
                                        </div>

                                        <FormInput
                                            label="Tax ID / VAT Number"
                                            name="taxId"
                                            placeholder="123456789"
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
                                            Payment & Terms
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormSelectBox
                                            label="Payment Terms"
                                            name="paymentTerms"
                                            options={paymentTermsOptions}
                                            required
                                        />

                                        <FormInput
                                            label="Credit Limit"
                                            name="creditLimit"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            min="0"
                                        />

                                        <FormSelectBox
                                            label="Status"
                                            name="status"
                                            options={statusOptions}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
                                    <Button
                                        type="button"
                                        theme="neutral"
                                        onClick={() => navigate(ROUTES.SUPPLIERS)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        theme="primary"
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting || loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update Supplier' : 'Create Supplier'
                                        )}
                                    </Button>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default SupplierForm;
