import { Form, Formik, FormikHelpers } from 'formik';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import { useState, FunctionComponent, useMemo } from 'react';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import {
    X,
    PlusIcon,
} from 'lucide-react';
import * as Yup from 'yup';
import { Button, FormFieldCard, PricingFields, ToggleButtonGroup, type ToggleOption } from '../../../components';
import VariantModal from '../partials/VariantModal';
import VariantCard from '../partials/VariantCard';
import StockMovementModal from '../partials/StockMovementModal';
import { InventoryFormValues, createDefaultFormValues, createDefaultVariant, Variant } from '../types/variant.types';
import MobilePlanSkeleton from '../../../components/loader/MobilePlanSkeleton';

type FormMode = 'simple' | 'advance';

const formModeOptions: ToggleOption<FormMode>[] = [
    { value: 'simple', label: 'Simple' },
    { value: 'advance', label: 'Advance' },
];

interface MobileInventoryFormProps {
    productId?: string;
    item: ApiProduct | null;
    loading: boolean;
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
    unitOptions,
    onSubmit,
}) => {
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariantIndex, setEditingVariantIndex] = useState<number>(0);
    const [isNewVariant, setIsNewVariant] = useState(false);
    const [newVariantData, setNewVariantData] = useState(createDefaultVariant());
    const [formMode, setFormMode] = useState<FormMode>(productId ? 'advance' : 'simple');
    const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
    const [selectedVariantForMovements, setSelectedVariantForMovements] = useState<{ variant: Variant; productName: string } | null>(null);

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
        return <MobilePlanSkeleton />
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
                                title={productId ? 'MANAGE ITEM' : 'ADD ITEM'}
                                className="bg-white dark:bg-gray-800"
                                leftIcon={<X className="w-5 h-5 text-sky-500 dark:text-sky-400" />}
                                rightContent={
                                    <Button
                                        type="button"
                                        onClick={submitForm}
                                        disabled={isSubmitting || loading}
                                        theme='success'
                                        className='uppercase'
                                    >
                                        Submit
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
                                            className='uppercase'
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
                                                        key={variant.id || index}
                                                        variant={variant}
                                                        index={index}
                                                        onClick={() => handleOpenVariantModal(index)}
                                                        onViewHistory={productId && variant.id ? () => {
                                                            setSelectedVariantForMovements({ variant, productName: values.name });
                                                            setIsStockMovementOpen(true);
                                                        } : undefined}
                                                    />
                                                ))}
                                            </div>
                                            <div className='flex items-center justify-center'>
                                                <Button
                                                    type="button"
                                                    onClick={handleOpenAddVariantModal}
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
                                        isEditing={!!productId}
                                        newVariantData={isNewVariant ? newVariantData : undefined}
                                        onNewVariantChange={isNewVariant ? setNewVariantData : undefined}
                                    />

                                    {selectedVariantForMovements && (
                                        <StockMovementModal
                                            isOpen={isStockMovementOpen}
                                            onClose={() => {
                                                setIsStockMovementOpen(false);
                                                setSelectedVariantForMovements(null);
                                            }}
                                            variantId={selectedVariantForMovements.variant.id}
                                            variantName={selectedVariantForMovements.variant.variantName || 'Default'}
                                            productName={selectedVariantForMovements.productName}
                                            sku={selectedVariantForMovements.variant.sku}
                                        />
                                    )}
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
