import { FC, useCallback, useState, useMemo } from "react";
import {
    Package, PackageCheck, PackageX, TrendingDown, Clock, AlertTriangle,
    CheckCircle, X, Search, Check,
} from "lucide-react";
import BottomSheet from "../../../components/BottomSheet";
import MobileDateFilter from "../../../components/reports/MobileDateFilter";

const statusOptions: Array<{
    value: string;
    label: string;
    icon: FC<{ className?: string }>;
    color: string;
    activeColor: string;
}> = [
        { value: "all", label: "All Items", icon: Package, color: "text-gray-500", activeColor: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700" },
        { value: "in-stock", label: "In Stock", icon: PackageCheck, color: "text-green-500", activeColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
        { value: "low-stock", label: "Low Stock", icon: TrendingDown, color: "text-yellow-500", activeColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
        { value: "out-of-stock", label: "Out of Stock", icon: PackageX, color: "text-red-500", activeColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
        { value: "expiring-soon", label: "Expiring Soon", icon: Clock, color: "text-orange-500", activeColor: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700" },
        { value: "expired", label: "Expired", icon: AlertTriangle, color: "text-red-500", activeColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
    ];

interface InventoryFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    // Stock status
    activeFilter: string;
    onFilterChange: (status: string) => void;
    // Category
    categoryId?: string;
    onCategoryChange: (categoryId: string) => void;
    categories: Category[];
    // Date
    startDate: string;
    endDate: string;
    onDateChange: (start: Date | null, end: Date | null) => void;
    // Clear
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const InventoryFilterSheet: FC<InventoryFilterSheetProps> = ({
    isOpen,
    onClose,
    activeFilter,
    onFilterChange,
    categoryId,
    onCategoryChange,
    categories,
    startDate,
    endDate,
    onDateChange,
    hasActiveFilters,
    onClearFilters,
}) => {
    const [categorySearch, setCategorySearch] = useState("");

    const filteredCategories = useMemo(() => {
        if (!categorySearch.trim()) return categories;
        const q = categorySearch.toLowerCase();
        return categories.filter(c => (c.name as string).toLowerCase().includes(q));
    }, [categories, categorySearch]);

    const handleDateChange = useCallback(
        (start: Date | null, end: Date | null) => {
            onDateChange(start, end);
        },
        [onDateChange],
    );

    const handleClearAll = useCallback(() => {
        onClearFilters();
        onClose();
    }, [onClearFilters, onClose]);

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title="Filters"
            rightContent={
                hasActiveFilters ? (
                    <button
                        onClick={handleClearAll}
                        className="text-sm font-medium text-red-500 hover:text-red-600 active:scale-95 transition-all px-2 py-1"
                    >
                        Clear all
                    </button>
                ) : (
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )
            }
        >
            <div className="space-y-6 pb-4">
                {/* Date Range */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Date Range
                    </h4>
                    <MobileDateFilter
                        startDate={startDate ? new Date(startDate) : null}
                        endDate={endDate ? new Date(endDate) : null}
                        onChange={handleDateChange}
                        align="left"
                        compact
                    />
                </section>

                {/* Stock Status */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Stock Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = activeFilter === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onFilterChange(option.value)}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium
                                        transition-all active:scale-[0.97] touch-manipulation
                                        ${isSelected
                                            ? option.activeColor
                                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "" : option.color}`} />
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && option.value !== "all" && (
                                        <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Category */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Category
                    </h4>

                    {/* Search — only show when there are enough categories */}
                    {categories.length > 6 && (
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400
                                         transition-colors"
                            />
                            {categorySearch && (
                                <button
                                    onClick={() => setCategorySearch("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}

                    <div className="max-h-52 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700/50">
                        {/* All Categories option */}
                        {!categorySearch && (
                            <button
                                onClick={() => onCategoryChange("all")}
                                className={`
                                    flex items-center justify-between w-full px-3 py-2.5 text-sm
                                    transition-colors active:bg-gray-100 dark:active:bg-gray-700 touch-manipulation
                                    ${!categoryId || categoryId === "all"
                                        ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-medium"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }
                                `}
                            >
                                <span>All Categories</span>
                                {(!categoryId || categoryId === "all") && (
                                    <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                )}
                            </button>
                        )}

                        {filteredCategories.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                                No categories match &ldquo;{categorySearch}&rdquo;
                            </div>
                        ) : (
                            filteredCategories.map((category) => {
                                const isSelected = categoryId === category.categoryId;
                                return (
                                    <button
                                        key={category.categoryId}
                                        onClick={() => onCategoryChange(category.categoryId)}
                                        className={`
                                            flex items-center justify-between w-full px-3 py-2.5 text-sm
                                            transition-colors active:bg-gray-100 dark:active:bg-gray-700 touch-manipulation
                                            ${isSelected
                                                ? "bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 font-medium"
                                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }
                                        `}
                                    >
                                        <span className="truncate">{category.name as string}</span>
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-sky-500 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* Apply Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm
                             transition-colors active:scale-[0.98] touch-manipulation shadow-sm"
                >
                    Apply Filters
                </button>
            </div>
        </BottomSheet>
    );
};

export default InventoryFilterSheet;
