import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Truck, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import { Box, Flex, Grid, Text, Button } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import TextInput from '../../components/TextInput';
import FormStepper, { type FormStep } from '../../components/FormStepper';
import { ROUTES } from '../../utils/constants';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useSettings } from '../../hooks/useSettings';
import SupplierBalanceWidget from './partials/SupplierBalanceWidget';
import SupplierFormReview from './partials/SupplierFormReview';
import { getErrorMessage } from '../../utils/api-error-handler';

const FORM_STEPS: FormStep[] = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Payment & Terms' },
    { id: 3, label: 'Review & Confirm' },
];

const STEP_FIELDS: Record<number, string[]> = {
    1: ['name', 'contactPerson', 'email', 'phone', 'address', 'taxId', 'identifierType', 'identifierNumber'],
    2: ['paymentTerms', 'creditLimit', 'status'],
    3: [],
};

const SupplierForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setup } = useSettings();
    const { create, update, getById } = useSuppliers();

    const supplierId = (location.state as any)?.supplierId;
    const isEditMode = !!supplierId;

    const [loading, setLoading] = useState(false);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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
            const errorMessage = getErrorMessage(error, 'Failed to load supplier details');
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
        // Guard against implicit/accidental submission (e.g. pressing Enter) while not on the review step
        if (currentStep !== FORM_STEPS.length) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...values,
                creditLimit: Number(values.creditLimit),
            };

            if (isEditMode) {
                await update(supplierId, payload as any);
                Report.success('Success', 'Supplier updated successfully', 'Okay', () => {
                    navigate(ROUTES.PROCUREMENT_SUPPLIERS);
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
                        setCurrentStep(1);
                        setCompletedSteps([]);
                    },
                    () => {
                        navigate(ROUTES.PROCUREMENT_SUPPLIERS);
                    }
                );
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = getErrorMessage(error, `Failed to ${isEditMode ? 'update' : 'create'} supplier`);
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !supplier && supplierId) {
        return (
            <AppLayout>
                <Box className="max-w-4xl mx-auto" px={{ initial: '4', sm: '6', lg: '8' }} py="6">
                    <Flex align="center" justify="center" className="h-64">
                        <Text color="gray">Loading supplier details...</Text>
                    </Flex>
                </Box>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Formik
                onSubmit={handleSubmit}
                enableReinitialize={true}
                initialValues={initialSupplierValues}
                validationSchema={supplierValidationSchema}
            >
                {({ isSubmitting, values, touched, setTouched, validateForm, submitForm }) => {
                    const isLastStep = currentStep === FORM_STEPS.length;

                    const goToStep = (stepId: number) => setCurrentStep(stepId);

                    const handleBack = () => setCurrentStep((step) => Math.max(step - 1, 1));

                    const handleNext = async () => {
                        const stepFields = STEP_FIELDS[currentStep] || [];
                        const formErrors = await validateForm();
                        const stepHasErrors = stepFields.some((field) => !!(formErrors as Record<string, unknown>)[field]);

                        if (stepHasErrors) {
                            setTouched({
                                ...touched,
                                ...stepFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}),
                            }, false);
                            return;
                        }

                        setCompletedSteps((prev) => (prev.includes(currentStep) ? prev : [...prev, currentStep]));
                        setCurrentStep((step) => Math.min(step + 1, FORM_STEPS.length));
                    };

                    return (
                        <Form
                            onKeyDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (e.key === 'Enter' && !isLastStep && target.tagName !== 'TEXTAREA') {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <PageHeader
                                title={isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                                description={isEditMode ? 'Update supplier information' : 'Required fields are marked with an asterisk (*)'}
                                icon={<Truck className="w-8 h-8 text-sky-500" />}
                                showBackButton
                            />

                            <Flex direction="column" gap="6">
                                {isEditMode && supplierId && (
                                    <SupplierBalanceWidget
                                        supplierId={supplierId}
                                        supplierName={supplier?.name}
                                    />
                                )}

                                <FormStepper
                                    steps={FORM_STEPS}
                                    currentStep={currentStep}
                                    completedSteps={completedSteps}
                                    onStepClick={goToStep}
                                />

                                {currentStep === 1 && (
                                    <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                        <TextInput
                                            label="Supplier Name"
                                            name="name"
                                            placeholder="ABC Wholesale Ltd"
                                            required
                                        />

                                        <TextInput
                                            label="Contact Person"
                                            name="contactPerson"
                                            placeholder="John Doe"
                                            required
                                        />

                                        <TextInput
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="contact@supplier.com"
                                        />

                                        <TextInput
                                            label="Phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+265 1 234 567"
                                            required
                                        />

                                        <TextInput
                                            label="Address"
                                            name="address"
                                            required
                                            placeholder="Street address, city, country"
                                        />

                                        <TextInput
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

                                        <TextInput
                                            label="Supplier Identity"
                                            name="identifierNumber"
                                            placeholder="Enter identifier number"
                                        />
                                    </Grid>
                                )}

                                {currentStep === 2 && (
                                    <Grid columns={{ initial: '1', md: '2' }} gap="4">
                                        <FormSearchableSelect
                                            label="Payment Terms"
                                            name="paymentTerms"
                                            options={paymentTermsOptions}
                                            required
                                            placeholder="Select payment terms"
                                        />

                                        <TextInput
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
                                    </Grid>
                                )}

                                {currentStep === 3 && (
                                    <SupplierFormReview
                                        values={values}
                                        paymentTermsOptions={paymentTermsOptions}
                                        statusOptions={statusOptions}
                                        identifierTypeOptions={identifierTypeOptions}
                                        onEditStep={goToStep}
                                    />
                                )}

                                <Flex justify="between" align="center" pt="4" className="border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        variant="soft"
                                        color="gray"
                                        onClick={handleBack}
                                        disabled={currentStep === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        Back
                                    </Button>

                                    {isLastStep ? (
                                        <Button
                                            type="button"
                                            color="green"
                                            loading={isSubmitting || loading}
                                            disabled={isSubmitting || loading}
                                            onClick={() => submitForm()}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            {isEditMode ? 'Update Supplier' : 'Create Supplier'}
                                        </Button>
                                    ) : (
                                        <Button type="button" onClick={handleNext}>
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    )}
                                </Flex>
                            </Flex>
                        </Form>
                    );
                }}
            </Formik>
        </AppLayout>
    );
};

export default SupplierForm;
