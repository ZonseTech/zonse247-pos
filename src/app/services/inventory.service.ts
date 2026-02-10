import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

// Fields to decode for inventory items
const INVENTORY_DECODE_FIELDS = ['name', 'description', 'brand', 'sku', 'color', 'size', 'unit', 'supplierName'] as const;

const endpoints = {
	// Base endpoints
	root: 'inventory',
	item: 'inventory/item',

	// GET endpoints
	summary: 'inventory/summary',
	overview: 'inventory/overview',
	topValue: 'inventory/top-value',
	count: 'inventory/count',
	all: 'inventory/all',
	itemsOnly: 'inventory/items-only',
	search: 'inventory/search',
	lowStock: 'inventory/low-stock',

	// Item-specific endpoints
	byBarcode: 'inventory/barcode',
	byCategory: 'inventory/category',
	byStatus: 'inventory/status',
	exists: 'inventory/exists',

	// Action endpoints
	void: 'inventory/item-void',
	bulkUpdate: 'inventory/bulk-update',
	moveToCategory: 'inventory/move-to-category',
	syncCategoryCounts: 'inventory/sync-category-counts',

	// Legacy endpoints (kept for backwards compatibility)
	findBySku: 'inventory/item/sku',
};

export interface InventorySummary {
	totalStock: number;
	newStock: number;
	expiringSoon: number;
	expired: number;
}

export interface InventoryCount {
	total: number;
	active: number;
	inactive: number;
	lowStock: number;
	expired: number;
}

export interface PaginatedResponse<T> {
	items: T[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export interface BulkUpdatePayload {
	itemIds: string[];
	updates: Partial<InventoryItem>;
}

export interface MoveToCategoryPayload {
	itemIds: string[];
	categoryId: string;
}

export interface AdjustInventoryPayload {
	adjustment: number;
	reason?: string;
	type: 'add' | 'subtract' | 'set';
}

export interface CategoryBreakdown {
	categoryId: string | null;
	categoryName: string;
	productCount: number;
	totalQuantity: number;
	totalCostValue: number;
	totalRetailValue: number;
}

export interface StockHealthSummary {
	healthy: number;
	lowStock: number;
	outOfStock: number;
	overstocked: number;
}

export interface InventoryOverview {
	totalProducts: number;
	totalStockQuantity: number;
	totalStockValue: number;
	totalRetailValue: number;
	potentialProfit: number;
	profitMargin: number;
	averageCostPerUnit: number;
	averageSellingPricePerUnit: number;
	lowStockCount: number;
	outOfStockCount: number;
	categoryBreakdown: CategoryBreakdown[];
	stockHealthSummary: StockHealthSummary;
	filters: {
		search: string;
		filter: string;
		categoryId: string | null;
		startDate: string | null;
		endDate: string | null;
	};
}

export interface TopValueItem {
	productId: string;
	name: string;
	sku: string;
	categoryName: string | null;
	availableQuantity: number;
	averageCost: number;
	sellingPrice: number;
	totalCostValue: number;
	totalRetailValue: number;
	potentialProfit: number;
}

export interface InventoryOverviewQuery {
	search?: string;
	filter?: string;
	categoryId?: string;
	startDate?: string;
	endDate?: string;
}

const inventoryService = {
	endpoints,

	/**
	 * GET /summary - Get inventory summary statistics
	 */
	async getSummary(): Promise<InventorySummary> {
		return api
			.get<ApiResponse<InventorySummary>>(endpoints.summary)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /overview - Get comprehensive inventory overview with filters
	 * Includes total values, profit margins, category breakdown, and stock health
	 */
	async getOverview(query: InventoryOverviewQuery = {}): Promise<InventoryOverview> {
		return api
			.get<ApiResponse<InventoryOverview>>(endpoints.overview, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /top-value - Get top inventory items by value
	 * Returns items sorted by total retail value
	 */
	async getTopValueItems(limit: number = 10): Promise<TopValueItem[]> {
		return api
			.get<ApiResponse<TopValueItem[]>>(endpoints.topValue, { limit })
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /count - Get inventory counts
	 */
	async getCount(): Promise<InventoryCount> {
		return api
			.get<ApiResponse<InventoryCount>>(endpoints.count)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET / - Get paginated inventory items (Products with Variants)
	 */
	async list(query = {}): Promise<PaginatedResponse<ApiProduct>> {
		return api
			.get<ApiResponse<{
				products: ApiProduct[];
				pagination: {
					currentPage: number;
					totalPages: number;
					totalItems: number;
					itemsPerPage: number;
				};
			}>>(endpoints.root, { ...query, groupByProduct: true })
			.then((res) => ({
				items: res.data.data.products,
				pagination: res.data.data.pagination
			}))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /all - Get all inventory items without pagination
	 */
	async getAll(query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(endpoints.all, { ...query, groupByProduct: true })
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /items-only - Get inventory items only (optimized for POS)
	 */
	async index(query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(endpoints.itemsOnly, query)
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /item/:itemId - Get a single inventory item (Product with Variants)
	 */
	async show(id: string): Promise<ApiProduct> {
		return api
			.get<ApiResponse<ApiProduct>>(`${endpoints.item}/${id}`)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /search - Search inventory items
	 */
	async search(query: string, filters = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(endpoints.search, { q: query, ...filters })
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /barcode/:barcode - Find inventory item by barcode
	 */
	async findByBarcode(barcode: string): Promise<InventoryItem | null> {
		return api
			.get<ApiResponse<InventoryItem>>(`${endpoints.byBarcode}/${barcode}`)
			.then((res) => decodeObjectStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				if (err.response?.status === 404) {
					return null;
				}
				throw err;
			});
	},

	/**
	 * GET /category/:categoryId - Get inventory items by category
	 */
	async getByCategory(categoryId: string, query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(`${endpoints.byCategory}/${categoryId}`, query)
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /status/:status - Get inventory items by status
	 */
	async getByStatus(status: string, query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(`${endpoints.byStatus}/${status}`, query)
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /low-stock - Get low stock items
	 */
	async getLowStock(query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(endpoints.lowStock, query)
			.then((res) => decodeArrayStrings<InventoryItem>(res.data.data, INVENTORY_DECODE_FIELDS))
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /exists/:itemId - Check if inventory item exists
	 */
	async checkExists(itemId: string): Promise<boolean> {
		return api
			.get<ApiResponse<{ exists: boolean }>>(`${endpoints.exists}/${itemId}`)
			.then((res) => res.data.data.exists)
			.catch((err) => {
				if (err.response?.status === 404) {
					return false;
				}
				throw err;
			});
	},

	// ==================== POST ENDPOINTS ====================

	/**
	 * POST /item - Create a new inventory item
	 */
	async store(data: InventoryItem): Promise<InventoryItem> {
		try {
			const res = await api.post<ApiResponse<InventoryItem>>(endpoints.item, data as any);
			if (!res.data.success) {
				throw new Error(res.data.message || 'Failed to create inventory item');
			}
			return res.data.data;
		} catch (err: any) {
			// If it's already an Error with a meaningful message, re-throw it
			if (err instanceof Error && err.message && err.message !== 'Failed to create inventory item') {
				throw err;
			}
			// Handle API error responses - interceptor wraps errors in { error }
			const axiosError = err?.error || err;
			const message =
				axiosError?.response?.data?.message ||
				axiosError?.message ||
				err?.message ||
				'Failed to create inventory item';
			throw new Error(message);
		}
	},

	/**
	 * POST /item/sku - Find inventory item by SKU
	 */
	async findBySku(sku: string): Promise<InventoryItem | null> {
		return api
			.post<ApiResponse<InventoryItem>>(endpoints.findBySku, { sku } as any)
			.then((res) => res.data.data)
			.catch((err) => {
				if (err.response?.status === 404) {
					return null;
				}
				throw err;
			});
	},

	/**
	 * POST /sync-category-counts - Sync category item counts
	 */
	async syncCategoryCounts(): Promise<{ message: string; synced: number }> {
		return api
			.post<ApiResponse<{ message: string; synced: number }>>(endpoints.syncCategoryCounts, {} as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	// ==================== PUT ENDPOINTS ====================

	/**
	 * PUT /item/:itemId - Update an inventory item
	 */
	async update(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
		return api
			.put<ApiResponse<InventoryItem>>(`${endpoints.item}/${id}`, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PUT /item-void/:itemId - Void an inventory item
	 */
	async voidItem(id: string): Promise<InventoryItem> {
		return api
			.put<ApiResponse<InventoryItem>>(`${endpoints.void}/${id}`, { status: 'void' } as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PUT /item-void/:itemId - Update inventory item status (legacy)
	 */
	async updateStatus(id: string, status: string): Promise<Pick<InventoryItem, 'status'>> {
		return api
			.put<ApiResponse<Pick<InventoryItem, 'status'>>>(`${endpoints.void}/${id}`, { status } as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PUT /bulk-update - Bulk update inventory items
	 */
	async bulkUpdate(payload: BulkUpdatePayload): Promise<{ updated: number; items: InventoryItem[] }> {
		return api
			.put<ApiResponse<{ updated: number; items: InventoryItem[] }>>(endpoints.bulkUpdate, payload as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PUT /move-to-category - Move items to a different category
	 */
	async moveToCategory(payload: MoveToCategoryPayload): Promise<{ moved: number; items: InventoryItem[] }> {
		return api
			.put<ApiResponse<{ moved: number; items: InventoryItem[] }>>(endpoints.moveToCategory, payload as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	// ==================== PATCH ENDPOINTS ====================

	/**
	 * PATCH /item/:itemId/quantity - Update inventory quantity
	 */
	async updateQuantity(id: string, quantity: number): Promise<InventoryItem> {
		return api
			.patch<ApiResponse<InventoryItem>>(`${endpoints.item}/${id}/quantity`, { quantity } as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * PATCH /item/:itemId/adjust - Adjust inventory (add/subtract/set)
	 */
	async adjustInventory(id: string, payload: AdjustInventoryPayload): Promise<InventoryItem> {
		return api
			.patch<ApiResponse<InventoryItem>>(`${endpoints.item}/${id}/adjust`, payload as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * Increment inventory quantity (for returns/restocking)
	 * @param productId Product ID to increment
	 * @param quantity Quantity to add
	 * @param reason Optional reason for increment
	 */
	async incrementInventory(productId: string, quantity: number, reason?: string): Promise<InventoryItem> {
		return this.adjustInventory(productId, {
			adjustment: quantity,
			type: 'add',
			reason: reason || 'Returned item',
		});
	},

	/**
	 * Decrement inventory quantity (for reversing returns)
	 * @param productId Product ID to decrement
	 * @param quantity Quantity to subtract
	 * @param reason Optional reason for decrement
	 */
	async decrementInventory(productId: string, quantity: number, reason?: string): Promise<InventoryItem> {
		return this.adjustInventory(productId, {
			adjustment: quantity,
			type: 'subtract',
			reason: reason || 'Return cancelled',
		});
	},

	// ==================== DELETE ENDPOINTS ====================

	/**
	 * DELETE /item/:itemId - Delete an inventory item
	 */
	async delete(id: string): Promise<boolean> {
		return api
			.delete(`${endpoints.item}/${id}`)
			.then(() => true)
			.catch((err) => {
				throw err;
			});
	},

	// ==================== NEW WORKFLOW INTEGRATION ====================

	/**
	 * Check stock availability before sale
	 * @param productId Product ID to check
	 * @param requiredQuantity Quantity needed
	 * @returns Available quantity and whether sufficient stock exists
	 */
	async checkStockAvailability(
		productId: string,
		requiredQuantity: number
	): Promise<{ available: number; isSufficient: boolean; allowNegative: boolean }> {
		const item = await this.show(productId);
		const available = Number(item.quantity || 0);
		const allowNegative = item.allowNegativeStock || false;

		return {
			available,
			isSufficient: available >= requiredQuantity || allowNegative,
			allowNegative,
		};
	},

	/**
	 * Get current inventory levels
	 * @param productId Product ID
	 * @returns Current inventory quantities
	 */
	async getInventoryLevels(productId: string): Promise<{
		available: number;
		reserved: number;
		damaged: number;
		total: number;
		averageCost: number;
		lastPurchaseCost: number;
	}> {
		const item = await this.show(productId);

		return {
			available: Number(item.quantity || 0),
			reserved: Number(item.reservedQuantity || 0),
			damaged: 0, // Will be tracked separately in new schema
			total: Number(item.quantity || 0) + Number(item.reservedQuantity || 0),
			averageCost: Number(item.costPrice || 0),
			lastPurchaseCost: Number(item.costPrice || 0),
		};
	},

	/**
	 * Reserve inventory for an order
	 * @param productId Product ID to reserve
	 * @param quantity Quantity to reserve
	 */
	async reserveInventory(productId: string, quantity: number): Promise<InventoryItem> {
		const item = await this.show(productId);
		const currentReserved = Number(item.reservedQuantity || 0);

		return this.update(productId, {
			reservedQuantity: currentReserved + quantity,
		});
	},

	/**
	 * Release reserved inventory
	 * @param productId Product ID
	 * @param quantity Quantity to release
	 */
	async releaseReservedInventory(productId: string, quantity: number): Promise<InventoryItem> {
		const item = await this.show(productId);
		const currentReserved = Number(item.reservedQuantity || 0);

		return this.update(productId, {
			reservedQuantity: Math.max(0, currentReserved - quantity),
		});
	},

	/**
	 * Get products that need reordering
	 * @param tenantId Tenant ID
	 * @param branchId Branch ID
	 */
	async getReorderList(tenantId: string, branchId: string): Promise<InventoryItem[]> {
		const lowStock = await this.getLowStock({ tenantId, branchId });
		return lowStock.filter(item => {
			const quantity = Number(item.quantity || 0);
			const reorderLevel = Number(item.reorderLevel || 0);
			return reorderLevel > 0 && quantity <= reorderLevel;
		});
	},

	/**
	 * Calculate weighted average cost after purchase
	 * @param currentQuantity Current quantity in stock
	 * @param currentCost Current average cost
	 * @param newQuantity New quantity being added
	 * @param newCost Cost of new items
	 */
	calculateWeightedAverageCost(
		currentQuantity: number,
		currentCost: number,
		newQuantity: number,
		newCost: number
	): number {
		if (currentQuantity + newQuantity === 0) return 0;

		const currentValue = currentQuantity * currentCost;
		const newValue = newQuantity * newCost;
		const totalValue = currentValue + newValue;
		const totalQuantity = currentQuantity + newQuantity;

		return totalValue / totalQuantity;
	},
};

export default inventoryService;
