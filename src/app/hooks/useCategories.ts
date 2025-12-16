import { useState, useEffect } from 'react';
import { Notify } from 'notiflix';
import categoriesService from '../services/category.service';

interface UseCategoriesReturn {
    categories: Category[];
    filteredCategories: Category[];
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    totalRows: number;
    page: number;
    perPage: number;
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    sortBy: 'name' | 'date' | 'count';
    setSortBy: (sortBy: 'name' | 'date' | 'count') => void;
    getPaginatedData: () => Category[];
    loadCategories: () => Promise<void>;
    deleteCategory: (categoryUuid: string) => Promise<void>;
    updateCategory: (categoryUuid: string, updates: Partial<Category>) => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(13);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        filterAndSortCategories();
    }, [searchTerm, categories, sortBy]);

    const filterAndSortCategories = () => {
        let filtered = categories;

        if (searchTerm.trim() !== '') {
            filtered = categories.filter(
                (category) =>
                    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (category.description &&
                        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return (
                        new Date(b.createdAt || '').getTime() -
                        new Date(a.createdAt || '').getTime()
                    );
                case 'count':
                    return (b.itemCount || 0) - (a.itemCount || 0);
                default:
                    return 0;
            }
        });

        setFilteredCategories(filtered);
        setTotalRows(filtered.length);
        setPage(1);
    };

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await categoriesService.list();
            setCategories(data);
            setFilteredCategories(data);
            setTotalRows(data.length);
        } catch (error) {
            console.error('Error loading categories:', error);
            Notify.failure('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCategory = async (categoryUuid: string) => {
        try {
            await categoriesService.delete(categoryUuid);
            const updatedCategories = categories.filter(
                (cat) => cat.categoryId !== categoryUuid
            );
            setCategories(updatedCategories);
            setFilteredCategories(updatedCategories);
            setTotalRows(updatedCategories.length);
            Notify.success('Category deleted successfully');
        } catch (error) {
            console.error('Error deleting category:', error);
            Notify.failure('Failed to delete category');
            throw error;
        }
    };

    const updateCategory = async (categoryUuid: string, updates: Partial<Category>) => {
        try {
            await categoriesService.update(categoryUuid, updates);
            const updatedCategories = categories.map((cat) =>
                cat.categoryId === categoryUuid ? { ...cat, ...updates } : cat
            );
            setCategories(updatedCategories);
            setFilteredCategories(updatedCategories);
            Notify.success('Category updated successfully');
        } catch (error) {
            console.error('Error updating category:', error);
            Notify.failure('Failed to update category');
            throw error;
        }
    };

    const getPaginatedData = () => {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        return filteredCategories.slice(startIndex, endIndex);
    };

    return {
        categories,
        filteredCategories,
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        perPage,
        setPage,
        setPerPage,
        sortBy,
        setSortBy,
        getPaginatedData,
        loadCategories,
        deleteCategory,
        updateCategory,
    };
};
