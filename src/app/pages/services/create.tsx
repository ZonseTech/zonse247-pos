import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Wrench, Loader2 } from 'lucide-react';
import { Notify, Report, Confirm } from 'notiflix';
import { Button } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { FormFieldCard } from '../../components';
import FormInput from '../../components/FormInput';
import FormSearchableSelect from '../../components/FormSearchableSelect';
import { CategorySearch } from '../categories/partials/CategorySearch';
import { ROUTES } from '../../utils/constants';
import { useServices } from '../../hooks/useServices';
import { getErrorMessage } from '../../utils/api-error-handler';

const pricingTypeOptions = [
    { label: 'Fixed — One price per service', value: 'FIXED' },
    { label: 'Variable — Quoted at order time', value: 'VARIABLE' },
    { label: 'Hourly — Price per hour', value: 'HOURLY' },
    { label: 'Per Unit — e.g. per sq inch, per kg', value: 'PER_UNIT' },
    { label: 'Package — Multi-session package', value: 'PACKAGE' },
    { label: 'Flat Rate — Fixed regardless of time', value: 'FLAT_RATE' },
    { label: 'Tiered — Volume/level-based tiers', value: 'TIERED' },
    { label: 'Subscription — Recurring charge', value: 'SUBSCRIPTION' },
    { label: 'Custom — Custom/quoted pricing', value: 'CUSTOM' },
];

const statusOptions = [
    { label: 'Active', value: 'true' },
    { label: 'Inactive', value: 'false' },
];

interface ServiceFormValues {
    name: string;
    description: string;
    sku: string;
    pricingType: string;
    basePrice: number | '';
    durationMin: number | '';
    categoryId: string;
    isActive: string;
}

const defaultValues: ServiceFormValues = {
    name: '',
    description: '',
    sku: '',
    pricingType: 'FIXED',
    basePrice: '',
    durationMin: '',
    categoryId: '',
    isActive: 'true',
};

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Service name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(200, 'Name is too long'),
    description: Yup.string().max(500, 'Description is too long'),
    sku: Yup.string().max(50, 'SKU is too long'),
    pricingType: Yup.string().required('Pricing type is required'),
    basePrice: Yup.number().min(0, 'Price must be 0 or higher'),
    durationMin: Yup.number().integer().min(1, 'Duration must be at least 1 minute'),
});

const ServiceForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { getById, create, update } = useServices();

    const serviceId = (location.state as any)?.serviceId;
    const isEditMode = !!serviceId;

    const [loading, setLoading] = useState(false);
    const [service, setService] = useState<Service | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadService();
        }
    }, [serviceId]);

    const loadService = async () => {
        if (!serviceId) return;
        setLoading(true);
        try {
            const data = await getById(serviceId);
            if (data) setService(data);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load service'));
        } finally {
            setLoading(false);
        }
    };

    const initialValues: ServiceFormValues = service
        ? {
            name: service.name,
            description: service.description || '',
            sku: service.sku || '',
            pricingType: service.pricingType || 'FIXED',
            basePrice: service.basePrice ?? '',
            durationMin: service.durationMin ?? '',
            categoryId: service.categoryId || '',
            isActive: String(service.isActive),
        }
        : defaultValues;

    const handleSubmit = async (values: ServiceFormValues, { resetForm }: any) => {
        setLoading(true);
        try {
            const payload: CreateServiceInput = {
                name: values.name,
                description: values.description || undefined,
                sku: values.sku || undefined,
                pricingType: values.pricingType as ServicePricingType,
                basePrice: values.basePrice !== '' ? Number(values.basePrice) : undefined,
                durationMin: values.durationMin !== '' ? Number(values.durationMin) : undefined,
                categoryId: values.categoryId || undefined,
                isActive: values.isActive === 'true',
            };

            if (isEditMode) {
                await update(serviceId, payload);
                Report.success('Success', 'Service updated successfully', 'Okay', () => {
                    navigate(ROUTES.SERVICES);
                });
            } else {
                await create(payload);
                Confirm.show(
                    'Service Saved',
                    'Service created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Services',
                    () => {
                        resetForm();
                    },
                    () => {
                        navigate(ROUTES.SERVICES);
                    },
                );
            }
        } catch (error: any) {
            const errorMessage = getErrorMessage(error, `Failed to ${isEditMode ? 'update' : 'create'} service`);
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !service && serviceId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading service details…</div>
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
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form>
                            <PageHeader
                                title={isEditMode ? 'Edit Service' : 'Add New Service'}
                                description={isEditMode ? 'Update service information' : 'Required fields are marked with an asterisk (*)'}
                                icon={<Wrench className="w-8 h-8 text-sky-500" />}
                                showBackButton
                                onBack={() => navigate(ROUTES.SERVICES)}
                            />

                            <div className="mt-6 space-y-6">
                                <FormFieldCard title="Basic Information">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Service Name"
                                            name="name"
                                            placeholder="e.g. Haircut"
                                            required
                                        />
                                        <FormInput
                                            label="SKU"
                                            name="sku"
                                            placeholder="e.g. SVC-001"
                                        />
                                        <FormInput
                                            label="Description"
                                            name="description"
                                            placeholder="Brief description of the service"
                                        />
                                        <CategorySearch
                                            value={values.categoryId || ''}
                                            onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                            error={errors.categoryId as string}
                                            touched={touched.categoryId as boolean}
                                        />
                                    </div>
                                </FormFieldCard>

                                <FormFieldCard title="Pricing & Duration">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormSearchableSelect
                                            label="Pricing Type"
                                            name="pricingType"
                                            options={pricingTypeOptions}
                                            placeholder="Select pricing type"
                                            required
                                        />

                                        {/* Base price — shown for types that have a set price */}
                                        {['FIXED', 'HOURLY', 'PER_UNIT', 'FLAT_RATE', 'SUBSCRIPTION'].includes(values.pricingType) && (
                                            <FormInput
                                                label={
                                                    values.pricingType === 'HOURLY' ? 'Hourly Rate' :
                                                        values.pricingType === 'PER_UNIT' ? 'Unit Price' :
                                                            values.pricingType === 'SUBSCRIPTION' ? 'Recurring Price' :
                                                                'Base Price'
                                                }
                                                name="basePrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                required
                                            />
                                        )}

                                        {/* Package price — starting price for packages */}
                                        {values.pricingType === 'PACKAGE' && (
                                            <FormInput
                                                label="Package Price"
                                                name="basePrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                required
                                            />
                                        )}

                                        {/* Tiered — starting price / base tier price */}
                                        {values.pricingType === 'TIERED' && (
                                            <FormInput
                                                label="Base Tier Price"
                                                name="basePrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        )}

                                        {/* Variable / Custom — optional estimate */}
                                        {['VARIABLE', 'CUSTOM'].includes(values.pricingType) && (
                                            <FormInput
                                                label="Estimated Price (optional)"
                                                name="basePrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        )}

                                        {/* Duration — for time-based types */}
                                        {['FIXED', 'HOURLY', 'FLAT_RATE', 'PER_UNIT'].includes(values.pricingType) && (
                                            <FormInput
                                                label={values.pricingType === 'HOURLY' ? 'Estimated Duration (minutes)' : 'Duration (minutes)'}
                                                name="durationMin"
                                                type="number"
                                                step="1"
                                                placeholder="e.g. 30"
                                            />
                                        )}

                                        {/* Package — number of sessions */}
                                        {values.pricingType === 'PACKAGE' && (
                                            <FormInput
                                                label="Duration per Session (minutes)"
                                                name="durationMin"
                                                type="number"
                                                step="1"
                                                placeholder="e.g. 60"
                                            />
                                        )}

                                        {/* Subscription frequency hint */}
                                        {values.pricingType === 'SUBSCRIPTION' && (
                                            <FormInput
                                                label="Session Duration (minutes)"
                                                name="durationMin"
                                                type="number"
                                                step="1"
                                                placeholder="e.g. 60"
                                            />
                                        )}

                                        <FormSearchableSelect
                                            label="Status"
                                            name="isActive"
                                            options={statusOptions}
                                            placeholder="Active / Inactive"
                                        />
                                    </div>

                                    {/* Contextual hint */}
                                    <div className="mt-3 px-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {values.pricingType === 'FIXED' && 'Fixed price charged per service regardless of time spent.'}
                                            {values.pricingType === 'VARIABLE' && 'Price will be quoted at order time based on the specific job.'}
                                            {values.pricingType === 'HOURLY' && 'Customer is charged per hour. Duration is used to estimate the total.'}
                                            {values.pricingType === 'PER_UNIT' && 'Price is per unit of measurement (e.g. per sq inch, per kg).'}
                                            {values.pricingType === 'PACKAGE' && 'Multi-session package sold at a bundle price.'}
                                            {values.pricingType === 'FLAT_RATE' && 'A flat rate charged regardless of time or effort involved.'}
                                            {values.pricingType === 'TIERED' && 'Pricing varies by tier/level. Set the base tier price here.'}
                                            {values.pricingType === 'SUBSCRIPTION' && 'Recurring charge billed periodically (e.g. monthly).'}
                                            {values.pricingType === 'CUSTOM' && 'Pricing is fully custom — each job is quoted individually.'}
                                        </p>
                                    </div>
                                </FormFieldCard>

                                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button type="submit" size="2" disabled={loading || isSubmitting}>
                                        {loading ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                                        ) : isEditMode ? (
                                            'Update Service'
                                        ) : (
                                            'Create Service'
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

export default ServiceForm;
