import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import dashboardService, {
    DashboardSummary,
    DashboardDataPoint,
    TopSellingProduct,
    RecentSaleItem,
    LowStockItem,
} from '../services/dashboard.service';
import { getErrorMessage } from '../utils/api-error-handler';

export interface LowStockSection {
    items: LowStockItem[];
    totalCount: number;
}

export interface DashboardStats {
    summary: DashboardSummary | null;
    revenueTrend: DashboardDataPoint[];
    paymentMethods: DashboardDataPoint[];
    expensesByCategory: DashboardDataPoint[];
    topProducts: TopSellingProduct[];
    recentSales: RecentSaleItem[];
    lowStock: LowStockSection;
}

const EMPTY_STATS: DashboardStats = {
    summary: null,
    revenueTrend: [],
    paymentMethods: [],
    expensesByCategory: [],
    topProducts: [],
    recentSales: [],
    lowStock: { items: [], totalCount: 0 },
};

export type DashboardLoadingState = Record<keyof DashboardStats, boolean>;

export interface UseDashboardStatsReturn {
    stats: DashboardStats;
    /** Per-section loading flags, so a fast section can render before a slow one finishes */
    loading: DashboardLoadingState;
    /** True while any section is still loading — handy for a first-paint skeleton */
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export type DashboardSectionFlags = Partial<Record<keyof DashboardStats, boolean>>;

interface UseDashboardStatsOptions {
    branchId?: string;
    enabledSections?: DashboardSectionFlags;
}

/**
 * Hook for fetching and managing dashboard statistics.
 * Each section is fetched independently and updates the moment it resolves,
 * instead of the whole dashboard waiting on the slowest of six requests.
 * A failure in one section falls back to an empty value rather than failing
 * the whole dashboard, and stale responses (from a superseded refetch, or
 * after unmount) are dropped.
 */
const normalizeEnabledSections = (enabledSections?: DashboardSectionFlags): DashboardLoadingState => ({
    summary: enabledSections?.summary ?? true,
    revenueTrend: enabledSections?.revenueTrend ?? true,
    paymentMethods: enabledSections?.paymentMethods ?? true,
    expensesByCategory: enabledSections?.expensesByCategory ?? true,
    topProducts: enabledSections?.topProducts ?? true,
    recentSales: enabledSections?.recentSales ?? true,
    lowStock: enabledSections?.lowStock ?? true,
});

const toLoadingState = (enabledSections: DashboardLoadingState): DashboardLoadingState => ({
    ...enabledSections,
});

const isEnabled = (enabledSections: DashboardLoadingState, key: keyof DashboardStats): boolean => {
    return enabledSections[key];
};

export const useDashboardStats = (options: UseDashboardStatsOptions = {}): UseDashboardStatsReturn => {
    const branchId = options.branchId;
    const enabledSections = useMemo(
        () => normalizeEnabledSections(options.enabledSections),
        [
            options.enabledSections?.summary,
            options.enabledSections?.revenueTrend,
            options.enabledSections?.paymentMethods,
            options.enabledSections?.expensesByCategory,
            options.enabledSections?.topProducts,
            options.enabledSections?.recentSales,
            options.enabledSections?.lowStock,
        ],
    );
    const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
    const [loading, setLoading] = useState<DashboardLoadingState>(() => toLoadingState(enabledSections));
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const requestIdRef = useRef(0);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const fetchAll = useCallback(async (): Promise<void> => {
        const requestId = ++requestIdRef.current;
        const isStale = () => !isMountedRef.current || requestIdRef.current !== requestId;

        setLoading(toLoadingState(enabledSections));
        setError(null);
        let toastShown = false;

        const load = <K extends keyof DashboardStats>(key: K, fetcher: () => Promise<DashboardStats[K]>): void => {
            if (!isEnabled(enabledSections, key)) {
                return;
            }

            fetcher()
                .then((value) => {
                    if (isStale()) return;
                    setStats((prev) => ({ ...prev, [key]: value }));
                })
                .catch((err) => {
                    if (isStale()) return;
                    const message = getErrorMessage(err, `Failed to fetch dashboard ${key}`);
                    console.error(`Error fetching dashboard ${key}:`, err);
                    setError(message);
                    if (!toastShown) {
                        toastShown = true;
                        toast.error(message);
                    }
                })
                .finally(() => {
                    if (isStale()) return;
                    setLoading((prev) => ({ ...prev, [key]: false }));
                });
        };

        load('summary', () => dashboardService.getSummary({ branchId }));
        load('revenueTrend', () => dashboardService.getRevenueTrend({ branchId }).then((res) => res.data));
        load('paymentMethods', () => dashboardService.getPaymentMethods({ branchId }).then((res) => res.data));
        load('expensesByCategory', () => dashboardService.getExpensesByCategory({ branchId }).then((res) => res.data));
        load('topProducts', () => dashboardService.getTopProducts({ branchId }).then((res) => res.data));
        load('recentSales', () => dashboardService.getRecentSales({ branchId }).then((res) => res.data));
        load('lowStock', () =>
            dashboardService.getLowStock({ branchId }).then((res) => ({ items: res.data, totalCount: res.totalCount })),
        );
    }, [branchId, enabledSections]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const isLoading = Object.values(loading).some(Boolean);

    return { stats, loading, isLoading, error, refetch: fetchAll };
};

export default useDashboardStats;
