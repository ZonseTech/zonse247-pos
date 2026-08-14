import React, { useState, useCallback, useMemo, useRef } from 'react';
import { HiShare } from 'react-icons/hi';
import { ReceiptText, Download } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import MobileTabPageHeader from '../../components/page/MobileTabPageHeader';
import LoadingState from '../../components/loader/LoadingState';
import { ReportBranchSelector } from '../../components/reports';
import { useBranch } from '../../context/BranchContext';
import { useAuth } from '../../context/AuthProvider';
import { useReportsSummary } from '../../hooks/useReportsSummary';
import ReportStatTile from './partials/ReportStatTile';
import ReportDetailView from './partials/ReportDetailView';
import { REPORT_VISUALS } from './partials/reportVisuals';
import { hasAnyPermission, hasPermission } from '../../utils';

const MobileReports: React.FC = () => {
    const [isSharing, setIsSharing] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const detailContentRef = useRef<HTMLDivElement>(null);
    const { currentBranch, accessibleBranches } = useBranch();
    const hasBranchSelector = accessibleBranches.length > 1;
    const { user } = useAuth();
    const canExportReports = hasPermission(user, 'reports.export');
    const canViewSalesReports = hasAnyPermission(user, ['analytics.view', 'reports.sales.daily', 'reports.sales.detailed']);
    const canViewDetailedSalesReports = hasAnyPermission(user, ['analytics.view', 'reports.sales.detailed']);
    const canViewFinancialReports = hasAnyPermission(user, ['analytics.view', 'reports.financial']);
    const canViewInventoryReports = hasAnyPermission(user, ['analytics.view', 'reports.inventory']);
    const canViewAnyReports = canViewSalesReports || canViewDetailedSalesReports || canViewFinancialReports || canViewInventoryReports;

    const enabledDetails = useMemo(() => ({
        'total-sales': canViewSalesReports,
        'net-profit': canViewFinancialReports,
        'receipt-count': canViewSalesReports,
        'payment-modes': canViewFinancialReports,
        'top-stocks': canViewInventoryReports,
        'top-category': canViewInventoryReports || canViewDetailedSalesReports,
        'expenses': canViewFinancialReports,
        'expenses-by-category': canViewFinancialReports,
    }), [canViewSalesReports, canViewDetailedSalesReports, canViewFinancialReports, canViewInventoryReports]);

    const {
        startDate,
        endDate,
        branchId,
        isSummaryLoading,
        activeReport,
        setActiveReport,
        reportCards,
        hasNoData,
        handleDateChange,
        handleBranchChange,
        detailData,
        detailLoading,
        detailErrors,
        retryDetail,
    } = useReportsSummary({
        enableSummary: canViewAnyReports,
        enablePreviousSummary: canViewAnyReports,
        enabledDetails,
    });

    const canViewCard = useCallback((visualKey: string): boolean => {
        if (visualKey === 'profit' || visualKey === 'expenses') {
            return canViewFinancialReports;
        }

        if (visualKey === 'revenue' || visualKey === 'service-orders' || visualKey === 'average-sale' || visualKey === 'receipt-count') {
            return canViewSalesReports;
        }

        if (visualKey === 'payment-modes') {
            return canViewFinancialReports;
        }

        if (visualKey === 'top-stocks') {
            return canViewInventoryReports;
        }

        if (visualKey === 'top-category') {
            return canViewInventoryReports || canViewDetailedSalesReports;
        }

        return canViewAnyReports;
    }, [canViewAnyReports, canViewDetailedSalesReports, canViewFinancialReports, canViewInventoryReports, canViewSalesReports]);

    const visibleReportCards = useMemo(
        () => reportCards.filter((card) => canViewCard(card.visualKey)),
        [reportCards, canViewCard],
    );

    const getFormattedDateRange = useCallback((): string => {
        if (!startDate) return '';
        const startStr = dayjs(startDate).format('DD MMM YYYY');
        if (!endDate || dayjs(startDate).isSame(endDate, 'day')) return startStr;
        return `${startStr} - ${dayjs(endDate).format('DD MMM YYYY')}`;
    }, [startDate, endDate]);

    const getActiveReportTitle = useCallback((): string => {
        const report = reportCards.find((r) => r.id === activeReport);
        return report?.title || 'Report Details';
    }, [reportCards, activeReport]);

    const generateReportText = useCallback((): string => {
        const dateRange = getFormattedDateRange();
        const storeName = currentBranch?.branchName || 'Store';

        if (activeReport) {
            const report = reportCards.find((r) => r.id === activeReport);
            return `📊 ${report?.title || 'Report'}\n\n` +
                `🏪 ${storeName}\n` +
                `📅 ${dateRange}\n\n` +
                `${report?.name}: ${report?.value}\n` +
                (report?.description ? `${report.description}` : '');
        }

        const revenue = reportCards.find((r) => r.visualKey === 'revenue');
        const profit = reportCards.find((r) => r.visualKey === 'profit');
        const receipts = reportCards.find((r) => r.visualKey === 'receipt-count');
        const topStocks = reportCards.find((r) => r.visualKey === 'top-stocks');
        const topCategory = reportCards.find((r) => r.visualKey === 'top-category');
        const paymentModes = reportCards.find((r) => r.visualKey === 'payment-modes');
        const expenses = reportCards.find((r) => r.visualKey === 'expenses');

        return `📊 Sales Report Summary\n\n` +
            `🏪 ${storeName}\n` +
            `📅 ${dateRange}\n\n` +
            `💰 ${revenue?.name}: ${revenue?.value ?? ''}\n` +
            `📈 ${profit?.name}: ${profit?.value ?? ''}\n` +
            (expenses ? `💸 Expenses: ${expenses.value}\n` : '') +
            `🧾 Receipt Count: ${receipts?.value ?? ''}\n` +
            (topStocks ? `📦 Top Stocks: ${topStocks.value}\n` : '') +
            (topCategory ? `🏷️ Top Category: ${topCategory.value}\n` : '') +
            `💳 Payment Methods: ${paymentModes?.value ?? ''}`;
    }, [activeReport, reportCards, currentBranch, getFormattedDateRange]);

    const captureReportAsImage = async (element: HTMLDivElement | null): Promise<Blob | null> => {
        if (!element) return null;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(element, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png', 1.0);
            });
        } catch (error) {
            console.error('Failed to capture report:', error);
            return null;
        }
    };

    const handleShare = useCallback(async (): Promise<void> => {
        if (hasNoData) {
            toast.warning('No data to share');
            return;
        }

        setIsSharing(true);

        try {
            const elementRef = activeReport ? detailContentRef : reportContentRef;
            const imageBlob = await captureReportAsImage(elementRef.current);
            const reportTitle = activeReport ? getActiveReportTitle() : 'Sales Report Summary';
            const dateRange = getFormattedDateRange();
            const fileName = `report-${activeReport || 'summary'}-${dayjs().format('YYYYMMDD-HHmmss')}.png`;

            if (imageBlob) {
                const reader = new FileReader();
                const base64Data = await new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.readAsDataURL(imageBlob);
                });

                if (Capacitor.isNativePlatform()) {
                    const savedFile = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Cache });
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

            const shareText = generateReportText();
            if (Capacitor.isNativePlatform()) {
                await Share.share({ title: reportTitle, text: shareText, dialogTitle: 'Share Report' });
                toast.success('Report shared successfully');
            } else if (navigator.share) {
                await navigator.share({ title: reportTitle, text: shareText });
                toast.success('Report shared successfully');
            } else {
                await navigator.clipboard.writeText(shareText);
                toast.success('Report copied to clipboard');
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') {
                console.error('Share failed:', err);
                try {
                    await navigator.clipboard.writeText(generateReportText());
                    toast.info('Report copied to clipboard');
                } catch {
                    toast.error('Unable to share report');
                }
            }
        } finally {
            setIsSharing(false);
        }
    }, [activeReport, hasNoData, currentBranch, getActiveReportTitle, getFormattedDateRange, generateReportText]);

    const handleDownload = useCallback(async (): Promise<void> => {
        if (hasNoData) {
            toast.warning('No data to download');
            return;
        }

        setIsSharing(true);

        try {
            const elementRef = activeReport ? detailContentRef : reportContentRef;
            const imageBlob = await captureReportAsImage(elementRef.current);
            const fileName = `report-${activeReport || 'summary'}-${dayjs().format('YYYYMMDD-HHmmss')}.png`;

            if (imageBlob) {
                if (Capacitor.isNativePlatform()) {
                    const reader = new FileReader();
                    const base64Data = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                        reader.readAsDataURL(imageBlob);
                    });
                    await Filesystem.writeFile({ path: `Downloads/${fileName}`, data: base64Data, directory: Directory.Documents, recursive: true });
                    toast.success('Report saved to Downloads folder');
                    return;
                }

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
    }, [activeReport, hasNoData, generateReportText]);

    const shareDownloadActions = canExportReports ? (
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
    ) : null;

    if (activeReport) {
        return (
            <div className="fixed inset-0 z-[100] bg-gray-100 dark:bg-gray-900 flex flex-col animate-slide-in-right">
                <ReportDetailView
                    reportId={activeReport}
                    rawData={detailData[activeReport]}
                    isLoading={detailLoading[activeReport]}
                    error={detailErrors[activeReport]}
                    onRetry={() => retryDetail(activeReport)}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={handleDateChange}
                    onBack={() => setActiveReport(null)}
                    headerActions={shareDownloadActions}
                    contentRef={detailContentRef}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobileTabPageHeader
                    rightContent={
                        <div className="flex items-center gap-x-3">
                            {canExportReports && (
                                <>
                                    <Download
                                        className={`w-6 h-6 text-white cursor-pointer active:scale-95 transition-transform ${isSharing ? 'opacity-50' : ''}`}
                                        onClick={!isSharing ? handleDownload : undefined}
                                    />
                                    <HiShare
                                        className={`w-6 h-6 cursor-pointer active:scale-95 transition-transform ${isSharing ? 'text-sky-300 animate-pulse' : 'text-white'}`}
                                        onClick={!isSharing ? handleShare : undefined}
                                    />
                                </>
                            )}
                        </div>
                    }
                >
                    {hasBranchSelector && (
                        <div className="flex justify-end">
                            <ReportBranchSelector
                                value={branchId}
                                onChange={handleBranchChange}
                                theme="onColor"
                                compact
                            />
                        </div>
                    )}
                </MobileTabPageHeader>
            </div>

            <div className={`flex-1 min-h-0 overflow-hidden ${hasBranchSelector ? 'pt-[108px]' : 'pt-[52px]'}`}>
                <div ref={reportContentRef} className="h-full overflow-y-auto pb-20 space-y-3 px-4 pt-2">
                    {isSummaryLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <LoadingState />
                        </div>
                    ) : !canViewAnyReports ? (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
                            You do not currently have permission to view report components.
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
                        visibleReportCards.map((card) => {
                            const visual = REPORT_VISUALS[card.visualKey];
                            return (
                                <ReportStatTile
                                    key={card.name}
                                    name={card.name}
                                    value={card.value}
                                    description={card.description}
                                    icon={visual.icon}
                                    accent={visual.accent}
                                    hasData={card.hasData}
                                    delta={card.delta}
                                    onClick={card.id && enabledDetails[card.id] ? () => setActiveReport(card.id) : undefined}
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileReports;
