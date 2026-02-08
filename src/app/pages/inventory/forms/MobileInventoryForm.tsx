import { Form, Formik, FormikHelpers } from 'formik';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import { useState, FunctionComponent, useMemo } from 'react';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { useNavigate } from 'react-router';
import {
    X,
    PlusIcon
} from 'lucide-react';
import * as Yup from 'yup';
import { Button, FormFieldCard, PricingFields, ToggleButtonGroup, type ToggleOption } from '../../../components';
import VariantModal from '../partials/VariantModal';
import VariantCard from '../partials/VariantCard';
import { InventoryFormValues, createDefaultFormValues, createDefaultVariant } from '../types/variant.types';

type FormMode = 'simple' | 'advance';

const formModeOptions: ToggleOption<FormMode>[] = [
    { value: 'simple', label: 'Simple' },
    { value: 'advance', label: 'Advance' },
];

interface MobileInventoryFormProps {
    productId?: string;
    item: InventoryItem | null;
    loading: boolean;
    statusOptions: { label: string; value: string }[];
    unitOptions: { label: string; value: string }[];
    onSubmit: (
        values: InventoryFormValues,
        helpers: FormikHelpers<InventoryFormValues>
    ) => Promise<void>;
}

const MobileInventoryForm: FunctionComponent<MobileInventoryFormProps> = ({
    productId,
    item,
    loading,
    statusOptions,
    unitOptions,
    onSubmit,
}) => {
    const navigate = useNavigate();
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number>(0);
    const [isNewVariant, setIsNewVariant] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>('simple');

    const initialFormValues: InventoryFormValues = useMemo(() => {
        if (item) {
            return {
                productId: item.productId || '',
                name: item.name || '',
                categoryId: item.categoryId || '',
                unit: item.unit || 'pc',
                variants: [{
                    id: item.productId || crypto.randomUUID(),
                    variantName: '',
                    barcode: item.barcode || '',
                    sku: item.sku || '',
                    brand: item.brand || '',
                    description: item.description || '',
                    color: item.color || '',
                    size: item.size || '',
                    dimensions: item.dimensions || '',
                    weight: item.weight || 0,
                    costPrice: item.costPrice || 0,
                    sellPrice: item.sellPrice || 0,
                    promoPrice: item.promoPrice || 0,
                    promoStart: item.promoStart ? new Date(item.promoStart).toISOString().split('T')[0] : '',
                    promoEnd: item.promoEnd ? new Date(item.promoEnd).toISOString().split('T')[0] : '',
                    quantity: item.quantity || '0',
                    originalQuantity: item.originalQuantity || '0',
                    reservedQuantity: item.reservedQuantity || 0,
                    minStock: item.minStock || 1,
                    maxStock: item.maxStock || 1000,
                    reorderLevel: item.reorderLevel || 5,
                    status: item.status || 'active',
                    trackInventory: item.trackInventory ?? true,
                    allowNegativeStock: item.allowNegativeStock ?? false,
                    isTaxable: item.isTaxable ?? true,
                    expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
                    manufactureDate: item.manufactureDate ? new Date(item.manufactureDate).toISOString().split('T')[0] : '',
                    supplierName: item.supplierName || '',
                    supplierCode: item.supplierCode || '',
                }],
            };
        }
        return createDefaultFormValues();
    }, [item]);

    const variantSchema = Yup.object().shape({
        variantName: Yup.string().max(100, 'Variant name is too long'),
        barcode: Yup.string().max(100, 'Barcode is too long'),
        sku: Yup.string().max(50, 'SKU is too long'),
        sellPrice: Yup.number()
            .required('Sell price is required')
            .min(0, 'Sell price must be 0 or higher'),
        costPrice: Yup.number().min(0, 'Cost price must be 0 or higher'),
        quantity: Yup.number().min(0, 'Quantity cannot be negative'),
    });

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        categoryId: Yup.string(),
        unit: Yup.string(),
        variants: Yup.array().of(variantSchema).min(1, 'At least one variant is required'),
    });

    const handleOpenVariantModal = (index: number) => {
        setEditingVariantIndex(index);
        setIsNewVariant(false);
        setIsVariantModalOpen(true);
    };

    const handleAddVariant = (setFieldValue: (field: string, value: unknown) => void, variants: InventoryFormValues['variants']) => {
        const newVariant = createDefaultVariant();
        const newVariants = [...variants, newVariant];
        const newIndex = newVariants.length - 1;

        setFieldValue('variants', newVariants);
        setEditingVariantIndex(newIndex);
        setIsNewVariant(true);
        setIsVariantModalOpen(true);
    };

    const handleDeleteVariant = (setFieldValue: (field: string, value: unknown) => void, variants: InventoryFormValues['variants'], index: number) => {
        if (variants.length > 1) {
            const newVariants = variants.filter((_, i) => i !== index);
            setFieldValue('variants', newVariants);
        }
    };

    if (loading && !item && productId) {
        return (
            <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 z-50">
                    <MobilePageHeader
                        title="Loading..."
                        className="bg-white dark:bg-gray-800"
                    />
                </div>
                <div className="flex-1 pt-[60px] px-4 py-4">
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                                <div className="space-y-3">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
            <Formik
                onSubmit={onSubmit}
                enableReinitialize={true}
                initialValues={initialFormValues}
                validationSchema={validationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched, submitForm }) => (
                    <>
                        <div className="fixed top-0 left-0 right-0 z-30">
                            <MobilePageHeader
                                title={productId ? 'Edit Item' : 'Add Item'}
                                className="bg-white dark:bg-gray-800"
                                leftIcon={<X className="w-5 h-5 text-sky-500 dark:text-sky-400" />}
                                rightContent={
                                    <Button
                                        type="button"
                                        onClick={submitForm}
                                        disabled={isSubmitting || loading}
                                        theme='success'
                                    >
                                        SAVE
                                    </Button>
                                }
                            />
                        </div>
                        <Form className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto pt-[60px] pb-24">
                                <div className="px-4 py-4 space-y-4">
                                    <FormFieldCard>
                                        <FormInput
                                            label="Item Name"
                                            name="name"
                                            placeholder="Enter item name"
                                            required
                                        />
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <CategorySearch
                                            value={values.categoryId || ''}
                                            onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                            error={errors.categoryId as string}
                                            touched={touched.categoryId as boolean}
                                        />
                                    </FormFieldCard>

                                    <FormFieldCard>
                                        <FormSelectBox
                                            label="Sell by Unit"
                                            name="unit"
                                            options={unitOptions}
                                        />
                                    </FormFieldCard>

                                    {!productId && (
                                        <ToggleButtonGroup<FormMode>
                                            options={formModeOptions}
                                            value={formMode}
                                            onChange={(value) => setFormMode(value)}
                                        />
                                    )}

                                    {formMode === 'simple' ? (
                                        <FormFieldCard>
                                            <PricingFields fieldPrefix="variants.0" showTrackProfit={false} />
                                        </FormFieldCard>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                {values.variants.map((variant, index) => (
                                                    <VariantCard
                                                        key={variant.id}
                                                        variant={variant}
                                                        index={index}
                                                        onClick={() => handleOpenVariantModal(index)}
                                                    />
                                                ))}
                                            </div>
                                            <div className='flex items-center justify-center'>
                                                <Button
                                                    type="button"
                                                    onClick={() => handleAddVariant(setFieldValue, values.variants)}
                                                    className='uppercase'
                                                >
                                                    <span>Add Variant</span>
                                                    <PlusIcon className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </>
                                    )}

                                    <VariantModal
                                        isOpen={isVariantModalOpen}
                                        onClose={() => setIsVariantModalOpen(false)}
                                        variantIndex={editingVariantIndex}
                                        statusOptions={statusOptions}
                                        onSave={() => { }}
                                        onDelete={() => handleDeleteVariant(setFieldValue, values.variants, editingVariantIndex)}
                                        isNewVariant={isNewVariant}
                                    />
                                </div>
                            </div>
                        </Form>
                    </>
                )}
            </Formik>
        </div>
    );
};

export default MobileInventoryForm;
