import api from './http.service';
import { decodeObjectStrings, decodeArrayStrings } from '../utils/text-encoding';

/**
 * Product Service
 * Handles all product-related API calls following the inventory workflow
 * Updated for Product/Variant model (API v1.6.0+)
 */

// Fields to decode for products (ProductWithInventory type)
const PRODUCT_DECODE_FIELDS: (keyof ProductWithInventory)[] = ['name', 'variantName', 'displayName', 'description', 'brand', 'sku', 'unit'];

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

    // Barcodes (now for variants)
    addBarcode: 'products/barcodes',
    removeBarcode: 'products/barcodes',
    setPrimaryBarcode: 'products/barcodes/primary',

    // Variants
    variants: 'products/variants',
    createVariant: 'products/variants',
    updateVariant: 'products/variants',
};

const productService = {
    endpoints,

    /**
     * POST /products - Create a new product with default variant
     * Product is created with stock = 0 (no inventory until receipt)
     */
    async createProduct(payload: CreateProductInput | CreateProductPayload): Promise<ProductWithInventory> {
        return api
            .post<ProductResponse>(endpoints.create, payload as any)
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/search/:term - Search product by SKU, Barcode, or Name
     * Returns the matching product variant (ProductWithInventory)
     */
    async searchProduct(
        term: string,
        tenantId: string,
        branchId: string
    ): Promise<SearchProductResult> {
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
     * Returns ProductWithInventory (the variant)
     */
    async searchByBarcode(
        barcode: string,
        tenantId: string,
        branchId: string
    ): Promise<ProductWithInventory> {
        return api
            .get<ProductResponse>(`${endpoints.searchByBarcode}/${encodeURIComponent(barcode)}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products/search/sku/:sku - Search by SKU only
     * Returns ProductWithInventory (the variant)
     */
    async searchBySku(
        sku: string,
        tenantId: string,
        branchId: string
    ): Promise<ProductWithInventory> {
        return api
            .get<ProductResponse>(`${endpoints.searchBySku}/${encodeURIComponent(sku)}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * GET /products - List products with pagination and filters
     * Returns array of ProductWithInventory (flattened variants)
     */
    async listProducts(query: ListProductsOptions | ProductListQuery): Promise<ProductListResponse['data']> {
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
     * GET /products/:id - Get product/variant by ID
     * The ID can be a variant ID or product ID
     */
    async getProduct(
        productId: string,
        tenantId: string,
        branchId: string
    ): Promise<ProductWithInventory> {
        return api
            .get<ProductResponse>(`${endpoints.get}/${productId}`, { tenantId, branchId })
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /products/:id - Update product or variant
     */
    async updateProduct(
        productId: string,
        payload: UpdateProductInput | UpdateVariantInput | UpdateProductPayload
    ): Promise<ProductWithInventory> {
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
     * POST /products/variants - Create a new variant for an existing product
     */
    async createVariant(payload: CreateVariantInput): Promise<ProductWithInventory> {
        return api
            .post<ProductResponse>(endpoints.createVariant, payload as any)
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /products/variants/:variantId - Update a specific variant
     */
    async updateVariant(
        variantId: string,
        payload: UpdateVariantInput
    ): Promise<ProductWithInventory> {
        return api
            .put<ProductResponse>(`${endpoints.updateVariant}/${variantId}`, payload as any)
            .then((res) => decodeObjectStrings(res.data.data, PRODUCT_DECODE_FIELDS))
            .catch((err) => {
                throw err;
            });
    },

    /**
     * POST /products/barcodes - Add barcode to a variant
     */
    async addBarcode(
        variantId: string,
        barcode: BarcodeInput
    ): Promise<VariantBarcode> {
        return api
            .post<ApiResponse<VariantBarcode>>(`${endpoints.addBarcode}`, {
                variantId,
                ...barcode,
            } as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * DELETE /products/barcodes/:barcodeId - Remove barcode
     */
    async removeBarcode(variantId: string, barcodeId: string): Promise<void> {
        return api
            .delete(`${endpoints.removeBarcode}/${barcodeId}`, { variantId })
            .then(() => undefined)
            .catch((err) => {
                throw err;
            });
    },

    /**
     * PUT /products/barcodes/:barcodeId/primary - Set primary barcode for variant
     */
    async setPrimaryBarcode(variantId: string, barcodeId: string): Promise<ProductWithInventory> {
        return api
            .put<ProductResponse>(`${endpoints.setPrimaryBarcode}/${barcodeId}`, {
                variantId,
            } as any)
            .then((res) => res.data.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default productService;
