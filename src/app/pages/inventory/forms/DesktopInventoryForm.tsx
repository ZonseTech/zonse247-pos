import { Form, Formik, FormikHelpers } from 'formik';
import { Button, FormFieldCard, PricingFields, ToggleButtonGroup, type ToggleOption } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import { useState, FunctionComponent, useMemo } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import PageHeader from '../../../components/page/PageHeader';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../utils/constants';
import { PlusIcon, Loader2, CheckCircle2, X } from 'lucide-react';
import { HiOutlineDocumentPlus } from 'react-icons/hi2';
import * as Yup from 'yup';
import VariantModal from '../partials/VariantModal';
import VariantCard from '../partials/VariantCard';
import { InventoryFormValues, createDefaultFormValues, createDefaultVariant } from '../types/variant.types';
import FormSkeleton from '../../../components/skeleton/FormSkeleton';

type FormMode = 'simple' | 'advance';

const formModeOptions: ToggleOption<FormMode>[] = [
    { value: 'simple', label: 'Simple' },
    { value: 'advance', label: 'Advanced' },
];

interface DesktopInventoryFormProps {
    productId?: string;
    item: ApiProduct | null;
    loading: boolean;
    statusOptions: { label: string; value: string }[];
    unitOptions: { label: string; value: string }[];
    onSubmit: (
        values: InventoryFormValues,
        helpers: FormikHelpers<InventoryFormValues>
    ) => Promise<void>;
}

const DesktopInventoryForm: FunctionComponent<DesktopInventoryFormProps> = ({
    productId,
    item,
    loading,
    unitOptions,
    onSubmit,
}) => {
    const navigate = useNavigate();
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number>(0);
    const [isNewVariant, setIsNewVariant] = useState(false);
    const [newVariantData, setNewVariantData] = useState(createDefaultVariant());
    const [formMode, setFormMode] = useState<FormMode>(productId ? 'advance' : 'simple');

    const initialFormValues: InventoryFormValues = useMemo(() => {
        if (item) {
            const mappedVariants = item.variants?.map((v) => ({
                id: v.id || '',
                variantName: v.variantName || '',
                primaryBarcode: v.primaryBarcode || '',
                sku: v.sku || '',
                brand: v.brand || '',
                description: v.description || '',
                color: '',
                size: v.size || '',
                dimensions: v.dimensions || '',
                weight: v.weight || 0,
                costPrice: v.costPrice || 0,
                sellingPrice: v.sellingPrice || 0,
                promoPrice: v.promoPrice || 0,
                promoStart: v.promoStart ? new Date(v.promoStart).toISOString().split('T')[0] : '',
                promoEnd: v.promoEnd ? new Date(v.promoEnd).toISOString().split('T')[0] : '',
                quantity: String(v.inventory?.availableQuantity ?? 0),
                originalQuantity: String(v.inventory?.availableQuantity ?? 0),
                reservedQuantity: v.inventory?.reservedQuantity || 0,
                minStock: v.inventory?.reorderPoint || 0,
                maxStock: v.inventory?.maxStock || 100000,
                reorderLevel: v.inventory?.reorderPoint || 5,
                status: v.isActive ? 'active' : 'inactive',
                trackInventory: v.inventory?.trackInventory ?? true,
                allowNegativeStock: v.inventory?.allowNegativeStock ?? false,
                isTaxable: v.isTaxable ?? true,
                isDefault: v.isDefault ?? false,
                isActive: v.isActive ?? true,
                expiryDateAlert: '',
                expirationDate: v.expirationDate ? new Date(v.expirationDate).toISOString().split('T')[0] : '',
                manufactureDate: v.manufactureDate ? new Date(v.manufactureDate).toISOString().split('T')[0] : '',
                supplierName: v.supplierName || '',
                supplierCode: v.supplierCode || '',
                additionalBarcodes: v.barcodes?.map(b => ({ barcode: b })) || [],
            })) || [createDefaultVariant()];

            return {
                productId: item.id || '',
                name: item.name || '',
                categoryId: item.categoryId || '',
                unit: item.defaultUnit || 'pc',
                variants: mappedVariants.length > 0 ? mappedVariants : [createDefaultVariant()],
            };
        }
        return createDefaultFormValues();
    }, [item]);

    const variantSchema = Yup.object().shape({
        variantName: Yup.string().max(100, 'Variant name is too long'),
        primaryBarcode: Yup.string().max(100, 'Barcode is too long'),
        sku: Yup.string().max(50, 'SKU is too long'),
        sellingPrice: Yup.number()
            .required('Selling price is required')
            .moreThan(0, 'Selling price cannot be 0'),
        costPrice: Yup.number().min(0, 'Cost price must be 0 or higher'),
        quantity: Yup.number().min(0, 'Quantity cannot be negative'),
    });

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        categoryId: Yup.string().required('Category is required'),
        unit: Yup.string(),
        variants: Yup.array().of(variantSchema).min(1, 'At least one variant is required'),
    });

    const handleOpenVariantModal = (index: number) => {
        setEditingVariantIndex(index);
        setIsNewVariant(false);
        setIsVariantModalOpen(true);
    };

    const handleOpenAddVariantModal = () => {
        setNewVariantData(createDefaultVariant());
        setIsNewVariant(true);
        setIsVariantModalOpen(true);
    };

    const handleSaveNewVariant = (setFieldValue: (field: string, value: unknown) => void, variants: InventoryFormValues['variants']) => {
        const newVariants = [...variants, newVariantData];
        setFieldValue('variants', newVariants);
        setEditingVariantIndex(newVariants.length - 1);
    };

    const handleDeleteVariant = (setFieldValue: (field: string, value: unknown) => void, variants: InventoryFormValues['variants'], index: number) => {
        if (variants.length > 1) {
            const newVariants = variants.filter((_, i) => i !== index);
            setFieldValue('variants', newVariants);
        }
    };

    if (loading && !item && productId) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <FormSkeleton sections={3} fieldsPerSection={3} />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Formik
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                    initialValues={initialFormValues}
                    validationSchema={validationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form>
                            <PageHeader
                                title={productId ? 'Edit Inventory Item' : 'Add Inventory Item'}
                                description="Manage product details and pricing"
                                icon={<HiOutlineDocumentPlus className="w-8 h-8 text-sky-500" />}
                            />

                            <div className="mt-6 space-y-6">
                                <FormFieldCard title="Basic Information">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput
                                            label="Item Name"
                                            name="name"
                                            placeholder="Enter item name"
                                            required
                                        />

                                        <CategorySearch
                                            value={values.categoryId || ''}
                                            onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                            error={errors.categoryId as string}
                                            touched={touched.categoryId as boolean}
                                        />

                                        <FormSelectBox
                                            label="Sell by Unit"
                                            name="unit"
                                            options={unitOptions}
                                        />
                                    </div>
                                </FormFieldCard>

                                {!productId && (
                                    <div className="flex justify-center">
                                        <ToggleButtonGroup<FormMode>
                                            options={formModeOptions}
                                            value={formMode}
                                            onChange={(value) => setFormMode(value)}
                                        />
                                    </div>
                                )}

                                {formMode === 'simple' ? (
                                    <FormFieldCard title="Pricing & Stock">
                                        <PricingFields fieldPrefix="variants.0" showTrackProfit={true} />
                                    </FormFieldCard>
                                ) : (
                                    <FormFieldCard title="Variants">
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {values.variants.map((variant, index) => (
                                                    <VariantCard
                                                        key={variant.id || index}
                                                        variant={variant}
                                                        index={index}
                                                        onClick={() => handleOpenVariantModal(index)}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-center pt-2">
                                                <Button
                                                    type="button"
                                                    theme="primary"
                                                    onClick={handleOpenAddVariantModal}
                                                >
                                                    <PlusIcon className="w-4 h-4 mr-2" />
                                                    Add Variant
                                                </Button>
                                            </div>
                                        </div>
                                    </FormFieldCard>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <Button
                                        type="button"
                                        theme="danger"
                                        onClick={() => navigate(ROUTES.INVENTORY)}
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
                                                {productId ? 'Update Item' : 'Create Item'}
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <VariantModal
                                    isOpen={isVariantModalOpen}
                                    onClose={() => {
                                        setIsVariantModalOpen(false);
                                        if (isNewVariant) {
                                            setNewVariantData(createDefaultVariant());
                                        }
                                    }}
                                    variantIndex={editingVariantIndex}
                                    onSave={() => {
                                        if (isNewVariant) {
                                            handleSaveNewVariant(setFieldValue, values.variants);
                                        }
                                    }}
                                    onDelete={() => handleDeleteVariant(setFieldValue, values.variants, editingVariantIndex)}
                                    isNewVariant={isNewVariant}
                                    newVariantData={isNewVariant ? newVariantData : undefined}
                                    onNewVariantChange={isNewVariant ? setNewVariantData : undefined}
                                />
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default DesktopInventoryForm;
