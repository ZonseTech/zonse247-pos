import { useState, useCallback, useEffect } from 'react';
import { Notify } from 'notiflix';
import inventoryValuationService from '../services/inventory-valuation.service';
import { getErrorMessage } from '../utils/api-error-handler';
import { useSettings } from './useSettings';
import { usePagination } from './usePagination';

export const useInventoryValuation = () => {
    const { setup, loading: setupLoading } = useSettings();

    const [items, setItems] = useState<InventoryValuationItem[]>([]);
    const [summary, setSummary] = useState<InventoryValuationSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const {
        page, perPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange, resetPage,
        hasNextPage, hasPrevPage, nextPage, prevPage, pageLabel,
    } = usePagination({ initialPerPage: 10 });

    const [selectedItem, setSelectedItem] = useState<InventoryValuationItem | null>(null);
    const [itemValuation, setItemValuation] = useState<ItemValuation | null>(null);
    const [costLayers, setCostLayers] = useState<InventoryCostLayer[]>([]);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const [displayMethod, setDisplayMethod] = useState<CostingMethodType>('WEIGHTED_AVERAGE');

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';

    const loadSummary = useCallback(async () => {
        if (!tenantId || !branchId) return;
        setIsLoading(true);
        try {
            const data = await inventoryValuationService.getValuationSummary({
                page,
                limit: perPage,
                search: searchTerm || undefined,
                costingMethod: displayMethod,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setItems(data.items);
            setSummary(data.summary);
            setTotalRows(data.pagination.totalItems);
        } catch (error: any) {
            setItems([]);
            setSummary(null);
            setTotalRows(0);
            Notify.failure(getErrorMessage(error, 'Failed to load valuation summary'));
            console.error('Load valuation summary error:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId, page, perPage, searchTerm, displayMethod, startDate, endDate, setTotalRows]);

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        resetPage();
    }, [resetPage]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

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

    const openDrillDown = useCallback((item: InventoryValuationItem) => {
        setSelectedItem(item);
        loadItemDetail(item.inventoryId);
    }, [loadItemDetail]);

    const closeDrillDown = useCallback(() => {
        setSelectedItem(null);
        setItemValuation(null);
        setCostLayers([]);
    }, []);

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

    const isBusy = setupLoading || isLoading;

    return {
        items,
        summary,
        isLoading: isBusy,
        loadSummary,
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
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        displayMethod,
        setDisplayMethod,
        selectedItem,
        itemValuation,
        costLayers,
        isLoadingDetail,
        openDrillDown,
        closeDrillDown,
        changeCostingMethod,
        recordOpeningBalance,
        tenantId,
        branchId,
    };
};
