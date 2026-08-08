import { FC, useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import { Box, Text, TextField } from '@radix-ui/themes';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { productService } from '../../../services';

interface ItemNameFieldProps {
    label?: string;
    name?: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    excludeProductId?: string;
}

type Availability = 'idle' | 'checking' | 'available' | 'taken';

const ItemNameField: FC<ItemNameFieldProps> = ({
    label = 'Item Name',
    name = 'name',
    placeholder = 'Enter item name',
    required = false,
    className,
    excludeProductId,
}) => {
    const [field, meta] = useField({ name });
    const hasError = meta.touched && !!meta.error;

    const [availability, setAvailability] = useState<Availability>('idle');
    const requestIdRef = useRef(0);

    useEffect(() => {
        const value = (field.value || '').trim();

        if (value.length < 2) {
            setAvailability('idle');
            return;
        }

        setAvailability('checking');
        const requestId = ++requestIdRef.current;

        const timer = setTimeout(async () => {
            try {
                const result = await productService.listProducts({ search: value, limit: 5 });
                if (requestId !== requestIdRef.current) return;

                const taken = (result.products || []).some(
                    (p) => p.name?.trim().toLowerCase() === value.toLowerCase() && p.id !== excludeProductId
                );
                setAvailability(taken ? 'taken' : 'available');
            } catch {
                if (requestId === requestIdRef.current) setAvailability('idle');
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [field.value, excludeProductId]);

    const statusMessage = hasError
        ? meta.error
        : availability === 'taken'
            ? 'This item name is already in use'
            : availability === 'available'
                ? 'Name is available'
                : null;

    const statusColor = hasError || availability === 'taken' ? 'red' : availability === 'available' ? 'green' : undefined;

    return (
        <Box>
            <Text as="label" htmlFor={name} size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                {label} {required && <Text color="red">*</Text>}
            </Text>
            <TextField.Root
                {...field}
                id={name}
                placeholder={placeholder}
                className={className}
                color={hasError || availability === 'taken' ? 'red' : undefined}
            >
                <TextField.Slot side="right">
                    {availability === 'checking' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    {availability === 'available' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {availability === 'taken' && <XCircle className="w-4 h-4 text-red-500" />}
                </TextField.Slot>
            </TextField.Root>
            {statusMessage && (
                <Text as="p" size="1" color={statusColor} mt="1">
                    {statusMessage}
                </Text>
            )}
        </Box>
    );
};

export default ItemNameField;
