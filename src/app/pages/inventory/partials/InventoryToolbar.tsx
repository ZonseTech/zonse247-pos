import { FC, useCallback } from 'react';
import { Settings2, X, Download, SlidersHorizontal } from 'lucide-react';
import { Button, Badge, Flex, Tooltip } from '@radix-ui/themes';
import { SearchBar } from '../../../components/SearchBar';
import MobileDateFilter from '../../../components/reports/MobileDateFilter';

interface InventoryToolbarProps {
    searchTerm: string;
    onSearch: (value: string) => void;
    startDate: string;
    endDate: string;
    onDateChange: (start: Date | null, end: Date | null) => void;
    onExport: () => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    activeFilterCount?: number;
    selectedRowCount: number;
    onBulkActions: () => void;
    isMobile?: boolean;
    onOpenFilters?: () => void;
}

const InventoryToolbar: FC<InventoryToolbarProps> = ({
    searchTerm,
    onSearch,
    startDate,
    endDate,
    onDateChange,
    onExport,
    onClearFilters,
    hasActiveFilters,
    activeFilterCount = 0,
    selectedRowCount,
    onBulkActions,
    isMobile = false,
    onOpenFilters,
}) => {
    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        onDateChange(start, end);
    }, [onDateChange]);

    if (isMobile) {
        return (
            <Flex align="center" gap="2" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <SearchBar
                    placeholder="Search name, barcode, SKU..."
                    value={searchTerm}
                    onChange={onSearch}
                    debounce={500}
                    className="flex-1 [&_input]:!min-h-[36px]"
                />

                {/* Filter button — opens bottom sheet */}
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

                <Tooltip content="Export">
                    <button
                        onClick={onExport}
                        aria-label="Export inventory data"
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
        <Flex
            align="center"
            justify="between"
            gap="3"
            px="4"
            py="3"
            className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
        >
            <SearchBar
                placeholder="Search by name, barcode, SKU..."
                value={searchTerm}
                onChange={onSearch}
                debounce={500}
                className="flex-1 max-w-xs"
            />

            <Flex align="center" gap="2">
                <MobileDateFilter
                    startDate={startDate ? new Date(startDate) : null}
                    endDate={endDate ? new Date(endDate) : null}
                    onChange={handleDateChange}
                    align="right"
                />

                <Tooltip content="Export inventory data">
                    <Button variant="outline" color="gray" size="2" onClick={onExport} aria-label="Export inventory data">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </Tooltip>

                {hasActiveFilters && (
                    <Tooltip content="Clear all filters">
                        <Button variant="soft" color="red" size="2" onClick={onClearFilters} aria-label="Clear all filters">
                            <X className="w-4 h-4" />
                            Clear
                        </Button>
                    </Tooltip>
                )}

                {selectedRowCount > 0 && (
                    <Button variant="soft" color="purple" size="2" onClick={onBulkActions}>
                        <Settings2 className="w-4 h-4" />
                        Bulk
                        <Badge color="purple" variant="solid" size="1">{selectedRowCount}</Badge>
                    </Button>
                )}
            </Flex>
        </Flex>
    );
};

export default InventoryToolbar;
