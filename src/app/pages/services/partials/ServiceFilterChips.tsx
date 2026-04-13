import { FC } from 'react';
import { X } from 'lucide-react';
import { Flex } from '@radix-ui/themes';

interface ChipProps {
    label: string;
    onRemove: () => void;
}

const Chip: FC<ChipProps> = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 whitespace-nowrap">
        {label}
        <button onClick={onRemove} className="hover:text-sky-900 dark:hover:text-sky-100 touch-manipulation" aria-label={`Remove ${label} filter`}>
            <X className="w-3 h-3" />
        </button>
    </span>
);

interface ServiceFilterChipsProps {
    searchTerm: string;
    statusFilter: 'all' | 'active' | 'inactive';
    pricingTypeFilter: ServicePricingType | 'all';
    categoryFilter: string | 'all';
    categoryName?: string;
    onClearSearch: () => void;
    onClearStatus: () => void;
    onClearPricingType: () => void;
    onClearCategory: () => void;
    onClearAll: () => void;
}

const ServiceFilterChips: FC<ServiceFilterChipsProps> = ({
    searchTerm,
    statusFilter,
    pricingTypeFilter,
    categoryFilter,
    categoryName,
    onClearSearch,
    onClearStatus,
    onClearPricingType,
    onClearCategory,
    onClearAll,
}) => {
    return (
        <Flex align="center" gap="1" px="3" py="1.5" className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-thin">
            {searchTerm && <Chip label={`"${searchTerm}"`} onRemove={onClearSearch} />}
            {statusFilter !== 'all' && <Chip label={statusFilter === 'active' ? 'Active' : 'Inactive'} onRemove={onClearStatus} />}
            {pricingTypeFilter !== 'all' && <Chip label={pricingTypeFilter.replace(/_/g, ' ')} onRemove={onClearPricingType} />}
            {categoryFilter !== 'all' && <Chip label={categoryName || 'Category'} onRemove={onClearCategory} />}
            <button onClick={onClearAll} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 whitespace-nowrap ml-1 touch-manipulation">
                Clear all
            </button>
        </Flex>
    );
};

export default ServiceFilterChips;
