import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { PurchaseOrderMobileList, PurchaseOrderMobileCardSkeleton } from './PurchaseOrderMobileCard';

interface PurchaseOrderMobileViewProps {
    data: PurchaseOrder[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    page: number;
    totalPages: number;
    totalRows: number;
    perPage: number;
    onSend: (po: PurchaseOrder) => void;
    onReceive: (po: PurchaseOrder) => void;
    onCancel: (po: PurchaseOrder) => void;
    onView: (po: PurchaseOrder) => void;
    onPageChange: (page: number) => void;
    onClearFilters: () => void;
}

const PurchaseOrderMobileView: FC<PurchaseOrderMobileViewProps> = ({
    data,
    isLoading,
    hasActiveFilters,
    page,
    totalPages,
    totalRows,
    perPage,
    onSend,
    onReceive,
    onCancel,
    onView,
    onPageChange,
    onClearFilters,
}) => {
    const [accumulatedData, setAccumulatedData] = useState<PurchaseOrder[]>([]);
    const [reachedEnd, setReachedEnd] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const hasMore = totalRows > 0 && accumulatedData.length < totalRows && !reachedEnd;

    // Accumulate items for infinite scroll
    useEffect(() => {
        if (data && data.length > 0) {
            setReachedEnd(false);
            if (page === 1) {
                setAccumulatedData(data);
            } else {
                setAccumulatedData(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = data.filter(item => !existingIds.has(item.id));
                    if (newItems.length === 0) {
                        setReachedEnd(true);
                        return prev;
                    }
                    return [...prev, ...newItems];
                });
            }
        } else if (page === 1) {
            setAccumulatedData([]);
            setReachedEnd(false);
        } else {
            // Server returned no items for page > 1 — stop loading
            setReachedEnd(true);
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
    }, [handleObserver, accumulatedData.length]);

    // Loading state
    if (isLoading && accumulatedData.length === 0) {
        return (
            <div className="px-3 py-3 space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <PurchaseOrderMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (accumulatedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No purchase orders found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    {hasActiveFilters
                        ? 'Try adjusting your filters to find purchase orders.'
                        : 'Purchase orders will appear here once they are created.'}
                </p>
                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="mt-3 text-sm font-medium text-sky-500 hover:text-sky-600 active:scale-95 transition-all"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Results count */}
            <p className="text-xs text-gray-500 dark:text-gray-400 px-3.5 pt-2 pb-1">
                {totalRows > 0
                    ? `${accumulatedData.length} of ${totalRows} order${totalRows === 1 ? '' : 's'}`
                    : `${accumulatedData.length} order${accumulatedData.length === 1 ? '' : 's'}`}
            </p>

            <PurchaseOrderMobileList
                purchaseOrders={accumulatedData}
                onSend={onSend}
                onReceive={onReceive}
                onCancel={onCancel}
                onView={onView}
                isLoading={false}
            />

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-1" />

            {isLoading && accumulatedData.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                </div>
            )}

            {!hasMore && accumulatedData.length > 0 && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    {totalRows > 0 ? `All ${totalRows} orders loaded` : 'No more orders'}
                </p>
            )}
        </div>
    );
};

export default PurchaseOrderMobileView;
