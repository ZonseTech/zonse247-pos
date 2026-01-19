import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import { HiOutlineCalendarDateRange } from 'react-icons/hi2';

interface DateRangeFilterProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
    compact?: boolean;
}

const DateFilterInput = forwardRef<HTMLButtonElement, any>(
    ({ value, onClick, className, compact }, ref) => (
        <button
            className={`${className} flex items-center gap-${compact ? '1' : '2'} px-${compact ? '2' : '4'} py-${compact ? '1' : '2'} bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-${compact ? 'md' : 'lg'} hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-${compact ? 'xs' : 'sm'} font-medium text-gray-700 dark:text-gray-200`}
            onClick={onClick}
            ref={ref}
        >
            <HiOutlineCalendarDateRange className={compact ? "w-3 h-3" : "w-4 h-4"} />
            <span>{value ? value : (compact ? 'Date' : 'Select Date Range')}</span>
        </button>
    ),
);

DateFilterInput.displayName = 'DateFilterInput';

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    startDate,
    endDate,
    onChange,
    compact = false,
}) => {
    const formatDateDisplay = () => {
        if (!startDate) return null;
        const startFormatted = dayjs(startDate).format(compact ? 'DD/MM' : 'DD/MM/YYYY');
        const endFormatted = endDate ? ` - ${dayjs(endDate).format(compact ? 'DD/MM' : 'DD/MM/YYYY')}` : '';
        return `${startFormatted}${endFormatted}`;
    };

    return (
        <DatePicker
            selected={startDate}
            onChange={(dates) => {
                const [start, end] = dates as [Date | null, Date | null];
                onChange([start, end]);
            }}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            dateFormat='dd/MM/yyyy'
            withPortal
            customInput={<DateFilterInput value={formatDateDisplay()} compact={compact} />}
            isClearable
            placeholderText="Select date range"
        />
    );
};
