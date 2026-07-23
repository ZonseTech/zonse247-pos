import { formatCurrency } from '../../../utils';
import type { ReportDetailRawData, ReportId } from '../../../hooks/useReportsSummary';
import type { NormalizedPoint, ReportPeriod } from './reportDetailConfigs';

/**
 * Maps each report's real reportsService response shape to the common
 * NormalizedPoint[] every chart/list/table renders — the live-data
 * counterpart of the old sample-data-bound getData() closures.
 */
export const normalizeReportPoints = (
    reportId: NonNullable<ReportId>,
    rawData: ReportDetailRawData[NonNullable<ReportId>] | null,
    period: ReportPeriod,
): NormalizedPoint[] => {
    if (!rawData) return [];

    switch (reportId) {
        case 'total-sales':
        case 'gross-profit':
        case 'receipt-count':
            return (rawData as ReportDetailRawData['total-sales'])![period].data.map((d) => ({
                label: d.label,
                value: d.value,
            }));

        case 'payment-modes':
            return (rawData as ReportDetailRawData['payment-modes']).data.map((d) => ({
                label: d.label,
                value: d.value,
                subtitle: `${d.transactions} transactions`,
            }));

        case 'top-stocks':
            // Total revenue per item (quantity x unit price) — the weight used for both the chart slice and % bar.
            return (rawData as ReportDetailRawData['top-stocks']).data.map((d) => ({
                label: d.name,
                value: d.quantity * d.pricing,
                subtitle: `${d.quantity} x ${formatCurrency(d.pricing, true)}`,
            }));

        case 'top-category':
            return (rawData as ReportDetailRawData['top-category']).data.map((d) => ({
                label: d.name,
                value: d.totalPrice,
                subtitle: `${d.orderCount} orders`,
            }));

        default:
            return [];
    }
};
