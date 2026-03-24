import React, { FunctionComponent, useCallback } from 'react';
import FormAsyncSearchSelect from './FormAsyncSearchSelect';
import { supplierService } from '../services';

interface SupplierSearchSelectProps {
    /** Formik field name, e.g. "supplierId" */
    name: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Pre-selected option for edit/view mode (label + value) */
    initialOption?: { label: string; value: string | number } | null;
}

/**
 * Format a supplier record into a select option label.
 */
const formatSupplierLabel = (s: { name: string; code?: string }) =>
    s.code ? `${s.name} (${s.code})` : s.name;

/**
 * Reusable server-side supplier search select.
 * Debounces input, queries the API, and returns the top 25 matching suppliers.
 */
const SupplierSearchSelect: FunctionComponent<SupplierSearchSelectProps> = ({
    name,
    label = 'Supplier',
    placeholder = 'Search supplier...',
    required = false,
    disabled = false,
    initialOption = null,
}) => {
    const loadOptions = useCallback(async (inputValue: string) => {
        const result = await supplierService.listSuppliers({
            search: inputValue,
            limit: 25,
        });
        return (result.suppliers || []).map(s => ({
            label: formatSupplierLabel(s),
            value: s.id,
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

export { formatSupplierLabel };
export default SupplierSearchSelect;
