import { FC } from 'react';
import { CheckCircle, Clock, Send, Truck, Package, XCircle, ShoppingCart } from 'lucide-react';
import { Flex, Text, Button } from '@radix-ui/themes';
import { useIsEBN } from '../../../hooks/useMediaQuery';

type PurchaseOrderFilterStatus = PurchaseOrderStatus | 'all';

type RadixColor = 'cyan' | 'gray' | 'yellow' | 'indigo' | 'purple' | 'sky' | 'green' | 'red';

const statusOptions: Array<{ value: PurchaseOrderFilterStatus; label: string; icon: any; color: RadixColor }> = [
    { value: 'all', label: 'All', icon: ShoppingCart, color: 'cyan' },
    { value: 'DRAFT', label: 'Draft', icon: Clock, color: 'gray' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'yellow' },
    { value: 'SENT', label: 'Sent', icon: Send, color: 'indigo' },
    { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'purple' },
    { value: 'PARTIALLY_RECEIVED', label: 'Partial', icon: Package, color: 'sky' },
    { value: 'RECEIVED', label: 'Received', icon: CheckCircle, color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'red' },
];

interface PurchaseOrderStatusFilterProps {
    selectedStatus: PurchaseOrderFilterStatus;
    onChange: (status: PurchaseOrderFilterStatus) => void;
}

const PurchaseOrderStatusFilter: FC<PurchaseOrderStatusFilterProps> = ({ selectedStatus, onChange }) => {
    const isEBN = useIsEBN();

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

export default PurchaseOrderStatusFilter;
