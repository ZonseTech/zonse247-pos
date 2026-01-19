import * as Yup from 'yup';
import { Form, Formik, FormikHelpers } from 'formik';
import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report, Confirm } from 'notiflix';
import {
    Package,
    BarcodeIcon,
    Tag,
    DollarSign,
    QrCode,
    Settings2,
    AlertCircle,
    CheckCircle2,
    Info,
    Loader2
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import { useProducts } from '../../hooks/useProducts';
import { useSettings } from '../../hooks/useSettings';
import { ROUTES } from '../../utils/constants';
import BarcodeManager from './partials/BarcodeManager';
import { CategorySearch } from '../categories/partials/CategorySearch';
import CameraBarcodeScanner from '../../components/scanner/CameraBarcodeScanner';
import { type ScannerResult } from '../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../hooks/useScannerSettings';
import {
    parseApiError,
    getErrorMessage,
    mapErrorToFormikErrors,
    isDuplicateError,
    isValidationError,
    isRetryableError,
    isNotFoundError,
    ProductErrorMessages,
    InventoryErrorMessages,
    getFriendlyFieldName,
} from '../../utils/api-error-handler';

const ProductForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setup } = useSettings();
    const { createProduct, updateProduct, getProduct } = useProducts();
    const { triggerFeedback } = useScannerFeedback();

    const productId = (location.state as any)?.productId;
    const isEditMode = !!productId;

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [barcodes, setBarcodes] = useState<Omit<ProductBarcode, 'id' | 'productId' | 'createdAt' | 'updatedAt'>[]>([]);
    const [isPrimaryBarcodeScannerOpen, setIsPrimaryBarcodeScannerOpen] = useState(false);

    const isNative = Capacitor.isNativePlatform();

    useEffect(() => {
        if (isEditMode) {
            loadProduct();
        }
    }, [productId]);

    const loadProduct = async () => {
        if (!productId) return;

        setLoading(true);
        try {
            const productData = await getProduct(productId);

            if (productData) {
                setProduct(productData);
                if (productData.barcodes) {
                    setBarcodes(productData.barcodes.map(b => ({
                        barcode: b.barcode,
                        barcodeType: b.barcodeType,
                        barcodeSource: b.barcodeSource,
                        description: b.description,
                    })));
                }
            }
        } catch (error: unknown) {
            console.error('Error fetching product:', error);
            const parsedError = parseApiError(error);

            if (parsedError.statusCode === 404) {
                Report.failure(
                    'Product Not Found',
                    ProductErrorMessages.PRODUCT_NOT_FOUND(productId),
                    'Go Back',
                    () => navigate(ROUTES.PRODUCTS)
                );
            } else {
                Notify.failure(parsedError.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const unitOptions = [
        { label: 'Piece (pc)', value: 'piece' },
        { label: 'Pack', value: 'pack' },
        { label: 'Box', value: 'box' },
        { label: 'Carton', value: 'carton' },
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Liter (L)', value: 'liter' },
        { label: 'Milliliter (ml)', value: 'ml' },
        { label: 'Meter (m)', value: 'm' },
        { label: 'Centimeter (cm)', value: 'cm' }
    ];

    const defaultProductValues = {
        sku: '',
        name: '',
        description: '',
        categoryId: '',
        unit: 'piece',
        sellingPrice: 0,
        costPrice: 0,
        brand: '',
        weight: 0,
        primaryBarcode: '',
        trackInventory: true,
        allowNegativeStock: false,
        minStock: 0,
        maxStock: 0,
        reorderLevel: 0,
    };

    const initialProductValues = product ? {
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        categoryId: product.categoryId || '',
        unit: product.unit,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice || 0,
        brand: product.brand || '',
        weight: product.weight || 0,
        primaryBarcode: product.primaryBarcode || '',
        trackInventory: product.inventory?.trackInventory ?? true,
        allowNegativeStock: product.inventory?.allowNegativeStock ?? false,
        minStock: product.inventory?.minStock || 0,
        maxStock: product.inventory?.maxStock || 0,
        reorderLevel: product.inventory?.reorderLevel || 0,
    } : defaultProductValues;

    const productValidationSchema = Yup.object().shape({
        categoryId: Yup.string(),
        sku: Yup.string()
            .required('SKU is required')
            .max(100, 'SKU is too long'),
        name: Yup.string()
            .required('Product name is required')
            .min(1, 'Name is required')
            .max(255, 'Name is too long'),
        description: Yup.string().max(1000, 'Description is too long'),
        unit: Yup.string().max(50, 'Unit is too long'),
        sellingPrice: Yup.number()
            .required('Selling price is required')
            .min(0, 'Selling price must be 0 or higher'),
        costPrice: Yup.number()
            .min(0, 'Cost price must be 0 or higher'),
        brand: Yup.string().max(100, 'Brand name is too long'),
        weight: Yup.number().min(0, 'Weight must be 0 or higher'),
        primaryBarcode: Yup.string().max(100, 'Primary barcode is too long'),
        minStock: Yup.number().min(0, 'Min stock must be 0 or higher'),
        maxStock: Yup.number().min(0, 'Max stock must be 0 or higher'),
        reorderLevel: Yup.number().min(0, 'Reorder level must be 0 or higher'),
    });

    const handleSubmit = async (
        values: typeof defaultProductValues,
        { resetForm, setErrors, setFieldError }: FormikHelpers<typeof defaultProductValues>
    ) => {
        setLoading(true);
        try {
            // Validate business rules before submission
            const minStock = Number(values.minStock) || 0;
            const maxStock = Number(values.maxStock) || 0;
            const reorderLevel = Number(values.reorderLevel) || 0;

            if (maxStock > 0 && minStock > maxStock) {
                setFieldError('minStock', InventoryErrorMessages.MIN_EXCEEDS_MAX(minStock, maxStock));
                setLoading(false);
                return;
            }

            if (maxStock > 0 && reorderLevel > maxStock) {
                setFieldError('reorderLevel', InventoryErrorMessages.REORDER_EXCEEDS_MAX(reorderLevel, maxStock));
                setLoading(false);
                return;
            }

            // Check for duplicate barcodes in the request
            if (barcodes.length > 0) {
                const allBarcodes = values.primaryBarcode
                    ? [values.primaryBarcode, ...barcodes.map(b => b.barcode)]
                    : barcodes.map(b => b.barcode);
                const uniqueBarcodes = new Set(allBarcodes.filter(b => b));
                if (uniqueBarcodes.size !== allBarcodes.filter(b => b).length) {
                    const duplicates = allBarcodes.filter((item, index) => item && allBarcodes.indexOf(item) !== index);
                    Report.warning(
                        'Duplicate Barcodes',
                        ProductErrorMessages.DUPLICATE_BARCODES_IN_REQUEST(duplicates[0]),
                        'Okay'
                    );
                    setLoading(false);
                    return;
                }
            }

            const payload: CreateProductPayload = {
                name: values.name,
                description: values.description || undefined,
                categoryId: values.categoryId || undefined,
                sellingPrice: Number(values.sellingPrice),
                costPrice: Number(values.costPrice) || undefined,
                unit: values.unit,
                brand: values.brand || undefined,
                weight: Number(values.weight) || undefined,
                sku: values.sku,
                primaryBarcode: values.primaryBarcode || undefined,
                barcodes: barcodes.length > 0 ? barcodes : undefined,
                trackInventory: values.trackInventory,
                allowNegativeStock: values.allowNegativeStock,
                minStock: Number(values.minStock) || undefined,
                maxStock: Number(values.maxStock) || undefined,
                reorderLevel: Number(values.reorderLevel) || undefined,
            };

            if (!isEditMode) {
                await createProduct(payload);

                Confirm.show(
                    'Product Saved',
                    'Product created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Products',
                    () => {
                        resetForm();
                        setBarcodes([]);
                    },
                    () => {
                        navigate(ROUTES.PRODUCTS);
                    }
                );
            } else {
                await updateProduct(productId, payload);
                Report.success('Success', 'Product updated successfully', 'Okay', () => {
                    navigate(ROUTES.PRODUCTS);
                });
            }
        } catch (error: unknown) {
            console.error('Submit error:', error);

            // Parse the API error
            const parsedError = parseApiError(error);

            // Map field-specific errors to Formik
            const formikErrors = mapErrorToFormikErrors(error);
            if (Object.keys(formikErrors).length > 0) {
                setErrors(formikErrors);
            }

            // Handle specific error types
            if (isDuplicateError(error)) {
                const fieldName = parsedError.field?.toLowerCase() || '';

                if (fieldName.includes('sku')) {
                    setFieldError('sku', ProductErrorMessages.SKU_EXISTS(values.sku));
                    Report.warning(
                        'Duplicate SKU',
                        ProductErrorMessages.SKU_EXISTS(values.sku),
                        'Okay'
                    );
                } else if (fieldName.includes('barcode')) {
                    setFieldError('primaryBarcode', parsedError.message);
                    Report.warning(
                        'Duplicate Barcode',
                        parsedError.message,
                        'Okay'
                    );
                } else {
                    Report.warning(
                        'Duplicate Entry',
                        parsedError.message,
                        'Okay'
                    );
                }
            } else if (isNotFoundError(error)) {
                // Handle not found (e.g., category doesn't exist)
                const fieldName = parsedError.field?.toLowerCase() || '';

                if (fieldName.includes('category')) {
                    setFieldError('categoryId', ProductErrorMessages.CATEGORY_NOT_FOUND(values.categoryId));
                    Report.failure(
                        'Category Not Found',
                        ProductErrorMessages.CATEGORY_NOT_FOUND(values.categoryId),
                        'Okay'
                    );
                } else {
                    Report.failure(
                        'Not Found',
                        parsedError.message,
                        'Okay'
                    );
                }
            } else if (isValidationError(error)) {
                // Handle validation errors
                Report.failure(
                    'Validation Error',
                    parsedError.message,
                    'Okay'
                );
            } else if (isRetryableError(error)) {
                // Handle retryable errors (network, timeout, etc.)
                Confirm.show(
                    'Operation Failed',
                    `${parsedError.message} Would you like to try again?`,
                    'Retry',
                    'Cancel',
                    async () => {
                        // Retry the submission
                        await handleSubmit(values, { resetForm, setErrors, setFieldError } as FormikHelpers<typeof defaultProductValues>);
                    },
                    () => {
                        // User cancelled
                    }
                );
            } else {
                // Generic error
                Report.failure(
                    'Error',
                    parsedError.message,
                    'Okay'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !product && productId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded md:col-span-2"></div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                </div>
                            </div>
                        </div>
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
                        title={isEditMode ? 'Edit Product' : 'Add New Product'}
                        description={isEditMode ? 'Update product information' : 'Required fields are marked with an asterisk (*)'}
                        icon={<Package className="w-8 h-8 text-blue-600" />}
                    />
                </div>

                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialProductValues}
                    validationSchema={productValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form>
                            <FormWrapper>
                                <div className="py-6 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-200 dark:from-blue-600 dark:to-blue-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-400 font-semibold text-sm shadow-sm">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Basic Information
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Enter the product identification details</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <div className="md:col-span-2">
                                            <CategorySearch
                                                value={values.categoryId || ''}
                                                onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                            />
                                        </div>

                                        <FormInput
                                            label="SKU"
                                            name="sku"
                                            placeholder="PROD-001"
                                            required
                                            disabled={isEditMode}
                                        />

                                        <FormInput
                                            label="Product Name"
                                            name="name"
                                            placeholder="Sugar 1kg"
                                            required
                                        />

                                        <div className="md:col-span-2">
                                            <FormInput
                                                label="Description"
                                                name="description"
                                                placeholder="Product description"
                                            />
                                        </div>

                                        <FormInput
                                            label="Brand"
                                            name="brand"
                                            placeholder="Brand name"
                                        />

                                        <FormSelectBox
                                            label="Unit"
                                            name="unit"
                                            options={unitOptions}
                                        />
                                    </div>
                                </div>

                                <div className="pb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-200 dark:from-green-600 dark:to-green-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 border-2 border-green-500 dark:border-green-600 text-green-600 dark:text-green-400 font-semibold text-sm shadow-sm">
                                            <DollarSign className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Pricing
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Set cost and selling prices</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormInput
                                            label="Cost Price"
                                            name="costPrice"
                                            type="number"
                                            step="0.01"
                                            placeholder="1200.00"
                                            min="0"
                                        />

                                        <FormInput
                                            label="Selling Price"
                                            name="sellingPrice"
                                            type="number"
                                            step="0.01"
                                            placeholder="1500.00"
                                            required
                                            min="0"
                                        />

                                        <FormInput
                                            label="Weight (optional)"
                                            name="weight"
                                            type="number"
                                            step="0.01"
                                            placeholder="1.5"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {(
                                    <>
                                        <div className="pb-8 relative">
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-200 dark:from-purple-600 dark:to-purple-900"></div>

                                            <div className="flex items-center gap-3 mb-6 relative">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-400 font-semibold text-sm shadow-sm">
                                                    <QrCode className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Barcode Information
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Manage product barcodes for scanning</p>
                                                </div>
                                            </div>
                                            <div className="ml-4 sm:ml-11 space-y-4">
                                                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Primary Barcode
                                                    </label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <FormInput
                                                                name="primaryBarcode"
                                                                placeholder="Scan or enter barcode"
                                                                className="w-full"
                                                            />
                                                        </div>

                                                        {isNative && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsPrimaryBarcodeScannerOpen(true)}
                                                                className="flex-shrink-0 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium text-sm transition-colors duration-150 flex items-center justify-center gap-2 touch-manipulation"
                                                                title="Scan barcode with camera"
                                                                aria-label="Open camera barcode scanner"
                                                            >
                                                                <BarcodeIcon className="w-5 h-5" />
                                                                <span>Scan</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                        {isNative ? 'Tap the scan button to use your camera' : 'Enter the main barcode for this product'}
                                                    </p>
                                                </div>

                                                <CameraBarcodeScanner
                                                    isOpen={isPrimaryBarcodeScannerOpen}
                                                    onClose={() => setIsPrimaryBarcodeScannerOpen(false)}
                                                    onScan={(result: ScannerResult) => {
                                                        triggerFeedback();
                                                        setFieldValue('primaryBarcode', result.barcode);
                                                        setIsPrimaryBarcodeScannerOpen(false);
                                                    }}
                                                    continuous={false}
                                                    title="Scan Primary Barcode"
                                                    subtitle="Point camera at product barcode"
                                                />

                                                <div className="pt-2">
                                                    <BarcodeManager barcodes={barcodes} onBarcodesChange={setBarcodes} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pb-8 relative">
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-orange-200 dark:from-orange-600 dark:to-orange-900"></div>

                                            <div className="flex items-center gap-3 mb-6 relative">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 border-2 border-orange-500 dark:border-orange-600 text-orange-600 dark:text-orange-400 font-semibold text-sm shadow-sm">
                                                    <Settings2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        Inventory Settings
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Configure stock tracking and levels</p>
                                                </div>
                                            </div>
                                            <div className="ml-11">
                                                <div className="space-y-4 mb-4">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.trackInventory}
                                                            onChange={(e) => setFieldValue('trackInventory', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Track Inventory
                                                        </span>
                                                    </label>
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.allowNegativeStock}
                                                            onChange={(e) => setFieldValue('allowNegativeStock', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Allow Negative Stock
                                                        </span>
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <FormInput
                                                        label="Min Stock"
                                                        name="minStock"
                                                        type="number"
                                                        placeholder="10"
                                                        min="0"
                                                    />
                                                    <FormInput
                                                        label="Max Stock"
                                                        name="maxStock"
                                                        type="number"
                                                        placeholder="100"
                                                        min="0"
                                                    />
                                                    <FormInput
                                                        label="Reorder Level"
                                                        name="reorderLevel"
                                                        type="number"
                                                        placeholder="20"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        <span>Fields marked with * are required</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            theme="neutral"
                                            onClick={() => navigate(ROUTES.PRODUCTS)}
                                            disabled={isSubmitting || loading}
                                            className="min-w-[100px]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            theme="primary"
                                            disabled={isSubmitting || loading}
                                            className="min-w-[140px]"
                                        >
                                            {isSubmitting || loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {isEditMode ? 'Update Product' : 'Create Product'}
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </FormWrapper>
                        </Form>
                    )}
                </Formik>
            </div>
        </AppLayout>
    );
};

export default ProductForm;
