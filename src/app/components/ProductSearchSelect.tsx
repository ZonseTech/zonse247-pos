import React, { FunctionComponent, useCallback } from 'react';
import FormAsyncSearchSelect from './FormAsyncSearchSelect';
import { productService } from '../services';

interface ProductSearchSelectProps {
    /** Formik field name, e.g. `items.${index}.variantId` */
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Pre-selected option for edit/view mode (label + value) */
    initialOption?: { label: string; value: string | number } | null;
}

/**
 * Format a product record into a select option label.
 */
const formatProductLabel = (p: { name: string; variantName: string; sku?: string | null }) =>
    `${p.name} - ${p.variantName} (${p.sku || 'No SKU'})`;

/**
 * Reusable server-side product search select.
 * Debounces input, queries the API, and returns the top 25 matching variants.
 */
const ProductSearchSelect: FunctionComponent<ProductSearchSelectProps> = ({
    name,
    label = 'Product / Variant',
    placeholder = 'Search product...',
    required = false,
    disabled = false,
    initialOption = null,
}) => {
    const loadOptions = useCallback(async (inputValue: string) => {
        const result = await productService.listProducts({
            search: inputValue,
            limit: 25,
        });
        return (result.products || []).map(p => ({
            label: formatProductLabel(p),
            value: p.id,
        }));
    }, []);

    return (
        <FormAsyncSearchSelect
            name={name}
            label={label}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            loadOptions={loadOptions}
            initialOption={initialOption}
        />
    );
};

export { formatProductLabel };
export default ProductSearchSelect;
