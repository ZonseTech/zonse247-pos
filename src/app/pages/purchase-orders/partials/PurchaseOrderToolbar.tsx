import { FC } from 'react';
import { SlidersHorizontal, Download } from 'lucide-react';
import { Flex, Tooltip } from '@radix-ui/themes';
import { SearchBar } from '../../../components/SearchBar';

interface PurchaseOrderToolbarProps {
    searchTerm: string;
    onSearch: (value: string) => void;
    onExport?: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    onOpenFilters: () => void;
    isMobile?: boolean;
}

const PurchaseOrderToolbar: FC<PurchaseOrderToolbarProps> = ({
    searchTerm,
    onSearch,
    onExport,
    hasActiveFilters,
    activeFilterCount,
    onOpenFilters,
    isMobile = false,
}) => {
    if (isMobile) {
        return (
            <Flex align="center" gap="2" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <SearchBar
                    placeholder="Search PO#, supplier..."
                    value={searchTerm}
                    onChange={onSearch}
                    debounce={400}
                    className="flex-1 [&_input]:!min-h-[36px]"
                />

                {onExport && (
                    <Tooltip content="Export">
                        <button
                            onClick={onExport}
                            aria-label="Export purchase orders"
                            className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0
                                     border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400
                                     hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600
                                     transition-colors touch-manipulation"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </Tooltip>
                )}
            </Flex>
        );
    }

    return (
        <Flex
            align="center"
            gap="3"
            px="4"
            py="3"
            className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
        >
            <SearchBar
                placeholder="Search by PO#, supplier..."
                value={searchTerm}
                onChange={onSearch}
                debounce={400}
                className="flex-1 max-w-xs"
            />
        </Flex>
    );
};

export default PurchaseOrderToolbar;
