import React, { useState, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, CalendarRange } from 'lucide-react';
import { DateRangePicker, RangeKeyDict, createStaticRanges } from 'react-date-range';
import { Box, Flex, Text, IconButton, Button } from '@radix-ui/themes';
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
}

const MobileDateFilter: React.FC<MobileDateFilterProps> = ({
    startDate,
    endDate,
    onChange,
    align = 'left',
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

        const startFormatted = dayjs(startDate).format('D MMM, YYYY');
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
        <Box position="relative" width={{ initial: '100%', md: 'auto' }} py="2" ref={pickerRef}>
            <Flex
                align="center"
                justify="between"
                width="100%"
                className="bg-white dark:bg-gray-800 border-y md:border md:rounded-lg border-gray-200 dark:border-gray-700"
            >
                <IconButton
                    variant="ghost"
                    color="sky"
                    size={{ initial: '3', md: '2' }}
                    onClick={handlePrevDate}
                    aria-label="Previous date"
                >
                    <ChevronLeft size={18} />
                </IconButton>

                <Flex asChild align="center" justify="center" gap="2" flexGrow="1" py={{ initial: '3', md: '1' }} px={{ initial: '0', md: '4' }}>
                    <button onClick={() => setShowPicker(true)}>
                        <CalendarRange size={18} className="text-sky-500 dark:text-sky-400" />
                        <Text size="2" weight="medium">
                            {getDisplayText()}
                        </Text>
                    </button>
                </Flex>

                <IconButton
                    variant="ghost"
                    color="sky"
                    size={{ initial: '3', md: '2' }}
                    onClick={handleNextDate}
                    aria-label="Next date"
                    disabled={isNextDisabled}
                >
                    <ChevronRight size={18} />
                </IconButton>
            </Flex>

            {showPicker && isMobile && (
                <Box position="fixed" inset="0" className="z-[9999] flex items-end justify-center bg-black/50">
                    <Box className="bg-white dark:bg-gray-800 rounded-sm w-full max-h-[90vh] overflow-hidden animate-slide-up">
                        <Flex justify="between" align="center" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                            <Button variant="ghost" color="gray" size="2" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Text size="3" weight="bold">Select Date Range</Text>
                            <Button variant="ghost" color="sky" size="2" onClick={handleApply}>
                                Apply
                            </Button>
                        </Flex>
                        <Box className="overflow-auto max-h-[calc(90vh-60px)] date-range-picker-mobile">
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
                        </Box>
                    </Box>
                </Box>
            )}

            {showPicker && !isMobile && (
                <Box position="fixed" inset="0" className="z-[9999]" onClick={handleCancel}>
                    <Box
                        position="absolute"
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        style={{
                            top: (pickerRef.current?.getBoundingClientRect().bottom ?? 0) + 8,
                            ...(align === 'right'
                                ? { right: Math.max(8, window.innerWidth - (pickerRef.current?.getBoundingClientRect().right ?? 0)) }
                                : { left: Math.max(8, pickerRef.current?.getBoundingClientRect().left ?? 0) }),
                        }}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <Flex justify="between" align="center" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                            <Button variant="ghost" color="gray" size="2" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Text size="2" weight="bold">Select Date Range</Text>
                            <Button variant="ghost" color="sky" size="2" onClick={handleApply}>
                                Apply
                            </Button>
                        </Flex>
                        <Box className="date-range-picker-desktop">
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
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default MobileDateFilter;
