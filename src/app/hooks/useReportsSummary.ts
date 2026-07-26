import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils';
import { getErrorMessage } from '../utils/api-error-handler';
import reportsService, {
    ReportSummary,
    TotalSalesResponse,
    NetProfitResponse,
    ReceiptCountResponse,
    PaymentModesResponse,
    TopStocksResponse,
    TopCategoryResponse,
    ExpensesTrendResponse,
    ExpensesByCategoryResponse,
} from '../services/reports.service';
import useBusinessFeatures from './useBusinessFeatures';

export type ReportId =
    | 'total-sales'
    | 'net-profit'
    | 'top-stocks'
    | 'top-category'
    | 'receipt-count'
    | 'payment-modes'
    | 'expenses'
    | 'expenses-by-category'
    | null;

export type ReportVisualKey =
    | 'revenue'
    | 'profit'
    | 'service-orders'
    | 'top-stocks'
    | 'top-category'
    | 'receipt-count'
    | 'payment-modes'
    | 'average-sale'
    | 'expenses'
    | 'expenses-by-category';

export interface ReportStatConfig {
    id: ReportId;
    visualKey: ReportVisualKey;
    name: string;
    title: string;
    value: string;
    description?: string;
    hasData: boolean;
    /** Percent change vs. the previous equivalent period, when meaningful for this metric */
    delta?: number;
}

export interface ReportDetailRawData {
    'total-sales': TotalSalesResponse | null;
    'net-profit': NetProfitResponse | null;
    'receipt-count': ReceiptCountResponse | null;
    'payment-modes': PaymentModesResponse | null;
    'top-stocks': TopStocksResponse | null;
    'top-category': TopCategoryResponse | null;
    'expenses': ExpensesTrendResponse | null;
    'expenses-by-category': ExpensesByCategoryResponse | null;
}

export type DetailLoadingState = Record<NonNullable<ReportId>, boolean>;
export type DetailErrorState = Partial<Record<NonNullable<ReportId>, string>>;

const DEFAULT_SUMMARY: ReportSummary = {
    totalSales: 0,
    expenses: 0,
    netProfit: 0,
    topStocks: 0,
    topCategory: '',
    receiptCount: 0,
    paymentModes: 0,
};

const EMPTY_DETAIL_DATA: ReportDetailRawData = {
    'total-sales': null,
    'net-profit': null,
    'receipt-count': null,
    'payment-modes': null,
    'top-stocks': null,
    'top-category': null,
    'expenses': null,
    'expenses-by-category': null,
};

const LOADING_ALL_DETAIL: DetailLoadingState = {
    'total-sales': true,
    'net-profit': true,
    'receipt-count': true,
    'payment-modes': true,
    'top-stocks': true,
    'top-category': true,
    'expenses': true,
    'expenses-by-category': true,
};

const buildQuery = (start: Date | null, end: Date | null): { startDate?: string; endDate?: string } => {
    if (!start) return {};
    return {
        startDate: dayjs(start).format('YYYY-MM-DD'),
        endDate: end ? dayjs(end).format('YYYY-MM-DD') : dayjs(start).format('YYYY-MM-DD'),
    };
};

/** Same span, immediately preceding — mirrors MobileDateFilter.tsx's own prev/next-arrow day math. */
const getPreviousPeriod = (start: Date | null, end: Date | null): { start: Date | null; end: Date | null } => {
    if (!start) return { start: null, end: null };
    const rangeEnd = end ?? start;
    const daysDiff = dayjs(rangeEnd).diff(dayjs(start), 'day') + 1;
    return {
        start: dayjs(start).subtract(daysDiff, 'day').toDate(),
        end: dayjs(rangeEnd).subtract(daysDiff, 'day').toDate(),
    };
};

const computeDelta = (current: number, previous: number): number | undefined => {
    if (!Number.isFinite(previous) || previous <= 0) return undefined;
    return ((current - previous) / previous) * 100;
};

/**
 * Centralizes Reports data-fetching: the summary stat row, the previous-period
 * comparison used for delta badges, and the six detail-report datasets — one
 * hook instance per page (desktop index.tsx and MobileReports.tsx each own one),
 * modeled on useDashboardStats.ts's per-section load/stale-guard/single-toast pattern.
 */
export const useReportsSummary = () => {
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [previousSummary, setPreviousSummary] = useState<ReportSummary | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [detailData, setDetailData] = useState<ReportDetailRawData>(EMPTY_DETAIL_DATA);
    const [detailLoading, setDetailLoading] = useState<DetailLoadingState>(LOADING_ALL_DETAIL);
    const [detailErrors, setDetailErrors] = useState<DetailErrorState>({});
    const [activeReport, setActiveReport] = useState<ReportId>(null);
    const { showRetail, showServices } = useBusinessFeatures();

    const isMountedRef = useRef(true);
    const requestIdRef = useRef(0);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchAll = useCallback((start: Date | null, end: Date | null) => {
        const requestId = ++requestIdRef.current;
        const isStale = () => !isMountedRef.current || requestIdRef.current !== requestId;

        const query = buildQuery(start, end);
        const prevRange = getPreviousPeriod(start, end);
        const prevQuery = buildQuery(prevRange.start, prevRange.end);

        setIsSummaryLoading(true);
        setDetailLoading(LOADING_ALL_DETAIL);
        setDetailErrors({});

        let toastShown = false;
        const reportFailure = (label: string, err: unknown): string => {
            const message = getErrorMessage(err, `Failed to fetch ${label}`);
            console.error(`Error fetching ${label}:`, err);
            if (!toastShown) {
                toastShown = true;
                toast.error(message);
            }
            return message;
        };

        reportsService.getSummary(query)
            .then((value) => {
                if (isStale()) return;
                setSummary(value);
            })
            .catch((err) => {
                if (isStale()) return;
                reportFailure('report summary', err);
                setSummary(DEFAULT_SUMMARY);
            })
            .finally(() => {
                if (isStale()) return;
                setIsSummaryLoading(false);
            });

        // Comparison-only fetch for deltas — a failure here just means no delta
        // badge, so it stays quiet (no toast) rather than reporting an error for
        // a metric the user didn't ask to see.
        reportsService.getSummary(prevQuery)
            .then((value) => {
                if (isStale()) return;
                setPreviousSummary(value);
            })
            .catch((err) => {
                if (isStale()) return;
                console.error('Error fetching previous-period report summary:', err);
                setPreviousSummary(null);
            });

        const loadDetail = <K extends NonNullable<ReportId>>(
            key: K,
            fetcher: () => Promise<ReportDetailRawData[K]>,
        ): void => {
            fetcher()
                .then((value) => {
                    if (isStale()) return;
                    setDetailData((prev) => ({ ...prev, [key]: value }));
                })
                .catch((err) => {
                    if (isStale()) return;
                    const message = reportFailure(key, err);
                    setDetailErrors((prev) => ({ ...prev, [key]: message }));
                })
                .finally(() => {
                    if (isStale()) return;
                    setDetailLoading((prev) => ({ ...prev, [key]: false }));
                });
        };

        loadDetail('total-sales', () => reportsService.getTotalSales(query));
        loadDetail('net-profit', () => reportsService.getNetProfit(query));
        loadDetail('receipt-count', () => reportsService.getReceiptCount(query));
        loadDetail('payment-modes', () => reportsService.getPaymentModes(query));
        loadDetail('top-stocks', () => reportsService.getTopStocks(query));
        loadDetail('top-category', () => reportsService.getTopCategory(query));
        loadDetail('expenses', () => reportsService.getExpensesTrend(query));
        loadDetail('expenses-by-category', () => reportsService.getExpensesByCategory(query));
    }, []);

    useEffect(() => {
        fetchAll(startDate, endDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setStartDate(start);
        setEndDate(end);
        fetchAll(start, end);
    }, [fetchAll]);

    /** Refetches a single detail report against the current date range — used by each panel's inline retry. */
    const retryDetail = useCallback((reportId: NonNullable<ReportId>) => {
        const capturedRequestId = requestIdRef.current;
        const isStale = () => !isMountedRef.current || requestIdRef.current !== capturedRequestId;
        const query = buildQuery(startDate, endDate);

        const fetcherByKey: { [K in NonNullable<ReportId>]: () => Promise<ReportDetailRawData[K]> } = {
            'total-sales': () => reportsService.getTotalSales(query),
            'net-profit': () => reportsService.getNetProfit(query),
            'receipt-count': () => reportsService.getReceiptCount(query),
            'payment-modes': () => reportsService.getPaymentModes(query),
            'top-stocks': () => reportsService.getTopStocks(query),
            'top-category': () => reportsService.getTopCategory(query),
            'expenses': () => reportsService.getExpensesTrend(query),
            'expenses-by-category': () => reportsService.getExpensesByCategory(query),
        };

        setDetailLoading((prev) => ({ ...prev, [reportId]: true }));
        setDetailErrors((prev) => ({ ...prev, [reportId]: undefined }));

        fetcherByKey[reportId]()
            .then((value) => {
                if (isStale()) return;
                setDetailData((prev) => ({ ...prev, [reportId]: value }));
            })
            .catch((err) => {
                if (isStale()) return;
                const message = getErrorMessage(err, `Failed to fetch ${reportId}`);
                console.error(`Error fetching ${reportId}:`, err);
                setDetailErrors((prev) => ({ ...prev, [reportId]: message }));
            })
            .finally(() => {
                if (isStale()) return;
                setDetailLoading((prev) => ({ ...prev, [reportId]: false }));
            });
    }, [startDate, endDate]);

    const reportCards: ReportStatConfig[] = useMemo(() => {
        const so = summary?.serviceOrders;
        const prevSo = previousSummary?.serviceOrders;
        const hasCombined = showRetail && showServices;
        const cards: ReportStatConfig[] = [];

        const revenueValue = hasCombined
            ? summary?.combinedRevenue ?? 0
            : showRetail
                ? summary?.totalSales ?? 0
                : so?.totalRevenue ?? 0;

        const previousRevenueValue = previousSummary
            ? (hasCombined
                ? previousSummary.combinedRevenue ?? 0
                : showRetail
                    ? previousSummary.totalSales ?? 0
                    : prevSo?.totalRevenue ?? 0)
            : 0;

        const profitValue = hasCombined
            ? summary?.combinedGrossProfit ?? 0
            : showRetail
                ? summary?.netProfit ?? 0
                : so?.grossProfit ?? 0;

        const previousProfitValue = previousSummary
            ? (hasCombined
                ? previousSummary.combinedGrossProfit ?? 0
                : showRetail
                    ? previousSummary.netProfit ?? 0
                    : prevSo?.grossProfit ?? 0)
            : 0;

        if (hasCombined) {
            cards.push({
                id: 'total-sales',
                visualKey: 'revenue',
                name: 'Combined Revenue',
                title: 'Revenue',
                value: formatCurrency(summary?.combinedRevenue ?? 0, true),
                description: 'Total revenue from product sales and services',
                hasData: (summary?.combinedRevenue ?? 0) > 0,
                delta: computeDelta(revenueValue, previousRevenueValue),
            });
        } else if (showRetail) {
            cards.push({
                id: 'total-sales',
                visualKey: 'revenue',
                name: 'Total Sales',
                title: 'Revenue',
                value: formatCurrency(summary?.totalSales ?? 0, true),
                description: 'Revenue from product sales',
                hasData: (summary?.totalSales ?? 0) > 0,
                delta: computeDelta(revenueValue, previousRevenueValue),
            });
        } else {
            cards.push({
                id: 'total-sales',
                visualKey: 'revenue',
                name: 'Service Revenue',
                title: 'Revenue',
                value: formatCurrency(so?.totalRevenue ?? 0, true),
                description: 'Revenue from service orders',
                hasData: (so?.totalRevenue ?? 0) > 0,
                delta: computeDelta(revenueValue, previousRevenueValue),
            });
        }

        if (hasCombined) {
            cards.push({
                id: 'net-profit',
                visualKey: 'profit',
                name: 'Combined Gross Profit',
                title: 'Profit',
                value: formatCurrency(summary?.combinedGrossProfit ?? 0, true),
                description: 'Profit from products and services',
                hasData: (summary?.combinedGrossProfit ?? 0) !== 0,
                delta: computeDelta(profitValue, previousProfitValue),
            });
        } else if (showRetail) {
            cards.push({
                id: 'net-profit',
                visualKey: 'profit',
                name: 'Net Profit',
                title: 'Profit',
                value: formatCurrency(summary?.netProfit ?? 0, true),
                description: 'Revenue minus cost, discounts, and approved expenses',
                hasData: (summary?.netProfit ?? 0) !== 0,
                delta: computeDelta(profitValue, previousProfitValue),
            });
        } else {
            cards.push({
                id: 'net-profit',
                visualKey: 'profit',
                name: 'Service Gross Profit',
                title: 'Profit',
                value: formatCurrency(so?.grossProfit ?? 0, true),
                description: 'Service revenue minus material costs',
                hasData: (so?.grossProfit ?? 0) !== 0,
                delta: computeDelta(profitValue, previousProfitValue),
            });
        }

        if (showServices && so) {
            cards.push({
                id: null,
                visualKey: 'service-orders',
                name: 'Service Orders',
                title: 'Service Orders',
                value: String(so.orderCount ?? 0),
                description: `Material cost: ${formatCurrency(so.totalConsumptionCost ?? 0, true)}`,
                hasData: (so.orderCount ?? 0) > 0,
                delta: computeDelta(so.orderCount ?? 0, prevSo?.orderCount ?? 0),
            });
        }

        if (showRetail) {
            cards.push({
                id: 'top-stocks',
                visualKey: 'top-stocks',
                name: 'Top Stocks',
                title: 'Top Stocks',
                value: `${summary?.topStocks ?? 0} items`,
                description: 'Best performing inventory items',
                hasData: (summary?.topStocks ?? 0) > 0,
            });

            cards.push({
                id: 'top-category',
                visualKey: 'top-category',
                name: 'Top Category',
                title: 'Top Category',
                value: summary?.topCategory || 'N/A',
                description: 'Highest selling category',
                hasData: !!summary?.topCategory,
            });

            cards.push({
                id: 'expenses',
                visualKey: 'expenses',
                name: 'Expenses',
                title: 'Expenses',
                value: formatCurrency(summary?.expenses ?? 0, true),
                description: 'Approved business expenses',
                hasData: (summary?.expenses ?? 0) > 0,
                delta: computeDelta(summary?.expenses ?? 0, previousSummary?.expenses ?? 0),
            });

            cards.push({
                id: 'expenses-by-category',
                visualKey: 'expenses-by-category',
                name: 'Expenses by Category',
                title: 'Expenses by Category',
                value: `${summary?.expenses ? formatCurrency(summary.expenses, true) : 'N/A'}`,
                description: 'Approved expenses broken down by category',
                hasData: (summary?.expenses ?? 0) > 0,
            });
        }

        const receiptCount = summary?.receiptCount ?? 0;
        cards.push({
            id: 'receipt-count',
            visualKey: 'receipt-count',
            name: 'Receipt Count',
            title: 'Sales Count',
            value: String(receiptCount),
            description: 'Total receipts issued',
            hasData: receiptCount > 0,
            delta: computeDelta(receiptCount, previousSummary?.receiptCount ?? 0),
        });

        cards.push({
            id: 'payment-modes',
            visualKey: 'payment-modes',
            name: 'Payment Modes',
            title: 'Payment Modes',
            value: `${summary?.paymentModes ?? 0} methods`,
            description: 'Breakdown by payment method',
            hasData: (summary?.paymentModes ?? 0) > 0,
        });

        const averageSaleValue = receiptCount > 0 ? revenueValue / receiptCount : 0;
        const previousReceiptCount = previousSummary?.receiptCount ?? 0;
        const previousAverageSaleValue = previousReceiptCount > 0 ? previousRevenueValue / previousReceiptCount : 0;
        cards.push({
            id: null,
            visualKey: 'average-sale',
            name: 'Average Sale Value',
            title: 'Average Sale',
            value: formatCurrency(averageSaleValue, true),
            description: 'Revenue per receipt',
            hasData: averageSaleValue > 0,
            delta: computeDelta(averageSaleValue, previousAverageSaleValue),
        });

        return cards;
    }, [summary, previousSummary, showRetail, showServices]);

    const hasNoData = useMemo(() => {
        if (!summary) return true;
        const hasProductData = summary.totalSales > 0 || summary.netProfit > 0 || summary.receiptCount > 0;
        const hasServiceData = (summary.serviceOrders?.totalRevenue ?? 0) > 0 || (summary.serviceOrders?.orderCount ?? 0) > 0;
        return !hasProductData && !hasServiceData;
    }, [summary]);

    return {
        startDate,
        endDate,
        summary,
        isSummaryLoading,
        activeReport,
        setActiveReport,
        reportCards,
        hasNoData,
        handleDateChange,
        detailData,
        detailLoading,
        detailErrors,
        retryDetail,
    };
};

export default useReportsSummary;
