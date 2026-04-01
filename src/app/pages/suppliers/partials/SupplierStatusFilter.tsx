import { FC } from 'react';
import { Truck, CheckCircle, XCircle, ShieldOff } from 'lucide-react';
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, Select } from '@radix-ui/themes';

type RadixColor = 'cyan' | 'green' | 'gray' | 'red';

interface SupplierStatusFilterProps {
    selectedStatus: SupplierStatus | '';
    onChange: (status: SupplierStatus | '') => void;
}

const ALL_STATUS = 'ALL' as const;

const statusOptions: Array<{
    value: SupplierStatus | '' | typeof ALL_STATUS;
    label: string;
    icon: any;
    color: RadixColor;
}> = [
        { value: ALL_STATUS, label: 'All', icon: Truck, color: 'cyan' },
        { value: 'ACTIVE', label: 'Active', icon: CheckCircle, color: 'green' },
        { value: 'INACTIVE', label: 'Inactive', icon: XCircle, color: 'gray' },
        { value: 'SUSPENDED', label: 'Suspended', icon: ShieldOff, color: 'red' },
    ];

export const SupplierStatusFilter: FC<SupplierStatusFilterProps> = ({
    selectedStatus,
    onChange,
}) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();

    if (isMobile) {
        return (
            <Flex align="center" gap="2" width="100%">
                <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Status:
                </Text>
                <Select.Root value={selectedStatus || ALL_STATUS} onValueChange={(v) => onChange(v === ALL_STATUS ? '' : v as SupplierStatus)}>
                    <Select.Trigger variant="surface" placeholder="All statuses" className="flex-1" />
                    <Select.Content position="popper">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <Select.Item key={option.value || ALL_STATUS} value={option.value || ALL_STATUS}>
                                    <Flex align="center" gap="2">
                                        <Icon className="w-4 h-4" />
                                        {option.label}
                                    </Flex>
                                </Select.Item>
                            );
                        })}
                    </Select.Content>
                </Select.Root>
            </Flex>
        );
    }

    return (
        <Flex align="center" gap="2" wrap="wrap">
            <Text size={isEBN ? '1' : '2'} weight="medium" className="text-gray-700 dark:text-gray-300 mr-1">
                Status:
            </Text>
            <Flex align="center" gap="1">
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const optionValue = option.value === ALL_STATUS ? '' : option.value;
                    const isSelected = selectedStatus === optionValue;

                    return (
                        <Button
                            key={option.value}
                            size={isEBN ? '1' : '2'}
                            variant={isSelected ? 'soft' : 'outline'}
                            color={isSelected ? option.color : 'gray'}
                            onClick={() => onChange(optionValue as SupplierStatus | '')}
                            className="whitespace-nowrap"
                        >
                            <Icon className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
                            {option.label}
                        </Button>
                    );
                })}
            </Flex>
        </Flex>
    );
};
