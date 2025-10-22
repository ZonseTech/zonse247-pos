import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import productsService from '../services/products.service';
import { Confirm, Notify } from 'notiflix';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchCategories, setCategories } from '../store/slices/productsSlice';

export const useProductManagement = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState(undefined);
    const [activeFilter, setActiveFilter] = useState('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const dispatch = useAppDispatch()
    const categories = useAppSelector((state) => state.products.categories)

    const loadCategories = () => dispatch(fetchCategories())

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
                categoryId: filters?.categoryId ?? categoryId,
                filter: filters?.filter ?? activeFilter
            });

            if (response && response.pagination) {
                setTotalRows(response.pagination.totalItems);
                setProducts(response.products);
                setData(response.products);
            } else {
                toast.error('Error: Invalid data format received from server');
                setProducts([]);
                setData([]);
            }
        } catch (error: any) {
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
    };

    const handleFilterByCategory = (categoryId: number) => {
        setCategoryId(categoryId);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        applyFilters();
    };

    const handlePerRowsChange = (newPerPage: number, newPage: number) => {
        setPage(newPage);
        setPerPage(newPerPage);

        applyFilters();
    };

    const handleEditProduct = (product: Product) => {
        if (product) {
            setSelectedProduct(product);
        }
    };

    return {
        isLoading,
        data,
        categories,
        totalRows,
        page,
        perPage,
        products,
        searchTerm,
        selectedProduct,
        activeFilter,
        loadProducts,
        loadCategories,
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