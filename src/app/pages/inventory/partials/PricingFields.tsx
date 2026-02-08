import { FunctionComponent, useState, useEffect } from 'react';
import { useFormikContext, getIn } from 'formik';
import FormInput from '../../../components/FormInput';

interface PricingFieldsProps {
    fieldPrefix?: string;
    showTrackProfit?: boolean;
}

const PricingFields: FunctionComponent<PricingFieldsProps> = ({
    fieldPrefix = '',
    showTrackProfit = true,
}) => {
    const { values, setFieldValue } = useFormikContext<Record<string, unknown>>();
    const [trackingCost, setTrackingCost] = useState(false);

    const getFieldName = (field: string) => fieldPrefix ? `${fieldPrefix}.${field}` : field;
    const getFieldValue = (field: string) => {
        const name = getFieldName(field);
        return fieldPrefix ? getIn(values, name) : values[field];
    };

    const sellingPriceName = getFieldName('sellingPrice');
    const costPriceName = getFieldName('costPrice');
    const marginName = getFieldName('margin');

    const costPrice = getFieldValue('costPrice') as number | string;
    const sellingPrice = getFieldValue('sellingPrice') as number | string;
    const margin = getFieldValue('margin');

    const handleTrackProfitClick = () => {
        setTrackingCost(true);
        setTimeout(() => {
            const costInput = document.querySelector(`input[name="${costPriceName}"]`) as HTMLInputElement;
            costInput?.focus();
        }, 50);
    };

    const handleCostPriceBlur = () => {
        const cost = Number(costPrice) || 0;
        if (cost === 0) {
            setTrackingCost(false);
            setFieldValue(marginName, '0');
        }
    };

    useEffect(() => {
        if (trackingCost) {
            const sell = Number(sellingPrice) || 0;
            const cost = Number(costPrice) || 0;
            if (sell > 0 && cost > 0) {
                const marginValue = ((sell - cost) / sell) * 100;
                setFieldValue(marginName, marginValue.toFixed(2));
            } else {
                setFieldValue(marginName, '0');
            }
        }
    }, [sellingPrice, costPrice, trackingCost, setFieldValue, marginName]);

    useEffect(() => {
        const cost = Number(costPrice) || 0;
        if (cost > 0 && !trackingCost) {
            setTrackingCost(true);
        }
    }, []);

    return (
        <div className="space-y-3">
            <div className={`grid gap-3 ${showTrackProfit && trackingCost ? 'grid-cols-3' : showTrackProfit ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <FormInput
                    label="Selling Price"
                    name={sellingPriceName}
                    type="number"
                    required
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                />
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
                            <FormInput
                                label="Cost Price"
                                name={costPriceName}
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                onBlur={handleCostPriceBlur}
                            />
                            <div className="flex flex-col items-center">
                                <span className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
                                    Margin
                                </span>
                                <div className="flex items-center h-[34px] px-3">
                                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
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
