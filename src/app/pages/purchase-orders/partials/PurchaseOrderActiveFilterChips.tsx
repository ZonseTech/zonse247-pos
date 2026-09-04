import { FC, useMemo } from 'react';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import { poStatusLabels } from './PurchaseOrderFilterSheet';

interface PurchaseOrderActiveFilterChipsProps {
    searchTerm: string;
    statusFilter: string;
    dateFrom?: string;
    dateTo?: string;
    onClearSearch: () => void;
    onClearStatus: () => void;
    onClearDate?: () => void;
    onClearAll: () => void;
}

interface FilterChip {
    key: string;
    label: string;
    onRemove: () => void;
}

const PurchaseOrderActiveFilterChips: FC<PurchaseOrderActiveFilterChipsProps> = ({
    searchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    onClearSearch,
    onClearStatus,
    onClearDate,
    onClearAll,
}) => {
    const chips = useMemo<FilterChip[]>(() => {
        const result: FilterChip[] = [];

        if (searchTerm) {
            result.push({
                key: 'search',
                label: `"${searchTerm.length > 12 ? searchTerm.slice(0, 12) + '…' : searchTerm}"`,
                onRemove: onClearSearch,
            });
        }

        if (statusFilter) {
            result.push({
                key: 'status',
                label: poStatusLabels[statusFilter] || statusFilter,
                onRemove: onClearStatus,
            });
        }

        if ((dateFrom || dateTo) && onClearDate) {
            const from = dateFrom ? dayjs(dateFrom).format('DD/MM') : '';
            const to = dateTo ? dayjs(dateTo).format('DD/MM') : '';
            result.push({
                key: 'date',
                label: from && to ? `${from} - ${to}` : from || to,
                onRemove: onClearDate,
            });
        }

        return result;
    }, [searchTerm, statusFilter, dateFrom, dateTo, onClearSearch, onClearStatus, onClearDate]);

    if (chips.length === 0) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 scrollbar-hide">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                             bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300
                             border border-sky-200 dark:border-sky-800
                             active:scale-95 transition-all touch-manipulation whitespace-nowrap flex-shrink-0"
                >
                    {chip.label}
                    <X className="w-3 h-3" />
                </button>
            ))}
            {chips.length > 1 && (
                <button
                    onClick={onClearAll}
                    className="text-xs font-medium text-red-500 hover:text-red-600 active:scale-95
                             transition-all whitespace-nowrap flex-shrink-0 px-1"
                >
                    Clear all
                </button>
            )}
        </div>
    );
};

export default PurchaseOrderActiveFilterChips;
