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

const productsService = {
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
		products: Product[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		return api
			.get<ApiResponse<{
				products: Product[];
				pagination: {
					currentPage: number;
					totalPages: number;
					totalItems: number;
					itemsPerPage: number;
				};
			}>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async index(query = {}): Promise<Product[]> {
		return api
			.get<ApiResponse<Product[]>>(endpoints.all, query)
			.then((res) => res.data.data)
			.catch((err) => {
				throw err;
			});
	},
	async show(id: string): Promise<Product> {
		return api
			.get<Product>(`${endpoints.show}/${id}`)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async store(data: Product): Promise<Product> {
		return api
			.post(endpoints.store, data)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
	async update(id: string, data: Product): Promise<Product> {
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
	): Promise<Pick<Product, 'status'>> {
		return api
			.put<Pick<Product, 'status'>>(`${endpoints.void}/${id}`, { status })
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
	async findByBarcode(barcode: number): Promise<Product> {
		return api
			.post<Product>(endpoints.findByBarcode, { barcode } as any)
			.then((res) => res.data)
			.catch((err) => {
				throw err;
			});
	},
};

export default productsService;
