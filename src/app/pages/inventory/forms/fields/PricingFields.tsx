import { useState, useEffect, FunctionComponent } from 'react';
import { useFormikContext, getIn } from 'formik';
import { TextField, Text } from '@radix-ui/themes';
import { TextInput } from '../../../../components';

interface PricingFieldsProps {
    fieldPrefix?: string;
    showTrackProfit?: boolean;
    isNewVariant?: boolean;
    pricingError?: boolean;
    getPrice?: (field: string) => number | string;
    onChange?: (field: string, value: string) => void;
}

const PricingFields: FunctionComponent<PricingFieldsProps> = ({
    fieldPrefix = '',
    showTrackProfit = true,
    isNewVariant = false,
    pricingError,
    getPrice,
    onChange,
}) => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const [trackingCost, setTrackingCost] = useState(false);

    const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;
    const getFieldValue = (field: string) => {
        if (isNewVariant && getPrice) {
            return getPrice(field);
        }
        const name = getFieldName(field);
        return fieldPrefix ? getIn(values, name) : values[field];
    };

    const updateField = (field: string, value: unknown) => {
        if (isNewVariant && onChange) {
            onChange(field, String(value));
        } else {
            setFieldValue(getFieldName(field), value);
        }
    };

    const sellingPriceName = getFieldName('sellingPrice');
    const costPriceName = getFieldName('costPrice');

    const costPrice = getFieldValue('costPrice') as number | string;
    const sellingPrice = getFieldValue('sellingPrice') as number | string;
    const margin = getFieldValue('margin');

    const getNumberValue = (field: string): number | string => {
        const value = getFieldValue(field);
        if (value === undefined || value === null || value === 0) {
            return '';
        }
        return typeof value === 'number' ? value : '';
    };

    const handleTrackProfitClick = () => {
        setTrackingCost(true);
        setTimeout(() => {
            const costInput = document.querySelector(
                isNewVariant ? 'input[data-field="costPrice"]' : `input[name="${costPriceName}"]`
            ) as HTMLInputElement;
            costInput?.focus();
        }, 50);
    };

    const handleCostPriceBlur = () => {
        const cost = Number(costPrice) || 0;
        if (cost === 0) {
            setTrackingCost(false);
            updateField('margin', '0');
        }
    };

    useEffect(() => {
        if (trackingCost) {
            const sell = Number(sellingPrice) || 0;
            const cost = Number(costPrice) || 0;
            if (sell > 0 && cost > 0) {
                const marginValue = ((sell - cost) / sell) * 100;
                updateField('margin', marginValue.toFixed(2));
            } else {
                updateField('margin', '0');
            }
        }
    }, [sellingPrice, costPrice, trackingCost]);

    useEffect(() => {
        const cost = Number(costPrice) || 0;
        if (cost > 0 && !trackingCost) {
            setTrackingCost(true);
        }
    }, []);

    return (
        <div className="space-y-3">
            <div className={`grid gap-3 ${showTrackProfit && trackingCost ? 'grid-cols-3' : showTrackProfit ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {isNewVariant ? (
                    <div className="space-y-1">
                        <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                            Selling Price <Text color="red">*</Text>
                        </Text>
                        <TextField.Root
                            value={getNumberValue('sellingPrice')}
                            onChange={(e) => onChange?.('sellingPrice', e.target.value)}
                            type="number"
                            placeholder="0.00"
                            min={0}
                            step={0.01}
                            color={pricingError === false ? 'red' : undefined}
                        />
                        {pricingError === false && (
                            <p className="text-sm text-red-500">Selling price cannot be 0</p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <TextInput
                            label="Selling Price"
                            name={sellingPriceName}
                            type="number"
                            required
                            placeholder="0.00"
                            min={0}
                            step={0.01}
                        />
                        {pricingError === false && (
                            <p className="text-sm text-red-500">Selling price cannot be 0</p>
                        )}
                    </div>
                )}
                {showTrackProfit && (
                    !trackingCost ? (
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Track Profit?
                            </span>
                            <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleTrackProfitClick()}
                                className="h-5 w-5 text-sky-500 focus:ring-sky-500 border-gray-300 rounded"
                            />
                        </div>
                    ) : (
                        <>
                            {isNewVariant ? (
                                <div className="space-y-1">
                                    <Text as="label" size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                                        Cost Price
                                    </Text>
                                    <TextField.Root
                                        value={getNumberValue('costPrice')}
                                        onChange={(e) => onChange?.('costPrice', e.target.value)}
                                        type="number"
                                        placeholder="0.00"
                                        min={0}
                                        step={0.01}
                                        onBlur={handleCostPriceBlur}
                                        data-field="costPrice"
                                    />
                                </div>
                            ) : (
                                <TextInput
                                    label="Cost Price"
                                    name={costPriceName}
                                    type="number"
                                    placeholder="0.00"
                                    min={0}
                                    step={0.01}
                                    onBlur={handleCostPriceBlur}
                                />
                            )}
                            <div className="flex flex-col items-center">
                                <span className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                    Margin
                                </span>
                                <div className="flex items-center h-[34px] px-3">
                                    <span className={`font-semibold text-sm ${Number(margin) < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {margin ? `${margin}%` : '0%'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default PricingFields;
