import { FC, useMemo, useCallback } from "react";
import { X, CalendarRange, CheckCircle, Wallet } from "lucide-react";
import dayjs from "dayjs";

interface ActiveFilterChipsProps {
    searchTerm: string;
    startDate: Date | null;
    endDate: Date | null;
    selectedStatus: SaleStatus | TransactionStatus | "all";
    selectedPaymentMethod: string | "all";
    paymentMethods: PaymentMethod[];
    onClearSearch: () => void;
    onClearDate: () => void;
    onClearStatus: () => void;
    onClearPaymentMethod: () => void;
    onClearAll: () => void;
}

interface FilterChip {
    key: string;
    label: string;
    onRemove: () => void;
}

const ActiveFilterChips: FC<ActiveFilterChipsProps> = ({
    searchTerm,
    startDate,
    endDate,
    selectedStatus,
    selectedPaymentMethod,
    paymentMethods,
    onClearSearch,
    onClearDate,
    onClearStatus,
    onClearPaymentMethod,
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

        if (startDate) {
            const start = dayjs(startDate).format("DD MMM");
            const end = endDate ? dayjs(endDate).format("DD MMM") : start;
            result.push({
                key: "date",
                label: start === end ? start : `${start} – ${end}`,
                onRemove: onClearDate,
            });
        }

        if (selectedStatus !== "all") {
            result.push({
                key: "status",
                label: selectedStatus.charAt(0) + selectedStatus.slice(1).toLowerCase(),
                onRemove: onClearStatus,
            });
        }

        if (selectedPaymentMethod !== "all") {
            const method = paymentMethods.find(m => m.methodId === selectedPaymentMethod);
            result.push({
                key: "payment",
                label: method?.name || selectedPaymentMethod,
                onRemove: onClearPaymentMethod,
            });
        }

        return result;
    }, [searchTerm, startDate, endDate, selectedStatus, selectedPaymentMethod, paymentMethods, onClearSearch, onClearDate, onClearStatus, onClearPaymentMethod]);

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

export default ActiveFilterChips;
