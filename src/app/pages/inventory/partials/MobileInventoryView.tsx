import React, { FC, useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { Plus, Package, Loader2 } from 'lucide-react';
import InventoryToolbar from './InventoryToolbar';
import InventorySummaryCards, { InventorySummaryCard } from './InventorySummaryCards';
import InventoryFilterSheet from './InventoryFilterSheet';
import InventoryActiveFilterChips from './InventoryActiveFilterChips';
import MobileProductCard, { MobileProductCardSkeleton } from './MobileProductCard';

interface MobileInventoryViewProps {
    /** Data & loading */
    data: ApiProduct[];
    isLoading: boolean;
    totalRows: number;
    categories: Category[];

    /** Summary cards */
    summaryCards: InventorySummaryCard[];
    statsLoading: boolean;

    /** Search & filters */
    searchTerm: string;
    onSearch: (value: string) => void;
    activeFilter: string;
    onFilterChange: (status: string) => void;
    categoryId?: string;
    onCategoryChange: (categoryId: string) => void;
    startDate: string;
    endDate: string;
    onDateChange: (start: Date | null, end: Date | null) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onExport?: () => void;

    /** Pagination */
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;

    /** Item actions */
    onAddItem?: () => void;
    onEdit?: (item: ApiProduct) => void;
    onDelete?: (productId: string) => void;
    onAdjustQuantity?: (item: ApiProduct) => void;
    onViewStockMovements?: (item: ApiProduct) => void;

    /** Bulk */
    selectedRowCount: number;
    onBulkActions?: () => void;
}

const MobileInventoryView: FC<MobileInventoryViewProps> = ({
    data,
    isLoading,
    totalRows,
    categories,
    summaryCards,
    statsLoading,
    searchTerm,
    onSearch,
    activeFilter,
    onFilterChange,
    categoryId,
    onCategoryChange,
    startDate,
    endDate,
    onDateChange,
    hasActiveFilters,
    onClearFilters,
    onExport,
    page,
    perPage,
    onPageChange,
    onAddItem,
    onEdit,
    onDelete,
    onAdjustQuantity,
    onViewStockMovements,
    selectedRowCount,
    onBulkActions,
}) => {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [accumulatedItems, setAccumulatedItems] = useState<ApiProduct[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const hasMore = totalRows > 0 && accumulatedItems.length < totalRows;

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (startDate) count++;
        if (activeFilter !== 'all') count++;
        if (categoryId && categoryId !== 'all') count++;
        return count;
    }, [searchTerm, startDate, activeFilter, categoryId]);

    const handleClearSearch = useCallback(() => onSearch(""), [onSearch]);
    const handleClearDate = useCallback(() => onDateChange(null, null), [onDateChange]);
    const handleClearStatus = useCallback(() => onFilterChange("all"), [onFilterChange]);
    const handleClearCategory = useCallback(() => onCategoryChange("all"), [onCategoryChange]);

    // Accumulate items for infinite scroll
    useEffect(() => {
        if (data && data.length > 0) {
            if (page === 1) {
                setAccumulatedItems(data);
            } else {
                setAccumulatedItems(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = data.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAccumulatedItems([]);
        }
    }, [data, page]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setAccumulatedItems([]);
    }, [searchTerm, activeFilter, categoryId, startDate, endDate]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            onPageChange(page + 1);
        }
    }, [isLoading, hasMore, page, onPageChange]);

    // Intersection observer for infinite scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                handleLoadMore();
            }
        },
        [hasMore, isLoading, handleLoadMore]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '200px',
            threshold: 0.1,
        });
        observerRef.current.observe(element);

        return () => observerRef.current?.disconnect();
    }, [handleObserver]);

    const handleTap = useCallback((item: ApiProduct) => {
        onEdit?.(item);
    }, [onEdit]);

    return (
        <>
            {/* Toolbar: search + filter button + export */}
            <InventoryToolbar
                searchTerm={searchTerm}
                onSearch={onSearch}
                startDate={startDate}
                endDate={endDate}
                onDateChange={onDateChange}
                onExport={onExport}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                selectedRowCount={selectedRowCount}
                onBulkActions={onBulkActions}
                isMobile
                onOpenFilters={() => setIsFilterSheetOpen(true)}
            />

            {/* Active filter chips (inline, scrollable) */}
            {hasActiveFilters && (
                <InventoryActiveFilterChips
                    searchTerm={searchTerm}
                    startDate={startDate}
                    endDate={endDate}
                    activeFilter={activeFilter}
                    categoryId={categoryId}
                    categories={categories}
                    onClearSearch={handleClearSearch}
                    onClearDate={handleClearDate}
                    onClearStatus={handleClearStatus}
                    onClearCategory={handleClearCategory}
                    onClearAll={onClearFilters}
                />
            )}

            <InventorySummaryCards cards={summaryCards} isLoading={statsLoading} />

            <div>
                {isLoading && accumulatedItems.length === 0 ? (
                    <div className="px-3 py-3 space-y-2">
                        {Array.from({ length: 6 }, (_, i) => (
                            <MobileProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : accumulatedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            No inventory found
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                            {hasActiveFilters
                                ? 'Try adjusting your filters to find items.'
                                : 'Items will appear here once added.'}
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="mt-3 text-sm font-medium text-cyan-500 hover:text-cyan-600 active:scale-95 transition-all"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="py-2 space-y-2 pb-24">
                        {/* Results count */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-0.5">
                            {totalRows > 0
                                ? `${accumulatedItems.length} of ${totalRows} item${totalRows === 1 ? '' : 's'}`
                                : `${accumulatedItems.length} item${accumulatedItems.length === 1 ? '' : 's'}`}
                        </p>

                        {accumulatedItems.map(item => (
                            <MobileProductCard
                                key={item.id}
                                item={item}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onAdjustQuantity={onAdjustQuantity}
                                onViewStockMovements={onViewStockMovements}
                                onTap={handleTap}
                            />
                        ))}

                        {/* Infinite scroll sentinel */}
                        <div ref={loadMoreRef} className="h-1" />

                        {isLoading && accumulatedItems.length > 0 && (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
                            </div>
                        )}

                        {!hasMore && accumulatedItems.length > 0 && (
                            <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                                {totalRows > 0 ? `All ${totalRows} items loaded` : 'No more items'}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Floating action button */}
            {onAddItem && (
                <button
                    onClick={onAddItem}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-cyan-500 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             hover:bg-cyan-600 focus:outline-none focus:ring-4 focus:ring-cyan-200 dark:focus:ring-cyan-900"
                    aria-label="Add inventory item"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            {/* Filter bottom sheet */}
            <InventoryFilterSheet
                isOpen={isFilterSheetOpen}
                onClose={() => setIsFilterSheetOpen(false)}
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
                categoryId={categoryId}
                onCategoryChange={onCategoryChange}
                categories={categories}
                startDate={startDate}
                endDate={endDate}
                onDateChange={onDateChange}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={onClearFilters}
            />
        </>
    );
};

export default MobileInventoryView;
