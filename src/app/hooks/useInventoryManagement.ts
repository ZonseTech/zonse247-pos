import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import inventoryService from '../services/inventory.service';
import { Confirm, Notify } from 'notiflix';
import { getErrorMessage } from '../utils/api-error-handler';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchCategories, setCategories } from '../store/slices/inventorySlice';

export const useInventoryManagement = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState<ApiProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState('all');
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [inventory, setInventory] = useState<ApiProduct[]>([]);
    const [selectedItem, setSelectedItem] = useState<ApiProduct | null>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const dispatch = useAppDispatch()
    const categories = useAppSelector((state) => state.inventory.categories)

    const loadCategories = () => dispatch(fetchCategories())

    /**
     * Apply filters to inventory - all filtering is done on the backend
     * This includes: search, category, status filters (new, low-stock, expiring, expired), and date range
     */
    const applyFilters = useCallback(async (filters?: { search?: string; categoryId?: string; filter?: string; startDate?: string; endDate?: string }) => {
        try {
            setIsLoading(true);
            // Backend handles all filtering including magic IDs and date ranges
            const response = await inventoryService.list({
                page,
                perPage,
                search: filters?.search ?? debouncedSearchTerm,
                categoryId: filters?.categoryId ?? categoryId,
                filter: filters?.filter ?? activeFilter,
                startDate: filters?.startDate ?? startDate,
                endDate: filters?.endDate ?? endDate
            });

            if (response && response.pagination) {
                setTotalRows(response.pagination.totalItems);
                setInventory(response.items);
                setData(response.items);
            } else {
                toast.error('Error: Invalid data format received from server');
                setInventory([]);
                setData([]);
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error, "Error applying filters"));
            setInventory([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [page, perPage, debouncedSearchTerm, categoryId, activeFilter, startDate, endDate]);

    // Debounce search term — waits 500ms after user stops typing before triggering API call
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [searchTerm]);

    // Auto-apply filters when debounced search or other filter values change
    useEffect(() => {
        applyFilters();
    }, [debouncedSearchTerm, categoryId, activeFilter, startDate, endDate, page, perPage]);

    const loadInventory = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await inventoryService.list({
                page: 1,
                perPage,
                search: '',
                filter: 'all'
            });

            if (response && response.pagination) {
                setTotalRows(response.pagination.totalItems);
                setInventory(response.items);
                setData(response.items);
            } else {
                console.error('Invalid response format:', response);
                toast.error('Error: Invalid data format received from server');
                setInventory([]);
                setData([]);
            }
        } catch (error: any) {
            toast.error(getErrorMessage(error, "Error loading inventory"));
            setInventory([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    }, [perPage]);

    const handleVoidItem = (uuid: string) => {
        Confirm.show(
            'Void Item',
            'Are you sure you want to void this inventory item?',
            'Yes, void it',
            'Cancel',
            function okCb() {
                setIsLoading(true);

                inventoryService
                    .updateStatus(uuid, 'void')
                    .then(() => {
                        Notify.success('Item has been voided successfully');
                        loadInventory();
                    })
                    .catch((error) => {
                        Notify.failure(getErrorMessage(error, 'Failed to void item'));
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        );
    };

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleFilterByCategory = (categoryId: string) => {
        setCategoryId(categoryId || undefined);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePerRowsChange = (newPerPage: number, newPage: number) => {
        setPage(newPage);
        setPerPage(newPerPage);
    };

    const handleEditItem = (item: ApiProduct) => {
        if (item) {
            setSelectedItem(item);
        }
    };

    return {
        isLoading,
        data,
        categories,
        totalRows,
        page,
        perPage,
        inventory,
        searchTerm,
        debouncedSearchTerm,
        selectedItem,
        activeFilter,
        categoryId,
        startDate,
        endDate,
        loadInventory,
        loadCategories,
        handleSearch,
        handleVoidItem,
        handleEditItem,
        handleFilterByCategory,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
        setSelectedItem,
        setCategoryId,
        setStartDate,
        setEndDate,
        applyFilters
    };
};