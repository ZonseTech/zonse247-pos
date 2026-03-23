import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { stockMovementService } from '../services';
import { useSettings } from './useSettings';

/**
 * Helper to derive movement direction from movement type
 */
const getDirectionFromType = (movementType: StockMovementType): StockMovementDirection => {
    const inTypes: StockMovementType[] = ['PURCHASE_RECEIPT', 'RETURN', 'TRANSFER_IN', 'OPENING_BALANCE'];
    const outTypes: StockMovementType[] = ['SALE', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRY', 'RETURN_TO_SUPPLIER'];

    if (inTypes.includes(movementType)) return 'IN';
    if (outTypes.includes(movementType)) return 'OUT';
    return 'ADJUSTMENT';
};

/**
 * Normalize API response to match expected StockMovement interface
 */
const normalizeMovement = (apiMovement: any): StockMovement => {
    // Handle nested inventory.product structure from API
    const product = apiMovement.product || apiMovement.inventory?.product || null;

    return {
        ...apiMovement,
        product: product,
        productId: apiMovement.productId || apiMovement.inventory?.productId || product?.id,
        direction: apiMovement.direction || getDirectionFromType(apiMovement.movementType),
        performedBy: apiMovement.performedBy || apiMovement.movedBy,
        referenceNumber: apiMovement.referenceNumber || apiMovement.notes?.match(/(?:Sale|PO|Transfer)\s+(\S+)/)?.[1],
    };
};

export const useStockMovements = (productId?: string, variantId?: string) => {
    const { setup } = useSettings();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [movementTypeFilter, setMovementTypeFilterInternal] = useState<StockMovementType | ''>('');
    const [startDate, setStartDateInternal] = useState('');
    const [endDate, setEndDateInternal] = useState('');

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';
    const userId = setup?.setupId || '';

    // Wrapper setters that reset page to 1 when filter changes
    const setMovementTypeFilter = useCallback((value: StockMovementType | '') => {
        setMovementTypeFilterInternal(value);
        setPage(1);
    }, []);

    const setStartDate = useCallback((value: string) => {
        setStartDateInternal(value);
        setPage(1);
    }, []);

    const setEndDate = useCallback((value: string) => {
        setEndDateInternal(value);
        setPage(1);
    }, []);

    const loadMovements = useCallback(async () => {
        if (!tenantId || !branchId) return;

        setIsLoading(true);
        try {
            const query: StockMovementListQuery = {
                tenantId,
                branchId,
                page,
                limit: perPage,
                productId,
                variantId,
                movementType: movementTypeFilter || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            };

            // Priority: variantId > productId > all branch movements
            const result = variantId
                ? await stockMovementService.getVariantStockHistory(
                    variantId,
                    tenantId,
                    branchId,
                    perPage,
                    page,
                    startDate || undefined,
                    endDate || undefined,
                    movementTypeFilter || undefined
                )
                : productId
                    ? await stockMovementService.getProductStockHistory(
                        productId,
                        tenantId,
                        branchId,
                        perPage,
                        page,
                        startDate || undefined,
                        endDate || undefined,
                        movementTypeFilter || undefined
                    )
                    : await stockMovementService.getBranchStockMovements(query);

            // Handle case where result might be undefined or malformed
            if (!result) {
                setMovements([]);
                setTotalRows(0);
                return;
            }

            if (Array.isArray(result)) {
                setMovements(result.map(normalizeMovement));
                setTotalRows(result.length);
            } else {
                const normalizedMovements = (result.movements || []).map(normalizeMovement);
                setMovements(normalizedMovements);
                setTotalRows(result.pagination?.total || (result.pagination as any)?.totalItems || 0);
            }
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to load stock movements'));
            console.error('Load movements error:', error);
            // Reset state on error
            setMovements([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [tenantId, branchId, page, perPage, productId, variantId, movementTypeFilter, startDate, endDate]);

    useEffect(() => {
        loadMovements();
    }, [loadMovements]);

    const adjustStock = useCallback(async (payload: StockAdjustmentPayload) => {
        try {
            const movement = await stockMovementService.adjustStock(payload);
            Notify.success('Stock adjusted successfully');
            loadMovements();
            return movement;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to adjust stock'));
            throw error;
        }
    }, [loadMovements]);

    const damageStock = useCallback(async (payload: DamageStockPayload) => {
        try {
            const movement = await stockMovementService.damageStock(payload);
            Notify.success('Stock marked as damaged');
            loadMovements();
            return movement;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to mark stock as damaged'));
            throw error;
        }
    }, [loadMovements]);

    const transferStock = useCallback(async (payload: TransferStockPayload) => {
        try {
            const result = await stockMovementService.transferStock(payload);
            Notify.success('Stock transferred successfully');
            loadMovements();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to transfer stock'));
            throw error;
        }
    }, [loadMovements]);

    const performStockTake = useCallback(async (
        productId: string,
        physicalCount: number,
        notes?: string
    ) => {
        if (!tenantId || !branchId || !userId) return;

        try {
            const movement = await stockMovementService.performStockTake({
                tenantId,
                branchId,
                productId,
                physicalCount,
                performedBy: userId,
                notes,
            });
            Notify.success('Stock count completed');
            loadMovements();
            return movement;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to perform stock take'));
            throw error;
        }
    }, [tenantId, branchId, userId, loadMovements]);

    /**
     * POST /stock-movements/stock-count — physical count reconciliation
     */
    const performStockCount = useCallback(async (payload: {
        inventoryId: string;
        actualQuantity: number;
        unitCost?: number;
        notes?: string;
    }) => {
        try {
            const result = await stockMovementService.performStockCount(payload);
            Notify.success('Stock count reconciliation completed');
            loadMovements();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to reconcile stock count'));
            throw error;
        }
    }, [loadMovements]);

    /**
     * POST /stock-movements/expiry — record expired stock
     */
    const recordExpiry = useCallback(async (payload: {
        inventoryId: string;
        quantity: number;
        unitCost?: number;
        expiryDate?: string;
        notes?: string;
    }) => {
        try {
            const result = await stockMovementService.recordExpiry(payload);
            Notify.success('Expired stock recorded');
            loadMovements();
            return result;
        } catch (error: any) {
            Notify.failure(getErrorMessage(error, 'Failed to record expiry'));
            throw error;
        }
    }, [loadMovements]);

    return {
        movements,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        movementTypeFilter,
        setMovementTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        loadMovements,
        adjustStock,
        damageStock,
        transferStock,
        performStockTake,
        performStockCount,
        recordExpiry,
        tenantId,
        branchId,
        userId,
    };
};
