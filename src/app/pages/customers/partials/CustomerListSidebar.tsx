import { FC } from 'react';
import { Plus, Users, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea, Text, IconButton, Badge, Flex } from '@radix-ui/themes';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import classNames from 'classnames';
import { SearchBar } from '../../../components/SearchBar';

interface CustomerListSidebarProps {
    customers: Customer[];
    isLoading: boolean;
    searchTerm: string;
    selectedCustomer: Customer | null;
    pageLabel: string;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onSearchChange: (term: string) => void;
    onSelectCustomer: (customer: Customer) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onAddCustomer: () => void;
}

const CustomerListSidebar: FC<CustomerListSidebarProps> = ({
    customers,
    isLoading,
    searchTerm,
    selectedCustomer,
    pageLabel,
    hasNextPage,
    hasPrevPage,
    onSearchChange,
    onSelectCustomer,
    onNextPage,
    onPrevPage,
    onAddCustomer,
}) => (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <Flex align="center" justify="between" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700">
            <Text size="2" weight="bold">Customers</Text>
            <IconButton variant="ghost" color="sky" size="1" onClick={onAddCustomer} aria-label="Add customer">
                <Plus className="w-4 h-4" />
            </IconButton>
        </Flex>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Search customers..." compact />
        </div>

        {/* List */}
        <ScrollArea scrollbars="vertical" className="flex-1 min-h-0">
            {isLoading && customers.length === 0 ? (
                <ListSkeleton />
            ) : customers.length === 0 ? (
                <EmptyList searchTerm={searchTerm} onAdd={onAddCustomer} />
            ) : (
                customers.map((c) => (
                    <CustomerItem
                        key={c.customerId}
                        customer={c}
                        isSelected={selectedCustomer?.customerId === c.customerId}
                        onSelect={onSelectCustomer}
                    />
                ))
            )}
        </ScrollArea>

        {/* Pagination footer */}
        <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700" />
        <Flex align="center" justify="between" px="3" py="2" gap="2">
            <Text size="1" color="gray">{pageLabel}</Text>
            <Flex gap="1">
                <IconButton variant="soft" color="gray" size="1" disabled={!hasPrevPage} onClick={onPrevPage} aria-label="Previous page">
                    <ChevronLeft className="w-3.5 h-3.5" />
                </IconButton>
                <IconButton variant="soft" color="gray" size="1" disabled={!hasNextPage} onClick={onNextPage} aria-label="Next page">
                    <ChevronRight className="w-3.5 h-3.5" />
                </IconButton>
            </Flex>
        </Flex>
    </div>
);

/* ─── List item ──────────────────────────────────────────────────── */

const CustomerItem: FC<{
    customer: Customer;
    isSelected: boolean;
    onSelect: (c: Customer) => void;
}> = ({ customer, isSelected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(customer)}
        className={classNames(
            'w-full text-left px-3 py-2.5 border-b border-gray-100 dark:border-gray-700/50 transition-colors',
            isSelected
                ? 'bg-sky-50 dark:bg-sky-900/20 border-l-2 border-l-sky-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent',
        )}
    >
        <Flex align="center" gap="2">
            <Avatar.Root className="flex-shrink-0 w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center overflow-hidden">
                <Avatar.Fallback className="text-white font-bold text-sm">
                    {customer.name.charAt(0).toUpperCase()}
                </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 flex-1">
                <Flex align="center" gap="1">
                    <Text size="2" weight="medium" truncate>{customer.name}</Text>
                    {customer.isDefault && <Badge variant="soft" color="sky" size="1" radius="full">Default</Badge>}
                </Flex>
                <Text size="1" color="gray" truncate className="block">
                    {customer.phone || customer.email || 'No contact info'}
                </Text>
            </div>
        </Flex>
    </button>
);

/* ─── Empty / Skeleton ───────────────────────────────────────────── */

const EmptyList: FC<{ searchTerm: string; onAdd: () => void }> = ({ searchTerm, onAdd }) => (
    <Flex direction="column" align="center" justify="center" py="9" px="4">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
            <Users className="w-6 h-6 text-gray-400" />
        </div>
        <Text size="2" weight="medium" color="gray">{searchTerm ? 'No customers found' : 'No customers yet'}</Text>
        <Text size="1" color="gray" align="center" className="mt-1">
            {searchTerm ? 'Try adjusting your search.' : 'Add your first customer to get started.'}
        </Text>
        {!searchTerm && (
            <button onClick={onAdd} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-500 hover:text-sky-600">
                <UserPlus className="w-3.5 h-3.5" /> Add Customer
            </button>
        )}
    </Flex>
);

const ListSkeleton: FC = () => (
    <div className="py-2">
        {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded w-32" />
                </div>
            </div>
        ))}
    </div>
);

export default CustomerListSidebar;
