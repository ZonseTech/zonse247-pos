import { useMemo, useState, type FunctionComponent } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import Panel from '../../dashboard/partials/Panel';
import ViewAllButton from '../../dashboard/partials/ViewAllButton';
import PanelErrorState from './PanelErrorState';
import { ReportBarChart } from '../../../components';
import { REPORT_DETAIL_CONFIGS, type ReportPeriod } from './reportDetailConfigs';
import { normalizeReportPoints } from './reportDataNormalizers';
import { REPORT_ID_ICONS } from './reportVisuals';
import type { ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';

const PERIODS: ReportPeriod[] = ['hourly', 'weekly', 'monthly'];

export interface TrendPreviewPanelProps {
    reportId: NonNullable<ReportId>;
    rawData: ReportDetailRawData[NonNullable<ReportId>] | null;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
    onViewDetails: () => void;
    height?: number;
    className?: string;
    /** Defaults to the report's own hasPeriodTabs config — pass false to keep a compact panel from showing them */
    showPeriodTabs?: boolean;
}

const TrendPreviewPanel: FunctionComponent<TrendPreviewPanelProps> = ({
    reportId,
    rawData,
    isLoading,
    error,
    onRetry,
    onViewDetails,
    height = 220,
    className,
    showPeriodTabs,
}) => {
    const config = REPORT_DETAIL_CONFIGS[reportId];
    const [period, setPeriod] = useState<ReportPeriod>('hourly');
    const displayPeriodTabs = showPeriodTabs ?? config.hasPeriodTabs;

    const chartData = useMemo(() => normalizeReportPoints(reportId, rawData, period), [reportId, rawData, period]);

    return (
        <Panel
            title={config.title}
            icon={REPORT_ID_ICONS[reportId]}
            className={className}
            action={<ViewAllButton label="View details" onClick={onViewDetails} />}
        >
            {displayPeriodTabs && !error && (
                <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)} className="mb-3">
                    <Tabs.List className="flex gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1 w-fit">
                        {PERIODS.map((p) => (
                            <Tabs.Trigger
                                key={p}
                                value={p}
                                className={
                                    'px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors outline-none cursor-pointer ' +
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

            {error ? (
                <PanelErrorState message={error} onRetry={onRetry} height={height} />
            ) : isLoading ? (
                <div style={{ height }} className="rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
            ) : chartData.length === 0 ? (
                <div style={{ height }} className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                    No data yet
                </div>
            ) : (
                <ReportBarChart data={chartData} height={height} barColor={config.color} tooltipFormatter={config.valueFormatter} />
            )}
        </Panel>
    );
};

export default TrendPreviewPanel;
