import { FunctionComponent, useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import type { PaymentFormValues } from './types';

interface SupplierFieldWatcherProps {
    onSupplierSelected: (supplierId: string) => void;
}

export const SupplierFieldWatcher: FunctionComponent<SupplierFieldWatcherProps> = ({ onSupplierSelected }) => {
    const { values, setFieldValue } = useFormikContext<PaymentFormValues>();
    const [lastSupplierId, setLastSupplierId] = useState(values.supplierId || '');

    useEffect(() => {
        if (values.supplierId && values.supplierId !== lastSupplierId) {
            setLastSupplierId(values.supplierId);
            onSupplierSelected(values.supplierId);
            // Clear allocations when supplier changes
            setFieldValue('allocations', []);
        }
    }, [values.supplierId, lastSupplierId, onSupplierSelected, setFieldValue]);

    return null;
};
