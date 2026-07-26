import { useCallback, useEffect, useRef, useState } from 'react';
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

const LOADING_ALL: DashboardLoadingState = {
    summary: true,
    revenueTrend: true,
    paymentMethods: true,
    expensesByCategory: true,
    topProducts: true,
    recentSales: true,
    lowStock: true,
};

export interface UseDashboardStatsReturn {
    stats: DashboardStats;
    /** Per-section loading flags, so a fast section can render before a slow one finishes */
    loading: DashboardLoadingState;
    /** True while any section is still loading — handy for a first-paint skeleton */
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing dashboard statistics.
 * Each section is fetched independently and updates the moment it resolves,
 * instead of the whole dashboard waiting on the slowest of six requests.
 * A failure in one section falls back to an empty value rather than failing
 * the whole dashboard, and stale responses (from a superseded refetch, or
 * after unmount) are dropped.
 */
export const useDashboardStats = (query: { branchId?: string } = {}): UseDashboardStatsReturn => {
    const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
    const [loading, setLoading] = useState<DashboardLoadingState>(LOADING_ALL);
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

        setLoading(LOADING_ALL);
        setError(null);
        let toastShown = false;

        const load = <K extends keyof DashboardStats>(key: K, fetcher: () => Promise<DashboardStats[K]>): void => {
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

        load('summary', () => dashboardService.getSummary(query));
        load('revenueTrend', () => dashboardService.getRevenueTrend(query).then((res) => res.data));
        load('paymentMethods', () => dashboardService.getPaymentMethods(query).then((res) => res.data));
        load('expensesByCategory', () => dashboardService.getExpensesByCategory(query).then((res) => res.data));
        load('topProducts', () => dashboardService.getTopProducts(query).then((res) => res.data));
        load('recentSales', () => dashboardService.getRecentSales(query).then((res) => res.data));
        load('lowStock', () =>
            dashboardService.getLowStock(query).then((res) => ({ items: res.data, totalCount: res.totalCount })),
        );
    }, [query.branchId]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const isLoading = Object.values(loading).some(Boolean);

    return { stats, loading, isLoading, error, refetch: fetchAll };
};

export default useDashboardStats;
