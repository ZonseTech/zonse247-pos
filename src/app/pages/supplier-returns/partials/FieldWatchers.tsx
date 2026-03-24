import { FunctionComponent, useState, useEffect } from 'react';
import { useFormikContext } from 'formik';
import type { ReturnFormValues } from './types';

interface GRNFieldWatcherProps {
    onGRNSelected: (grnId: string, setFieldValue: (field: string, value: any) => void) => void;
}

export const GRNFieldWatcher: FunctionComponent<GRNFieldWatcherProps> = ({ onGRNSelected }) => {
    const { values, setFieldValue } = useFormikContext<ReturnFormValues>();
    const [lastId, setLastId] = useState('');

    useEffect(() => {
        if (values.goodsReceiptId && values.goodsReceiptId !== lastId) {
            setLastId(values.goodsReceiptId);
            onGRNSelected(values.goodsReceiptId, setFieldValue);
        }
    }, [values.goodsReceiptId, lastId, onGRNSelected, setFieldValue]);

    return null;
};
