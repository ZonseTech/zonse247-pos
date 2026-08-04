import { FC, useCallback } from "react";
import { Download, X, SlidersHorizontal } from "lucide-react";
import { Button, Flex, Tooltip } from "@radix-ui/themes";
import MobileDateFilter from "../../../components/reports/MobileDateFilter";
import { SearchBar } from "../../../components/SearchBar";
import { useIsMobile } from "../../../hooks/useMediaQuery";

interface SalesToolbarProps {
    searchTerm: string;
    startDate: Date | null;
    endDate: Date | null;
    hasActiveFilters: boolean;
    activeFilterCount?: number;
    onSearch: (term: string) => void;
    onDateChange: (dates: [Date | null, Date | null]) => void;
    onExport: () => void;
    onClearFilters: () => void;
    onOpenFilters?: () => void;
    canExport?: boolean;
}

const SalesToolbar: FC<SalesToolbarProps> = ({
    searchTerm,
    startDate,
    endDate,
    hasActiveFilters,
    activeFilterCount = 0,
    onSearch,
    onDateChange,
    onExport,
    onClearFilters,
    onOpenFilters,
    canExport = true,
}) => {
    const isMobile = useIsMobile();

    const handleDateChange = useCallback(
        (start: Date | null, end: Date | null) => {
            onDateChange([start, end]);
        },
        [onDateChange],
    );

    if (isMobile) {
        return (
            <Flex align="center" gap="2" px="3" py="2" className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <SearchBar
                    placeholder="Search sales..."
                    value={searchTerm}
                    onChange={onSearch}
                    debounce={400}
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

                {canExport && (
                    <Tooltip content="Export">
                        <button
                            onClick={onExport}
                            aria-label="Export sales data"
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

    // Desktop: full toolbar with inline date picker
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
                placeholder="Search by invoice, cashier..."
                value={searchTerm}
                onChange={onSearch}
                debounce={400}
                className="flex-1 max-w-xs"
            />

            <Flex align="center" gap="2">
                <MobileDateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                    align="right"
                />

                {canExport && (
                    <Tooltip content="Export sales data">
                        <Button variant="outline" color="gray" size="2" onClick={onExport} aria-label="Export sales data">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </Tooltip>
                )}

                {hasActiveFilters && (
                    <Tooltip content="Clear all filters">
                        <Button variant="soft" color="red" size="2" onClick={onClearFilters} aria-label="Clear all filters">
                            <X className="w-4 h-4" />
                            Clear
                        </Button>
                    </Tooltip>
                )}
            </Flex>
        </Flex>
    );
};

export default SalesToolbar;
