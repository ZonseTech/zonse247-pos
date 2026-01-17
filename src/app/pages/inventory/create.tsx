import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import { Notify, Report, Confirm } from 'notiflix';
import { Button } from '../../components';
import FormInput from '../../components/FormInput';
import FormWrapper from '../../components/FormWrapper';
import FormSelectBox from '../../components/FormSelectBox';
import { CategorySearch } from '../categories/partials/CategorySearch';
import { Fragment, useState, useEffect, ChangeEvent, FunctionComponent, useCallback } from 'react';
import inventoryService from '../../services/inventory.service';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useNavigate, useLocation } from 'react-router';
import { ROUTES } from '../../utils/constants';
import { Zap, FileText, BarcodeIcon } from 'lucide-react';
import { HiOutlineDocumentPlus } from 'react-icons/hi2';
import { useInventory } from '../../hooks/useInventory';
import { Capacitor } from '@capacitor/core';
import CameraBarcodeScanner from '../../components/scanner/CameraBarcodeScanner';
import { type ScannerResult } from '../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../hooks/useScannerSettings';

type FormMode = 'quick' | 'full';

const InventoryForm: FunctionComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState<InventoryItem | null>(null);
    const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
    const { triggerFeedback } = useScannerFeedback();

    // Check if running on native mobile platform
    const isNative = Capacitor.isNativePlatform();
    const [formMode, setFormMode] = useState<FormMode>('full');
    const { reloadInventory } = useInventory();

    const { productId } = location.state || {};

    useEffect(() => {
        const fetchItem = async () => {
            if (productId) {
                setLoading(true);
                try {
                    const itemData = await inventoryService.show(productId);
                    setItem(itemData);
                } catch (error: any) {
                    console.error('Error fetching inventory item:', error);
                    const errorMessage = error?.response?.data?.message || 'Failed to load inventory details';
                    Notify.failure(errorMessage);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchItem();
    }, [productId]);

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Discontinued', value: 'discontinued' },
        { label: 'Out of Stock', value: 'out_of_stock' }
    ];

    const unitOptions = [
        { label: 'Piece (pc)', value: 'pc' },
        { label: 'Pack', value: 'pack' },
        { label: 'Box', value: 'box' },
        { label: 'Carton', value: 'carton' },
        { label: 'Kilogram (kg)', value: 'kg' },
        { label: 'Gram (g)', value: 'g' },
        { label: 'Liter (L)', value: 'L' },
        { label: 'Milliliter (ml)', value: 'ml' },
        { label: 'Meter (m)', value: 'm' },
        { label: 'Centimeter (cm)', value: 'cm' }
    ];

    const defaultItemValues: Partial<InventoryItem> = {
        productId: '',
        barcode: '',
        sku: '',
        name: '',
        description: '',
        brand: '',
        unit: 'pc',
        color: '',
        size: '',
        dimensions: '',
        weight: 0,
        categoryId: '',
        costPrice: 0,
        sellPrice: 0,
        promoPrice: 0,
        promoStart: '',
        promoEnd: '',
        quantity: '0',
        originalQuantity: '0',
        reservedQuantity: 0,
        minStock: 1,
        maxStock: 1000,
        reorderLevel: 5,
        status: 'active',
        trackInventory: true,
        allowNegativeStock: false,
        isTaxable: true,
        expirationDate: '',
        manufactureDate: '',
        supplierName: '',
        supplierCode: '',
    };

    const initialItemValues = item ? {
        ...defaultItemValues,
        ...item,
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate).toISOString().split('T')[0] : '',
        promoStart: item.promoStart ? new Date(item.promoStart).toISOString().split('T')[0] : '',
        promoEnd: item.promoEnd ? new Date(item.promoEnd).toISOString().split('T')[0] : '',
    } : defaultItemValues;

    const quickValidationSchema = Yup.object().shape({
        categoryId: Yup.string().required('Category is required'),
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        barcode: Yup.string()
            .required('Barcode is required')
            .matches(/^[0-9]+$/, 'Barcode must contain only numbers'),
        costPrice: Yup.number()
            .required('Cost price is required')
            .min(0, 'Cost price must be 0 or higher'),
        sellPrice: Yup.number()
            .required('Sell price is required')
            .min(0, 'Sell price must be 0 or higher'),
        quantity: Yup.number()
            .required('Quantity is required')
            .min(0, 'Quantity cannot be negative'),
        expirationDate: Yup.string().required('Expiry date is required'),
        minStock: Yup.number()
            .required('Minimum stock is required')
            .min(0, 'Minimum stock must be 0 or higher'),
    });

    const fullValidationSchema = Yup.object().shape({
        categoryId: Yup.string().required('Category is required'),
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        barcode: Yup.string()
            .required('Barcode is required')
            .matches(/^[0-9]+$/, 'Barcode must contain only numbers'),
        sku: Yup.string().max(50, 'SKU is too long'),
        description: Yup.string().max(1000, 'Description is too long'),
        brand: Yup.string().max(100, 'Brand name is too long'),
        unit: Yup.string().required('Unit is required'),
        color: Yup.string().max(50, 'Color is too long'),
        size: Yup.string().max(50, 'Size is too long'),
        dimensions: Yup.string().max(100, 'Dimensions is too long'),
        weight: Yup.number().min(0, 'Weight must be 0 or higher'),
        costPrice: Yup.number()
            .required('Cost price is required')
            .min(0, 'Cost price must be 0 or higher'),
        sellPrice: Yup.number()
            .required('Sell price is required')
            .min(0, 'Sell price must be 0 or higher'),
        promoPrice: Yup.number().min(0, 'Promo price must be 0 or higher'),
        quantity: Yup.number()
            .required('Quantity is required')
            .min(0, 'Quantity cannot be negative'),
        minStock: Yup.number()
            .required('Minimum stock is required')
            .min(0, 'Minimum stock must be 0 or higher'),
        maxStock: Yup.number()
            .min(0, 'Maximum stock must be 0 or higher'),
        reorderLevel: Yup.number()
            .min(0, 'Reorder level must be 0 or higher'),
        expirationDate: Yup.string().required('Expiry date is required'),
        supplierName: Yup.string().max(200, 'Supplier name is too long'),
        supplierCode: Yup.string().max(50, 'Supplier code is too long'),
    });

    const handleSubmit = async (values: Partial<InventoryItem>, { resetForm }: any) => {
        setLoading(true);
        try {
            const data = {
                ...values,
                costPrice: Number(values.costPrice),
                sellPrice: Number(values.sellPrice),
                promoPrice: Number(values.promoPrice) || 0,
                weight: Number(values.weight) || 0,
                minStock: Number(values.minStock),
                maxStock: Number(values.maxStock) || 1000,
                reorderLevel: Number(values.reorderLevel) || 5,
                reservedQuantity: Number(values.reservedQuantity) || 0,
                quantity: values.quantity?.toString() || '0',
                originalQuantity: values.originalQuantity?.toString() || values.quantity?.toString() || '0',
            } as InventoryItem;

            if (productId) {
                await inventoryService.update(productId, data);
                await reloadInventory();
                Report.success('Success', 'Inventory item updated successfully', 'Okay', () => {
                    navigate(ROUTES.INVENTORY);
                });
            } else {
                await inventoryService.store(data);
                await reloadInventory();
                Confirm.show(
                    'Item Saved',
                    'Inventory item created successfully. What would you like to do?',
                    'Add Another',
                    'Go to Inventory',
                    () => {
                        resetForm();
                    },
                    () => {
                        navigate(ROUTES.INVENTORY);
                    }
                );
            }
        } catch (error: any) {
            console.error('Error saving inventory item:', error);
            const errorMessage = error?.message || error?.response?.data?.message || `Failed to ${productId ? 'update' : 'create'} inventory item`;
            Report.failure('Error', errorMessage, 'Okay');
        } finally {
            setLoading(false);
        }
    };

    const handleBarcodeChange = (value: string, setFieldValue: Function) => {
        const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
        setFieldValue('barcode', cleanedValue);
    };

    const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    if (loading && !item && productId) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-600 dark:text-gray-400">Loading inventory details...</div>
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
                        title={productId ? 'Edit Inventory Item' : 'Add Inventory Item'}
                        description='Required fields are marked with an asterisk (*)'
                        icon={<HiOutlineDocumentPlus className="w-8 h-8 text-blue-600" />}
                        action={!productId ? (
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex items-center w-full lg:w-auto gap-3">

                                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('quick')}
                                            title="Quick Add"
                                            className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium transition-colors ${formMode === 'quick'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            <Zap className="w-4 h-4" />
                                            <span className="hidden sm:inline">Quick Add</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('full')}
                                            title="Full Form"
                                            className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium transition-colors ${formMode === 'full'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span className="hidden sm:inline">Full Form</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    />
                </div>

                <Formik
                    onSubmit={handleSubmit}
                    enableReinitialize={true}
                    initialValues={initialItemValues}
                    validationSchema={formMode === 'quick' ? quickValidationSchema : fullValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
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
                                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <CategorySearch
                                                value={values.categoryId || ''}
                                                onChange={(categoryId) => setFieldValue('categoryId', categoryId)}
                                                error={errors.categoryId as string}
                                                touched={touched.categoryId as boolean}
                                            />

                                            <FormInput
                                                label="Item Name"
                                                name="name"
                                                placeholder="Enter item name"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2 p-3 sm:p-4 rounded-sm border border-gray-200 dark:border-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <FormInput
                                                        name="barcode"
                                                        label='Barcode'
                                                        placeholder="Scan or enter barcode"
                                                        required
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                            handleBarcodeChange(e.target.value, setFieldValue);
                                                        }}
                                                        onKeyDown={handleBarcodeKeyDown}
                                                    />
                                                </div>

                                                {isNative && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsBarcodeScannerOpen(true)}
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
                                                {isNative ? 'Tap the scan button to use your camera' : 'Enter or scan the product barcode'}
                                            </p>
                                        </div>

                                        <CameraBarcodeScanner
                                            isOpen={isBarcodeScannerOpen}
                                            onClose={() => setIsBarcodeScannerOpen(false)}
                                            onScan={(result: ScannerResult) => {
                                                triggerFeedback();
                                                setFieldValue('barcode', result.barcode);
                                                setIsBarcodeScannerOpen(false);
                                            }}
                                            continuous={false}
                                            title="Scan Barcode"
                                            subtitle="Point camera at product barcode"
                                        />

                                        {formMode === 'full' && (
                                            <>
                                                <FormInput
                                                    label="SKU"
                                                    name="sku"
                                                    placeholder="Stock Keeping Unit"
                                                />

                                                <FormInput
                                                    label="Brand"
                                                    name="brand"
                                                    placeholder="Enter brand name"
                                                />

                                                <div className="md:col-span-2">
                                                    <FormInput
                                                        label="Description"
                                                        name="description"
                                                        placeholder="Enter item description"
                                                    />
                                                </div>
                                            </>
                                        )}
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
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            step="0.01"
                                        />

                                        <FormInput
                                            label="Sell Price"
                                            name="sellPrice"
                                            type="number"
                                            placeholder="0.00"
                                            required
                                            min="0"
                                            step="0.01"
                                        />

                                        {formMode === 'full' && (
                                            <>
                                                <FormInput
                                                    label="Promo Price"
                                                    name="promoPrice"
                                                    type="number"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />

                                                <div></div>

                                                <FormInput
                                                    label="Promo Start Date"
                                                    name="promoStart"
                                                    type="date"
                                                />

                                                <FormInput
                                                    label="Promo End Date"
                                                    name="promoEnd"
                                                    type="date"
                                                />

                                                <div className="flex items-end">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.isTaxable}
                                                            onChange={(e) => setFieldValue('isTaxable', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Taxable Item
                                                        </span>
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            3
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Stock & Inventory
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormInput
                                            label="Quantity"
                                            name="quantity"
                                            type="number"
                                            placeholder="0"
                                            required
                                            min="0"
                                        />

                                        <FormInput
                                            label="Minimum Stock Level"
                                            name="minStock"
                                            type="number"
                                            placeholder="1"
                                            required
                                            min="0"
                                        />

                                        {formMode === 'full' && (
                                            <>
                                                <FormInput
                                                    label="Maximum Stock Level"
                                                    name="maxStock"
                                                    type="number"
                                                    placeholder="1000"
                                                    min="0"
                                                />

                                                <FormInput
                                                    label="Reorder Level"
                                                    name="reorderLevel"
                                                    type="number"
                                                    placeholder="5"
                                                    min="0"
                                                />

                                                <FormInput
                                                    label="Reserved Quantity"
                                                    name="reservedQuantity"
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                />

                                                <FormSelectBox
                                                    label="Unit"
                                                    name="unit"
                                                    options={unitOptions}
                                                    required
                                                />

                                                <div className="flex items-end">
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
                                                </div>

                                                <div className="flex items-end">
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
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="pb-8 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                            4
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Dates & Tracking
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormInput
                                            label="Expiration Date"
                                            name="expirationDate"
                                            type="date"
                                            required
                                        />

                                        {formMode === 'full' && (
                                            <>
                                                <FormInput
                                                    label="Manufacture Date"
                                                    name="manufactureDate"
                                                    type="date"
                                                />

                                                <FormSelectBox
                                                    label="Status"
                                                    name="status"
                                                    options={statusOptions}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                {formMode === 'full' && (
                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                5
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Product Attributes
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormInput
                                                label="Color"
                                                name="color"
                                                placeholder="Enter color"
                                            />

                                            <FormInput
                                                label="Size"
                                                name="size"
                                                placeholder="Enter size"
                                            />

                                            <FormInput
                                                label="Dimensions"
                                                name="dimensions"
                                                placeholder="e.g., 10x20x5 cm"
                                            />

                                            <FormInput
                                                label="Weight"
                                                name="weight"
                                                type="number"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formMode === 'full' && (
                                    <div className="pb-8 relative">
                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm">
                                                6
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Supplier Information
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                            <FormInput
                                                label="Supplier Name"
                                                name="supplierName"
                                                placeholder="Enter supplier name"
                                            />

                                            <FormInput
                                                label="Supplier Code"
                                                name="supplierCode"
                                                placeholder="Enter supplier code"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-300 dark:border-gray-600">
                                    <Button
                                        type="button"
                                        theme="danger"
                                        onClick={() => navigate(ROUTES.INVENTORY)}
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
                                            productId ? 'Update Item' : 'Create Item'
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

export default InventoryForm;
