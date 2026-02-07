import { HiShare } from 'react-icons/hi';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../../utils';
import { ROUTES } from '../../utils/constants';
import React, { useState, useCallback, useMemo } from 'react';
import { MobileDateFilter, ReportCard, ReportCardProps } from '../dashboard/components';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import { useReportSummary } from '../../hooks/useReportSummary';
import LoadingState from '../../components/loader/LoadingState';

interface ReportData extends Omit<ReportCardProps, 'onClick'> {
    id: string;
    route: string;
}

const MobileReport: React.FC = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());

    const { summary, isLoading, refetch } = useReportSummary({
        startDate,
        endDate,
        autoFetch: true,
    });

    const reportData: ReportData[] = useMemo(() => [
        {
            id: 'total-sales',
            name: 'Total Sales',
            value: formatCurrency(summary?.totalSales ?? 0, true),
            description: 'Revenue from all transactions',
            route: ROUTES.MOBILE_REPORT_TOTAL_SALES,
        },
        {
            id: 'gross-profit',
            name: 'Gross Profit',
            value: formatCurrency(summary?.grossProfit ?? 0, true),
            description: 'Selling price minus cost price',
            route: ROUTES.MOBILE_REPORT_GROSS_PROFIT,
        },
        {
            id: 'top-stocks',
            name: 'Top Stocks',
            value: `${summary?.topStocks ?? 0} items`,
            description: 'Best performing inventory items',
            route: ROUTES.MOBILE_REPORT_TOP_STOCKS,
        },
        {
            id: 'top-category',
            name: 'Top Category',
            value: summary?.topCategory || 'N/A',
            description: 'Highest selling category',
            route: ROUTES.MOBILE_REPORT_TOP_CATEGORY,
        },
        {
            id: 'receipt-count',
            name: 'Total Receipt Count',
            value: String(summary?.receiptCount ?? 0),
            description: 'Number of completed transactions',
            route: ROUTES.MOBILE_REPORT_RECEIPT_COUNT,
        },
        {
            id: 'payment-modes',
            name: 'Payment Modes',
            value: `${summary?.paymentModes ?? 0} methods`,
            description: 'Cash, E-Pay, Bank, Split payments',
            route: ROUTES.MOBILE_REPORT_PAYMENT_MODES,
        },
    ], [summary]);

    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
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

    const handleCardClick = useCallback((route: string): void => {
        navigate(route);
    }, [navigate]);

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
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingState />
                        </div>
                    ) : (
                        reportData.map((item) => (
                            <ReportCard
                                key={item.id}
                                name={item.name}
                                value={item.value}
                                description={item.description}
                                onClick={() => handleCardClick(item.route)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileReport;