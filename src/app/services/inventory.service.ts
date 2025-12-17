import api from './http.service';

const endpoints = {
	index: 'inventory/products-only',
	all: 'inventory',
	store: 'inventory/product',
	update: 'inventory/product',
	show: 'inventory/product',
	delete: 'inventory/product',
	findByBarcode: 'inventory/product/sku',
	void: 'inventory/product-void',
};

const inventoryService = {
	endpoints,
	async getSummary(): Promise<{
		totalStock: number;
		newStock: number;
		expiringSoon: number;
		expired: number;
	}> {
		return api
			.get<ApiResponse<{
				totalStock: number;
				newStock: number;
				expiringSoon: number;
				expired: number;
			}>>('inventory/summary')
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async list(query = {}): Promise<{
		items: InventoryItem[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		return api
			.get<ApiResponse<{
				products: InventoryItem[];
				pagination: {
					currentPage: number;
					totalPages: number;
					totalItems: number;
					itemsPerPage: number;
				};
			}>>(endpoints.all, query)
			.then((res) => ({
				items: res.data.data.products,
				pagination: res.data.data.pagination
			}))
			.catch((err) => {
				throw err;
			});
	},
	async index(query = {}): Promise<InventoryItem[]> {
		return api
			.get<ApiResponse<InventoryItem[]>>(endpoints.index, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async show(id: string): Promise<InventoryItem> {
		return api
			.get<InventoryItem>(`${endpoints.show}/${id}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async store(data: InventoryItem): Promise<InventoryItem> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async update(id: string, data: InventoryItem): Promise<InventoryItem> {
		return api
			.put(`${endpoints.update}/${id}`, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async updateStatus(
		id: string,
		status: string
	): Promise<Pick<InventoryItem, 'status'>> {
		return api
			.put<Pick<InventoryItem, 'status'>>(`${endpoints.void}/${id}`, { status })
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async delete(id: string): Promise<DataTypes> {
		return api
			.delete(`${endpoints.delete}/${id}`)
			.then(() => true)
			.catch((err) => {
				throw err;
			});
	},
	async findByBarcode(barcode: number): Promise<InventoryItem> {
		return api
			.post<InventoryItem>(endpoints.findByBarcode, { barcode } as any)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default inventoryService;
