import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Notify, Report } from 'notiflix';
import { Flex, Grid, Text, Button } from '@radix-ui/themes';
import FormModal from '../../../components/FormModal';
import FormSearchableSelect from '../../../components/FormSearchableSelect';
import TextInput from '../../../components/TextInput';
import FormStepper, { type FormStep } from '../../../components/FormStepper';
import { useSuppliers } from '../../../hooks/useSuppliers';
import SupplierBalanceWidget from './SupplierBalanceWidget';
import SupplierFormReview from './SupplierFormReview';
import { getErrorMessage } from '../../../utils/api-error-handler';

const FORM_STEPS: FormStep[] = [
    { id: 1, label: 'Basic Information' },
    { id: 2, label: 'Payment & Terms' },
    { id: 3, label: 'Review & Confirm' },
];

const STEP_FIELDS: Record<number, string[]> = {
    1: [
        'name',
        'contactPerson',
        'email',
        'phone',
        'address',
        'taxId',
        'identifierType',
        'identifierNumber',
    ],
    2: ['paymentTerms', 'creditLimit', 'status'],
    3: [],
};

const paymentTermsOptions = [
    { label: 'Cash on Delivery', value: 'CASH_ON_DELIVERY' },
    { label: 'Net 7 Days', value: 'NET_7' },
    { label: 'Net 15 Days', value: 'NET_15' },
    { label: 'Net 30 Days', value: 'NET_30' },
    { label: 'Net 60 Days', value: 'NET_60' },
    { label: 'Net 90 Days', value: 'NET_90' },
];

const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' },
    { label: 'Blocked', value: 'BLOCKED' },
];

const identifierTypeOptions = [
    { label: 'Business Registration Number', value: 'BUSINESS_REGISTRATION' },
    { label: 'National ID', value: 'NATIONAL_ID' },
    { label: 'Passport Number', value: 'PASSPORT' },
    { label: "Driver's License", value: 'DRIVERS_LICENSE' },
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

const supplierValidationSchema = Yup.object().shape(
    {
        name: Yup.string()
            .required('Supplier name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        contactPerson: Yup.string().max(100, 'Contact person name is too long'),
        email: Yup.string()
            .email('Invalid email address')
            .max(100, 'Email is too long'),
        phone: Yup.string()
            .required('Phone number is required')
            .max(20, 'Phone number is too long'),
        address: Yup.string().max(500, 'Address is too long'),
        taxId: Yup.string().max(50, 'Tax ID is too long'),
        paymentTerms: Yup.string().required('Payment terms are required'),
        creditLimit: Yup.number().min(0, 'Credit limit must be 0 or higher'),
        status: Yup.string().required('Status is required'),
        identifierType: Yup.string().when('identifierNumber', {
            is: (val: string) => val && val.length > 0,
            then: (schema) =>
                schema.required(
                    'Identifier type is required when identity number is provided',
                ),
            otherwise: (schema) => schema,
        }),
        identifierNumber: Yup.string()
            .max(50, 'Identifier number is too long')
            .when('identifierType', {
                is: (val: string) => val && val.length > 0,
                then: (schema) =>
                    schema.required(
                        'Identifier number is required when type is selected',
                    ),
                otherwise: (schema) => schema,
            }),
    },
    [['identifierType', 'identifierNumber']],
);

interface SupplierFormModalProps {
    supplierId?: string;
    onClose: () => void;
    onSaved: () => void;
}

const SupplierFormModal: FunctionComponent<SupplierFormModalProps> = ({
    supplierId,
    onClose,
    onSaved,
}) => {
    const { create, update, getById } = useSuppliers();
    const isEditMode = !!supplierId;

    const [loading, setLoading] = useState(false);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!supplierId) return;
        setLoading(true);
        getById(supplierId)
            .then((data) => {
                if (data) setSupplier(data);
            })
            .catch((error) =>
                Notify.failure(
                    getErrorMessage(error, 'Failed to load supplier details'),
                ),
            )
            .finally(() => setLoading(false));
    }, [supplierId]);

    const initialSupplierValues = supplier
        ? {
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
          }
        : defaultSupplierValues;

    const handleSubmit = async (values: typeof defaultSupplierValues) => {
        if (currentStep !== FORM_STEPS.length) return;

        setLoading(true);
        try {
            const payload = {
                ...values,
                creditLimit: Number(values.creditLimit),
            };

            if (isEditMode) {
                await update(supplierId!, payload as any);
                Notify.success('Supplier updated successfully');
            } else {
                await create(payload as any);
                Notify.success('Supplier created successfully');
            }
            onSaved();
            onClose();
        } catch (error: any) {
            Report.failure(
                'Error',
                getErrorMessage(
                    error,
                    `Failed to ${isEditMode ? 'update' : 'create'} supplier`,
                ),
                'Okay',
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading && !supplier && supplierId) {
        return (
            <FormModal
                open
                onOpenChange={(open) => {
                    if (!open) onClose();
                }}
                title={isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
                size="lg"
            >
                <Flex align="center" justify="center" className="h-64">
                    <Text color="gray">Loading supplier details...</Text>
                </Flex>
            </FormModal>
        );
    }

    return (
        <Formik
            onSubmit={handleSubmit}
            enableReinitialize
            initialValues={initialSupplierValues}
            validationSchema={supplierValidationSchema}
        >
            {({
                isSubmitting,
                values,
                touched,
                setTouched,
                validateForm,
                submitForm,
            }) => {
                const isLastStep = currentStep === FORM_STEPS.length;

                const goToStep = (stepId: number) => setCurrentStep(stepId);
                const handleBack = () =>
                    setCurrentStep((step) => Math.max(step - 1, 1));

                const handleNext = async () => {
                    const stepFields = STEP_FIELDS[currentStep] || [];
                    const formErrors = await validateForm();
                    const stepHasErrors = stepFields.some(
                        (field) =>
                            !!(formErrors as Record<string, unknown>)[field],
                    );

                    if (stepHasErrors) {
                        setTouched(
                            {
                                ...touched,
                                ...stepFields.reduce(
                                    (acc, field) => ({ ...acc, [field]: true }),
                                    {},
                                ),
                            },
                            false,
                        );
                        return;
                    }

                    setCompletedSteps((prev) =>
                        prev.includes(currentStep)
                            ? prev
                            : [...prev, currentStep],
                    );
                    setCurrentStep((step) =>
                        Math.min(step + 1, FORM_STEPS.length),
                    );
                };

                return (
                    <FormModal
                        open
                        onOpenChange={(open) => {
                            if (!open) onClose();
                        }}
                        title={
                            isEditMode ? 'Edit Supplier' : 'Add New Supplier'
                        }
                        size="lg"
                        footer={
                            <Flex justify="between" align="center" width="100%">
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
                                        {isEditMode
                                            ? 'Update Supplier'
                                            : 'Create Supplier'}
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleNext}>
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                )}
                            </Flex>
                        }
                    >
                        <Form
                            onKeyDown={(e) => {
                                const target = e.target as HTMLElement;
                                if (
                                    e.key === 'Enter' &&
                                    !isLastStep &&
                                    target.tagName !== 'TEXTAREA'
                                ) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <Flex direction="column" gap="5">
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
                                    <Grid
                                        columns={{ initial: '1', md: '2' }}
                                        gap="4"
                                    >
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
                                    <Grid
                                        columns={{ initial: '1', md: '2' }}
                                        gap="4"
                                    >
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
                                        paymentTermsOptions={
                                            paymentTermsOptions
                                        }
                                        statusOptions={statusOptions}
                                        identifierTypeOptions={
                                            identifierTypeOptions
                                        }
                                        onEditStep={goToStep}
                                    />
                                )}
                            </Flex>
                        </Form>
                    </FormModal>
                );
            }}
        </Formik>
    );
};

export default SupplierFormModal;
