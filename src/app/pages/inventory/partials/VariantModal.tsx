import { FunctionComponent, useState } from 'react';
import { useFormikContext } from 'formik';
import {
    X,
    Trash2,
} from 'lucide-react';
import FormInput from '../../../components/FormInput';
import { BottomSheet, Button, FormFieldCard } from '../../../components';
import Input from '../../../components/Input';
import Label from '../../../components/Label';
import PricingFields from '../forms/fields/PricingFields';
import StockFields from '../forms/fields/StockFields';
import BarcodeFields from '../forms/fields/BarcodeFields';
import ExpiryFields from '../forms/fields/ExpiryFields';
import NotesFields from '../forms/fields/NotesFields';
import SkuFields from '../forms/fields/SkuFields';
import { InventoryFormValues, Variant } from '../types/variant.types';

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
                        SAVE
                    </Button>
                </div>
            }
        >
            <div className="space-y-2.5 pb-6 -mx-4 -mb-4 px-1.5 pt-4 bg-gray-100 dark:bg-gray-900">
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
            </div>
        </BottomSheet>
    );
};

export default VariantModal;