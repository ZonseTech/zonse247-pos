import { Fragment, useState, type FunctionComponent } from 'react';
import { HiOutlineDocumentChartBar } from 'react-icons/hi2';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useIsInsideHub } from '../../context/HubContext';
import { MobileDateFilter } from '../../components/reports';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useReportsSummary } from '../../hooks/useReportsSummary';
import type { ReportId } from '../../hooks/useReportsSummary';
import useBusinessFeatures from '../../hooks/useBusinessFeatures';
import ReportStatTile from './partials/ReportStatTile';
import TrendPreviewPanel from './partials/TrendPreviewPanel';
import BreakdownListPreviewPanel from './partials/BreakdownListPreviewPanel';
import PaymentMixPreviewPanel from './partials/PaymentMixPreviewPanel';
import ReportDetailModal from './partials/ReportDetailModal';
import { REPORT_VISUALS } from './partials/reportVisuals';
import MobileReports from './MobileReports';

const STAT_ROW_KEYS = new Set(['revenue', 'profit', 'service-orders', 'receipt-count', 'average-sale']);

const ReportsPage: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const isInsideHub = useIsInsideHub();
    const Wrapper = isInsideHub ? Fragment : AppLayout;
    const { showRetail } = useBusinessFeatures();

    const {
        startDate,
        endDate,
        isSummaryLoading,
        reportCards,
        handleDateChange,
        detailData,
        detailLoading,
        detailErrors,
        retryDetail,
    } = useReportsSummary();
    const [detailReport, setDetailReport] = useState<ReportId>(null);

    const statCards = reportCards.filter((c) => STAT_ROW_KEYS.has(c.visualKey));

    if (isMobile) {
        return <MobileReports />;
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
                        <MobileDateFilter
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                            align="right"
                            compact
                        />
                    </PageHeader>
                )}

                <div className="flex-1 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isSummaryLoading ? (
                            Array.from({ length: 4 }, (_, i) => (
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

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
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
                        <PaymentMixPreviewPanel
                            rawData={detailData['payment-modes']}
                            isLoading={detailLoading['payment-modes']}
                            error={detailErrors['payment-modes']}
                            onRetry={() => retryDetail('payment-modes')}
                            onViewDetails={() => setDetailReport('payment-modes')}
                        />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
                        {showRetail && (
                            <>
                                <BreakdownListPreviewPanel
                                    reportId="top-stocks"
                                    rawData={detailData['top-stocks']}
                                    isLoading={detailLoading['top-stocks']}
                                    error={detailErrors['top-stocks']}
                                    onRetry={() => retryDetail('top-stocks')}
                                    onViewDetails={() => setDetailReport('top-stocks')}
                                />
                                <BreakdownListPreviewPanel
                                    reportId="top-category"
                                    rawData={detailData['top-category']}
                                    isLoading={detailLoading['top-category']}
                                    error={detailErrors['top-category']}
                                    onRetry={() => retryDetail('top-category')}
                                    onViewDetails={() => setDetailReport('top-category')}
                                />
                            </>
                        )}
                        <TrendPreviewPanel
                            reportId="gross-profit"
                            rawData={detailData['gross-profit']}
                            isLoading={detailLoading['gross-profit']}
                            error={detailErrors['gross-profit']}
                            onRetry={() => retryDetail('gross-profit')}
                            height={180}
                            showPeriodTabs={false}
                            onViewDetails={() => setDetailReport('gross-profit')}
                        />
                    </div>
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
