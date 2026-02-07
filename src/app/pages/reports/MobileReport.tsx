import { HiShare, HiX } from 'react-icons/hi';
import { formatCurrency } from '../../utils';
import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { MobileDateFilter, ReportCard, ReportCardProps } from '../dashboard/components';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import LoadingState from '../../components/loader/LoadingState';
import reportsService, { ReportSummary } from '../../services/reports.service';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

const TotalSalesReport = lazy(() => import('./TotalSalesReport'));
const GrossProfitReport = lazy(() => import('./GrossProfitReport'));
const TopStocksReport = lazy(() => import('./TopStocksReport'));
const TopCategoryReport = lazy(() => import('./TopCategoryReport'));
const ReceiptCountReport = lazy(() => import('./ReceiptCountReport'));
const PaymentModesReport = lazy(() => import('./PaymentModesReport'));

type ReportType = 'total-sales' | 'gross-profit' | 'top-stocks' | 'top-category' | 'receipt-count' | 'payment-modes' | null;

interface ReportData extends Omit<ReportCardProps, 'onClick'> {
    id: ReportType;
    title: string;
}

const defaultSummary: ReportSummary = {
    totalSales: 0,
    grossProfit: 0,
    topStocks: 0,
    topCategory: '',
    receiptCount: 0,
    paymentModes: 0,
};

const MobileReport: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeReport, setActiveReport] = useState<ReportType>(null);
    const lastFetchKeyRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);

    const generateFetchKey = (start: Date | null, end: Date | null): string => {
        const startStr = start ? dayjs(start).format('YYYY-MM-DD') : '';
        const endStr = end ? dayjs(end).format('YYYY-MM-DD') : '';
        return `${startStr}_${endStr}`;
    };

    const fetchSummary = useCallback(async (start: Date | null, end: Date | null, forceRefresh = false) => {
        const currentFetchKey = generateFetchKey(start, end);

        if (isFetchingRef.current) return;

        if (!forceRefresh && lastFetchKeyRef.current === currentFetchKey && summary !== null) {
            return;
        }

        try {
            isFetchingRef.current = true;
            setIsLoading(true);

            const query: { startDate?: string; endDate?: string } = {};
            if (start) {
                query.startDate = dayjs(start).format('YYYY-MM-DD');
                query.endDate = end ? dayjs(end).format('YYYY-MM-DD') : dayjs(start).format('YYYY-MM-DD');
            }

            const response = await reportsService.getSummary(query);
            setSummary(response);
            lastFetchKeyRef.current = currentFetchKey;
        } catch (err: any) {
            const axiosError = err?.error || err;
            const serverMessage = axiosError?.response?.data?.message || axiosError?.message || 'Failed to fetch report summary';
            console.error('Error fetching report summary:', axiosError?.response?.data || axiosError);
            toast.error(serverMessage);
            setSummary(defaultSummary);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [summary]);

    useEffect(() => {
        fetchSummary(startDate, endDate);
    }, []);

    const reportData: ReportData[] = useMemo(() => [
        {
            id: 'total-sales',
            name: 'Total Sales',
            title: 'REVENUE',
            value: formatCurrency(summary?.totalSales ?? 0, true),
            description: 'Revenue from all transactions',
        },
        {
            id: 'gross-profit',
            name: 'Gross Profit',
            title: 'Gross Profit Report',
            value: formatCurrency(summary?.grossProfit ?? 0, true),
            description: 'Selling price minus cost price',
        },
        {
            id: 'top-stocks',
            name: 'Top Stocks',
            title: 'Top Stocks Report',
            value: `${summary?.topStocks ?? 0} items`,
            description: 'Best performing inventory items',
        },
        {
            id: 'top-category',
            name: 'Top Category',
            title: 'Top Category Report',
            value: summary?.topCategory || 'N/A',
            description: 'Highest selling category',
        },
        {
            id: 'receipt-count',
            name: 'Total Receipt Count',
            title: 'Receipt Count Report',
            value: String(summary?.receiptCount ?? 0),
            description: 'Number of completed transactions',
        },
        {
            id: 'payment-modes',
            name: 'Payment Modes',
            title: 'Payment Modes Report',
            value: `${summary?.paymentModes ?? 0} methods`,
            description: 'Cash, E-Pay, Bank, Split payments',
        },
    ], [summary]);

    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
        fetchSummary(start, end, true);
    }, [fetchSummary]);

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

    const handleCardClick = useCallback((reportId: ReportType): void => {
        setActiveReport(reportId);
    }, []);

    const handleCloseDetail = useCallback((): void => {
        setActiveReport(null);
    }, []);

    const getActiveReportTitle = (): string => {
        const report = reportData.find(r => r.id === activeReport);
        return report?.title || 'Report Details';
    };

    const getFormattedDateRange = (): string => {
        if (!startDate) return '';
        const startStr = dayjs(startDate).format('DD MMM YYYY');
        if (!endDate || dayjs(startDate).isSame(endDate, 'day')) {
            return startStr;
        }
        return `${startStr} - ${dayjs(endDate).format('DD MMM YYYY')}`;
    };

    const renderDetailHeader = () => (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <button
                    onClick={handleCloseDetail}
                    className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
                >
                    <HiX className="w-6 h-6 text-sky-600 dark:text-sky-300" />
                </button>
                <div>
                    <h1 className="text-lg font-semibold text-sky-500 dark:text-white">
                        {getActiveReportTitle()}
                    </h1>
                    <p className="text-xs text-sky-500 dark:text-sky-400">
                        {getFormattedDateRange()}
                    </p>
                </div>
            </div>
            <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all"
            >
                <HiShare className="w-5 h-5 text-sky-600 dark:text-sky-300" />
            </button>
        </div>
    );

    const renderDetailContent = () => {
        switch (activeReport) {
            case 'total-sales':
                return <TotalSalesReport startDate={startDate} endDate={endDate} />;
            case 'gross-profit':
                return <GrossProfitReport />;
            case 'top-stocks':
                return <TopStocksReport />;
            case 'top-category':
                return <TopCategoryReport />;
            case 'receipt-count':
                return <ReceiptCountReport />;
            case 'payment-modes':
                return <PaymentModesReport />;
            default:
                return null;
        }
    };

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
                                onClick={() => handleCardClick(item.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {activeReport && (
                <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex flex-col animate-slide-in-right">
                    {renderDetailHeader()}
                    <div className="flex-1 overflow-y-auto">
                        <Suspense fallback={<LoadingState />}>
                            {renderDetailContent()}
                        </Suspense>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileReport;