import { FunctionComponent, useState } from 'react';
import { useFormikContext } from 'formik';
import { Dialog, Flex, IconButton, TextField, Text } from '@radix-ui/themes';
import {
    X,
    Trash2,
    History,
} from 'lucide-react';
import StockMovementModal from './StockMovementModal';
import { Button, FormFieldCard, TextInput } from '../../../components';
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
    isEditing?: boolean;
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
    isEditing = false,
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

    const getStringValue = (field: string): string => {
        const value = variant?.[field as keyof Variant];
        return typeof value === 'string' ? value : '';
    };

    const getNumberValue = (field: string): number | string => {
        const value = variant?.[field as keyof Variant];
        if (value === undefined || value === null || value === 0) {
            return '';
        }
        return typeof value === 'number' ? value : '';
    };

    const handleNumberChange = (field: string, inputValue: string) => {
        const numValue = inputValue === '' ? 0 : Number(inputValue);
        updateField(field as keyof Variant, numValue);
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

    const modalContent = (
        <>
            <FormFieldCard>
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            Variant Name
                        </Text>
                        <TextField.Root
                            value={getStringValue('variantName')}
                            onChange={(e) => updateField('variantName', e.target.value)}
                            placeholder="e.g., Red / Large"
                        />
                    </div>
                ) : (
                    <TextInput
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
                    isEditing={isEditing}
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

    return (
        <>
            <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <Dialog.Content maxWidth="720px" className="!max-h-[90vh] !overflow-y-auto">
                    <Flex justify="between" align="center" mb="4" pb="4" className="border-b border-gray-200 dark:border-gray-700">
                        <Dialog.Title mb="0" size="5">
                            {isNewVariant ? 'Add New Variant' : `Edit: ${variant?.variantName || 'Variant'}`}
                        </Dialog.Title>
                        <Flex align="center" gap="2">
                            {headerActions}
                            <Dialog.Close>
                                <IconButton type="button" variant="ghost" color="gray" size="1" aria-label="Close modal">
                                    <X className="w-5 h-5" />
                                </IconButton>
                            </Dialog.Close>
                        </Flex>
                    </Flex>

                    {modalContent}
                </Dialog.Content>
            </Dialog.Root>

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