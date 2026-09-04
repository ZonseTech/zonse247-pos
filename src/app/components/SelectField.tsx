import { FC } from 'react';
import { useField } from 'formik';
import { Box, Select, Text } from '@radix-ui/themes';

export interface SelectFieldOption {
    label: string;
    value: string;
}

interface SelectFieldProps {
    label: string;
    name: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    options: SelectFieldOption[];
}

const SelectField: FC<SelectFieldProps> = ({
    label,
    name,
    required,
    disabled,
    placeholder,
    options,
}) => {
    const [field, meta, helpers] = useField(name);
    const hasError = meta.touched && !!meta.error;

    return (
        <Box>
            <Text as="label" htmlFor={name} size="2" weight="medium" mb="1" className="block text-gray-700 dark:text-gray-300">
                {label} {required && <Text color="red">*</Text>}
            </Text>
            <Select.Root
                value={field.value || undefined}
                onValueChange={(val) => helpers.setValue(val)}
                disabled={disabled}
            >
                <Select.Trigger id={name} placeholder={placeholder} className="w-full" color={hasError ? 'red' : undefined} />
                {/* z-[60] beats FormModal's Dialog.Content (z-50) so the menu isn't hidden when this field renders inside a modal */}
                <Select.Content position="popper" className="z-[60]">
                    {options.map((option) => (
                        <Select.Item key={option.value} value={option.value}>{option.label}</Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
            {hasError && (
                <Text as="p" size="1" color="red" mt="1">
                    {meta.error}
                </Text>
            )}
        </Box>
    );
};

export default SelectField;
