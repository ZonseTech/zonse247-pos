import { FC } from 'react';
import { Download, X, SlidersHorizontal } from 'lucide-react';
import { Button, Flex, Tooltip } from '@radix-ui/themes';
import { SearchBar } from '../../../components/SearchBar';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface ServiceToolbarProps {
    searchTerm: string;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    onSearch: (term: string) => void;
    onExport: () => void;
    onClearFilters: () => void;
    onOpenFilters?: () => void;
}

const ServiceToolbar: FC<ServiceToolbarProps> = ({
    searchTerm,
    hasActiveFilters,
    activeFilterCount,
    onSearch,
    onExport,
    onClearFilters,
    onOpenFilters,
}) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Flex align="center" gap="2" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <SearchBar
                    placeholder="Search services…"
                    value={searchTerm}
                    onChange={onSearch}
                    debounce={400}
                    className="flex-1 [&_input]:!min-h-[36px]"
                />
                {onOpenFilters && (
                    <button
                        onClick={onOpenFilters}
                        aria-label="Open filters"
                        className="relative flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0
                                 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400
                                 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600
                                 transition-colors touch-manipulation"
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-sky-500 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                )}
                <Tooltip content="Export CSV">
                    <button
                        onClick={onExport}
                        aria-label="Export service data"
                        className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0
                                 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400
                                 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600
                                 transition-colors touch-manipulation"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </Tooltip>
            </Flex>
        );
    }

    return (
        <Flex align="center" gap="3" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <SearchBar
                placeholder="Search by name, SKU, or description…"
                value={searchTerm}
                onChange={onSearch}
                debounce={400}
                className="flex-1 max-w-md"
            />
            <Flex align="center" gap="2" className="ml-auto">
                {hasActiveFilters && (
                    <Button size="2" variant="soft" color="red" onClick={onClearFilters}>
                        <X className="w-4 h-4" /> Clear Filters
                    </Button>
                )}
                <Tooltip content="Export CSV">
                    <Button size="2" variant="outline" color="gray" onClick={onExport}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </Tooltip>
            </Flex>
        </Flex>
    );
};

export default ServiceToolbar;
