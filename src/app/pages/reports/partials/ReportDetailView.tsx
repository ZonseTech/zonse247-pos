import { useMemo, useState, type FunctionComponent, type ReactNode, type RefObject } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { HiInformationCircle } from 'react-icons/hi';
import PageHeader from '../../../components/page/PageHeader';
import { MobileDateFilter } from '../../../components/reports';
import { ReportBarChart, ReportPieChart, ReportProgressBar } from '../../../components';
import PanelErrorState from './PanelErrorState';
import { REPORT_DETAIL_CONFIGS, type ReportPeriod } from './reportDetailConfigs';
import { normalizeReportPoints } from './reportDataNormalizers';
import type { ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';

const PERIODS: ReportPeriod[] = ['hourly', 'weekly', 'monthly'];

export interface ReportDetailViewProps {
    reportId: NonNullable<ReportId>;
    rawData: ReportDetailRawData[NonNullable<ReportId>] | null;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
    startDate: Date | null;
    endDate: Date | null;
    onDateChange: (start: Date | null, end: Date | null) => void;
    onBack: () => void;
    /** Extra controls (e.g. mobile share/download) rendered in the header's action slot */
    headerActions?: ReactNode;
    /** Ref on the scrollable content area, used by mobile share/download to capture a PNG */
    contentRef?: RefObject<HTMLDivElement | null>;
}

const ReportDetailView: FunctionComponent<ReportDetailViewProps> = ({
    reportId,
    rawData,
    isLoading,
    error,
    onRetry,
    startDate,
    endDate,
    onDateChange,
    onBack,
    headerActions,
    contentRef,
}) => {
    const config = REPORT_DETAIL_CONFIGS[reportId];
    const [period, setPeriod] = useState<ReportPeriod>('hourly');

    const points = useMemo(() => normalizeReportPoints(reportId, rawData, period), [reportId, rawData, period]);
    const grandTotal = useMemo(() => points.reduce((acc, p) => acc + p.value, 0), [points]);
    const chartData = config.chartType === 'pie' ? points.slice(0, 5) : points;

    return (
        <div className="flex flex-col h-full">
            <PageHeader
                title={config.title}
                description={`Detailed ${config.title.toLowerCase()} breakdown`}
                showBackButton
                onBack={onBack}
                action={headerActions}
            >
                <div className="flex flex-wrap items-center gap-3">
                    <MobileDateFilter startDate={startDate} endDate={endDate} onChange={onDateChange} compact />
                    {config.hasPeriodTabs && !error && (
                        <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
                            <Tabs.List className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                                {PERIODS.map((p) => (
                                    <Tabs.Trigger
                                        key={p}
                                        value={p}
                                        className={
                                            'px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors outline-none cursor-pointer ' +
                                            'text-gray-500 dark:text-gray-400 ' +
                                            'data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 ' +
                                            'data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 ' +
                                            'data-[state=active]:shadow-sm'
                                        }
                                    >
                                        {p}
                                    </Tabs.Trigger>
                                ))}
                            </Tabs.List>
                        </Tabs.Root>
                    )}
                </div>
            </PageHeader>

            <div ref={contentRef} className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4">
                {error ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                        <PanelErrorState message={error} onRetry={onRetry} height={320} />
                    </div>
                ) : (
                    <>
                        {config.infoNote && (
                            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                                <HiInformationCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                                <p className="text-xs text-sky-600 dark:text-sky-400">{config.infoNote}</p>
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-4">
                            {isLoading ? (
                                <div className="h-[260px] rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                            ) : config.chartType === 'bar' ? (
                                <ReportBarChart data={chartData} height={260} barColor={config.color} tooltipFormatter={config.valueFormatter} />
                            ) : (
                                <ReportPieChart data={chartData} height={240} colors={config.pieColors} tooltipFormatter={config.valueFormatter} />
                            )}
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-4 space-y-3">
                            {isLoading ? (
                                Array.from({ length: 4 }, (_, i) => (
                                    <div key={i} className="h-10 rounded bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                                ))
                            ) : points.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-500">No data yet</p>
                            ) : (
                                points.map((point) => {
                                    const percentage = grandTotal > 0 ? Math.round((point.value / grandTotal) * 100) : 0;
                                    return (
                                        <ReportProgressBar
                                            key={point.label}
                                            bare
                                            label={point.label}
                                            subtitle={point.subtitle}
                                            value={config.valueFormatter(point.value)}
                                            percentage={percentage}
                                            barColorHex={config.color}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportDetailView;
