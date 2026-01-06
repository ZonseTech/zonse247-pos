import { useState, useEffect, useCallback } from 'react';
import { Notify } from 'notiflix';
import { productService } from '../services';
import { useSettings } from './useSettings';

export const useProducts = () => {
    const { setup } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');

    const tenantId = setup?.tenantId || '';
    const branchId = setup?.branchId || '';

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await productService.listProducts({
                page,
                limit: perPage,
                search: searchTerm || undefined,
                categoryId: categoryFilter || undefined,
                status: statusFilter || undefined,
            });

            if (!result) {
                setProducts([]);
                setTotalRows(0);
                return;
            }

            setProducts(result.products || []);
            setTotalRows(result.pagination?.total || 0);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load products');
            console.error('Load products error:', error);
            setProducts([]);
            setTotalRows(0);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, searchTerm, categoryFilter, statusFilter]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const searchProduct = useCallback(async (term: string) => {
        try {
            const result = await productService.searchProduct(term, tenantId, branchId);
            return result;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Product not found');
            return null;
        }
    }, []);

    const createProduct = useCallback(async (payload: CreateProductPayload) => {
        try {
            const product = await productService.createProduct(payload);
            Notify.success('Product created successfully');
            loadProducts();
            return product;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to create product');
            throw error;
        }
    }, [loadProducts]);

    const updateProduct = useCallback(async (productId: string, payload: UpdateProductPayload) => {
        try {
            const product = await productService.updateProduct(productId, payload);
            Notify.success('Product updated successfully');
            loadProducts();
            return product;
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to update product');
            throw error;
        }
    }, [loadProducts]);

    const deleteProduct = useCallback(async (productId: string) => {
        if (!tenantId || !branchId) return;

        try {
            await productService.deleteProduct(productId, tenantId, branchId);
            Notify.success('Product deleted successfully');
            loadProducts();
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to delete product');
            throw error;
        }
    }, [loadProducts]);

    const getProduct = useCallback(async (productId: string) => {
        try {
            return await productService.getProduct(productId, tenantId, branchId);
        } catch (error: any) {
            Notify.failure(error?.response?.data?.message || 'Failed to load product');
            return null;
        }
    }, []);

    return {
        products,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        loadProducts,
        searchProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        getProduct,
    };
};
