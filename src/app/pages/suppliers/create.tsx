import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Truck, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button, FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
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

    const identifierTypeOptions = [
        { label: 'Business Registration Number', value: 'BUSINESS_REGISTRATION' },
        { label: 'National ID', value: 'NATIONAL_ID' },
        { label: 'Passport Number', value: 'PASSPORT' },
        { label: "Driver's License", value: 'DRIVERS_LICENSE' }
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
        identifierType: '',
        identifierNumber: '',
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
        identifierType: (supplier as any).identifierType || '',
        identifierNumber: (supplier as any).identifierNumber || '',
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
        identifierType: Yup.string().when('identifierNumber', {
            is: (val: string) => val && val.length > 0,
            then: (schema) => schema.required('Identifier type is required when identity number is provided'),
            otherwise: (schema) => schema,
        }),
        identifierNumber: Yup.string()
            .max(50, 'Identifier number is too long')
            .when('identifierType', {
                is: (val: string) => val && val.length > 0,
                then: (schema) => schema.required('Identifier number is required when type is selected'),
                otherwise: (schema) => schema,
            }),
    }, [['identifierType', 'identifierNumber']]);

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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading supplier details...</div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialSupplierValues}
                    validationSchema={supplierValidationSchema}
                >
                    {({ isSubmitting, values }) => (
                        <Form>
                            <PageHeader
                                title={isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                                description={isEditMode ? 'Update supplier information' : 'Required fields are marked with an asterisk (*)'}
                                icon={<Truck className="w-8 h-8 text-sky-500" />}
                                showBackButton
                            />

                            <div className="mt-6 space-y-6">
                                <FormFieldCard title="Basic Information">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            required
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

                                        <FormInput
                                            label="Address"
                                            name="address"
                                            required
                                            placeholder="Street address, city, country"
                                        />

                                        <FormInput
                                            label="Tax ID / VAT Number"
                                            name="taxId"
                                            placeholder="123456789"
                                        />

                                        <FormSearchableSelect
                                            label="Identifier Type"
                                            name="identifierType"
                                            options={identifierTypeOptions}
                                            placeholder="Select identifier type"
                                            isClearable
                                        />

                                        <FormInput
                                            label="Supplier Identity"
                                            name="identifierNumber"
                                            placeholder="Enter identifier number"
                                        />
                                    </div>
                                </FormFieldCard>

                                <FormFieldCard title="Payment & Terms">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormSearchableSelect
                                            label="Payment Terms"
                                            name="paymentTerms"
                                            options={paymentTermsOptions}
                                            required
                                            placeholder="Select payment terms"
                                        />

                                        <FormInput
                                            label="Credit Limit"
                                            name="creditLimit"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            min="0"
                                        />

                                        <FormSearchableSelect
                                            label="Status"
                                            name="status"
                                            options={statusOptions}
                                            required
                                            placeholder="Select status"
                                        />
                                    </div>
                                </FormFieldCard>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme="danger"
                                        onClick={() => navigate(ROUTES.SUPPLIERS)}
                                        disabled={isSubmitting || loading}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        theme="success"
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting || loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                {isEditMode ? 'Update Supplier' : 'Create Supplier'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default SupplierForm;
