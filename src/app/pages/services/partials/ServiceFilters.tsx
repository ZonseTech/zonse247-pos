import { FC, useMemo } from 'react';
import { CheckCircle, XCircle, CircleDot, DollarSign, Tag } from 'lucide-react';
import { Flex, Text, Button, Select } from '@radix-ui/themes';
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { useCategories } from '../../../hooks/useCategories';

// ─── Status Filter ────────────────────────────────────────────────────────────

interface StatusFilterProps {
    value: 'all' | 'active' | 'inactive';
    onChange: (v: 'all' | 'active' | 'inactive') => void;
}

type RadixColor = 'cyan' | 'green' | 'gray';

const statusOptions: Array<{ value: 'all' | 'active' | 'inactive'; label: string; icon: any; color: RadixColor }> = [
    { value: 'all', label: 'All', icon: CircleDot, color: 'cyan' },
    { value: 'active', label: 'Active', icon: CheckCircle, color: 'green' },
    { value: 'inactive', label: 'Inactive', icon: XCircle, color: 'gray' },
];

const ServiceStatusFilter: FC<StatusFilterProps> = ({ value, onChange }) => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();

    if (isMobile) {
        return (
            <Flex align="center" gap="2" width="100%">
                <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Status:
                </Text>
                <Select.Root value={value} onValueChange={(v) => onChange(v as any)}>
                    <Select.Trigger variant="surface" className="flex-1" />
                    <Select.Content position="popper">
                        {statusOptions.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value}>
                                {opt.label}
                            </Select.Item>
                        ))}
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
                {statusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = value === opt.value;
                    return (
                        <Button
                            key={opt.value}
                            size={isEBN ? '1' : '2'}
                            variant={isSelected ? 'soft' : 'outline'}
                            color={isSelected ? opt.color : 'gray'}
                            onClick={() => onChange(opt.value)}
                            className="whitespace-nowrap"
                        >
                            <Icon className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
                            {opt.label}
                        </Button>
                    );
                })}
            </Flex>
        </Flex>
    );
};

// ─── Pricing Type Filter ──────────────────────────────────────────────────────

interface PricingTypeFilterProps {
    value: ServicePricingType | 'all';
    onChange: (v: ServicePricingType | 'all') => void;
}

const pricingOptions: Array<{ value: ServicePricingType | 'all'; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'FIXED', label: 'Fixed' },
    { value: 'HOURLY', label: 'Hourly' },
    { value: 'PER_UNIT', label: 'Per Unit' },
    { value: 'PACKAGE', label: 'Package' },
    { value: 'FLAT_RATE', label: 'Flat Rate' },
    { value: 'VARIABLE', label: 'Variable' },
    { value: 'TIERED', label: 'Tiered' },
    { value: 'SUBSCRIPTION', label: 'Subscription' },
    { value: 'CUSTOM', label: 'Custom' },
];

const PricingTypeFilter: FC<PricingTypeFilterProps> = ({ value, onChange }) => {
    const isMobile = useIsMobile();

    return (
        <Flex align="center" gap="2" width={isMobile ? '100%' : undefined}>
            <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                <DollarSign className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />
                Pricing:
            </Text>
            <Select.Root value={value} onValueChange={(v) => onChange(v as any)}>
                <Select.Trigger variant="surface" className={isMobile ? 'flex-1' : ''} />
                <Select.Content position="popper">
                    {pricingOptions.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                            {opt.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Flex>
    );
};

// ─── Category Filter ──────────────────────────────────────────────────────────

interface CategoryFilterProps {
    value: string | 'all';
    onChange: (v: string | 'all') => void;
}

const CategoryFilter: FC<CategoryFilterProps> = ({ value, onChange }) => {
    const isMobile = useIsMobile();
    const { categories, isLoading } = useCategories();

    const options = useMemo(() => {
        const cats = categories.map((c) => ({ value: c.categoryId, label: c.name }));
        return [{ value: 'all', label: 'All Categories' }, ...cats];
    }, [categories]);

    return (
        <Flex align="center" gap="2" width={isMobile ? '100%' : undefined}>
            <Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
                <Tag className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />
                Category:
            </Text>
            <Select.Root value={value} onValueChange={(v) => onChange(v)} disabled={isLoading}>
                <Select.Trigger variant="surface" placeholder={isLoading ? 'Loading…' : 'Select'} className={isMobile ? 'flex-1' : ''} />
                <Select.Content position="popper">
                    {options.map((opt) => (
                        <Select.Item key={opt.value} value={opt.value}>
                            {opt.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Flex>
    );
};

// ─── Combined Filter Bar ──────────────────────────────────────────────────────

interface ServiceFiltersProps {
    statusFilter: 'all' | 'active' | 'inactive';
    pricingTypeFilter: ServicePricingType | 'all';
    categoryFilter: string | 'all';
    onStatusChange: (v: 'all' | 'active' | 'inactive') => void;
    onPricingTypeChange: (v: ServicePricingType | 'all') => void;
    onCategoryChange: (v: string | 'all') => void;
}

const ServiceFilters: FC<ServiceFiltersProps> = ({
    statusFilter,
    pricingTypeFilter,
    categoryFilter,
    onStatusChange,
    onPricingTypeChange,
    onCategoryChange,
}) => {
    const isMobile = useIsMobile();

    return (
        <Flex
            direction={isMobile ? 'column' : 'row'}
            gap={{ initial: '2', sm: '4' }}
            align={isMobile ? 'stretch' : 'center'}
            px={{ initial: '3', sm: '4' }}
            py={{ initial: '2', sm: '3' }}
            className="border-b border-gray-200 dark:border-gray-700"
            wrap="wrap"
        >
            <ServiceStatusFilter value={statusFilter} onChange={onStatusChange} />
            <PricingTypeFilter value={pricingTypeFilter} onChange={onPricingTypeChange} />
            <CategoryFilter value={categoryFilter} onChange={onCategoryChange} />
        </Flex>
    );
};

export default ServiceFilters;
export { ServiceStatusFilter, PricingTypeFilter, CategoryFilter };
