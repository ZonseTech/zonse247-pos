import { FunctionComponent, useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import type { InvoiceFormValues } from './types';

// ─── SupplierFieldWatcher ───────────────────────────────────────────────────
// Watches the supplierId field and triggers onChange callback to cascade PO loading.

interface SupplierFieldWatcherProps {
    onChange: (supplierId: string) => void;
}

export const SupplierFieldWatcher: FunctionComponent<SupplierFieldWatcherProps> = ({ onChange }) => {
    const { values } = useFormikContext<InvoiceFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        const id = values.supplierId || '';
        if (id !== lastId) {
            setLastId(id);
            onChange(id);
        }
    }, [values.supplierId, lastId, onChange]);

    return null;
};

// ─── POFieldWatcher ─────────────────────────────────────────────────────────
// Watches the purchaseOrderId field and triggers onPOSelected to load PO details.

interface POFieldWatcherProps {
    onPOSelected: (poId: string) => void;
}

export const POFieldWatcher: FunctionComponent<POFieldWatcherProps> = ({ onPOSelected }) => {
    const { values } = useFormikContext<InvoiceFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        const id = values.purchaseOrderId || '';
        if (id && id !== lastId) {
            setLastId(id);
            onPOSelected(id);
        }
    }, [values.purchaseOrderId, lastId, onPOSelected]);

    return null;
};
