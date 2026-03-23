import type { FunctionComponent } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { SegmentedControl } from '@radix-ui/themes';

type CalculateAsType = 'monthly' | 'daily' | 'hourly';

interface CalculateAsFieldsProps {
    value: string;
    onChange: (value: CalculateAsType) => void;
}

const options: { value: CalculateAsType; label: string }[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'daily', label: 'Daily' },
    { value: 'hourly', label: 'Hourly' },
];

const CalculateAsFields: FunctionComponent<CalculateAsFieldsProps> = ({ value, onChange }) => {
    return (
        <Flex direction="column" gap="1">
            <Text size="1" color="gray" weight="medium">Calculate As</Text>
            <SegmentedControl.Root
                value={value}
                onValueChange={(val) => onChange(val as CalculateAsType)}
                size="2"
            >
                {options.map((option) => (
                    <SegmentedControl.Item key={option.value} value={option.value}>
                        {option.label}
                    </SegmentedControl.Item>
                ))}
            </SegmentedControl.Root>
        </Flex>
    );
};

export default CalculateAsFields;
