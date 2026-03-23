import { useState, useCallback, useEffect } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import inventoryValuationService from '../services/inventory-valuation.service';
import { useSettings } from './useSettings';
import { usePagination } from './usePagination';

const BUCKET_KEYS = ['0-30', '31-60', '61-90', '91-180', '181-365', '365+', 'never'] as const;
type BucketKey = (typeof BUCKET_KEYS)[number];

const BUCKET_LABELS: Record<BucketKey, string> = {
    '0-30': '0–30 days',
    '31-60': '31–60 days',
    '61-90': '61–90 days',
    '91-180': '91–180 days',
    '181-365': '181–365 days',
    '365+': '365+ days',
    never: 'Never sold',
};

const BUCKET_COLORS: Record<BucketKey, string> = {
    '0-30': '#10b981',   // emerald-500
    '31-60': '#3b82f6',  // blue-500
    '61-90': '#f59e0b',  // amber-500
    '91-180': '#f97316',  // orange-500
    '181-365': '#ef4444', // red-500
    '365+': '#dc2626',   // red-600
    never: '#6b7280',    // gray-500
};

export { BUCKET_KEYS, BUCKET_LABELS, BUCKET_COLORS };
export type { BucketKey };

export const useInventoryAging = () => {
    const { setup, loading: setupLoading } = useSettings();

    const [items, setItems] = useState<InventoryAgingItem[]>([]);
    const [summary, setSummary] = useState<InventoryAgingSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [thresholdDays, setThresholdDays] = useState<number>(90);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'slow' | 'dead'>('all');

    const {
        page, perPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange, resetPage,
        hasNextPage, hasPrevPage, nextPage, prevPage, pageLabel,
    } = usePagination({ initialPerPage: 15 });

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';

    const loadAgingReport = useCallback(async (threshold?: number) => {
        if (!tenantId || !branchId) return;
        setIsLoading(true);
        try {
            const data = await inventoryValuationService.getInventoryAging({
                page,
                limit: perPage,
                search: searchTerm || undefined,
                statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
                thresholdDays: threshold ?? thresholdDays,
                branchId,
            });
            setItems(data.items);
            setSummary(data.summary);
            setTotalRows(data.pagination.totalItems);
        } catch (error: any) {
            setItems([]);
            setSummary(null);
            setTotalRows(0);
            Notify.failure(getErrorMessage(error, 'Failed to load aging report'));
            console.error('Load aging report error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId, page, perPage, searchTerm, statusFilter, thresholdDays, setTotalRows]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        resetPage();
    }, [resetPage]);

    const handleStatusFilterChange = useCallback((value: 'all' | 'active' | 'slow' | 'dead') => {
        setStatusFilter(value);
        resetPage();
    }, [resetPage]);

    const handleThresholdChange = useCallback((days: number) => {
        setThresholdDays(days);
        resetPage();
    }, [resetPage]);

    useEffect(() => {
        loadAgingReport();
    }, [loadAgingReport]);

    /**
     * Get bucket chart data for visualization
     */
    const getBucketChartData = useCallback(() => {
        if (!summary) return [];
        return BUCKET_KEYS.map((key) => ({
            key,
            label: BUCKET_LABELS[key],
            color: BUCKET_COLORS[key],
            itemCount: summary.buckets[key].itemCount,
            totalQuantity: summary.buckets[key].totalQuantity,
            totalValue: summary.buckets[key].totalValue,
        }));
    }, [summary]);

    /**
     * Total value at risk (slow + never-sold)
     */
    const valueAtRisk = summary
        ? summary.slowMoverValue + summary.neverSoldValue
        : 0;

    const isBusy = setupLoading || isLoading;

    return {
        items,
        summary,
        isLoading: isBusy,
        loadAgingReport,
        // Pagination & search
        page,
        perPage,
        totalRows,
        searchTerm,
        handleSearch,
        handlePageChange,
        handlePerRowsChange,
        hasNextPage,
        hasPrevPage,
        nextPage,
        prevPage,
        pageLabel,
        // Filters
        thresholdDays,
        handleThresholdChange,
        statusFilter,
        handleStatusFilterChange,
        // Chart helpers
        getBucketChartData,
        valueAtRisk,
        tenantId,
        branchId,
    };
};
