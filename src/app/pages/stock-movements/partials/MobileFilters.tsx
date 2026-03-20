import { FC, useState, useRef, useEffect } from 'react';
import { Filter, X, Calendar, ChevronDown, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import classNames from 'classnames';

interface MobileFiltersProps {
    movementTypeFilter: StockMovementType | '';
    onMovementTypeChange: (value: StockMovementType | '') => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

const movementTypes: { value: StockMovementType | ''; label: string; color: string }[] = [
    { value: '', label: 'All Types', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'PURCHASE_RECEIPT', label: 'Purchase Receipt', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'SALE', label: 'Sale', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'RETURN', label: 'Return', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
    { value: 'ADJUSTMENT', label: 'Adjustment', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    { value: 'TRANSFER_IN', label: 'Transfer In', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
    { value: 'TRANSFER_OUT', label: 'Transfer Out', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400' },
    { value: 'DAMAGE', label: 'Damage', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    { value: 'EXPIRY', label: 'Expiry', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    { value: 'OPENING_BALANCE', label: 'Opening Balance', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
    { value: 'RETURN_TO_SUPPLIER', label: 'Return to Supplier', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
];

const MobileFilters: FC<MobileFiltersProps> = ({
    movementTypeFilter,
    onMovementTypeChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeFiltersCount = [
        movementTypeFilter !== '',
        startDate !== '',
        endDate !== '',
    ].filter(Boolean).length;

    const selectedType = movementTypes.find(t => t.value === movementTypeFilter) || movementTypes[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleClearAll = () => {
        onMovementTypeChange('');
        onStartDateChange('');
        onEndDateChange('');
    };

    return (
        <>
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm active:scale-95 transition-all"
            >
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
                {activeFiltersCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Filter Modal/Sheet */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Sheet */}
                    <div className="relative w-full bg-white dark:bg-gray-800 rounded-t-3xl max-h-[85vh] overflow-hidden animate-slide-up">
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Filter Movements
                            </h2>
                            <div className="flex items-center gap-2">
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="text-sm text-sky-500 font-medium"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 -mr-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Filter Content */}
                        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                            {/* Movement Type Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Movement Type
                                </label>
                                <div ref={dropdownRef} className="relative">
                                    <button
                                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={classNames(
                                                'px-2 py-0.5 rounded-full text-xs font-medium',
                                                selectedType.color
                                            )}>
                                                {selectedType.label}
                                            </span>
                                        </div>
                                        <ChevronDown className={classNames(
                                            'w-5 h-5 text-gray-500 transition-transform',
                                            isTypeDropdownOpen && 'rotate-180'
                                        )} />
                                    </button>

                                    {isTypeDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                                            {movementTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    onClick={() => {
                                                        onMovementTypeChange(type.value);
                                                        setIsTypeDropdownOpen(false);
                                                    }}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <span className={classNames(
                                                        'px-2 py-0.5 rounded-full text-xs font-medium',
                                                        type.color
                                                    )}>
                                                        {type.label}
                                                    </span>
                                                    {movementTypeFilter === type.value && (
                                                        <Check className="w-4 h-4 text-sky-500" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Date Range Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <DatePicker
                                            selected={startDate ? new Date(startDate) : null}
                                            onChange={((date: Date | null) =>
                                                onStartDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                                            ) as any}
                                            dateFormat="MMM d, yyyy"
                                            placeholderText="Start Date"
                                            isClearable
                                            className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm"
                                            portalId="datepicker-portal"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="relative">
                                        <DatePicker
                                            selected={endDate ? new Date(endDate) : null}
                                            onChange={((date: Date | null) =>
                                                onEndDateChange(date ? dayjs(date).format('YYYY-MM-DD') : '')
                                            ) as any}
                                            dateFormat="MMM d, yyyy"
                                            placeholderText="End Date"
                                            isClearable
                                            minDate={startDate ? new Date(startDate) : undefined}
                                            className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm"
                                            portalId="datepicker-portal"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Date Presets */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Quick Select
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: 'Today', days: 0 },
                                        { label: 'Last 7 Days', days: 7 },
                                        { label: 'Last 30 Days', days: 30 },
                                        { label: 'Last 90 Days', days: 90 },
                                    ].map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => {
                                                const end = dayjs().format('YYYY-MM-DD');
                                                const start = dayjs().subtract(preset.days, 'day').format('YYYY-MM-DD');
                                                onStartDateChange(start);
                                                onEndDateChange(end);
                                            }}
                                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default MobileFilters;
