import { Fragment, useMemo, useState, type FunctionComponent } from 'react';
import { Navigate } from 'react-router';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useIsInsideHub } from '../../context/HubContext';
import { useAuth } from '../../context/AuthProvider';
import { MobileDateFilter, ReportBranchSelector } from '../../components/reports';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useReportsSummary } from '../../hooks/useReportsSummary';
import type { ReportId } from '../../hooks/useReportsSummary';
import useBusinessFeatures from '../../hooks/useBusinessFeatures';
import { hasAnyPermission } from '../../utils';
import ReportStatTile from './partials/ReportStatTile';
import TrendPreviewPanel from './partials/TrendPreviewPanel';
import BreakdownListPreviewPanel from './partials/BreakdownListPreviewPanel';
import PaymentMixPreviewPanel from './partials/PaymentMixPreviewPanel';
import ReportDetailModal from './partials/ReportDetailModal';
import { REPORT_VISUALS } from './partials/reportVisuals';
import { ROUTES } from '../../utils/constants';

const STAT_ROW_KEYS = new Set(['revenue', 'profit', 'service-orders', 'average-sale', 'expenses']);
const SALES_DETAIL_IDS: ReportId[] = ['total-sales', 'receipt-count'];
const FINANCIAL_DETAIL_IDS: ReportId[] = ['net-profit', 'payment-modes', 'expenses', 'expenses-by-category'];
const INVENTORY_DETAIL_IDS: ReportId[] = ['top-stocks'];
const MIXED_DETAIL_IDS: ReportId[] = ['top-category'];

const ReportsPage: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const isInsideHub = useIsInsideHub();
    const Wrapper = isInsideHub ? Fragment : AppLayout;
    const { showRetail } = useBusinessFeatures();
    const { user } = useAuth();

    const canViewSalesReports = hasAnyPermission(user, ['analytics.view', 'reports.sales.daily', 'reports.sales.detailed']);
    const canViewDetailedSalesReports = hasAnyPermission(user, ['analytics.view', 'reports.sales.detailed']);
    const canViewFinancialReports = hasAnyPermission(user, ['analytics.view', 'reports.financial']);
    const canViewInventoryReports = hasAnyPermission(user, ['analytics.view', 'reports.inventory']);

    const canViewAnyReports = canViewSalesReports || canViewFinancialReports || canViewInventoryReports || canViewDetailedSalesReports;

    const enabledDetails = useMemo(() => ({
        'total-sales': canViewSalesReports,
        'net-profit': canViewFinancialReports,
        'receipt-count': canViewSalesReports,
        'payment-modes': canViewFinancialReports,
        'top-stocks': showRetail && canViewInventoryReports,
        'top-category': showRetail && (canViewInventoryReports || canViewDetailedSalesReports),
        'expenses': showRetail && canViewFinancialReports,
        'expenses-by-category': showRetail && canViewFinancialReports,
    }), [showRetail, canViewSalesReports, canViewFinancialReports, canViewInventoryReports, canViewDetailedSalesReports]);

    const {
        startDate,
        endDate,
        branchId,
        isSummaryLoading,
        reportCards,
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
    const [detailReport, setDetailReport] = useState<ReportId>(null);

    const canViewCard = (visualKey: string): boolean => {
        if (visualKey === 'profit' || visualKey === 'expenses') {
            return canViewFinancialReports;
        }

        if (visualKey === 'revenue' || visualKey === 'service-orders' || visualKey === 'average-sale') {
            return canViewSalesReports;
        }

        return canViewAnyReports;
    };

    const statCards = reportCards.filter((c) => STAT_ROW_KEYS.has(c.visualKey) && canViewCard(c.visualKey));

    const canViewDetailReport = (reportId: ReportId): boolean => {
        if (!reportId) return false;
        if (SALES_DETAIL_IDS.includes(reportId)) return canViewSalesReports;
        if (FINANCIAL_DETAIL_IDS.includes(reportId)) return canViewFinancialReports;
        if (INVENTORY_DETAIL_IDS.includes(reportId)) return canViewInventoryReports;
        if (MIXED_DETAIL_IDS.includes(reportId)) return canViewInventoryReports || canViewDetailedSalesReports;
        return false;
    };

    const canShowSalesTrend = canViewDetailReport('total-sales');
    const canShowPaymentMix = canViewDetailReport('payment-modes');
    const canShowTopStocks = showRetail && canViewDetailReport('top-stocks');
    const canShowTopCategory = showRetail && canViewDetailReport('top-category');
    const canShowNetProfit = canViewDetailReport('net-profit');
    const canShowExpensesTrend = showRetail && canViewDetailReport('expenses');
    const canShowExpensesByCategory = showRetail && canViewDetailReport('expenses-by-category');

    if (isMobile) {
        return <Navigate to={ROUTES.MOBILE_REPORT} replace />;
    }

    return (
        <Wrapper>
            <div className="h-full flex flex-col">
                {!isInsideHub && (
                    <PageHeader
                        icon={<HiOutlineDocumentChartBar className="h-5 w-5" />}
                        title="Reports"
                        description="View detailed reports and analytics for your business"
                    >
                        <div className="flex items-center gap-2">
                            <ReportBranchSelector
                                value={branchId}
                                onChange={handleBranchChange}
                                compact
                            />
                            <MobileDateFilter
                                startDate={startDate}
                                endDate={endDate}
                                onChange={handleDateChange}
                                align="right"
                                compact
                            />
                        </div>
                    </PageHeader>
                )}

                <div className="flex-1 overflow-y-auto space-y-4">
                    {!canViewAnyReports ? (
                        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300">
                            You do not currently have permission to view report components.
                        </div>
                    ) : (
                        <>
                            {statCards.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {isSummaryLoading ? (
                                        Array.from({ length: Math.max(statCards.length, 1) }, (_, i) => (
                                            <div key={i} className="h-[104px] rounded-2xl bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                                        ))
                                    ) : (
                                        statCards.map((card) => {
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
                                                />
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {(canShowSalesTrend || canShowPaymentMix) && (
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                                    {canShowSalesTrend && (
                                        <TrendPreviewPanel
                                            reportId="total-sales"
                                            rawData={detailData['total-sales']}
                                            isLoading={detailLoading['total-sales']}
                                            error={detailErrors['total-sales']}
                                            onRetry={() => retryDetail('total-sales')}
                                            height={240}
                                            className="xl:col-span-2"
                                            onViewDetails={() => setDetailReport('total-sales')}
                                        />
                                    )}
                                    {canShowPaymentMix && (
                                        <PaymentMixPreviewPanel
                                            rawData={detailData['payment-modes']}
                                            isLoading={detailLoading['payment-modes']}
                                            error={detailErrors['payment-modes']}
                                            onRetry={() => retryDetail('payment-modes')}
                                            onViewDetails={() => setDetailReport('payment-modes')}
                                        />
                                    )}
                                </div>
                            )}

                            {(canShowTopStocks || canShowTopCategory || canShowNetProfit) && (
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                                    {canShowTopStocks && (
                                        <BreakdownListPreviewPanel
                                            reportId="top-stocks"
                                            rawData={detailData['top-stocks']}
                                            isLoading={detailLoading['top-stocks']}
                                            error={detailErrors['top-stocks']}
                                            onRetry={() => retryDetail('top-stocks')}
                                            onViewDetails={() => setDetailReport('top-stocks')}
                                        />
                                    )}
                                    {canShowTopCategory && (
                                        <BreakdownListPreviewPanel
                                            reportId="top-category"
                                            rawData={detailData['top-category']}
                                            isLoading={detailLoading['top-category']}
                                            error={detailErrors['top-category']}
                                            onRetry={() => retryDetail('top-category')}
                                            onViewDetails={() => setDetailReport('top-category')}
                                        />
                                    )}
                                    {canShowNetProfit && (
                                        <TrendPreviewPanel
                                            reportId="net-profit"
                                            rawData={detailData['net-profit']}
                                            isLoading={detailLoading['net-profit']}
                                            error={detailErrors['net-profit']}
                                            onRetry={() => retryDetail('net-profit')}
                                            height={180}
                                            showPeriodTabs={false}
                                            onViewDetails={() => setDetailReport('net-profit')}
                                        />
                                    )}
                                </div>
                            )}

                            {(canShowExpensesTrend || canShowExpensesByCategory) && (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                    {canShowExpensesTrend && (
                                        <TrendPreviewPanel
                                            reportId="expenses"
                                            rawData={detailData['expenses']}
                                            isLoading={detailLoading['expenses']}
                                            error={detailErrors['expenses']}
                                            onRetry={() => retryDetail('expenses')}
                                            height={180}
                                            showPeriodTabs={false}
                                            onViewDetails={() => setDetailReport('expenses')}
                                        />
                                    )}
                                    {canShowExpensesByCategory && (
                                        <BreakdownListPreviewPanel
                                            reportId="expenses-by-category"
                                            rawData={detailData['expenses-by-category']}
                                            isLoading={detailLoading['expenses-by-category']}
                                            error={detailErrors['expenses-by-category']}
                                            onRetry={() => retryDetail('expenses-by-category')}
                                            onViewDetails={() => setDetailReport('expenses-by-category')}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <ReportDetailModal
                reportId={detailReport}
                detailData={detailData}
                detailLoading={detailLoading}
                detailErrors={detailErrors}
                onRetry={retryDetail}
                onClose={() => setDetailReport(null)}
            />
        </Wrapper>
    );
};

export default ReportsPage;
