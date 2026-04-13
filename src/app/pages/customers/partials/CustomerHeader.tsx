import { FC } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Text, Flex, Badge, IconButton } from '@radix-ui/themes';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import * as Avatar from '@radix-ui/react-avatar';

interface CustomerHeaderProps {
    customer: Customer;
    salesCount: number;
    serviceOrdersCount: number;
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
}

const CustomerHeader: FC<CustomerHeaderProps> = ({
    customer,
    salesCount,
    serviceOrdersCount,
    onEdit,
    onDelete,
}) => (
    <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <Flex gap="3" align="start">
            <Avatar.Root className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center overflow-hidden">
                <Avatar.Fallback className="text-white font-bold text-lg">
                    {customer.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>

            <div className="min-w-0 flex-1">
                <Flex align="center" gap="2">
                    <Text size="4" weight="bold" truncate>{customer.name}</Text>
                    {customer.isDefault && <Badge variant="soft" color="sky" size="1" radius="full">Default</Badge>}
                </Flex>

                <Flex wrap="wrap" gap="3" mt="1">
                    {customer.phone && (
                        <Text size="2" color="gray" className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {customer.phone}
                        </Text>
                    )}
                    {customer.email && (
                        <Text size="2" color="gray" className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3.5 h-3.5 flex-shrink-0" /> {customer.email}
                        </Text>
                    )}
                    {customer.address && (
                        <Text size="2" color="gray" className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {customer.address}
                        </Text>
                    )}
                </Flex>
            </div>

            <Flex gap="1" className="flex-shrink-0">
                <IconButton variant="ghost" color="sky" size="2" onClick={() => onEdit(customer)} aria-label="Edit">
                    <HiOutlinePencil className="w-4 h-4" />
                </IconButton>
                <IconButton variant="ghost" color="red" size="2" onClick={() => onDelete(customer.customerId, customer.name)} aria-label="Delete">
                    <HiOutlineTrash className="w-4 h-4" />
                </IconButton>
            </Flex>
        </Flex>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
            <StatCard label="Sales" value={salesCount} color="sky" />
            <StatCard label="Service Orders" value={serviceOrdersCount} color="purple" />
        </div>
    </div>
);

const StatCard: FC<{ label: string; value: number; color: 'sky' | 'purple' }> = ({ label, value, color }) => {
    const bg = color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-purple-50 dark:bg-purple-900/20';
    const textColor = color === 'sky' ? 'sky' : 'purple';
    return (
        <div className={`${bg} rounded-lg px-3 py-2`}>
            <Text size="1" weight="medium" color={textColor} className="uppercase tracking-wider">{label}</Text>
            <Text as="p" size="5" weight="bold" color={textColor}>{value}</Text>
        </div>
    );
};

export default CustomerHeader;
