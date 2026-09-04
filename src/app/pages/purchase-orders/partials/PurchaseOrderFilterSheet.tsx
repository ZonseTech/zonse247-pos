import { FC, useCallback } from 'react';
import {
    ShoppingCart, FileText, Clock, Send, Truck, CheckCircle, PackageCheck, XCircle, X,
} from 'lucide-react';
import BottomSheet from '../../../components/BottomSheet';
import MobileDateFilter from '../../../components/reports/MobileDateFilter';

const statusOptions: Array<{
    value: string;
    label: string;
    icon: FC<{ className?: string }>;
    color: string;
    activeColor: string;
}> = [
        { value: 'all', label: 'All Orders', icon: ShoppingCart, color: 'text-gray-500', activeColor: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700' },
        { value: 'DRAFT', label: 'Draft', icon: FileText, color: 'text-gray-500', activeColor: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600' },
        { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-amber-500', activeColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700' },
        { value: 'SENT', label: 'Sent', icon: Send, color: 'text-indigo-500', activeColor: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700' },
        { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'text-blue-500', activeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
        { value: 'PARTIALLY_RECEIVED', label: 'Partial', icon: PackageCheck, color: 'text-cyan-500', activeColor: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700' },
        { value: 'RECEIVED', label: 'Received', icon: CheckCircle, color: 'text-emerald-500', activeColor: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
        { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'text-red-500', activeColor: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700' },
    ];

export const poStatusLabels: Record<string, string> = Object.fromEntries(
    statusOptions.filter(o => o.value !== 'all').map(o => [o.value, o.label])
);

interface PurchaseOrderFilterSheetProps {
    isOpen: boolean;
    onClose: () => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    dateFrom?: string;
    dateTo?: string;
    onDateChange?: (start: Date | null, end: Date | null) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

const PurchaseOrderFilterSheet: FC<PurchaseOrderFilterSheetProps> = ({
    isOpen,
    onClose,
    statusFilter,
    onStatusChange,
    dateFrom,
    dateTo,
    onDateChange,
    hasActiveFilters,
    onClearFilters,
}) => {
    const handleClearAll = useCallback(() => {
        onClearFilters();
        onClose();
    }, [onClearFilters, onClose]);

    const activeStatus = statusFilter || 'all';

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
                <section>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Order Status
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {statusOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = activeStatus === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onStatusChange(option.value === 'all' ? '' : option.value)}
                                    className={`
                                        flex items-center gap-2.5 px-3 py-3 rounded-xl border text-sm font-medium
                                        transition-all active:scale-[0.97] touch-manipulation
                                        ${isSelected
                                            ? option.activeColor
                                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }
                                    `}
                                >
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? '' : option.color}`} />
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && option.value !== 'all' && (
                                        <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {onDateChange && (
                    <section>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Order Date
                        </h4>
                        <MobileDateFilter
                            startDate={dateFrom ? new Date(dateFrom) : null}
                            endDate={dateTo ? new Date(dateTo) : null}
                            onChange={onDateChange}
                            compact
                        />
                    </section>
                )}

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

export default PurchaseOrderFilterSheet;
