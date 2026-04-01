import { FC, useMemo } from "react";
import { X } from "lucide-react";

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

interface ReturnsActiveFilterChipsProps {
    searchTerm: string;
    selectedStatus: RestockFilter;
    onClearSearch: () => void;
    onClearStatus: () => void;
    onClearAll: () => void;
}

interface FilterChip {
    key: string;
    label: string;
    onRemove: () => void;
}

const statusLabels: Record<RestockFilter, string> = {
    'all': 'All',
    'pending-restock': 'Pending Restock',
    'restocked': 'Restocked',
    'damaged': 'Damaged',
};

const ReturnsActiveFilterChips: FC<ReturnsActiveFilterChipsProps> = ({
    searchTerm,
    selectedStatus,
    onClearSearch,
    onClearStatus,
    onClearAll,
}) => {
    const chips = useMemo<FilterChip[]>(() => {
        const result: FilterChip[] = [];

        if (searchTerm) {
            result.push({
                key: "search",
                label: `"${searchTerm.length > 12 ? searchTerm.slice(0, 12) + "…" : searchTerm}"`,
                onRemove: onClearSearch,
            });
        }

        if (selectedStatus !== "all") {
            result.push({
                key: "status",
                label: statusLabels[selectedStatus],
                onRemove: onClearStatus,
            });
        }

        return result;
    }, [searchTerm, selectedStatus, onClearSearch, onClearStatus]);

    if (chips.length === 0) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-gray-700">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                             bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300
                             active:bg-sky-200 dark:active:bg-sky-900/50 transition-colors
                             flex-shrink-0 touch-manipulation"
                    aria-label={`Remove filter: ${chip.label}`}
                >
                    <span>{chip.label}</span>
                    <X className="w-3 h-3" />
                </button>
            ))}

            {chips.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                             bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400
                             active:bg-red-200 dark:active:bg-red-900/50 transition-colors
                             flex-shrink-0 touch-manipulation"
                    aria-label="Clear all filters"
                >
                    <span>Clear all</span>
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
};

export default ReturnsActiveFilterChips;
