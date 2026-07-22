import { FC, ComponentProps } from 'react';
import { useField } from 'formik';
import { Box, Text, TextField } from '@radix-ui/themes';

type RootProps = ComponentProps<typeof TextField.Root>;

interface TextInputProps extends Omit<RootProps, 'name' | 'value' | 'color'> {
    label: string;
    name: string;
    required?: boolean;
}

const TextInput: FC<TextInputProps> = ({
    label,
    name,
    required,
    type = 'text',
    ...rest
}) => {
    const [field, meta] = useField({ name, type: type as string });
    const hasError = meta.touched && !!meta.error;

    // Show an empty box instead of "0" so the placeholder remains visible
    const displayValue = type === 'number' && (field.value === 0 || field.value === '0')
        ? ''
        : field.value ?? '';

    return (
        <Box>
            <Text as="label" htmlFor={name} size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                {label} {required && <Text color="red">*</Text>}
            </Text>
            <TextField.Root
                {...rest}
                {...field}
                value={displayValue}
                id={name}
                type={type}
                color={hasError ? 'red' : undefined}
            />
            {hasError && (
                <Text as="p" size="1" color="red" mt="1">
                    {meta.error}
                </Text>
            )}
        </Box>
    );
};

export default TextInput;
