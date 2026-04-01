import { FC, useCallback } from "react";
import { CheckCircle, Clock, PackageX, RotateCcw, X } from "lucide-react";
import BottomSheet from "../../../components/BottomSheet";

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

const statusOptions: Array<{
    value: RestockFilter;
    label: string;
    icon: FC<{ className?: string }>;
    color: string;
    activeColor: string;
}> = [
        { value: "all", label: "All Statuses", icon: RotateCcw, color: "text-gray-500", activeColor: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700" },
        { value: "pending-restock", label: "Pending Restock", icon: Clock, color: "text-yellow-500", activeColor: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700" },
        { value: "restocked", label: "Restocked", icon: CheckCircle, color: "text-green-500", activeColor: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700" },
        { value: "damaged", label: "Damaged", icon: PackageX, color: "text-red-500", activeColor: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700" },
    ];

interface ReturnsFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedStatus: RestockFilter;
    onStatusChange: (status: RestockFilter) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const ReturnsFilterSheet: FC<ReturnsFilterSheetProps> = ({
    isOpen,
    onClose,
    selectedStatus,
    onStatusChange,
    hasActiveFilters,
    onClearFilters,
}) => {
    const handleClearAll = useCallback(() => {
        onClearFilters();
        onClose();
    }, [onClearFilters, onClose]);

    const handleApply = useCallback(() => {
        onClose();
    }, [onClose]);

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
                {/* Restock Status */}
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Restock Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = selectedStatus === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onStatusChange(option.value)}
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

                {/* Apply Button */}
                <button
                    onClick={handleApply}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold text-sm
                             transition-colors active:scale-[0.98] touch-manipulation shadow-sm"
                >
                    Apply Filters
                </button>
            </div>
        </BottomSheet>
    );
};

export default ReturnsFilterSheet;
