import { useState, useCallback, useEffect } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import inventoryValuationService from '../services/inventory-valuation.service';
import { useSettings } from './useSettings';
import { usePagination } from './usePagination';

/**
 * Hook for COGS & Profitability reporting
 * Fetches period COGS (ledger + sales cross-check) and gross profit by product
 */
export const useCOGSReport = () => {
    const { setup } = useSettings();

    // Date range (default: current month)
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstOfMonth);
    const [endDate, setEndDate] = useState(today);

    // Period COGS
    const [periodCOGS, setPeriodCOGS] = useState<PeriodCOGSResult | null>(null);
    const [salesCOGS, setSalesCOGS] = useState<PeriodCOGSFromSalesResult | null>(null);
    const [isLoadingCOGS, setIsLoadingCOGS] = useState(false);
    const [showCrossCheck, setShowCrossCheck] = useState(false);

    // Gross profit
    const [grossProfitItems, setGrossProfitItems] = useState<GrossProfitProductItem[]>([]);
    const [grossProfitSummary, setGrossProfitSummary] = useState<GrossProfitSummary | null>(null);
    const [isLoadingProfit, setIsLoadingProfit] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const {
        page, perPage, totalRows, setTotalRows,
        handlePageChange, handlePerRowsChange, resetPage,
    } = usePagination({ initialPerPage: 15 });

    const branchId = setup?.branchId || '';

    /**
     * Load period COGS from stock-movement ledger
     * Optionally also loads the sales-derived COGS for cross-check
     */
    const loadPeriodCOGS = useCallback(async (compareSales = false) => {
        if (!startDate || !endDate) return;
        setIsLoadingCOGS(true);
        try {
            const promises: Promise<any>[] = [
                inventoryValuationService.getPeriodCOGS(startDate, endDate, branchId || undefined),
            ];
            if (compareSales) {
                promises.push(
                    inventoryValuationService.getPeriodCOGSFromSales(startDate, endDate, branchId || undefined)
                );
            }
            const [cogsResult, salesResult] = await Promise.all(promises);
            setPeriodCOGS(cogsResult);
            if (salesResult) setSalesCOGS(salesResult);
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load period COGS'));
            console.error('Load period COGS error:', error);
        } finally {
            setIsLoadingCOGS(false);
        }
    }, [startDate, endDate, branchId]);

    /**
     * Load gross profit by product (paginated)
     */
    const loadGrossProfit = useCallback(async () => {
        if (!startDate || !endDate) return;
        setIsLoadingProfit(true);
        try {
            const result = await inventoryValuationService.getGrossProfitByProduct({
                startDate,
                endDate,
                page,
                perPage,
                search: searchTerm || undefined,
                branchId: branchId || undefined,
            });
            setGrossProfitItems(result.items);
            setGrossProfitSummary(result.summary);
            setTotalRows(result.pagination.totalItems);
        } catch (error: any) {
            setGrossProfitItems([]);
            setGrossProfitSummary(null);
            setTotalRows(0);
            Notify.failure(getErrorMessage(error, 'Failed to load gross profit data'));
            console.error('Load gross profit error:', error);
        } finally {
            setIsLoadingProfit(false);
        }
    }, [startDate, endDate, page, perPage, searchTerm, branchId, setTotalRows]);

    /**
     * Search handler — resets to page 1
     */
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        resetPage();
    }, [resetPage]);

    /**
     * Reload gross profit when pagination/search/dates change
     */
    useEffect(() => {
        loadGrossProfit();
    }, [loadGrossProfit]);

    /**
     * Load all data for the current date range
     */
    const loadAll = useCallback(async () => {
        await Promise.all([
            loadPeriodCOGS(showCrossCheck),
            loadGrossProfit(),
        ]);
    }, [loadPeriodCOGS, loadGrossProfit, showCrossCheck]);

    /**
     * COGS discrepancy (if cross-check enabled)
     */
    const cogsDiscrepancy = periodCOGS && salesCOGS
        ? Math.abs(periodCOGS.totalCOGS - salesCOGS.totalCOGS)
        : null;

    const hasDiscrepancy = cogsDiscrepancy !== null && cogsDiscrepancy > 0.01;

    return {
        // Date range
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        // COGS
        periodCOGS,
        salesCOGS,
        isLoadingCOGS,
        loadPeriodCOGS,
        showCrossCheck,
        setShowCrossCheck,
        cogsDiscrepancy,
        hasDiscrepancy,
        // Gross profit
        grossProfitItems,
        grossProfitSummary,
        isLoadingProfit,
        loadGrossProfit,
        // Search & Pagination
        searchTerm,
        handleSearch,
        page,
        perPage,
        totalRows,
        handlePageChange,
        handlePerRowsChange,
        // Combined
        loadAll,
        branchId,
    };
};
