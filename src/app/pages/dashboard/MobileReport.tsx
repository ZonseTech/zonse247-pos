import React, { useState, useCallback } from 'react';
import { HiShare } from 'react-icons/hi';

import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import { formatCurrency } from '../../utils';

import { MobileDateFilter, ReportCard, ReportCardProps } from './components';

// Types
interface ReportData extends Omit<ReportCardProps, 'onClick'> {
    id: string;
}

// Helper function to generate report data
const generateReportData = (): ReportData[] => [
    {
        id: 'total-sales',
        name: 'Total Sales',
        value: formatCurrency(1250000, true),
        description: 'Revenue from all transactions',
    },
    {
        id: 'gross-profit',
        name: 'Gross Profit',
        value: formatCurrency(450000, true),
        description: 'Selling price minus cost price',
    },
    {
        id: 'top-stocks',
        name: 'Top Stocks',
        value: '24 items',
        description: 'Best performing inventory items',
    },
    {
        id: 'top-category',
        name: 'Top Category',
        value: 'Electronics',
        description: 'Highest selling category',
    },
    {
        id: 'receipt-count',
        name: 'Total Receipt Count',
        value: '156',
        description: 'Number of completed transactions',
    },
    {
        id: 'payment-modes',
        name: 'Payment Modes',
        value: '4 methods',
        description: 'Cash, E-Pay, Bank, Split payments',
    },
];

const MobileReport: React.FC = () => {
    // State
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    // Data
    const reportData = generateReportData();

    // Handlers
    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
        // TODO: Fetch report data based on date range
    }, []);

    const handleShare = useCallback(async (): Promise<void> => {
        if (!navigator.share) return;

        try {
            await navigator.share({
                title: 'Report',
                text: 'Check out this report',
                url: window.location.href,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, []);

    const handleCardClick = useCallback((id: string): void => {
        // TODO: Navigate to detailed view for each report item
        console.log(`Clicked on report: ${id}`);
    }, []);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader
                    rightContent={
                        <HiShare
                            className="w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform"
                            onClick={handleShare}
                        />
                    }
                />
            </div>


            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">

                <MobileDateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                />

                <div className='h-full overflow-y-auto pb-20 space-y-2 px-4'>
                    {reportData.map((item) => (
                        <ReportCard
                            key={item.id}
                            name={item.name}
                            value={item.value}
                            description={item.description}
                            onClick={() => handleCardClick(item.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileReport;