import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import inventoryService from '../services/inventory.service';
import { Confirm, Notify } from 'notiflix';
import { useAppDispatch, useAppSelector } from './redux';
import { fetchCategories, setCategories } from '../store/slices/inventorySlice';

export const useInventoryManagement = () => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [data, setData] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryId, setCategoryId] = useState(undefined);
    const [activeFilter, setActiveFilter] = useState('all');
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const dispatch = useAppDispatch()
    const categories = useAppSelector((state) => state.inventory.categories)

    const loadCategories = () => dispatch(fetchCategories())

    const loadInventory = async () => {
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
            toast.error("Error loading inventory: " + error.message);
            setInventory([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = async (filters?: { search?: string; categoryId?: number; filter?: string }) => {
        try {
            setIsLoading(true);
            const response = await inventoryService.list({
                page,
                perPage,
                search: filters?.search ?? searchTerm,
                categoryId: filters?.categoryId ?? categoryId,
                filter: filters?.filter ?? activeFilter
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
            toast.error("Error applying filters: " + error.message);
            setInventory([]);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

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
                        Notify.failure(`Failed to void item: ${error.message}`);
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

    const handleEditItem = (item: InventoryItem) => {
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
        selectedItem,
        activeFilter,
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
        applyFilters
    };
};