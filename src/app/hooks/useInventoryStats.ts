import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import inventoryService, {
    InventoryOverview,
    TopValueItem,
    InventoryOverviewQuery,
    InventorySummary,
    InventoryCount,
} from '../services/inventory.service';

export interface InventoryStats {
    overview: InventoryOverview | null;
    topValueItems: TopValueItem[];
    summary: InventorySummary | null;
    count: InventoryCount | null;
}

export interface UseInventoryStatsReturn {
    stats: InventoryStats;
    isLoading: boolean;
    error: string | null;
    fetchOverview: (query?: InventoryOverviewQuery) => Promise<InventoryOverview | null>;
    fetchTopValueItems: (limit?: number) => Promise<TopValueItem[]>;
    fetchSummary: () => Promise<InventorySummary | null>;
    fetchCount: () => Promise<InventoryCount | null>;
    fetchAllStats: (overviewQuery?: InventoryOverviewQuery, topValueLimit?: number) => Promise<void>;
    refreshStats: () => Promise<void>;
}

/**
 * Hook for fetching and managing inventory statistics
 * Provides access to overview, top value items, summary, and counts
 */
export const useInventoryStats = (
    autoFetch: boolean = false,
    initialOverviewQuery?: InventoryOverviewQuery
): UseInventoryStatsReturn => {
    const [stats, setStats] = useState<InventoryStats>({
        overview: null,
        topValueItems: [],
        summary: null,
        count: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch inventory overview with optional filters
     */
    const fetchOverview = useCallback(async (query: InventoryOverviewQuery = {}): Promise<InventoryOverview | null> => {
        try {
            const overview = await inventoryService.getOverview(query);
            setStats(prev => ({ ...prev, overview }));
            setError(null);
            return overview;
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to fetch inventory overview';
            setError(message);
            console.error('Error fetching inventory overview:', err);
            return null;
        }
    }, []);

    /**
     * Fetch top value inventory items
     */
    const fetchTopValueItems = useCallback(async (limit: number = 10): Promise<TopValueItem[]> => {
        try {
            const items = await inventoryService.getTopValueItems(limit);
            setStats(prev => ({ ...prev, topValueItems: items }));
            setError(null);
            return items;
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to fetch top value items';
            setError(message);
            console.error('Error fetching top value items:', err);
            return [];
        }
    }, []);

    /**
     * Fetch inventory summary
     */
    const fetchSummary = useCallback(async (): Promise<InventorySummary | null> => {
        try {
            const summary = await inventoryService.getSummary();
            setStats(prev => ({ ...prev, summary }));
            setError(null);
            return summary;
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to fetch inventory summary';
            setError(message);
            console.error('Error fetching inventory summary:', err);
            return null;
        }
    }, []);

    /**
     * Fetch inventory counts
     */
    const fetchCount = useCallback(async (): Promise<InventoryCount | null> => {
        try {
            const count = await inventoryService.getCount();
            setStats(prev => ({ ...prev, count }));
            setError(null);
            return count;
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to fetch inventory count';
            setError(message);
            console.error('Error fetching inventory count:', err);
            return null;
        }
    }, []);

    /**
     * Fetch all stats in parallel
     */
    const fetchAllStats = useCallback(async (
        overviewQuery: InventoryOverviewQuery = {},
        topValueLimit: number = 10
    ): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const [overview, topValueItems, summary, count] = await Promise.all([
                inventoryService.getOverview(overviewQuery).catch(() => null),
                inventoryService.getTopValueItems(topValueLimit).catch(() => []),
                inventoryService.getSummary().catch(() => null),
                inventoryService.getCount().catch(() => null),
            ]);

            setStats({
                overview,
                topValueItems,
                summary,
                count,
            });
        } catch (err: any) {
            const message = err?.response?.data?.message || 'Failed to fetch inventory stats';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Refresh all stats with current filters
     */
    const refreshStats = useCallback(async (): Promise<void> => {
        await fetchAllStats(initialOverviewQuery);
    }, [fetchAllStats, initialOverviewQuery]);

    // Auto-fetch on mount if enabled
    useEffect(() => {
        if (autoFetch) {
            fetchAllStats(initialOverviewQuery);
        }
    }, [autoFetch]);

    return {
        stats,
        isLoading,
        error,
        fetchOverview,
        fetchTopValueItems,
        fetchSummary,
        fetchCount,
        fetchAllStats,
        refreshStats,
    };
};

export default useInventoryStats;
