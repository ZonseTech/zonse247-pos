import { FunctionComponent, useState, ChangeEvent } from 'react';
import { useFormikContext } from 'formik';
import {
    BarcodeIcon,
    Tag,
    Package,
    Calendar,
    Palette,
    Truck,
    X,
    Trash2,
} from 'lucide-react';
import FormInput from '../../../components/FormInput';
import FormSelectBox from '../../../components/FormSelectBox';
import CameraBarcodeScanner from '../../../components/scanner/CameraBarcodeScanner';
import { type ScannerResult } from '../../../services/barcode-scanner.service';
import { useScannerFeedback } from '../../../hooks/useScannerSettings';
import { BottomSheet, Button, CollapsibleSection, FormFieldCard } from '../../../components';
import PricingFields from './PricingFields';
import { InventoryFormValues } from '../types/variant.types';

interface VariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantIndex: number;
    statusOptions: { label: string; value: string }[];
    onSave: () => void;
    onDelete?: () => void;
    isNewVariant?: boolean;
}

const VariantModal: FunctionComponent<VariantModalProps> = ({
    isOpen,
    onClose,
    variantIndex,
    statusOptions,
    onSave,
    onDelete,
    isNewVariant = false,
}) => {
    const { values, setFieldValue } = useFormikContext<InventoryFormValues>();
    const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
    const { triggerFeedback } = useScannerFeedback();

    const fieldPrefix = `variants.${variantIndex}`;
    const variant = values.variants?.[variantIndex];
    const isVariantEmpty = !variant?.sellPrice || Number(variant.sellPrice) === 0;
    const canDelete = !isNewVariant && !isVariantEmpty && values.variants && values.variants.length > 1;

    const handleBarcodeChange = (value: string) => {
        const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
        setFieldValue(`${fieldPrefix}.barcode`, cleanedValue);
    };

    const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    const handleSave = () => {
        onSave();
        onClose();
    };

    const handleDelete = () => {
        if (onDelete && canDelete) {
            onDelete();
            onClose();
        }
    };

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            leftContent={
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            }
            rightContent={
                <div className="flex items-center gap-2">
                    {canDelete && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="p-2 rounded-full text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <Button
                        type="button"
                        onClick={handleSave}
                        theme="success"
                    >
                        {isNewVariant || isVariantEmpty ? 'ADD' : 'UPDATE'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4 pb-6 -mx-4 -mb-4 px-1.5 pt-4 bg-gray-100 dark:bg-gray-900">
                <FormFieldCard>
                    <FormInput
                        label="Variant Name"
                        name={`${fieldPrefix}.variantName`}
                        placeholder="e.g., Red / Large"
                    />
                </FormFieldCard>

                <FormFieldCard>
                    <PricingFields fieldPrefix={fieldPrefix} />
                </FormFieldCard>

                {/* Basic Information */}
                <CollapsibleSection
                    title="Basic Information"
                    subtitle="Product identification"
                    icon={<Tag className="w-4 h-4" />}
                    iconBgColor="bg-sky-100 dark:bg-sky-900/50"
                    iconBorderColor="border-sky-500"
                    iconTextColor="text-sky-500 dark:text-sky-400"
                    defaultOpen={true}
                >
                    <div className="space-y-4">
                        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <FormInput
                                        name={`${fieldPrefix}.barcode`}
                                        label='Barcode'
                                        placeholder="Scan or enter"
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                            handleBarcodeChange(e.target.value);
                                        }}
                                        onKeyDown={handleBarcodeKeyDown}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBarcodeScannerOpen(true)}
                                    className="flex-shrink-0 p-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white rounded-lg transition-colors touch-manipulation"
                                >
                                    <BarcodeIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <CameraBarcodeScanner
                            isOpen={isBarcodeScannerOpen}
                            onClose={() => setIsBarcodeScannerOpen(false)}
                            onScan={(result: ScannerResult) => {
                                triggerFeedback();
                                setFieldValue(`${fieldPrefix}.barcode`, result.barcode);
                                setIsBarcodeScannerOpen(false);
                            }}
                            continuous={false}
                            title="Scan Barcode"
                            subtitle="Point camera at barcode"
                        />

                        <FormInput
                            label="SKU"
                            name={`${fieldPrefix}.sku`}
                            placeholder="Stock Keeping Unit"
                        />
                        <FormInput
                            label="Brand"
                            name={`${fieldPrefix}.brand`}
                            placeholder="Enter brand name"
                        />
                        <FormInput
                            label="Description"
                            name={`${fieldPrefix}.description`}
                            placeholder="Enter description"
                        />
                    </div>
                </CollapsibleSection>

                {/* Stock & Inventory */}
                <CollapsibleSection
                    title="Stock & Inventory"
                    subtitle="Stock levels and tracking"
                    icon={<Package className="w-4 h-4" />}
                    iconBgColor="bg-purple-100 dark:bg-purple-900/50"
                    iconBorderColor="border-purple-500"
                    iconTextColor="text-purple-600 dark:text-purple-400"
                    defaultOpen={true}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Quantity"
                                name={`${fieldPrefix}.quantity`}
                                type="number"
                                placeholder="0"
                                min="0"
                            />
                            <FormInput
                                label="Min Stock"
                                name={`${fieldPrefix}.minStock`}
                                type="number"
                                placeholder="1"
                                min="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Max Stock"
                                name={`${fieldPrefix}.maxStock`}
                                type="number"
                                placeholder="1000"
                                min="0"
                            />
                            <FormInput
                                label="Reorder Level"
                                name={`${fieldPrefix}.reorderLevel`}
                                type="number"
                                placeholder="5"
                                min="0"
                            />
                        </div>
                        <FormInput
                            label="Reserved Qty"
                            name={`${fieldPrefix}.reservedQuantity`}
                            type="number"
                            placeholder="0"
                            min="0"
                        />
                        <div className="space-y-2">
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={Boolean(variant?.trackInventory)}
                                    onChange={(e) => setFieldValue(`${fieldPrefix}.trackInventory`, e.target.checked)}
                                    className="h-5 w-5 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Track Inventory
                                </span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={Boolean(variant?.allowNegativeStock)}
                                    onChange={(e) => setFieldValue(`${fieldPrefix}.allowNegativeStock`, e.target.checked)}
                                    className="h-5 w-5 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Allow Negative Stock
                                </span>
                            </label>
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <input
                                    type="checkbox"
                                    checked={Boolean(variant?.isTaxable)}
                                    onChange={(e) => setFieldValue(`${fieldPrefix}.isTaxable`, e.target.checked)}
                                    className="h-5 w-5 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Taxable Item
                                </span>
                            </label>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Dates & Tracking */}
                <CollapsibleSection
                    title="Dates & Tracking"
                    subtitle="Expiration and manufacture"
                    icon={<Calendar className="w-4 h-4" />}
                    iconBgColor="bg-orange-100 dark:bg-orange-900/50"
                    iconBorderColor="border-orange-500"
                    iconTextColor="text-orange-600 dark:text-orange-400"
                    defaultOpen={false}
                >
                    <div className="space-y-4">
                        <FormInput
                            label="Expiration Date"
                            name={`${fieldPrefix}.expirationDate`}
                            type="date"
                        />

                        <FormInput
                            label="Manufacture Date"
                            name={`${fieldPrefix}.manufactureDate`}
                            type="date"
                        />
                        <FormSelectBox
                            label="Status"
                            name={`${fieldPrefix}.status`}
                            options={statusOptions}
                        />
                    </div>
                </CollapsibleSection>

                {/* Product Attributes */}
                <CollapsibleSection
                    title="Product Attributes"
                    subtitle="Additional specifications"
                    icon={<Palette className="w-4 h-4" />}
                    iconBgColor="bg-pink-100 dark:bg-pink-900/50"
                    iconBorderColor="border-pink-500"
                    iconTextColor="text-pink-600 dark:text-pink-400"
                    defaultOpen={false}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Color"
                                name={`${fieldPrefix}.color`}
                                placeholder="Color"
                            />
                            <FormInput
                                label="Size"
                                name={`${fieldPrefix}.size`}
                                placeholder="Size"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <FormInput
                                label="Dimensions"
                                name={`${fieldPrefix}.dimensions`}
                                placeholder="10x20x5 cm"
                            />
                            <FormInput
                                label="Weight"
                                name={`${fieldPrefix}.weight`}
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Supplier Information */}
                <CollapsibleSection
                    title="Supplier Information"
                    subtitle="Vendor details"
                    icon={<Truck className="w-4 h-4" />}
                    iconBgColor="bg-cyan-100 dark:bg-cyan-900/50"
                    iconBorderColor="border-cyan-500"
                    iconTextColor="text-cyan-600 dark:text-cyan-400"
                    defaultOpen={false}
                >
                    <div className="space-y-4">
                        <FormInput
                            label="Supplier Name"
                            name={`${fieldPrefix}.supplierName`}
                            placeholder="Enter supplier name"
                        />
                        <FormInput
                            label="Supplier Code"
                            name={`${fieldPrefix}.supplierCode`}
                            placeholder="Enter supplier code"
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </BottomSheet>
    );
};

export default VariantModal;
