import { useMemo, type FunctionComponent } from 'react';
import Panel from '../../dashboard/partials/Panel';
import ViewAllButton from '../../dashboard/partials/ViewAllButton';
import PanelErrorState from './PanelErrorState';
import { REPORT_DETAIL_CONFIGS } from './reportDetailConfigs';
import { normalizeReportPoints } from './reportDataNormalizers';
import { REPORT_ID_ICONS } from './reportVisuals';
import type { ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';

export interface BreakdownListPreviewPanelProps {
    reportId: NonNullable<ReportId>;
    rawData: ReportDetailRawData[NonNullable<ReportId>] | null;
    isLoading: boolean;
    error?: string;
    onRetry: () => void;
    onViewDetails: () => void;
    className?: string;
}

const BreakdownListPreviewPanel: FunctionComponent<BreakdownListPreviewPanelProps> = ({
    reportId,
    rawData,
    isLoading,
    error,
    onRetry,
    onViewDetails,
    className,
}) => {
    const config = REPORT_DETAIL_CONFIGS[reportId];
    const items = useMemo(() => normalizeReportPoints(reportId, rawData, 'hourly').slice(0, 5), [reportId, rawData]);
    const maxValue = useMemo(() => Math.max(1, ...items.map((i) => i.value)), [items]);

    return (
        <Panel
            title={config.title}
            icon={REPORT_ID_ICONS[reportId]}
            className={className}
            action={<ViewAllButton label="View details" onClick={onViewDetails} />}
        >
            {error ? (
                <PanelErrorState message={error} onRetry={onRetry} />
            ) : isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-6 rounded bg-gray-100 dark:bg-gray-700/50 animate-pulse" />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No data yet
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item, index) => {
                        const percentage = Math.round((item.value / maxValue) * 100);
                        return (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-semibold text-gray-500 dark:text-gray-300 flex-shrink-0">
                                            {index + 1}
                                        </span>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white flex-shrink-0">
                                        {config.valueFormatter(item.value)}
                                    </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${percentage}%`, backgroundColor: config.color }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
};

export default BreakdownListPreviewPanel;
