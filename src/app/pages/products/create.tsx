import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { FunctionComponent, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Notify, Report, Confirm } from 'notiflix';
import { Package, BarcodeIcon } from 'lucide-react';
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
        } catch (error: any) {
            console.error('Error fetching product:', error);
            const errorMessage = error?.response?.data?.message || 'Failed to load product details';
            Notify.failure(errorMessage);
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
        categoryId: Yup.string().required('Category is required'),
        sku: Yup.string()
            .required('SKU is required')
            .max(50, 'SKU is too long'),
        name: Yup.string()
            .required('Product name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        description: Yup.string().max(1000, 'Description is too long'),
        unit: Yup.string().required('Unit is required'),
        sellingPrice: Yup.number()
            .required('Selling price is required')
            .min(0, 'Selling price must be 0 or higher'),
        costPrice: Yup.number()
            .min(0, 'Cost price must be 0 or higher'),
        brand: Yup.string().max(100, 'Brand name is too long'),
        weight: Yup.number().min(0, 'Weight must be 0 or higher'),
        minStock: Yup.number().min(0, 'Min stock must be 0 or higher'),
        maxStock: Yup.number().min(0, 'Max stock must be 0 or higher'),
        reorderLevel: Yup.number().min(0, 'Reorder level must be 0 or higher'),
    });

    const handleSubmit = async (values: typeof defaultProductValues, { resetForm }: any) => {
        setLoading(true);
        try {
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
        } catch (error: any) {
            console.error('Submit error:', error);
            const errorMessage = error?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`;
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !product && productId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading product details...</div>
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
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            1
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Basic Information
                                        </h3>
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
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            2
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Pricing
                                        </h3>
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
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                            <div className="flex items-center gap-3 mb-6 relative">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                    3
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Barcode Information
                                                </h3>
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
                                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                            <div className="flex items-center gap-3 mb-6 relative">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                    4
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Inventory Settings
                                                </h3>
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

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
                                    <Button
                                        type="button"
                                        theme="neutral"
                                        onClick={() => navigate(ROUTES.PRODUCTS)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        theme="primary"
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting || loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            isEditMode ? 'Update Product' : 'Create Product'
                                        )}
                                    </Button>
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
