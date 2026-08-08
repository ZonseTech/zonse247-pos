import { useState, useEffect, FunctionComponent } from 'react';
import { useFormikContext, getIn } from 'formik';
import { TextField, Text } from '@radix-ui/themes';
import { TextInput } from '../../../../components';
import { Info } from 'lucide-react';

interface StockFieldsProps {
    fieldPrefix?: string;
    showLowStockAlert?: boolean;
    isNewVariant?: boolean;
    isEditing?: boolean;
    getStock?: (field: string) => number | string;
    onChange?: (field: string, value: string) => void;
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    onCheckboxChange?: (field: string, value: boolean) => void;
}

const StockFields: FunctionComponent<StockFieldsProps> = ({
    fieldPrefix = '',
    showLowStockAlert = true,
    isNewVariant = false,
    isEditing = false,
    getStock,
    onChange,
    trackInventory,
    allowNegativeStock,
    onCheckboxChange,
}) => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const [trackingLowStock, setTrackingLowStock] = useState(false);

    const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;
    const getFieldValue = (field: string) => {
        if (isNewVariant && getStock) {
            return getStock(field);
        }
        const name = getFieldName(field);
        return fieldPrefix ? getIn(values, name) : values[field];
    };

    const updateField = (field: string, value: string) => {
        if (isNewVariant && onChange) {
            onChange(field, value);
        } else {
            const numValue = value === '' ? 0 : Number(value);
            setFieldValue(getFieldName(field), numValue);
        }
    };

    const quantityName = getFieldName('quantity');
    const minStockName = getFieldName('minStock');

    const minStock = getFieldValue('minStock') as number | string;

    const getNumberValue = (field: string): number | string => {
        const value = getFieldValue(field);
        if (value === undefined || value === null || value === 0) {
            return '';
        }
        return typeof value === 'number' ? value : '';
    };

    const handleLowStockAlertClick = () => {
        setTrackingLowStock(true);
        setTimeout(() => {
            const minStockInput = document.querySelector(
                isNewVariant ? 'input[data-field="minStock"]' : `input[name="${minStockName}"]`
            ) as HTMLInputElement;
            minStockInput?.focus();
        }, 50);
    };

    const handleMinStockBlur = () => {
        const min = Number(minStock) || 0;
        if (min === 0) {
            setTrackingLowStock(false);
            updateField('minStock', '0');
        }
    };

    useEffect(() => {
        const min = Number(minStock) || 0;
        if (min > 0 && !trackingLowStock) {
            setTrackingLowStock(true);
        }
    }, []);

    // Quantity is read-only when editing an existing variant on an existing product.
    // Stock changes must go through stock movement endpoints (Adjust Stock).
    const isQuantityLocked = isEditing && !isNewVariant;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            {isEditing ? 'Opening Stock' : 'Stock Available'}
                        </Text>
                        <TextField.Root
                            value={getNumberValue('quantity')}
                            onChange={(e) => onChange?.('quantity', e.target.value)}
                            type="number"
                            placeholder="0"
                            min={0}
                        />
                    </div>
                ) : isQuantityLocked ? (
                    <div className="space-y-1">
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            Current Stock
                        </Text>
                        <TextField.Root
                            value={getFieldValue('quantity') ?? 0}
                            type="number"
                            disabled
                        />
                        <p className="flex items-start gap-1 text-xs text-amber-600 dark:text-amber-400 mt-1">
                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>To change stock, use <strong>Adjust Stock</strong> from the inventory list.</span>
                        </p>
                    </div>
                ) : (
                    <TextInput
                        label="Stock Available"
                        name={quantityName}
                        type="number"
                        placeholder="0"
                        min={0}
                    />
                )}
                {showLowStockAlert && (
                    !trackingLowStock ? (
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Low Stock Alert?
                            </span>
                            <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleLowStockAlertClick()}
                                className="h-5 w-5 text-sky-500 focus:ring-sky-500 border-gray-300 rounded-sm"
                            />
                        </div>
                    ) : (
                        isNewVariant ? (
                            <div className="space-y-1">
                                <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                    Low Stock Alert
                                </Text>
                                <TextField.Root
                                    value={getNumberValue('minStock')}
                                    onChange={(e) => onChange?.('minStock', e.target.value)}
                                    type="number"
                                    placeholder="Below 5"
                                    min={0}
                                    onBlur={handleMinStockBlur}
                                    data-field="minStock"
                                />
                            </div>
                        ) : (
                            <TextInput
                                label="Low Stock Alert"
                                name={minStockName}
                                type="number"
                                placeholder="Below 5"
                                min={0}
                                onBlur={handleMinStockBlur}
                            />
                        )
                    )
                )}
            </div>
            <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3">
                    <input
                        type="checkbox"
                        checked={Boolean(trackInventory)}
                        onChange={(e) => onCheckboxChange?.('trackInventory', e.target.checked)}
                        className="h-5 w-5 text-sky-500 border-gray-300 rounded-sm"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-update stock on item sale or return
                    </span>
                </label>
                <label className="flex items-center space-x-3 p-3">
                    <input
                        type="checkbox"
                        checked={Boolean(allowNegativeStock)}
                        onChange={(e) => onCheckboxChange?.('allowNegativeStock', e.target.checked)}
                        className="h-5 w-5 text-sky-500 border-gray-300 rounded-sm"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Prevent item sale when out of stock?
                    </span>
                </label>
            </div>
        </div>
    );
};

export default StockFields;
