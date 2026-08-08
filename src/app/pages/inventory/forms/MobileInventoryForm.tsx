import { Form, Formik, FormikHelpers } from 'formik';
import { Box, Flex, Separator, Text } from '@radix-ui/themes';
import FormSelectBox from '../../../components/FormSelectBox';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import { useState, FunctionComponent, useMemo } from 'react';
import MobilePageHeader from '../../../components/page/MobilePageHeader';
import { X, History } from 'lucide-react';
import * as Yup from 'yup';
import { Button, FormFieldCard, TextInput } from '../../../components';
import PricingFields from './fields/PricingFields';
import StockFields from './fields/StockFields';
import BarcodeFields from './fields/BarcodeFields';
import ExpiryFields from './fields/ExpiryFields';
import NotesFields from './fields/NotesFields';
import SkuFields from './fields/SkuFields';
import StockMovementModal from '../partials/StockMovementModal';
import { InventoryFormValues, Variant, createDefaultFormValues, createDefaultVariant } from '../types/variant.types';
import MobilePlanSkeleton from '../../../components/loader/MobilePlanSkeleton';

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
    const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);

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

    const firstVariant = item?.variants?.[0];

    if (loading && !item && productId) {
        return <MobilePlanSkeleton />
    }

    return (
        <Flex direction="column" className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
            <Formik
                onSubmit={onSubmit}
                enableReinitialize={true}
                initialValues={initialFormValues}
                validationSchema={validationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched, submitForm }) => {
                    const getStringValue = (field: string): string => {
                        const value = values.variants[0]?.[field as keyof Variant];
                        return typeof value === 'string' ? value : '';
                    };
                    const getNumberValue = (field: string): number | string => {
                        const value = values.variants[0]?.[field as keyof Variant];
                        if (value === undefined || value === null || value === 0) {
                            return '';
                        }
                        return typeof value === 'number' ? value : '';
                    };
                    const handleStringChange = (field: string, value: string) => {
                        setFieldValue(`variants.0.${field}`, value);
                    };
                    const handleNumberChange = (field: string, value: string) => {
                        const numValue = value === '' ? 0 : Number(value);
                        setFieldValue(`variants.0.${field}`, numValue);
                    };

                    return (
                        <>
                            <Box className="fixed top-0 left-0 right-0 z-30">
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
                            </Box>
                            <Form className="flex flex-col h-full">
                                <Box className="flex-1 min-h-0 overflow-y-auto pt-[60px] pb-24">
                                    <Box className="h-full" p="4">
                                        <Flex direction="column" gap="4">
                                            <FormFieldCard>
                                                <Flex direction="column" gap="4">
                                                    <TextInput
                                                        label="Item Name"
                                                        name="name"
                                                        placeholder="Enter item name"
                                                        required
                                                        className='uppercase'
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
                                                </Flex>
                                            </FormFieldCard>

                                            <Flex align="center" gap="2" py="1">
                                                <Separator size="4" />
                                                <Text size="1" weight="bold" className="uppercase tracking-wider whitespace-nowrap">
                                                    Pricing &amp; Stock
                                                </Text>
                                                <Separator size="4" />
                                            </Flex>

                                            <FormFieldCard>
                                                <PricingFields fieldPrefix="variants.0" showTrackProfit={false} />
                                            </FormFieldCard>

                                            <FormFieldCard>
                                                <StockFields
                                                    fieldPrefix="variants.0"
                                                    isEditing={!!productId}
                                                    trackInventory={Boolean(values.variants[0]?.trackInventory)}
                                                    allowNegativeStock={Boolean(values.variants[0]?.allowNegativeStock)}
                                                    onCheckboxChange={(field, value) => setFieldValue(`variants.0.${field}`, value)}
                                                />
                                            </FormFieldCard>

                                            <BarcodeFields
                                                fieldPrefix="variants.0"
                                                getValue={getStringValue}
                                                onChange={handleStringChange}
                                                hasData={Boolean(getStringValue('primaryBarcode'))}
                                            />

                                            <ExpiryFields
                                                fieldPrefix="variants.0"
                                                getStringValue={getStringValue}
                                                getNumberValue={getNumberValue}
                                                onStringChange={handleStringChange}
                                                onNumberChange={handleNumberChange}
                                                hasData={Boolean(getStringValue('expirationDate') || getNumberValue('expiryDateAlert'))}
                                            />

                                            <NotesFields
                                                fieldPrefix="variants.0"
                                                getValue={getStringValue}
                                                onChange={handleStringChange}
                                                hasData={Boolean(getStringValue('description'))}
                                            />

                                            <SkuFields
                                                fieldPrefix="variants.0"
                                                getValue={getStringValue}
                                                onChange={handleStringChange}
                                                hasData={Boolean(getStringValue('sku'))}
                                            />

                                            {productId && firstVariant && (
                                                <Button
                                                    type="button"
                                                    onClick={() => setIsStockMovementOpen(true)}
                                                    className="uppercase"
                                                >
                                                    <History className="w-4 h-4 mr-2" />
                                                    Stock Movement History
                                                </Button>
                                            )}

                                            {productId && firstVariant && (
                                                <StockMovementModal
                                                    isOpen={isStockMovementOpen}
                                                    onClose={() => setIsStockMovementOpen(false)}
                                                    variantId={firstVariant.id}
                                                    variantName={firstVariant.variantName}
                                                    productName={item?.name || ''}
                                                    sku={firstVariant.sku}
                                                />
                                            )}
                                        </Flex>
                                    </Box>
                                </Box>
                            </Form>
                        </>
                    );
                }}
            </Formik>
        </Flex>
    );
};

export default MobileInventoryForm;
