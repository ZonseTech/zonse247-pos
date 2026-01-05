import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import dayjs from 'dayjs';
import { HiOutlineCalendarDateRange } from 'react-icons/hi2';

interface DateRangeFilterProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (dates: [Date | null, Date | null]) => void;
}

const DateFilterInput = forwardRef<HTMLButtonElement, any>(
    ({ value, onClick, className }, ref) => (
        <button
            className={`${className} flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200`}
            onClick={onClick}
            ref={ref}
        >
            <HiOutlineCalendarDateRange className="w-4 h-4" />
            <span>{value ? value : 'Select Date Range'}</span>
        </button>
    ),
);

DateFilterInput.displayName = 'DateFilterInput';

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    startDate,
    endDate,
    onChange,
}) => {
    const formatDateDisplay = () => {
        if (!startDate) return null;
        const startFormatted = dayjs(startDate).format('DD/MM/YYYY');
        const endFormatted = endDate ? ` - ${dayjs(endDate).format('DD/MM/YYYY')}` : '';
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
            customInput={<DateFilterInput value={formatDateDisplay()} />}
            isClearable
            placeholderText="Select date range"
        />
    );
};
