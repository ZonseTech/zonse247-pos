import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

/**
 * Product Service
 * Handles all product-related API calls following the inventory workflow
 */

// Fields to decode for products
const PRODUCT_DECODE_FIELDS: (keyof Product)[] = ['name', 'description', 'brand', 'categoryName', 'sku', 'color', 'size', 'unit'];

const endpoints = {
    // Base
    root: 'products',

    // CRUD
    create: 'products',
    update: 'products',
    delete: 'products',
    get: 'products',
    list: 'products',

    // Search
    search: 'products/search',
    searchByBarcode: 'products/search/barcode',
    searchBySku: 'products/search/sku',

    // Barcodes
    addBarcode: 'products/barcodes',
    removeBarcode: 'products/barcodes',
    setPrimaryBarcode: 'products/barcodes/primary',
};

const productService = {
    endpoints,

    /**
     * POST /products - Create a new product
     * Product is created with stock = 0 (no inventory until receipt)
     */
    async createProduct(payload: CreateProductPayload): Promise<Product> {
        return api
            .post<ProductResponse>(endpoints.create, payload as any)
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/search/:term - Search product by SKU, Barcode, or Name
     * Returns the first matching product
     */
    async searchProduct(
        term: string,
        tenantId: string,
        branchId: string
    ): Promise<ProductSearchResult> {
        return api
            .get<ProductSearchResponse>(`${endpoints.search}/${encodeURIComponent(term)}`, { tenantId, branchId })
            .then((res) => {
                const data = res.data.data;
                if (data.product) {
                    data.product = decodeObjectStrings(data.product, PRODUCT_DECODE_FIELDS);
                }
                return data;
            })
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/search/barcode/:barcode - Search by barcode only
     */
    async searchByBarcode(
        barcode: string,
        tenantId: string,
        branchId: string
    ): Promise<Product> {
        return api
            .get<ProductResponse>(`${endpoints.searchByBarcode}/${encodeURIComponent(barcode)}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/search/sku/:sku - Search by SKU only
     */
    async searchBySku(
        sku: string,
        tenantId: string,
        branchId: string
    ): Promise<Product> {
        return api
            .get<ProductResponse>(`${endpoints.searchBySku}/${encodeURIComponent(sku)}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products - List products with pagination and filters
     */
    async listProducts(query: ProductListQuery): Promise<ProductListResponse['data']> {
        // Build params object, filtering out undefined/null/empty values
        const params: any = {};
        Object.keys(query).forEach(key => {
            const value = (query as any)[key];
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        });

        return api
            .get<ProductListResponse>(endpoints.list, params)
            .then((res) => {
                const data = res.data.data;
                if (data.products) {
                    data.products = decodeArrayStrings(data.products, PRODUCT_DECODE_FIELDS);
                }
                return data;
            })
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/:id - Get product by ID
     */
    async getProduct(
        productId: string,
        tenantId: string,
        branchId: string
    ): Promise<Product> {
        return api
            .get<ProductResponse>(`${endpoints.get}/${productId}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /products/:id - Update product
     */
    async updateProduct(
        productId: string,
        payload: UpdateProductPayload
    ): Promise<Product> {
        return api
            .put<ProductResponse>(`${endpoints.update}/${productId}`, payload as any)
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /products/:id - Delete product (soft delete)
     */
    async deleteProduct(
        productId: string,
        tenantId: string,
        branchId: string
    ): Promise<void> {
        return api
            .delete(`${endpoints.delete}/${productId}`, { tenantId, branchId })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /products/:id/barcodes - Add barcode to product
     */
    async addBarcode(
        productId: string,
        barcode: Omit<ProductBarcode, 'id' | 'productId' | 'createdAt' | 'updatedAt'>
    ): Promise<ProductBarcode> {
        return api
            .post<ApiResponse<ProductBarcode>>(`${endpoints.addBarcode}`, {
                productId,
                ...barcode,
            } as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /products/:productId/barcodes/:barcodeId - Remove barcode
     */
    async removeBarcode(productId: string, barcodeId: string): Promise<void> {
        return api
            .delete(`${endpoints.removeBarcode}/${barcodeId}`, { productId })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /products/:productId/barcodes/:barcodeId/primary - Set primary barcode
     */
    async setPrimaryBarcode(productId: string, barcodeId: string): Promise<Product> {
        return api
            .put<ProductResponse>(`${endpoints.setPrimaryBarcode}/${barcodeId}`, {
                productId,
            } as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default productService;
