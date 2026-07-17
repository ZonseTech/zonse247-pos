import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft, CalendarRange } from 'lucide-react';
import { Calendar, DateRangePicker, RangeKeyDict, createStaticRanges } from 'react-date-range';
import { Box, Flex, IconButton } from '@radix-ui/themes';
import * as Popover from '@radix-ui/react-popover';
import classNames from 'classnames';
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
    align?: 'left' | 'right';
    /** Remove outer padding and border-y — use when embedded inside a sheet/card */
    compact?: boolean;
    /** 'single' shows a plain calendar and picks one day (start === end). Defaults to 'range'. */
    mode?: 'range' | 'single';
}

const MobileDateFilter: React.FC<MobileDateFilterProps> = ({
    startDate,
    endDate,
    onChange,
    align = 'left',
    compact = false,
    mode = 'range',
}) => {
    const isSingle = mode === 'single';
    const [showPicker, setShowPicker] = useState(false);
    const [dateRange, setDateRange] = useState<DateRange[]>([
        {
            startDate: startDate || new Date(),
            endDate: endDate || new Date(),
            key: 'selection',
        },
    ]);
    const [selectedDate, setSelectedDate] = useState<Date>(startDate || new Date());
    const isMobile = useIsMobile();

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

        const startFormatted = dayjs(startDate).format('D MMM, YYYY');

        if (isSingle) {
            const today = dayjs().format('D MMM, YYYY');
            const yesterday = dayjs().subtract(1, 'day').format('D MMM, YYYY');

            if (startFormatted === today) return 'Today';
            if (startFormatted === yesterday) return 'Yesterday';
            return startFormatted;
        }

        const endFormatted = endDate ? dayjs(endDate).format('D MMM, YYYY') : '';

        if (startFormatted === endFormatted) {
            const today = dayjs().format('D MMM, YYYY');
            const yesterday = dayjs().subtract(1, 'day').format('D MMM, YYYY');

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

    const handleSelectSingle = (date: Date): void => {
        setSelectedDate(date);
    };

    const handleApply = (): void => {
        if (isSingle) {
            onChange(selectedDate, selectedDate);
        } else {
            onChange(dateRange[0].startDate, dateRange[0].endDate);
        }
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
        setSelectedDate(startDate || new Date());
        setShowPicker(false);
    };

    const handlePrevDate = (): void => {
        if (isSingle) {
            if (!startDate) return;
            const newDate = dayjs(startDate).subtract(1, 'day').toDate();
            setSelectedDate(newDate);
            onChange(newDate, newDate);
            return;
        }

        if (!startDate || !endDate) return;

        const daysDiff = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;
        const newStart = dayjs(startDate).subtract(daysDiff, 'day').toDate();
        const newEnd = dayjs(endDate).subtract(daysDiff, 'day').toDate();

        setDateRange([{ startDate: newStart, endDate: newEnd, key: 'selection' }]);
        onChange(newStart, newEnd);
    };

    const handleNextDate = (): void => {
        if (isSingle) {
            if (!startDate) return;
            const newDate = dayjs(startDate).add(1, 'day').toDate();
            if (dayjs(newDate).isAfter(dayjs(), 'day')) return;
            setSelectedDate(newDate);
            onChange(newDate, newDate);
            return;
        }

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

    const pickerHeader = (
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <button
                type="button"
                className="px-2 py-1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                onClick={handleCancel}
            >
                Cancel
            </button>
            <span className={classNames(
                'font-bold text-zinc-900 dark:text-zinc-100',
                isMobile ? 'text-base' : 'text-sm',
            )}>
                {isSingle ? 'Select Date' : 'Select Date Range'}
            </span>
            <button
                type="button"
                className="px-2 py-1 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 rounded transition-colors"
                onClick={handleApply}
            >
                Apply
            </button>
        </div>
    );

    return (
        <Box width={{ initial: '100%', md: 'auto' }} py={compact ? '0' : '2'}>
            <Flex
                align="center"
                justify="between"
                width="100%"
                className={classNames(
                    'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
                    compact ? 'border rounded-lg' : 'border-y md:border md:rounded-lg',
                )}
            >
                <IconButton
                    variant="ghost"
                    size={{ initial: '3', md: '2' }}
                    onClick={handlePrevDate}
                    aria-label="Previous date"
                >
                    <ChevronLeft size={18} />
                </IconButton>

                {isMobile ? (
                    <Flex
                        asChild
                        align="center"
                        justify="center"
                        gap="2"
                        flexGrow="1"
                        py="3"
                    >
                        <button onClick={() => setShowPicker(true)}>
                            <CalendarRange size={18} className="text-cyan-500 dark:text-cyan-400" />
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                {getDisplayText()}
                            </span>
                        </button>
                    </Flex>
                ) : (
                    <Popover.Root open={showPicker} onOpenChange={setShowPicker}>
                        <Popover.Trigger asChild>
                            <Flex
                                asChild
                                align="center"
                                justify="center"
                                gap="2"
                                flexGrow="1"
                                py="1"
                                px="4"
                                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors rounded"
                            >
                                <button type="button">
                                    <CalendarRange size={18} className="text-cyan-500 dark:text-cyan-400" />
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                                        {getDisplayText()}
                                    </span>
                                </button>
                            </Flex>
                        </Popover.Trigger>
                        <Popover.Portal>
                            <Popover.Content
                                side="bottom"
                                align={align === 'right' ? 'end' : 'start'}
                                sideOffset={8}
                                className={classNames(
                                    'bg-white dark:bg-zinc-800 rounded-lg shadow-2xl',
                                    'border border-zinc-200 dark:border-zinc-700 overflow-hidden',
                                    'z-[9999]',
                                    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                                )}
                            >
                                {pickerHeader}
                                <Box className="date-range-picker-desktop text-zinc-900 dark:text-zinc-300">
                                    {isSingle ? (
                                        <Calendar
                                            onChange={handleSelectSingle}
                                            date={selectedDate}
                                            color="#0ea5e9"
                                            maxDate={new Date()}
                                        />
                                    ) : (
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
                                    )}
                                </Box>
                            </Popover.Content>
                        </Popover.Portal>
                    </Popover.Root>
                )}

                <IconButton
                    variant="ghost"
                    size={{ initial: '3', md: '2' }}
                    onClick={handleNextDate}
                    aria-label="Next date"
                    disabled={isNextDisabled}
                >
                    <ChevronRight size={18} />
                </IconButton>
            </Flex>

            {showPicker && isMobile && (
                <Flex
                    position="fixed"
                    inset="0"
                    align="end"
                    justify="center"
                    className="z-[9999] bg-black/50"
                    onClick={handleCancel}
                >
                    <Box
                        className="bg-white dark:bg-zinc-800 rounded-t-xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <Flex justify="center" pt="2" pb="0">
                            <Box className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                        </Flex>
                        {pickerHeader}
                        <Box className="overflow-auto max-h-[calc(90vh-80px)] date-range-picker-mobile text-zinc-900 dark:text-zinc-300">
                            {isSingle ? (
                                <Calendar
                                    onChange={handleSelectSingle}
                                    date={selectedDate}
                                    color="#0ea5e9"
                                    maxDate={new Date()}
                                />
                            ) : (
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
                            )}
                        </Box>
                    </Box>
                </Flex>
            )}
        </Box>
    );
};

export default MobileDateFilter;
