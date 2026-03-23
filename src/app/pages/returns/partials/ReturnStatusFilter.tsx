import { FC } from 'react';
import { RotateCcw, CheckCircle, Clock, PackageX } from 'lucide-react';
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, Select } from '@radix-ui/themes';

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

type RadixColor = 'cyan' | 'green' | 'yellow' | 'red';

interface ReturnStatusFilterProps {
    selectedStatus: RestockFilter;
    onChange: (status: RestockFilter) => void;
    counts?: { total: number; pending: number; restocked: number; damaged: number };
}

const statusOptions: Array<{
    value: RestockFilter;
    label: string;
    icon: any;
    color: RadixColor;
    countKey: 'total' | 'pending' | 'restocked' | 'damaged';
}> = [
        { value: 'all', label: 'All', icon: RotateCcw, color: 'cyan', countKey: 'total' },
        { value: 'pending-restock', label: 'Pending Restock', icon: Clock, color: 'yellow', countKey: 'pending' },
        { value: 'restocked', label: 'Restocked', icon: CheckCircle, color: 'green', countKey: 'restocked' },
        { value: 'damaged', label: 'Damaged', icon: PackageX, color: 'red', countKey: 'damaged' },
    ];

export const ReturnStatusFilter: FC<ReturnStatusFilterProps> = ({
    selectedStatus,
    onChange,
    counts,
}) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();

    if (isMobile) {
        return (
            <Flex align="center" gap="2" width="100%">
                <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Status:
                </Text>
                <Select.Root value={selectedStatus} onValueChange={(v) => onChange(v as RestockFilter)}>
                    <Select.Trigger variant="surface" placeholder="Select status" className="flex-1" />
                    <Select.Content position="popper">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const count = counts?.[option.countKey];
                            return (
                                <Select.Item key={option.value} value={option.value}>
                                    <Flex align="center" gap="2">
                                        <Icon className="w-4 h-4" />
                                        {option.label}
                                        {count !== undefined && ` (${count})`}
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
            <Flex align="center" gap="1" className={`overflow-x-auto ${isEBN ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600' : ''}`}>
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus === option.value;
                    const count = counts?.[option.countKey];

                    return (
                        <Button
                            key={option.value}
                            size={isEBN ? '1' : '2'}
                            variant={isSelected ? 'soft' : 'outline'}
                            color={isSelected ? option.color : 'gray'}
                            onClick={() => onChange(option.value)}
                            className="whitespace-nowrap"
                        >
                            <Icon className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
                            {option.label}
                            {count !== undefined && (
                                <span className="ml-1 text-xs opacity-75">({count})</span>
                            )}
                        </Button>
                    );
                })}
            </Flex>
        </Flex>
    );
};
