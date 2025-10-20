import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productsService from '../../../services/products.service';
import { Confirm, Notify } from 'notiflix';

export const useProductManagement = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<Product[]>([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await productsService.list({
                page: 1,
                perPage,
                search: '',
                filter: 'all'
            });

            if (response && response.pagination) {
                setTotalRows(response.pagination.totalItems);
                setProducts(response.products);
                setData(response.products);
            } else {
                console.error('Invalid response format:', response);
                toast.error('Error: Invalid data format received from server');
                setProducts([]);
                setData([]);
            }
        } catch (error: any) {
            console.error('Error loading products:', error);
            toast.error("Error loading products: " + error.message);
            setProducts([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = async (filters?: { search?: string; categoryId?: number; filter?: string }) => {
        try {
            setIsLoading(true);
            const response = await productsService.list({
                page,
                perPage,
                search: filters?.search ?? searchTerm,
                categoryId: filters?.categoryId,
                filter: filters?.filter ?? activeFilter
            });

            if (response && response.pagination) {
                setTotalRows(response.pagination.totalItems);
                setProducts(response.products);
                setData(response.products);
            } else {
                console.error('Invalid response format:', response);
                toast.error('Error: Invalid data format received from server');
                setProducts([]);
                setData([]);
            }
        } catch (error: any) {
            console.error('Error applying filters:', error);
            toast.error("Error applying filters: " + error.message);
            setProducts([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoidProduct = (uuid: string) => {
        Confirm.show(
            'Void Product',
            'Are you sure you want to void this product?',
            'Yes, void it',
            'Cancel',
            function okCb() {
                setIsLoading(true);

                productsService
                    .updateStatus(uuid, 'void')
                    .then(() => {
                        Notify.success('Product has been voided successfully');
                        loadProducts();
                    })
                    .catch((error) => {
                        Notify.failure(`Failed to void product: ${error.message}`);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        );
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setPage(1);
        applyFilters({ search: value });
    };

    const handleEditProduct = (product: Product) => {
        if (product) {
            setSelectedProduct(product);
        }
    };

    const handleFilterByCategory = (categoryId: number) => {
        setSearchTerm('');
        if (isNaN(categoryId)) {
            applyFilters({ categoryId: undefined });
            return;
        }
        applyFilters({ categoryId });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage: number, newPage: number) => {
        setPage(newPage);
        setPerPage(newPerPage);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [page, perPage]);

    return {
        isLoading,
        data,
        totalRows,
        page,
        perPage,
        products,
        searchTerm,
        selectedProduct,
        activeFilter,
        loadProducts,
        handleSearch,
        handleVoidProduct,
        handleEditProduct,
        handleFilterByCategory,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
        setSelectedProduct,
        applyFilters
    };
};