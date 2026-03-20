import { useState, useCallback } from 'react';
import { Notify } from 'notiflix';
import inventoryValuationService from '../services/inventory-valuation.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { useSettings } from './useSettings';

export const useInventoryValuation = () => {
    const { setup } = useSettings();

    const [summary, setSummary] = useState<InventoryValuationSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Drill-down state
    const [selectedItem, setSelectedItem] = useState<InventoryValuationItem | null>(null);
    const [itemValuation, setItemValuation] = useState<ItemValuation | null>(null);
    const [costLayers, setCostLayers] = useState<InventoryCostLayer[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Active costing method for display toggle
    const [displayMethod, setDisplayMethod] = useState<CostingMethodType>('WEIGHTED_AVERAGE');

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';

    /**
     * Load the branch-level valuation summary
     */
    const loadSummary = useCallback(async () => {
        if (!tenantId || !branchId) return;
        setIsLoading(true);
        try {
            const data = await inventoryValuationService.getValuationSummary();
            setSummary(data);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load valuation summary'));
            console.error('Load valuation summary error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId]);

    /**
     * Load single-item valuation + cost layers
     */
    const loadItemDetail = useCallback(async (inventoryId: string) => {
        setIsLoadingDetail(true);
        try {
            const [valuation, layers] = await Promise.all([
                inventoryValuationService.getItemValuation(inventoryId),
                inventoryValuationService.getCostLayers(inventoryId),
            ]);
            setItemValuation(valuation);
            setCostLayers(layers as unknown as InventoryCostLayer[]);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load item valuation'));
            console.error('Load item valuation error:', error);
        } finally {
            setIsLoadingDetail(false);
        }
    }, []);

    /**
     * Open drill-down for a specific item
     */
    const openDrillDown = useCallback((item: InventoryValuationItem) => {
        setSelectedItem(item);
        loadItemDetail(item.inventoryId);
    }, [loadItemDetail]);

    /**
     * Close drill-down
     */
    const closeDrillDown = useCallback(() => {
        setSelectedItem(null);
        setItemValuation(null);
        setCostLayers([]);
    }, []);

    /**
     * Get the correct total value for the active display method
     */
    const getDisplayTotal = useCallback(() => {
        if (!summary) return 0;
        switch (displayMethod) {
            case 'FIFO': return summary.totalFIFOValue;
            case 'LIFO': return summary.totalLIFOValue;
            default: return summary.totalWeightedAverageValue;
        }
    }, [summary, displayMethod]);

    /**
     * Get item value for the current display method
     */
    const getItemDisplayValue = useCallback((item: InventoryValuationItem) => {
        switch (displayMethod) {
            case 'FIFO': return item.fifoValue ?? item.totalValue;
            case 'LIFO': return item.lifoValue ?? item.totalValue;
            default: return item.totalValue;
        }
    }, [displayMethod]);

    /**
     * Change costing method for a specific inventory item
     */
    const changeCostingMethod = useCallback(async (
        inventoryId: string,
        newMethod: CostingMethodType
    ) => {
        try {
            const result = await inventoryValuationService.changeCostingMethod({
                inventoryId,
                newMethod,
            });
            Notify.success(
                `Costing method changed to ${newMethod.replace('_', ' ')}`
            );
            // Refresh both summary and detail
            loadSummary();
            loadItemDetail(inventoryId);
            return result;
        } catch (error: any) {
            Notify.failure(
                getErrorMessage(error, 'Failed to change costing method')
            );
            throw error;
        }
    }, [loadSummary, loadItemDetail]);

    /**
     * Record opening balance for an inventory item
     */
    const recordOpeningBalance = useCallback(async (payload: {
        inventoryId: string;
        quantity: number;
        unitCost: number;
        openingDate?: string;
        notes?: string;
    }) => {
        try {
            await inventoryValuationService.recordOpeningBalance(payload);
            Notify.success('Opening balance recorded successfully');
            loadSummary();
        } catch (error: any) {
            Notify.failure(
                getErrorMessage(error, 'Failed to record opening balance')
            );
            throw error;
        }
    }, [loadSummary]);

    return {
        summary,
        isLoading,
        loadSummary,
        displayMethod,
        setDisplayMethod,
        getDisplayTotal,
        getItemDisplayValue,
        // Drill-down
        selectedItem,
        itemValuation,
        costLayers,
        isLoadingDetail,
        openDrillDown,
        closeDrillDown,
        // Actions
        changeCostingMethod,
        recordOpeningBalance,
        // Context
        tenantId,
        branchId,
    };
};
