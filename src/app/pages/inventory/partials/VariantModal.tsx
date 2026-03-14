import { FunctionComponent, useState } from 'react';
import { useFormikContext } from 'formik';
import {
    X,
    Trash2,
    History,
} from 'lucide-react';
import StockMovementModal from './StockMovementModal';
import FormInput from '../../../components/FormInput';
import { BottomSheet, Button, FormFieldCard, Modal } from '../../../components';
import Input from '../../../components/Input';
import Label from '../../../components/Label';
import PricingFields from '../forms/fields/PricingFields';
import StockFields from '../forms/fields/StockFields';
import BarcodeFields from '../forms/fields/BarcodeFields';
import ExpiryFields from '../forms/fields/ExpiryFields';
import NotesFields from '../forms/fields/NotesFields';
import SkuFields from '../forms/fields/SkuFields';
import { InventoryFormValues, Variant } from '../types/variant.types';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface VariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variantIndex: number;
    onSave: () => void;
    onDelete?: () => void;
    isNewVariant?: boolean;
    newVariantData?: Variant;
    onNewVariantChange?: (variant: Variant) => void;
}

const VariantModal: FunctionComponent<VariantModalProps> = ({
    isOpen,
    onClose,
    variantIndex,
    onSave,
    onDelete,
    isNewVariant = false,
    newVariantData,
    onNewVariantChange,
}) => {
    const { values, setFieldValue } = useFormikContext<InventoryFormValues>();
    const [sellingPriceError, setSellingPriceError] = useState<string | null>(null);
    const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);

    const fieldPrefix = `variants.${variantIndex}`;
    const variant = isNewVariant ? newVariantData : values.variants?.[variantIndex];
    const isVariantEmpty = !variant?.sellingPrice || Number(variant.sellingPrice) === 0;
    const canDelete = !isNewVariant && !isVariantEmpty && values.variants && values.variants.length > 1;

    const updateField = (field: keyof Variant, value: unknown) => {
        if (isNewVariant && newVariantData && onNewVariantChange) {
            onNewVariantChange({ ...newVariantData, [field]: value });
        } else {
            setFieldValue(`${fieldPrefix}.${field}`, value);
        }
        if (field === 'sellingPrice') {
            setSellingPriceError(null);
        }
    };

    const getStringValue = (field: keyof Variant): string => {
        const value = variant?.[field];
        return typeof value === 'string' ? value : '';
    };

    const getNumberValue = (field: keyof Variant): number | string => {
        const value = variant?.[field];
        if (value === undefined || value === null || value === 0) {
            return '';
        }
        return typeof value === 'number' ? value : '';
    };

    const handleNumberChange = (field: keyof Variant, inputValue: string) => {
        const numValue = inputValue === '' ? 0 : Number(inputValue);
        updateField(field, numValue);
    };

    const handleStringChange = (field: string, value: string) => {
        updateField(field as keyof Variant, value);
    };

    const validateVariant = (): boolean => {
        const sellingPrice = isNewVariant ? newVariantData?.sellingPrice : variant?.sellingPrice;
        if (!sellingPrice || Number(sellingPrice) <= 0) {
            setSellingPriceError('Selling price cannot be 0');
            return false;
        }
        return true;
    };

    const handleSave = () => {
        if (!validateVariant()) {
            return;
        }
        onSave();
        onClose();
    };

    const handleDelete = () => {
        if (onDelete && canDelete) {
            onDelete();
            onClose();
        }
    };

    const isMobile = useIsMobile();

    const modalContent = (
        <>
            <FormFieldCard>
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Label>Variant Name</Label>
                        <Input
                            value={getStringValue('variantName')}
                            onChange={(e) => updateField('variantName', e.target.value)}
                            placeholder="e.g., Red / Large"
                        />
                    </div>
                ) : (
                    <FormInput
                        label="Variant Name"
                        name={`${fieldPrefix}.variantName`}
                        placeholder="e.g., Red / Large"
                    />
                )}
            </FormFieldCard>

            <FormFieldCard>
                <PricingFields
                    isNewVariant={isNewVariant}
                    fieldPrefix={fieldPrefix}
                    pricingError={sellingPriceError ? false : undefined}
                    getPrice={getNumberValue}
                    onChange={handleNumberChange}
                />
            </FormFieldCard>

            <FormFieldCard>
                <StockFields
                    fieldPrefix={fieldPrefix}
                    isNewVariant={isNewVariant}
                    getStock={getNumberValue}
                    onChange={handleNumberChange}
                    trackInventory={Boolean(variant?.trackInventory)}
                    allowNegativeStock={Boolean(variant?.allowNegativeStock)}
                    onCheckboxChange={(field, value) => updateField(field as keyof Variant, value)}
                />
            </FormFieldCard>

            <BarcodeFields
                fieldPrefix={fieldPrefix}
                isNewVariant={isNewVariant}
                getValue={getStringValue}
                onChange={handleStringChange}
                hasData={Boolean(getStringValue('primaryBarcode'))}
            />

            <ExpiryFields
                fieldPrefix={fieldPrefix}
                isNewVariant={isNewVariant}
                getStringValue={getStringValue}
                getNumberValue={getNumberValue}
                onStringChange={handleStringChange}
                onNumberChange={handleNumberChange}
                hasData={Boolean(getStringValue('expirationDate') || getNumberValue('expiryDateAlert'))}
            />

            <NotesFields
                fieldPrefix={fieldPrefix}
                isNewVariant={isNewVariant}
                getValue={getStringValue}
                onChange={handleStringChange}
                hasData={Boolean(getStringValue('description'))}
            />

            <SkuFields
                fieldPrefix={fieldPrefix}
                isNewVariant={isNewVariant}
                getValue={getStringValue}
                onChange={handleStringChange}
                hasData={Boolean(getStringValue('sku'))}
            />
        </>
    );

    const canViewStockMovements = !isNewVariant && variant?.id;

    const headerActions = (
        <div className="flex items-center gap-2">
            {canViewStockMovements && (
                <Button
                    type="button"
                    onClick={() => setIsStockMovementOpen(true)}
                    title="View Stock Movements"
                >
                    <History className="w-5 h-5" />
                </Button>
            )}
            {canDelete && (
                <Button
                    type="button"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            )}
            <Button
                type="button"
                onClick={handleSave}
                theme="success"
            >
                SAVE
            </Button>
        </div>
    );

    const closeButton = (
        <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            <X className="w-5 h-5" />
        </button>
    );

    if (isMobile) {
        return (
            <>
                <BottomSheet
                    isOpen={isOpen}
                    onClose={onClose}
                    leftContent={closeButton}
                    rightContent={headerActions}
                >
                    {modalContent}
                </BottomSheet>

                {canViewStockMovements && variant?.id && (
                    <StockMovementModal
                        isOpen={isStockMovementOpen}
                        onClose={() => setIsStockMovementOpen(false)}
                        variantId={variant.id}
                        variantName={variant.variantName || 'Default'}
                        productName={values.name}
                        sku={variant.sku}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={isNewVariant ? 'Add New Variant' : `Edit: ${variant?.variantName || 'Variant'}`}
                size="xl"
                header={
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {isNewVariant ? 'Add New Variant' : `Edit: ${variant?.variantName || 'Variant'}`}
                        </h2>
                        <div className="flex items-center gap-2">
                            {headerActions}
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                }
            >
                {modalContent}
            </Modal>

            {canViewStockMovements && variant?.id && (
                <StockMovementModal
                    isOpen={isStockMovementOpen}
                    onClose={() => setIsStockMovementOpen(false)}
                    variantId={variant.id}
                    variantName={variant.variantName || 'Default'}
                    productName={values.name}
                    sku={variant.sku}
                />
            )}
        </>
    );
};

export default VariantModal;