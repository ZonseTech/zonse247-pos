import { formatCurrency } from '../../../utils';
import type { ReportId } from '../../../hooks/useReportsSummary';

export type ReportPeriod = 'hourly' | 'weekly' | 'monthly';

export interface NormalizedPoint {
    label: string;
    value: number;
    subtitle?: string;
}

export interface ReportDetailConfig {
    id: NonNullable<ReportId>;
    title: string;
    infoNote?: string;
    chartType: 'bar' | 'pie';
    hasPeriodTabs: boolean;
    color: string;
    pieColors?: string[];
    valueFormatter: (value: number) => string;
}

const currencyFormatter = (value: number) => formatCurrency(value, true);
const countFormatter = (value: number) => value.toLocaleString();

export const BREAKDOWN_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export const REPORT_DETAIL_CONFIGS: Record<NonNullable<ReportId>, ReportDetailConfig> = {
    'total-sales': {
        id: 'total-sales',
        title: 'Revenue',
        chartType: 'bar',
        hasPeriodTabs: true,
        color: '#0ea5e9',
        valueFormatter: currencyFormatter,
    },
    'net-profit': {
        id: 'net-profit',
        title: 'Net Profit',
        infoNote: 'Revenue minus discounts, cost, and approved expenses',
        chartType: 'bar',
        hasPeriodTabs: true,
        color: '#22c55e',
        valueFormatter: currencyFormatter,
    },
    'receipt-count': {
        id: 'receipt-count',
        title: 'Sales Count',
        chartType: 'bar',
        hasPeriodTabs: true,
        color: '#6366f1',
        valueFormatter: countFormatter,
    },
    'payment-modes': {
        id: 'payment-modes',
        title: 'Payment Modes',
        chartType: 'pie',
        hasPeriodTabs: false,
        color: '#14b8a6',
        pieColors: BREAKDOWN_COLORS,
        valueFormatter: currencyFormatter,
    },
    'top-stocks': {
        id: 'top-stocks',
        title: 'Top Stocks',
        chartType: 'pie',
        hasPeriodTabs: false,
        color: '#a855f7',
        pieColors: BREAKDOWN_COLORS,
        valueFormatter: currencyFormatter,
    },
    'top-category': {
        id: 'top-category',
        title: 'Top Category',
        chartType: 'pie',
        hasPeriodTabs: false,
        color: '#f59e0b',
        pieColors: BREAKDOWN_COLORS,
        valueFormatter: currencyFormatter,
    },
    expenses: {
        id: 'expenses',
        title: 'Expenses',
        chartType: 'bar',
        hasPeriodTabs: true,
        color: '#f97316',
        valueFormatter: currencyFormatter,
    },
    'expenses-by-category': {
        id: 'expenses-by-category',
        title: 'Expenses by Category',
        chartType: 'pie',
        hasPeriodTabs: false,
        color: '#f97316',
        pieColors: BREAKDOWN_COLORS,
        valueFormatter: currencyFormatter,
    },
};
