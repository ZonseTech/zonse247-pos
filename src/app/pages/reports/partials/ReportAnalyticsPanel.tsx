import { useContext, useMemo, useState, type FunctionComponent } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { BarChart3 } from 'lucide-react';
import { HiInformationCircle } from 'react-icons/hi';
import { ZonseThemeContext, ReportBarChart, ReportPieChart } from '../../../components';
import TableEmptyState from '../../../components/TableEmptyState';
import PanelErrorState from './PanelErrorState';
import { getTableStyles } from '../../../utils/table-styles';
import { REPORT_DETAIL_CONFIGS, type NormalizedPoint, type ReportPeriod } from './reportDetailConfigs';
import { normalizeReportPoints } from './reportDataNormalizers';
import type { ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';

const PERIODS: ReportPeriod[] = ['hourly', 'weekly', 'monthly'];

export interface ReportAnalyticsPanelProps {
    reportId: NonNullable<ReportId>;
    rawData: ReportDetailRawData[NonNullable<ReportId>] | null;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
}

const ReportAnalyticsPanel: FunctionComponent<ReportAnalyticsPanelProps> = ({
    reportId,
    rawData,
    isLoading,
    error,
    onRetry,
}) => {
    const { mode } = useContext(ZonseThemeContext);
    const config = REPORT_DETAIL_CONFIGS[reportId];
    const [period, setPeriod] = useState<ReportPeriod>('hourly');

    const points = useMemo(() => normalizeReportPoints(reportId, rawData, period), [reportId, rawData, period]);
    const grandTotal = useMemo(() => points.reduce((acc, p) => acc + p.value, 0), [points]);
    const chartData = config.chartType === 'pie' ? points.slice(0, 5) : points;

    const columns: TableColumn<NormalizedPoint>[] = useMemo(() => [
        {
            name: 'Label',
            sortable: true,
            selector: (row) => row.label,
            grow: 2,
            cell: (row) => (
                <div className="py-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{row.label}</p>
                    {row.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.subtitle}</p>
                    )}
                </div>
            ),
        },
        {
            name: 'Value',
            sortable: true,
            right: true,
            selector: (row) => row.value,
            cell: (row) => (
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {config.valueFormatter(row.value)}
                </span>
            ),
        },
        {
            name: '% of Total',
            sortable: true,
            right: true,
            selector: (row) => (grandTotal > 0 ? row.value / grandTotal : 0),
            cell: (row) => {
                const percentage = grandTotal > 0 ? Math.round((row.value / grandTotal) * 100) : 0;
                return <span className="text-sm text-gray-500 dark:text-gray-400">{percentage}%</span>;
            },
        },
    ], [config, grandTotal]);

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm">
                <PanelErrorState message={error} onRetry={onRetry} height={320} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                {config.infoNote && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-50 dark:bg-sky-900/20">
                        <HiInformationCircle className="w-4 h-4 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                        <p className="text-xs text-sky-600 dark:text-sky-400">{config.infoNote}</p>
                    </div>
                )}
                {config.hasPeriodTabs && (
                    <Tabs.Root value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)} className="ml-auto">
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

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-4">
                {isLoading ? (
                    <div className="h-[280px] rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                ) : config.chartType === 'bar' ? (
                    <ReportBarChart data={chartData} height={280} barColor={config.color} tooltipFormatter={config.valueFormatter} />
                ) : (
                    <ReportPieChart data={chartData} height={260} colors={config.pieColors} tooltipFormatter={config.valueFormatter} />
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
                <DataTable
                    columns={columns}
                    data={points}
                    theme={mode as string}
                    progressPending={isLoading}
                    customStyles={getTableStyles(mode)}
                    highlightOnHover
                    responsive
                    defaultSortFieldId={2}
                    defaultSortAsc={false}
                    noDataComponent={
                        <TableEmptyState
                            icon={<BarChart3 />}
                            title="No data"
                            description="No data for this period."
                        />
                    }
                />
            </div>
        </div>
    );
};

export default ReportAnalyticsPanel;
