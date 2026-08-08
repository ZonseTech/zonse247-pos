import { Form, Formik, FormikHelpers } from 'formik';
import { Box, Button, Flex, Grid } from '@radix-ui/themes';
import FormSelectBox from '../../../components/FormSelectBox';
import SectionCard from '../../../components/card/SectionCard';
import { FormActions } from '../../../components/form';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import ItemNameField from '../partials/ItemNameField';
import { useState, FunctionComponent, useMemo, type ReactNode } from 'react';
import PageHeader from '../../../components/page/PageHeader';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../utils/constants';
import { CheckCircle2, History, Package, Tags, Boxes } from 'lucide-react';
import * as Yup from 'yup';
import PricingFields from './fields/PricingFields';
import StockFields from './fields/StockFields';
import BarcodeFields from './fields/BarcodeFields';
import ExpiryFields from './fields/ExpiryFields';
import NotesFields from './fields/NotesFields';
import SkuFields from './fields/SkuFields';
import { InventoryFormValues, Variant, createDefaultFormValues, createDefaultVariant } from '../types/variant.types';
import FormSkeleton from '../../../components/skeleton/FormSkeleton';
import StockMovementModal from '../partials/StockMovementModal';
import AppLayout from '../../../layouts/AppLayout';

const PageContainer: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
    <Box minHeight="100%" px={{ initial: "2", sm: "4" }} pt={{ initial: "2", sm: "4" }} pb={{ initial: "2", sm: "4" }} overflowX="hidden" overflowY="visible">
        {children}
    </Box>
);

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
        return (
            <AppLayout>
                <FormSkeleton sections={3} fieldsPerSection={3} />
            </AppLayout>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title={productId ? 'Edit Inventory Item' : 'Add Inventory Item'}
                description="Manage product details and pricing"
                icon={<Package className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                showBackButton
                onBack={() => navigate(ROUTES.INVENTORY_HUB)}
            />
            <Formik
                onSubmit={onSubmit}
                enableReinitialize={true}
                initialValues={initialFormValues}
                validationSchema={validationSchema}
            >
                {({ isSubmitting, values, setFieldValue, errors, touched }) => {
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
                        <Form>
                            <Grid columns={{ initial: "1", lg: "3" }} gap="6">
                                <Box className="lg:col-span-2">
                                    <Flex direction="column" gap="4">
                                        <SectionCard
                                            title="Basic Information"
                                            icon={Package}
                                            iconColor="bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400"
                                        >
                                            <Grid columns={{ initial: "1", md: "2" }} gap="4">
                                                <Box className="md:col-span-2">
                                                    <ItemNameField
                                                        label="Item Name"
                                                        name="name"
                                                        placeholder="Enter item name"
                                                        required
                                                        className='uppercase'
                                                        excludeProductId={productId}
                                                    />
                                                </Box>

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
                                            </Grid>
                                        </SectionCard>

                                        <SectionCard
                                            title="Pricing"
                                            icon={Tags}
                                            iconColor="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                                        >
                                            <PricingFields fieldPrefix="variants.0" showTrackProfit={true} />
                                        </SectionCard>

                                        <SectionCard
                                            title="Stock"
                                            icon={Boxes}
                                            iconColor="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                                        >
                                            <StockFields
                                                fieldPrefix="variants.0"
                                                isEditing={!!productId}
                                                trackInventory={Boolean(values.variants[0]?.trackInventory)}
                                                allowNegativeStock={Boolean(values.variants[0]?.allowNegativeStock)}
                                                onCheckboxChange={(field, value) => setFieldValue(`variants.0.${field}`, value)}
                                            />
                                        </SectionCard>

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
                                    </Flex>
                                </Box>

                                <Flex
                                    direction="column"
                                    gap="6"
                                    position={{ initial: 'static', lg: 'sticky' }}
                                    top={{ initial: '0', lg: '4' }}
                                    alignSelf={{ initial: 'stretch', lg: 'start' }}
                                >
                                    <FormActions
                                        isSubmitting={isSubmitting}
                                        isLoading={loading}
                                        submitLabel={productId ? 'Update Item' : 'Create Item'}
                                        submitIcon={<CheckCircle2 className="w-4 h-4" />}
                                    >

                                        {productId && firstVariant && (
                                            <Button
                                                type="button"
                                                variant="soft"
                                                color="sky"
                                                size="3"
                                                onClick={() => setIsStockMovementOpen(true)}
                                                className="w-full h-auto justify-start text-left"
                                            >
                                                <Flex align="center" gap="3" width="100%">
                                                    <Box className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                                        <History className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                                    </Box>
                                                    <Box className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            View movement history
                                                        </p>
                                                        {firstVariant.sku && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                                                                {firstVariant.sku}
                                                            </p>
                                                        )}
                                                    </Box>
                                                </Flex>
                                            </Button>
                                        )}

                                    </FormActions>
                                </Flex>
                            </Grid>

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
                        </Form>
                    );
                }}
            </Formik>
        </PageContainer>
    );
};

export default DesktopInventoryForm;
