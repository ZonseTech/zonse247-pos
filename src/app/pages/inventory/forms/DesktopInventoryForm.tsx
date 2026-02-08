import { Form, Formik, FormikHelpers } from 'formik';
import { Button } from '../../../components';
import FormInput from '../../../components/FormInput';
import FormWrapper from '../../../components/FormWrapper';
import FormSelectBox from '../../../components/FormSelectBox';
import { CategorySearch } from '../../categories/partials/CategorySearch';
import { Fragment, useState, ChangeEvent, FunctionComponent } from 'react';
import AppLayout from '../../../layouts/AppLayout';
import PageHeader from '../../../components/page/PageHeader';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../utils/constants';
import {
    Zap,
    FileText,
    BarcodeIcon,
    Tag,
    DollarSign,
    Package,
    Calendar,
    Palette,
    Truck,
    CheckCircle2,
    Info,
    Loader2
} from 'lucide-react';
import { HiOutlineDocumentPlus } from 'react-icons/hi2';
import { Capacitor } from '@capacitor/core';
import CameraBarcodeScanner from '../../../components/scanner/CameraBarcodeScanner';
import { type ScannerResult } from '../../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../../hooks/useScannerSettings';
import * as Yup from 'yup';

type FormMode = 'quick' | 'full';

interface DesktopInventoryFormProps {
    productId?: string;
    item: InventoryItem | null;
    loading: boolean;
    statusOptions: { label: string; value: string }[];
    unitOptions: { label: string; value: string }[];
    onSubmit: (
        values: Partial<InventoryItem>,
        helpers: FormikHelpers<Partial<InventoryItem>>
    ) => Promise<void>;
}

const DesktopInventoryForm: FunctionComponent<DesktopInventoryFormProps> = ({
    productId,
    item,
    loading,
    statusOptions,
    unitOptions,
    onSubmit,
}) => {
    const navigate = useNavigate();
    const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
    const { triggerFeedback } = useScannerFeedback();
    const isNative = Capacitor.isNativePlatform();
    const [formMode, setFormMode] = useState<FormMode>('quick');

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
        categoryId: Yup.string(),
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        barcode: Yup.string()
            .max(100, 'Barcode is too long'),
        costPrice: Yup.number()
            .min(0, 'Cost price must be 0 or higher'),
        sellPrice: Yup.number()
            .required('Sell price is required')
            .min(0, 'Sell price must be 0 or higher'),
        quantity: Yup.number()
            .min(0, 'Quantity cannot be negative'),
        expirationDate: Yup.string(),
        minStock: Yup.number()
            .min(0, 'Minimum stock must be 0 or higher'),
    });

    const fullValidationSchema = Yup.object().shape({
        categoryId: Yup.string(),
        name: Yup.string()
            .required('Item name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(200, 'Name is too long'),
        barcode: Yup.string()
            .max(100, 'Barcode is too long'),
        sku: Yup.string().max(50, 'SKU is too long'),
        description: Yup.string().max(1000, 'Description is too long'),
        brand: Yup.string().max(100, 'Brand name is too long'),
        unit: Yup.string(),
        color: Yup.string().max(50, 'Color is too long'),
        size: Yup.string().max(50, 'Size is too long'),
        dimensions: Yup.string().max(100, 'Dimensions is too long'),
        weight: Yup.number().min(0, 'Weight must be 0 or higher'),
        costPrice: Yup.number()
            .min(0, 'Cost price must be 0 or higher'),
        sellPrice: Yup.number()
            .required('Sell price is required')
            .min(0, 'Sell price must be 0 or higher'),
        promoPrice: Yup.number().min(0, 'Promo price must be 0 or higher'),
        quantity: Yup.number()
            .min(0, 'Quantity cannot be negative'),
        minStock: Yup.number()
            .min(0, 'Minimum stock must be 0 or higher'),
        maxStock: Yup.number()
            .min(0, 'Maximum stock must be 0 or higher'),
        reorderLevel: Yup.number()
            .min(0, 'Reorder level must be 0 or higher'),
        expirationDate: Yup.string(),
        supplierName: Yup.string().max(200, 'Supplier name is too long'),
        supplierCode: Yup.string().max(50, 'Supplier code is too long'),
    });

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
                        title={productId ? 'Edit Inventory Item' : 'Add Inventory Item'}
                        description='Required fields are marked with an asterisk (*)'
                        icon={<HiOutlineDocumentPlus className="w-8 h-8 text-sky-500" />}
                        action={!productId ? (
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex items-center w-full lg:w-auto gap-3">
                                    <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('quick')}
                                            title="Quick Add"
                                            className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 text-sm font-medium transition-colors ${formMode === 'quick'
                                                ? 'bg-sky-500 text-white'
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
                                                ? 'bg-sky-500 text-white'
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
                    onSubmit={onSubmit}
                    enableReinitialize={true}
                    initialValues={initialItemValues}
                    validationSchema={formMode === 'quick' ? quickValidationSchema : fullValidationSchema}
                >
                    {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                        <Form>
                            <FormWrapper>
                                <div className="py-6 relative">
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-sky-500 to-sky-200 dark:from-sky-500 dark:to-sky-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 border-2 border-sky-500 dark:border-sky-500 text-sky-500 dark:text-sky-400 font-semibold text-sm shadow-sm">
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
                                                        label='Barcode / Batch No.'
                                                        placeholder="Scan or enter barcode"
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
                                                        className="flex-shrink-0 px-4 py-3 bg-sky-500 hover:bg-sky-700 active:bg-sky-800 text-white rounded-lg font-medium text-sm transition-colors duration-150 flex items-center justify-center gap-2 touch-manipulation"
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

                                        {(formMode === 'full' || productId) && (
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
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-green-500 to-green-200 dark:from-green-500 dark:to-green-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 border-2 border-green-500 dark:border-green-500 text-green-500 dark:text-green-400 font-semibold text-sm shadow-sm">
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
                                            placeholder="0.00"
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

                                        {(formMode === 'full' || productId) && (
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
                                                            className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
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
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-purple-200 dark:from-purple-600 dark:to-purple-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500 dark:border-purple-600 text-purple-600 dark:text-purple-400 font-semibold text-sm shadow-sm">
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Stock & Inventory
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage stock levels and tracking</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormInput
                                            label="Quantity"
                                            name="quantity"
                                            type="number"
                                            placeholder="0"
                                            min="0"
                                        />

                                        <FormInput
                                            label="Minimum Stock Level"
                                            name="minStock"
                                            type="number"
                                            placeholder="1"
                                            min="0"
                                        />

                                        {(formMode === 'full' || productId) && (
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
                                                />

                                                <div className="flex items-end">
                                                    <label className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={values.trackInventory}
                                                            onChange={(e) => setFieldValue('trackInventory', e.target.checked)}
                                                            className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
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
                                                            className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
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
                                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 to-orange-200 dark:from-orange-600 dark:to-orange-900"></div>

                                    <div className="flex items-center gap-3 mb-6 relative">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 border-2 border-orange-500 dark:border-orange-600 text-orange-600 dark:text-orange-400 font-semibold text-sm shadow-sm">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Dates & Tracking
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Set expiration and manufacture dates</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                                        <FormInput
                                            label="Expiration Date"
                                            name="expirationDate"
                                            type="date"
                                        />

                                        {(formMode === 'full' || productId) && (
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

                                {(formMode === 'full' || productId) && (
                                    <div className="pb-8 relative">
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 to-pink-200 dark:from-pink-600 dark:to-pink-900"></div>

                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 border-2 border-pink-500 dark:border-pink-600 text-pink-600 dark:text-pink-400 font-semibold text-sm shadow-sm">
                                                <Palette className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Product Attributes
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Additional product specifications</p>
                                            </div>
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

                                {(formMode === 'full' || productId) && (
                                    <div className="pb-8 relative">
                                        <div className="flex items-center gap-3 mb-6 relative">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 border-2 border-cyan-500 dark:border-cyan-600 text-cyan-600 dark:text-cyan-400 font-semibold text-sm shadow-sm">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Supplier Information
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Vendor and supply chain details</p>
                                            </div>
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

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        <span>Fields marked with * are required</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            theme="danger"
                                            onClick={() => navigate(ROUTES.INVENTORY)}
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
                                                    {productId ? 'Update Item' : 'Create Item'}
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

export default DesktopInventoryForm;
