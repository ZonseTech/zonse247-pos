import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Notify } from 'notiflix';
import inventoryService, {
    BulkUpdatePayload,
    MoveToCategoryPayload,
    AdjustInventoryPayload,
    ConvertToVariantPayload,
    ConvertToVariantResult,
    InventoryCount
} from '../services/inventory.service';

/**
 * Hook for advanced inventory operations including:
 * - Bulk updates
 * - Category moves
 * - Quantity adjustments
 * - Low stock management
 * - Search operations
 */
export const useInventoryActions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
    const [inventoryCount, setInventoryCount] = useState<InventoryCount | null>(null);
    const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);

    // ==================== COUNT & STATISTICS ====================

    /**
     * Fetch inventory count statistics
     */
    const fetchInventoryCount = useCallback(async () => {
        setIsLoading(true);
        try {
            const count = await inventoryService.getCount();
            setInventoryCount(count);
            return count;
        } catch (error: any) {
            toast.error('Failed to fetch inventory count: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== LOW STOCK OPERATIONS ====================

    /**
     * Fetch low stock items
     */
    const fetchLowStockItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await inventoryService.getLowStock();
            setLowStockItems(items);
            return items;
        } catch (error: any) {
            toast.error('Failed to fetch low stock items: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== SEARCH OPERATIONS ====================

    /**
     * Search inventory items
     */
    const searchInventory = useCallback(async (query: string, filters = {}) => {
        if (!query.trim()) {
            setSearchResults([]);
            return [];
        }

        setIsLoading(true);
        try {
            const results = await inventoryService.search(query, filters);
            setSearchResults(results);
            return results;
        } catch (error: any) {
            toast.error('Search failed: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Clear search results
     */
    const clearSearch = useCallback(() => {
        setSearchResults([]);
    }, []);

    // ==================== BARCODE OPERATIONS ====================

    /**
     * Find inventory item by barcode
     */
    const findByBarcode = useCallback(async (barcode: string) => {
        setIsLoading(true);
        try {
            const item = await inventoryService.findByBarcode(barcode);
            return item;
        } catch (error: any) {
            // Don't show error for 404s as item might not exist
            if (error.response?.status !== 404) {
                toast.error('Failed to find item by barcode: ' + error.message);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Find inventory item by SKU
     */
    const findBySku = useCallback(async (sku: string) => {
        setIsLoading(true);
        try {
            const item = await inventoryService.findBySku(sku);
            return item;
        } catch (error: any) {
            if (error.response?.status !== 404) {
                toast.error('Failed to find item by SKU: ' + error.message);
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== CATEGORY OPERATIONS ====================

    /**
     * Get inventory items by category
     */
    const getByCategory = useCallback(async (categoryId: string) => {
        setIsLoading(true);
        try {
            const items = await inventoryService.getByCategory(categoryId);
            return items;
        } catch (error: any) {
            toast.error('Failed to get items by category: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Move items to a different category
     */
    const moveToCategory = useCallback(async (payload: MoveToCategoryPayload) => {
        setIsLoading(true);
        try {
            const result = await inventoryService.moveToCategory(payload);
            Notify.success(`${result.moved} item(s) moved to category successfully`);
            return result;
        } catch (error: any) {
            Notify.failure('Failed to move items: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Sync category item counts
     */
    const syncCategoryCounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await inventoryService.syncCategoryCounts();
            Notify.success(result.message || 'Category counts synced successfully');
            return result;
        } catch (error: any) {
            Notify.failure('Failed to sync category counts: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== STATUS OPERATIONS ====================

    /**
     * Get inventory items by status
     */
    const getByStatus = useCallback(async (status: string) => {
        setIsLoading(true);
        try {
            const items = await inventoryService.getByStatus(status);
            return items;
        } catch (error: any) {
            toast.error('Failed to get items by status: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== QUANTITY OPERATIONS ====================

    /**
     * Update inventory quantity directly
     */
    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        setIsLoading(true);
        try {
            const item = await inventoryService.updateQuantity(itemId, quantity);
            Notify.success('Quantity updated successfully');
            return item;
        } catch (error: any) {
            Notify.failure('Failed to update quantity: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Adjust inventory (add/subtract/set)
     */
    const adjustInventory = useCallback(async (itemId: string, payload: AdjustInventoryPayload) => {
        setIsLoading(true);
        try {
            const item = await inventoryService.adjustInventory(itemId, payload);
            const actionText = payload.type === 'add' ? 'added' : payload.type === 'subtract' ? 'subtracted' : 'set';
            Notify.success(`Inventory ${actionText} successfully`);
            return item;
        } catch (error: any) {
            Notify.failure('Failed to adjust inventory: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk update inventory items
     */
    const bulkUpdate = useCallback(async (payload: BulkUpdatePayload) => {
        setIsLoading(true);
        try {
            const result = await inventoryService.bulkUpdate(payload);
            Notify.success(`${result.updated} item(s) updated successfully`);
            return result;
        } catch (error: any) {
            Notify.failure('Failed to bulk update items: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ==================== VALIDATION OPERATIONS ====================

    /**
     * Check if inventory item exists
     */
    const checkExists = useCallback(async (itemId: string) => {
        try {
            const exists = await inventoryService.checkExists(itemId);
            return exists;
        } catch (error: any) {
            return false;
        }
    }, []);

    /**
     * Void an inventory item
     */
    const voidItem = useCallback(async (itemId: string) => {
        setIsLoading(true);
        try {
            const item = await inventoryService.voidItem(itemId);
            Notify.success('Item voided successfully');
            return item;
        } catch (error: any) {
            Notify.failure('Failed to void item: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Convert a variant to become a variant of a different product
     * This allows moving an existing variant to become a variant of another product
     */
    const convertToVariant = useCallback(async (variantId: string, payload: ConvertToVariantPayload): Promise<ConvertToVariantResult> => {
        setIsLoading(true);
        try {
            const result = await inventoryService.convertToVariant(variantId, payload);
            Notify.success('Product converted to variant successfully');
            if (result.warning) {
                toast.warning(result.warning, { autoClose: 5000 });
            }
            return result;
        } catch (error: any) {
            Notify.failure('Failed to convert to variant: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get all inventory items without pagination
     */
    const getAllItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const items = await inventoryService.getAll();
            return items;
        } catch (error: any) {
            toast.error('Failed to fetch all items: ' + error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        // State
        isLoading,
        lowStockItems,
        inventoryCount,
        searchResults,

        // Count & Statistics
        fetchInventoryCount,

        // Low Stock
        fetchLowStockItems,

        // Search
        searchInventory,
        clearSearch,

        // Barcode/SKU
        findByBarcode,
        findBySku,

        // Category
        getByCategory,
        moveToCategory,
        syncCategoryCounts,

        // Status
        getByStatus,

        // Quantity
        updateQuantity,
        adjustInventory,

        // Bulk Operations
        bulkUpdate,

        // Validation
        checkExists,
        voidItem,

        // Conversion
        convertToVariant,

        // All Items
        getAllItems,
    };
};

export default useInventoryActions;
