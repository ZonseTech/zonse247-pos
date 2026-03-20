import { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense, type FunctionComponent } from 'react';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/api-error-handler';

import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import LoadingState from '../../components/loader/LoadingState';
import { MobileDateFilter, ReportCard, ReportCardProps } from '../../components/reports';
import { formatCurrency } from '../../utils';
import reportsService, { ReportSummary } from '../../services/reports.service';
import { useBranch } from '../../context/BranchContext';

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
    description?: string;
    hasData?: boolean;
}

const defaultSummary: ReportSummary = {
    totalSales: 0,
    grossProfit: 0,
    topStocks: 0,
    topCategory: '',
    receiptCount: 0,
    paymentModes: 0,
};

const DesktopReports: FunctionComponent = () => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeReport, setActiveReport] = useState<ReportType>(null);
    const lastFetchKeyRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);
    const { currentBranch } = useBranch();

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
            const serverMessage = getErrorMessage(err, 'Failed to fetch report summary');
            console.error('Error fetching report summary:', err);
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
            hasData: (summary?.totalSales ?? 0) > 0,
        },
        {
            id: 'gross-profit',
            name: 'Gross Profit (Selling Price - Cost Price)',
            title: 'Profit',
            value: formatCurrency(summary?.grossProfit ?? 0, true),
            description: 'Selling price minus cost price',
            hasData: (summary?.grossProfit ?? 0) !== 0,
        },
        {
            id: 'top-stocks',
            name: 'Top Stocks',
            title: 'Top Stocks',
            value: `${summary?.topStocks ?? 0} items`,
            description: 'Best performing inventory items',
            hasData: (summary?.topStocks ?? 0) > 0,
        },
        {
            id: 'top-category',
            name: 'Top Category',
            title: 'Top Category Report',
            value: summary?.topCategory || 'N/A',
            description: 'Highest selling category',
            hasData: !!summary?.topCategory,
        },
        {
            id: 'receipt-count',
            name: 'Total Receipt Count',
            title: 'Sales count',
            value: String(summary?.receiptCount ?? 0),
            description: '',
            hasData: (summary?.receiptCount ?? 0) > 0,
        },
        {
            id: 'payment-modes',
            name: 'Payment Modes',
            title: 'Payment Modes Report',
            value: `${summary?.paymentModes ?? 0} methods`,
            hasData: (summary?.paymentModes ?? 0) > 0,
        },
    ], [summary]);

    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
        fetchSummary(start, end, true);
    }, [fetchSummary]);

    const renderActiveReport = () => {
        const commonProps = { startDate, endDate };

        switch (activeReport) {
            case 'total-sales':
                return <TotalSalesReport {...commonProps} />;
            case 'gross-profit':
                return <GrossProfitReport {...commonProps} />;
            case 'top-stocks':
                return <TopStocksReport {...commonProps} />;
            case 'top-category':
                return <TopCategoryReport {...commonProps} />;
            case 'receipt-count':
                return <ReceiptCountReport {...commonProps} />;
            case 'payment-modes':
                return <PaymentModesReport {...commonProps} />;
            default:
                return null;
        }
    };

    const getActiveReportTitle = () => {
        const report = reportData.find(r => r.id === activeReport);
        return report?.title || 'Report';
    };

    return (
        <AppLayout>
            <div className="h-full flex flex-col">
                <PageHeader
                    icon={<HiOutlineDocumentChartBar className="h-5 w-5" />}
                    title={activeReport ? getActiveReportTitle() : 'Reports'}
                    description={
                        activeReport
                            ? `Detailed ${getActiveReportTitle().toLowerCase()} analysis`
                            : 'View detailed reports and analytics for your business'
                    }
                />

                <div className="px-4 lg:px-6 pb-2 flex flex-wrap items-center gap-4">
                    {activeReport && (
                        <button
                            onClick={() => setActiveReport(null)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ← Back to Summary
                        </button>
                    )}

                    <div className="ml-auto">
                        <MobileDateFilter
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4">
                    {isLoading ? (
                        <LoadingState />
                    ) : activeReport ? (
                        <Suspense fallback={<LoadingState />}>
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                                {renderActiveReport()}
                            </div>
                        </Suspense>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {reportData.map((report) => (
                                <div
                                    key={report.id}
                                    onClick={() => report.hasData && setActiveReport(report.id)}
                                    className={`transition-transform ${report.hasData
                                        ? 'cursor-pointer hover:scale-[1.02]'
                                        : 'cursor-not-allowed opacity-60'
                                        }`}
                                >
                                    <ReportCard
                                        name={report.name}
                                        value={report.value}
                                        onClick={report.hasData ? () => setActiveReport(report.id) : undefined}
                                    />
                                    {report.description && (
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 px-2">
                                            {report.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default DesktopReports;
