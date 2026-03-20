import { useState, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import inventoryValuationService from '../services/inventory-valuation.service';
import { useSettings } from './useSettings';

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
    const { setup } = useSettings();

    const [agingData, setAgingData] = useState<InventoryAgingResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [thresholdDays, setThresholdDays] = useState<number>(90);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'slow' | 'dead'>('all');

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';

    const loadAgingReport = useCallback(async (threshold?: number) => {
        if (!tenantId || !branchId) return;
        setIsLoading(true);
        try {
            const data = await inventoryValuationService.getInventoryAging(
                threshold ?? thresholdDays,
                branchId
            );
            setAgingData(data);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load aging report'));
            console.error('Load aging report error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId, thresholdDays]);

    /**
     * Get bucket chart data for visualization
     */
    const getBucketChartData = useCallback(() => {
        if (!agingData) return [];
        return BUCKET_KEYS.map((key) => ({
            key,
            label: BUCKET_LABELS[key],
            color: BUCKET_COLORS[key],
            itemCount: agingData.buckets[key].itemCount,
            totalQuantity: agingData.buckets[key].totalQuantity,
            totalValue: agingData.buckets[key].totalValue,
        }));
    }, [agingData]);

    /**
     * Filter items by status
     */
    const getFilteredItems = useCallback(() => {
        if (!agingData) return [];
        if (statusFilter === 'all') return agingData.items;
        return agingData.items.filter((item) => item.status === statusFilter);
    }, [agingData, statusFilter]);

    /**
     * Total value at risk (slow + never-sold)
     */
    const valueAtRisk = agingData
        ? agingData.slowMoverValue + agingData.neverSoldValue
        : 0;

    return {
        agingData,
        isLoading,
        thresholdDays,
        setThresholdDays,
        statusFilter,
        setStatusFilter,
        loadAgingReport,
        getBucketChartData,
        getFilteredItems,
        valueAtRisk,
        tenantId,
        branchId,
    };
};
