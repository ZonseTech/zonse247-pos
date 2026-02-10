import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HiSearch, HiPlus, HiX } from 'react-icons/hi';
import { Package, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { MobileInventoryCardList } from './partials/MobileInventoryCard';
import { CategoryList } from './partials/MobileCategoryCard';
import FloatingFilterButton from '../../components/buttons/FloatingFilterButton';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useCategories } from '../../hooks/useCategories';
import { ROUTES } from '../../utils/constants';

type TabType = 'items' | 'category';
const ITEMS_PER_PAGE = 15;

const MobileInventory: React.FC = () => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('items');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const {
        isLoading: isInventoryLoading,
        data: inventoryData,
        totalRows,
        page,
        perPage,
        loadInventory,
        applyFilters,
        handlePageChange,
    } = useInventoryManagement();

    // Track accumulated items for infinite scroll
    const [accumulatedItems, setAccumulatedItems] = useState<InventoryItem[]>([]);

    const {
        categories,
        isLoading: isCategoriesLoading,
        loadCategories,
    } = useCategories();

    useEffect(() => {
        loadInventory();
        loadCategories();
    }, []);

    // Handle inventory data changes for infinite scroll
    useEffect(() => {
        if (inventoryData.length > 0) {
            if (page === 1) {
                // Reset accumulated items on first page (new search/filter)
                setAccumulatedItems(inventoryData);
            } else {
                // Append new items for subsequent pages
                setAccumulatedItems(prev => {
                    const existingIds = new Set(prev.map(item => item.productId));
                    const newItems = inventoryData.filter(item => !existingIds.has(item.productId));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAccumulatedItems([]);
        }
    }, [inventoryData, page]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === 'items') {
                // Reset to page 1 when search changes
                handlePageChange(1);
                setAccumulatedItems([]);
                if (searchTerm) {
                    applyFilters({ search: searchTerm });
                } else {
                    loadInventory();
                }
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, activeTab]);

    const handleTabChange = useCallback((tab: TabType) => {
        setActiveTab(tab);
        setSearchTerm('');
        setAccumulatedItems([]);
        handlePageChange(1);
    }, [handlePageChange]);

    const handleLoadMore = useCallback(() => {
        if (!isInventoryLoading && accumulatedItems.length < totalRows) {
            handlePageChange(page + 1);
        }
    }, [isInventoryLoading, accumulatedItems.length, totalRows, page, handlePageChange]);

    const hasMoreItems = useMemo(() => {
        return totalRows > 0 && accumulatedItems.length < totalRows;
    }, [totalRows, accumulatedItems.length]);

    const handleSearchToggle = useCallback(() => {
        setIsSearchVisible(prev => {
            if (!prev) {
                setTimeout(() => searchInputRef.current?.focus(), 100);
            } else {
                setSearchTerm('');
            }
            return !prev;
        });
    }, []);

    const handleEditItem = useCallback((item: InventoryItem) => {
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: item.productId } });
    }, [navigate]);

    const handleNewItem = useCallback(() => {
        navigate(ROUTES.INVENTORY_FORM);
    }, [navigate]);

    const handleNewCategory = useCallback(() => {
        navigate(ROUTES.CATEGORIES);
    }, [navigate]);

    const handleCategoryTap = useCallback((category: Category) => {
        navigate(ROUTES.INVENTORY, { state: { categoryId: category.categoryId } });
    }, [navigate]);

    const handleDeleteCategory = useCallback((categoryId: string) => {
        // TODO: Implement delete category functionality
        console.log('Delete category:', categoryId);
    }, []);

    const handleReorderCategory = useCallback((categoryId: string, direction: 'up' | 'down') => {
        // TODO: Implement reorder category functionality
        console.log('Reorder category:', categoryId, direction);
    }, []);

    const handleFloatingButtonClick = useCallback(() => {
        if (activeTab === 'items') {
            handleNewItem();
        } else {
            handleNewCategory();
        }
    }, [activeTab, handleNewItem, handleNewCategory]);

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    leftIcon={isSearchVisible ? <HiSearch className="w-5 h-5 text-gray-400" /> : null}
                    title={
                        isSearchVisible ? (
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={activeTab === 'items' ? 'Search items...' : 'Search categories...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-9 pl-0 pr-4 text-sm bg-transparent
                                        text-gray-900 dark:text-gray-100
                                        placeholder-gray-500 dark:placeholder-gray-400
                                        border-none outline-none focus:outline-none focus:ring-0"
                            />
                        ) : (
                            "Inventory"
                        )
                    }
                    rightContent={
                        isSearchVisible ? (
                            <HiX
                                className="w-6 h-6 text-gray-500 dark:text-gray-400 cursor-pointer active:scale-95 transition-transform"
                                onClick={handleSearchToggle}
                            />
                        ) : (
                            <HiSearch
                                className="w-6 h-6 text-sky-500 dark:text-sky-400 cursor-pointer active:scale-95 transition-transform"
                                onClick={handleSearchToggle}
                            />
                        )
                    }
                    className='bg-white dark:bg-gray-700'
                />

                <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => handleTabChange('items')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                            ${activeTab === 'items'
                                ? 'text-sky-500 dark:text-sky-400 border-b-2 border-sky-500 dark:border-sky-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        Items
                    </button>
                    <button
                        onClick={() => handleTabChange('category')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
                            ${activeTab === 'category'
                                ? 'text-sky-500 dark:text-sky-400 border-b-2 border-sky-500 dark:border-sky-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <Tag className="w-4 h-4" />
                        Category
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[100px]">
                {activeTab === 'items' ? (
                    <MobileInventoryCardList
                        data={accumulatedItems}
                        isLoading={isInventoryLoading}
                        onItemTap={handleEditItem}
                        totalRows={totalRows}
                        page={page}
                        perPage={perPage}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMoreItems}
                    />
                ) : (
                    <CategoryList
                        categories={filteredCategories}
                        isLoading={isCategoriesLoading}
                        onCategoryTap={handleCategoryTap}
                        onDeleteCategory={handleDeleteCategory}
                        onReorderCategory={handleReorderCategory}
                    />
                )}
            </div>

            <FloatingFilterButton
                onClick={handleFloatingButtonClick}
                icon={<HiPlus className="w-6 h-6" />}
                className="bottom-6"
            />
        </div>
    );
};

export default MobileInventory;
