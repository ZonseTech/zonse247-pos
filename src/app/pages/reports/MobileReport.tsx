import { HiShare, HiX } from 'react-icons/hi';
import { ReceiptText, Download } from 'lucide-react';
import { formatCurrency } from '../../utils';
import React, { useState, useCallback, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { MobileDateFilter, ReportCard, ReportCardProps } from '../../components/reports';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import LoadingState from '../../components/loader/LoadingState';
import reportsService, { ReportSummary } from '../../services/reports.service';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/api-error-handler';
import dayjs from 'dayjs';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
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

const MobileReport: React.FC = () => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeReport, setActiveReport] = useState<ReportType>(null);
    const [isSharing, setIsSharing] = useState(false);
    const lastFetchKeyRef = useRef<string | null>(null);
    const isFetchingRef = useRef(false);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const detailContentRef = useRef<HTMLDivElement>(null);
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
    const hasNoData = useMemo(() => {
        if (!summary) return true;
        return (
            summary.totalSales === 0 &&
            summary.grossProfit === 0 &&
            summary.receiptCount === 0
        );
    }, [summary]);
    const handleDateChange = useCallback((start: Date | null, end: Date | null): void => {
        setStartDate(start);
        setEndDate(end);
        fetchSummary(start, end, true);
    }, [fetchSummary]);

    const captureReportAsImage = async (elementRef: React.RefObject<HTMLDivElement>): Promise<Blob | null> => {
        if (!elementRef.current) return null;

        try {
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(elementRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: elementRef.current.scrollWidth,
                windowHeight: elementRef.current.scrollHeight,
            });

            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 1.0);
            });
        } catch (error) {
            console.error('Failed to capture report:', error);
            return null;
        }
    };

    const generateReportText = (): string => {
        const dateRange = getFormattedDateRange();
        const storeName = currentBranch?.branchName || 'Store';

        if (activeReport) {
            const report = reportData.find(r => r.id === activeReport);
            return `📊 ${report?.title || 'Report'}\n\n` +
                `🏪 ${storeName}\n` +
                `📅 ${dateRange}\n\n` +
                `${report?.name}: ${report?.value}\n` +
                (report?.description ? `${report.description}` : '');
        }

        return `📊 Sales Report Summary\n\n` +
            `🏪 ${storeName}\n` +
            `📅 ${dateRange}\n\n` +
            `💰 Total Sales: ${formatCurrency(summary?.totalSales ?? 0, true)}\n` +
            `📈 Gross Profit: ${formatCurrency(summary?.grossProfit ?? 0, true)}\n` +
            `🧾 Receipt Count: ${summary?.receiptCount ?? 0}\n` +
            `📦 Top Stocks: ${summary?.topStocks ?? 0} items\n` +
            `🏷️ Top Category: ${summary?.topCategory || 'N/A'}\n` +
            `💳 Payment Methods: ${summary?.paymentModes ?? 0}`;
    };

    const handleShare = useCallback(async (): Promise<void> => {
        if (hasNoData) {
            toast.warning('No data to share');
            return;
        }

        setIsSharing(true);

        try {
            const elementRef = activeReport ? detailContentRef : reportContentRef;
            const imageBlob = await captureReportAsImage(elementRef);
            const reportTitle = activeReport ? getActiveReportTitle() : 'Sales Report Summary';
            const dateRange = getFormattedDateRange();
            const fileName = `report-${activeReport || 'summary'}-${dayjs().format('YYYYMMDD-HHmmss')}.png`;

            if (imageBlob) {
                const reader = new FileReader();
                const base64Data = await new Promise<string>((resolve) => {
                    reader.onloadend = () => {
                        const base64 = reader.result as string;
                        resolve(base64.split(',')[1]);
                    };
                    reader.readAsDataURL(imageBlob);
                });

                if (Capacitor.isNativePlatform()) {
                    const savedFile = await Filesystem.writeFile({
                        path: fileName,
                        data: base64Data,
                        directory: Directory.Cache,
                    });

                    await Share.share({
                        title: reportTitle,
                        text: `${reportTitle}\n${currentBranch?.branchName || 'Store'} - ${dateRange}`,
                        files: [savedFile.uri],
                        dialogTitle: 'Share Report',
                    });

                    toast.success('Report shared successfully');
                    return;
                }

                if (navigator.canShare) {
                    const file = new File([imageBlob], fileName, { type: 'image/png' });

                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: reportTitle,
                            text: `${reportTitle}\n${currentBranch?.branchName || 'Store'} - ${dateRange}`,
                            files: [file],
                        });
                        toast.success('Report shared successfully');
                        return;
                    }
                }
            }

            // Fallback to text sharing
            const shareText = generateReportText();

            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: reportTitle,
                    text: shareText,
                    dialogTitle: 'Share Report',
                });
                toast.success('Report shared successfully');
            } else if (navigator.share) {
                await navigator.share({
                    title: reportTitle,
                    text: shareText,
                });
                toast.success('Report shared successfully');
            } else {
                await navigator.clipboard.writeText(shareText);
                toast.success('Report copied to clipboard');
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                console.error('Share failed:', err);
                try {
                    const shareText = generateReportText();
                    await navigator.clipboard.writeText(shareText);
                    toast.info('Report copied to clipboard');
                } catch {
                    toast.error('Unable to share report');
                }
            }
        } finally {
            setIsSharing(false);
        }
    }, [activeReport, summary, currentBranch, startDate, endDate, hasNoData]);

    const handleDownload = useCallback(async (): Promise<void> => {
        if (hasNoData) {
            toast.warning('No data to download');
            return;
        }

        setIsSharing(true);

        try {
            const elementRef = activeReport ? detailContentRef : reportContentRef;
            const imageBlob = await captureReportAsImage(elementRef);
            const reportTitle = activeReport ? getActiveReportTitle() : 'Sales Summary';
            const fileName = `report-${activeReport || 'summary'}-${dayjs().format('YYYYMMDD-HHmmss')}.png`;

            if (imageBlob) {
                if (Capacitor.isNativePlatform()) {
                    const reader = new FileReader();
                    const base64Data = await new Promise<string>((resolve) => {
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            resolve(base64.split(',')[1]);
                        };
                        reader.readAsDataURL(imageBlob);
                    });

                    await Filesystem.writeFile({
                        path: `Downloads/${fileName}`,
                        data: base64Data,
                        directory: Directory.Documents,
                        recursive: true,
                    });

                    toast.success('Report saved to Downloads folder');
                    return;
                }

                // Web fallback
                const url = URL.createObjectURL(imageBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Report downloaded');
                return;
            }

            // Fallback to text download
            const reportText = generateReportText();
            const textFileName = `report-${activeReport || 'summary'}-${dayjs().format('YYYYMMDD-HHmmss')}.txt`;

            if (Capacitor.isNativePlatform()) {
                await Filesystem.writeFile({
                    path: `Downloads/${textFileName}`,
                    data: reportText,
                    directory: Directory.Documents,
                    encoding: 'utf8' as any,
                    recursive: true,
                });
                toast.success('Report saved to Downloads folder');
            } else {
                const blob = new Blob([reportText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = textFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success('Report downloaded');
            }
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download report');
        } finally {
            setIsSharing(false);
        }
    }, [activeReport, summary, currentBranch, startDate, endDate, hasNoData]);

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
        <div className="flex items-center uppercase justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top-android">
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
            <div className="flex items-center gap-1">
                <button
                    onClick={handleDownload}
                    disabled={isSharing}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50"
                >
                    <Download className="w-5 h-5 text-sky-600 dark:text-sky-300" />
                </button>
                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50"
                >
                    <HiShare className={`w-5 h-5 ${isSharing ? 'text-sky-500 animate-pulse' : 'text-sky-600 dark:text-sky-300'}`} />
                </button>
            </div>
        </div>
    );

    const renderDetailContent = () => {
        switch (activeReport) {
            case 'total-sales':
                return <TotalSalesReport startDate={startDate} endDate={endDate} />;
            case 'gross-profit':
                return <GrossProfitReport startDate={startDate} endDate={endDate} />;
            case 'top-stocks':
                return <TopStocksReport startDate={startDate} endDate={endDate} />;
            case 'top-category':
                return <TopCategoryReport startDate={startDate} endDate={endDate} />;
            case 'receipt-count':
                return <ReceiptCountReport startDate={startDate} endDate={endDate} />;
            case 'payment-modes':
                return <PaymentModesReport startDate={startDate} endDate={endDate} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader
                    rightContent={
                        <div className="flex items-center gap-x-3">
                            <Download
                                className={`w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform ${isSharing ? 'opacity-50' : ''}`}
                                onClick={!isSharing ? handleDownload : undefined}
                            />
                            <HiShare
                                className={`w-6 h-6 cursor-pointer active:scale-95 transition-transform ${isSharing ? 'text-sky-300 animate-pulse' : 'text-white'}`}
                                onClick={!isSharing ? handleShare : undefined}
                            />
                        </div>
                    }
                />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <MobileDateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleDateChange}
                />

                <div ref={reportContentRef} className='h-full overflow-y-auto pb-20 space-y-2 px-4'>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingState />
                        </div>
                    ) : hasNoData ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-20 h-20 rounded-full bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-4">
                                <ReceiptText className="w-10 h-10 text-sky-400 dark:text-sky-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                No Sales Data
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                                There are no sales recorded for the selected date range. Try selecting a different period.
                            </p>
                        </div>
                    ) : (
                        reportData.map((item) => (
                            <div
                                key={item.id}
                                className={!item.hasData ? 'opacity-60' : ''}
                            >
                                <ReportCard
                                    name={item.name}
                                    value={item.value}
                                    description={item.description}
                                    onClick={item.hasData ? () => handleCardClick(item.id) : undefined}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {activeReport && (
                <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex flex-col animate-slide-in-right">
                    {renderDetailHeader()}
                    <div ref={detailContentRef} className="flex-1 overflow-y-auto">
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