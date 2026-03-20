import React, { useState, useMemo, useRef } from 'react';
import { HiChevronRight, HiChevronLeft } from 'react-icons/hi';
import { HiOutlineCalendarDateRange } from 'react-icons/hi2';
import { DateRangePicker, RangeKeyDict, createStaticRanges } from 'react-date-range';
import dayjs from 'dayjs';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './MobileDateFilter.css';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface DateRange {
    startDate: Date;
    endDate: Date;
    key: string;
}

interface MobileDateFilterProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (start: Date | null, end: Date | null) => void;
}

const MobileDateFilter: React.FC<MobileDateFilterProps> = ({
    startDate,
    endDate,
    onChange,
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange[]>([
        {
            startDate: startDate || new Date(),
            endDate: endDate || new Date(),
            key: 'selection',
        },
    ]);
    const isMobile = useIsMobile();
    const pickerRef = useRef<HTMLDivElement>(null);

    const staticRanges = useMemo(() => createStaticRanges([
        {
            label: 'Today',
            range: () => ({
                startDate: dayjs().startOf('day').toDate(),
                endDate: dayjs().endOf('day').toDate(),
            }),
        },
        {
            label: 'Yesterday',
            range: () => ({
                startDate: dayjs().subtract(1, 'day').startOf('day').toDate(),
                endDate: dayjs().subtract(1, 'day').endOf('day').toDate(),
            }),
        },
        {
            label: 'This Week',
            range: () => ({
                startDate: dayjs().startOf('week').toDate(),
                endDate: dayjs().endOf('day').toDate(),
            }),
        },
        {
            label: 'Last Week',
            range: () => ({
                startDate: dayjs().subtract(1, 'week').startOf('week').toDate(),
                endDate: dayjs().subtract(1, 'week').endOf('week').toDate(),
            }),
        },
        {
            label: 'This Month',
            range: () => ({
                startDate: dayjs().startOf('month').toDate(),
                endDate: dayjs().endOf('day').toDate(),
            }),
        },
        {
            label: 'Last Month',
            range: () => ({
                startDate: dayjs().subtract(1, 'month').startOf('month').toDate(),
                endDate: dayjs().subtract(1, 'month').endOf('month').toDate(),
            }),
        },
        {
            label: 'This Year',
            range: () => ({
                startDate: dayjs().startOf('year').toDate(),
                endDate: dayjs().endOf('day').toDate(),
            }),
        },
        {
            label: 'Last Year',
            range: () => ({
                startDate: dayjs().subtract(1, 'year').startOf('year').toDate(),
                endDate: dayjs().subtract(1, 'year').endOf('year').toDate(),
            }),
        },
    ]), []);

    const getDisplayText = (): string => {
        if (!startDate) return 'Select Date';

        const startFormatted = dayjs(startDate).format('DD/MM/YYYY');
        const endFormatted = endDate ? dayjs(endDate).format('DD/MM/YYYY') : '';

        if (startFormatted === endFormatted) {
            const today = dayjs().format('DD/MM/YYYY');
            const yesterday = dayjs().subtract(1, 'day').format('DD/MM/YYYY');

            if (startFormatted === today) return 'Today';
            if (startFormatted === yesterday) return 'Yesterday';
        }

        return endFormatted && startFormatted !== endFormatted
            ? `${startFormatted} - ${endFormatted}`
            : startFormatted;
    };

    const handleSelect = (ranges: RangeKeyDict): void => {
        const selection = ranges.selection;
        if (selection) {
            setDateRange([
                {
                    startDate: selection.startDate || new Date(),
                    endDate: selection.endDate || new Date(),
                    key: 'selection',
                },
            ]);
        }
    };

    const handleApply = (): void => {
        onChange(dateRange[0].startDate, dateRange[0].endDate);
        setShowPicker(false);
    };

    const handleCancel = (): void => {
        setDateRange([
            {
                startDate: startDate || new Date(),
                endDate: endDate || new Date(),
                key: 'selection',
            },
        ]);
        setShowPicker(false);
    };

    const handlePrevDate = (): void => {
        if (!startDate || !endDate) return;

        const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
        const newStart = dayjs(startDate).subtract(daysDiff, 'day').toDate();
        const newEnd = dayjs(endDate).subtract(daysDiff, 'day').toDate();

        setDateRange([{ startDate: newStart, endDate: newEnd, key: 'selection' }]);
        onChange(newStart, newEnd);
    };

    const handleNextDate = (): void => {
        if (!startDate || !endDate) return;

        const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
        const newStart = dayjs(startDate).add(daysDiff, 'day').toDate();
        const newEnd = dayjs(endDate).add(daysDiff, 'day').toDate();

        if (dayjs(newEnd).isAfter(dayjs(), 'day')) return;

        setDateRange([{ startDate: newStart, endDate: newEnd, key: 'selection' }]);
        onChange(newStart, newEnd);
    };

    const isNextDisabled = endDate
        ? dayjs(endDate).isSame(dayjs(), 'day') || dayjs(endDate).isAfter(dayjs(), 'day')
        : false;

    return (
        <div className="relative w-full md:w-auto px-0 py-2" ref={pickerRef}>
            <div className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border-y md:border md:rounded-lg border-gray-200 dark:border-gray-700">
                <button
                    onClick={handlePrevDate}
                    className="p-4 md:p-2 active:scale-95 transition-transform"
                    aria-label="Previous date"
                >
                    <HiChevronLeft className="w-5 h-5 md:w-4 md:h-4 text-sky-500 dark:text-sky-400" />
                </button>

                <button
                    onClick={() => setShowPicker(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 md:py-2 md:px-4"
                >
                    <HiOutlineCalendarDateRange className="w-5 h-5 md:w-4 md:h-4 text-sky-500 dark:text-sky-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getDisplayText()}
                    </span>
                </button>

                <button
                    onClick={handleNextDate}
                    className="p-4 md:p-2 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                    aria-label="Next date"
                    disabled={isNextDisabled}
                >
                    <HiChevronRight className="w-5 h-5 md:w-4 md:h-4 text-sky-500 dark:text-sky-400" />
                </button>
            </div>

            {showPicker && isMobile && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-sm w-full max-h-[90vh] overflow-hidden animate-slide-up">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleCancel}
                                className="text-sm font-medium text-gray-500 dark:text-gray-400"
                            >
                                Cancel
                            </button>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Select Date Range
                            </h3>
                            <button
                                onClick={handleApply}
                                className="text-sm font-medium text-sky-500 dark:text-sky-400"
                            >
                                Apply
                            </button>
                        </div>
                        <div className="overflow-auto max-h-[calc(90vh-60px)] date-range-picker-mobile">
                            <DateRangePicker
                                onChange={handleSelect}
                                moveRangeOnFirstSelection={false}
                                months={1}
                                ranges={dateRange}
                                direction="vertical"
                                staticRanges={staticRanges}
                                inputRanges={[]}
                                rangeColors={['#0ea5e9']}
                                maxDate={new Date()}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showPicker && !isMobile && (
                <div className="fixed inset-0 z-[9999]" onClick={handleCancel}>
                    <div
                        className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{
                            top: pickerRef.current?.getBoundingClientRect().bottom ?? 0 + 8,
                            right: window.innerWidth - (pickerRef.current?.getBoundingClientRect().right ?? 0),
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleCancel}
                                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            >
                                Cancel
                            </button>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Select Date Range
                            </h3>
                            <button
                                onClick={handleApply}
                                className="text-sm font-medium text-sky-500 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300"
                            >
                                Apply
                            </button>
                        </div>
                        <div className="date-range-picker-desktop">
                            <DateRangePicker
                                onChange={handleSelect}
                                moveRangeOnFirstSelection={false}
                                months={2}
                                ranges={dateRange}
                                direction="horizontal"
                                staticRanges={staticRanges}
                                inputRanges={[]}
                                rangeColors={['#0ea5e9']}
                                maxDate={new Date()}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileDateFilter;
