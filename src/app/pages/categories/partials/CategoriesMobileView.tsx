import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { FolderOpen, Loader2, Plus } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import CategoryMobileCard, { CategoryMobileCardSkeleton } from './CategoryMobileCard';

interface CategoriesMobileViewProps {
    data: Category[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    page: number;
    totalRows: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string, categoryName: string) => void;
    onClearFilters: () => void;
    onAddCategory: () => void;
}

const CategoriesMobileView: FC<CategoriesMobileViewProps> = ({
    data,
    isLoading,
    hasActiveFilters,
    page,
    totalRows,
    perPage,
    onPageChange,
    onEdit,
    onDelete,
    onClearFilters,
    onAddCategory,
}) => {
    const [accumulatedData, setAccumulatedData] = useState<Category[]>([]);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const hasMore = totalRows > 0 && accumulatedData.length < totalRows;

    // Accumulate items for infinite scroll
    useEffect(() => {
        if (data && data.length > 0) {
            if (page === 1) {
                setAccumulatedData(data);
            } else {
                setAccumulatedData(prev => {
                    const existingIds = new Set(prev.map(item => item.categoryId));
                    const newItems = data.filter(item => !existingIds.has(item.categoryId));
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAccumulatedData([]);
        }
    }, [data, page]);

    const handleLoadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            onPageChange(page + 1);
        }
    }, [isLoading, hasMore, page, onPageChange]);

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                handleLoadMore();
            }
        },
        [hasMore, isLoading, handleLoadMore],
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
    }, [handleObserver, accumulatedData.length]);

    // Loading skeleton
    if (isLoading && accumulatedData.length === 0) {
        return (
            <div className="px-3 py-3 space-y-2">
                {Array.from({ length: 6 }, (_, i) => (
                    <CategoryMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (accumulatedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No categories found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    {hasActiveFilters
                        ? 'Try adjusting your search to find categories.'
                        : 'Get started by creating your first category.'}
                </p>
                {hasActiveFilters ? (
                    <button
                        onClick={onClearFilters}
                        className="mt-3 text-sm font-medium text-sky-500 hover:text-sky-600 active:scale-95 transition-all"
                    >
                        Clear filters
                    </button>
                ) : (
                    <Button size="2" className="mt-4" onClick={onAddCategory}>
                        <Plus className="w-4 h-4" />
                        Create Category
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Results count */}
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3.5 pt-2 pb-1">
                {totalRows > 0
                    ? `${accumulatedData.length} of ${totalRows} categor${totalRows === 1 ? 'y' : 'ies'}`
                    : `${accumulatedData.length} categor${accumulatedData.length === 1 ? 'y' : 'ies'}`}
            </p>

            <div className="space-y-2 px-3 py-2">
                {accumulatedData.map((category) => (
                    <CategoryMobileCard
                        key={category.categoryId}
                        category={category}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-1" />

            {isLoading && accumulatedData.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                </div>
            )}

            {!hasMore && accumulatedData.length > 0 && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    {totalRows > 0 ? `All ${totalRows} categories loaded` : 'No more categories'}
                </p>
            )}
        </div>
    );
};

export default CategoriesMobileView;
