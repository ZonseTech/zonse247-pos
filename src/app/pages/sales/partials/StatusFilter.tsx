import { FC } from "react";
import { CheckCircle, Clock, XCircle, Ban, RotateCcw } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, Select } from '@radix-ui/themes';

interface StatusFilterProps {
    selectedStatus: SaleStatus | TransactionStatus | 'all';
    onChange: (status: SaleStatus | TransactionStatus | 'all') => void;
    compact?: boolean;
}

type RadixColor = 'cyan' | 'green' | 'yellow' | 'red' | 'sky';

const statusOptions: Array<{ value: SaleStatus | TransactionStatus | 'all'; label: string; icon: any; color: RadixColor }> = [
    { value: 'all', label: 'All', icon: CheckCircle, color: 'cyan' },
    { value: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'green' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'VOIDED', label: 'Voided', icon: XCircle, color: 'red' },
    { value: 'RETURNED', label: 'Returned', icon: RotateCcw, color: 'sky' },
];

export const StatusFilter: FC<StatusFilterProps> = ({ selectedStatus, onChange }) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();

    if (isMobile) {
        return (
            <Flex align="center" gap="2" width="100%">
                <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Status:
                </Text>
                <Select.Root value={selectedStatus} onValueChange={(v) => onChange(v as SaleStatus | TransactionStatus | 'all')}>
                    <Select.Trigger
                        variant="surface"
                        placeholder="Select status"
                        className="flex-1"
                    />
                    <Select.Content position="popper">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <Select.Item key={option.value} value={option.value}>
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
            <Flex align="center" gap="1" className={`overflow-x-auto ${isEBN ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600' : ''}`}>
                {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus === option.value;

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
                        </Button>
                    );
                })}
            </Flex>
        </Flex>
    );
};
