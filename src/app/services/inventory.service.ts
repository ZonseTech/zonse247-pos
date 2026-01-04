import api from './http.service';

const endpoints = {
	// Base endpoints
	root: 'inventory',
	item: 'inventory/item',

	// GET endpoints
	summary: 'inventory/summary',
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

const inventoryService = {
	endpoints,

	// ==================== GET ENDPOINTS ====================

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
	 * GET / - Get paginated inventory items
	 */
	async list(query = {}): Promise<PaginatedResponse<InventoryItem>> {
		return api
			.get<ApiResponse<{
				inventoryItems: InventoryItem[];
				pagination: {
					currentPage: number;
					totalPages: number;
					totalItems: number;
					itemsPerPage: number;
				};
			}>>(endpoints.root, query)
			.then((res) => ({
				items: res.data.data.inventoryItems,
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
			.get<ApiResponse<InventoryItem[]>>(endpoints.all, query)
			.then((res) => res.data.data)
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
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},

	/**
	 * GET /item/:itemId - Get a single inventory item
	 */
	async show(id: string): Promise<InventoryItem> {
		return api
			.get<ApiResponse<InventoryItem>>(`${endpoints.item}/${id}`)
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
			.then((res) => res.data.data)
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
			.then((res) => res.data.data)
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
			.then((res) => res.data.data)
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
			.then((res) => res.data.data)
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
			.then((res) => res.data.data)
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
		return api
			.post<ApiResponse<InventoryItem>>(endpoints.item, data as any)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
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
};

export default inventoryService;
