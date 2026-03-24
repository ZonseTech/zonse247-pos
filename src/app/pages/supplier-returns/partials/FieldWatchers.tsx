import { FunctionComponent, useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import type { ReturnFormValues } from './types';

// ── Supplier watcher — resets dependents on supplier change ────────────

interface SupplierFieldWatcherProps {
    onSupplierChanged: (supplierId: string, setFieldValue: (field: string, value: any) => void) => void;
}

export const SupplierFieldWatcher: FunctionComponent<SupplierFieldWatcherProps> = ({ onSupplierChanged }) => {
    const { values, setFieldValue } = useFormikContext<ReturnFormValues>();
    const prevRef = useRef(values.supplierId);

    useEffect(() => {
        const prev = prevRef.current;
        const curr = values.supplierId;
        prevRef.current = curr;

        if (curr === prev) return;
        onSupplierChanged(curr, setFieldValue);
    }, [values.supplierId, onSupplierChanged, setFieldValue]);

    return null;
};

// ── GRN watcher — auto-populates or clears PO & items ─────────────────

interface GRNFieldWatcherProps {
    onGRNSelected: (grnId: string, setFieldValue: (field: string, value: any) => void) => void;
    onGRNCleared: (setFieldValue: (field: string, value: any) => void) => void;
}

export const GRNFieldWatcher: FunctionComponent<GRNFieldWatcherProps> = ({
    onGRNSelected,
    onGRNCleared,
}) => {
    const { values, setFieldValue } = useFormikContext<ReturnFormValues>();
    const prevRef = useRef(values.goodsReceiptId);

    useEffect(() => {
        const prev = prevRef.current;
        const curr = values.goodsReceiptId;
        prevRef.current = curr;

        if (curr === prev) return;

        if (curr) {
            onGRNSelected(curr, setFieldValue);
        } else if (prev) {
            // Was set, now cleared — reset auto-populated fields
            onGRNCleared(setFieldValue);
        }
    }, [values.goodsReceiptId, onGRNSelected, onGRNCleared, setFieldValue]);

    return null;
};
