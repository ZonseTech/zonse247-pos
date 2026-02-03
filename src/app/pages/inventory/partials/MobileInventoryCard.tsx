import React, { useRef, useCallback, useEffect } from 'react';
import { Tag, Loader2 } from 'lucide-react';
import { formatCurrency, formatQuantity } from '../../../utils';

interface MobileInventoryCardProps {
    item: InventoryItem;
    onTap: (item: InventoryItem) => void;
}

const MobileInventoryCard: React.FC<MobileInventoryCardProps> = ({ item, onTap }) => {
    const categoryName = item.categoryDetails?.name || 'Uncategorized';
    const firstLetter = categoryName.charAt(0).toUpperCase();
    const stockValue = item.stock ?? Number(item.quantity) ?? 0;
    const barcodes = item.barcode ? (Array.isArray(item.barcode) ? item.barcode : [item.barcode]) : [];

    return (
        <button
            onClick={() => onTap(item)}
            className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 text-left active:scale-[0.98] transition-all shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-sky-500 dark:text-sky-400">
                        {firstLetter}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                        {item.name}
                    </p>
                    <p className="text-sm font-semibold text-sky-500 dark:text-sky-400 mt-0.5">
                        {formatCurrency(item.sellPrice, true)}
                    </p>
                </div>

                <div className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0`}>
                    {formatQuantity(stockValue)} Left In Stock
                </div>
            </div>

            {barcodes.length > 0 && (
                <>
                    <hr className="my-3 border-gray-200 dark:border-gray-700" />

                    <div className="flex flex-wrap gap-2">
                        {barcodes.map((barcode, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-sm text-xs text-gray-600 dark:text-gray-300"
                            >
                                <Tag className="w-3 h-3" />
                                {barcode}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </button>
    );
};

// Skeleton Card
export const MobileInventoryCardSkeleton: React.FC = () => (
    <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
        <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
        <hr className="my-3 border-gray-200 dark:border-gray-700" />
        <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
    </div>
);

// List Component with Infinite Scroll
interface MobileInventoryCardListProps {
    data: InventoryItem[];
    isLoading: boolean;
    onItemTap: (item: InventoryItem) => void;
    totalRows?: number;
    page?: number;
    perPage?: number;
    onLoadMore?: () => void;
    hasMore?: boolean;
}

export const MobileInventoryCardList: React.FC<MobileInventoryCardListProps> = ({
    data,
    isLoading,
    onItemTap,
    totalRows = 0,
    page = 1,
    perPage = 13,
    onLoadMore,
    hasMore: hasMoreProp,
}) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Calculate if there are more items to load
    const hasMore = hasMoreProp ?? (totalRows > 0 && data.length < totalRows);

    // Intersection Observer for infinite scroll
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading && onLoadMore) {
                onLoadMore();
            }
        },
        [hasMore, isLoading, onLoadMore]
    );

    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        observerRef.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1,
        });

        observerRef.current.observe(element);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleObserver]);

    if (isLoading && data.length === 0) {
        return (
            <div className="h-full overflow-y-auto pb-24 px-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <MobileInventoryCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Tag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No items found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Add items to your inventory to get started
                </p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pb-24 px-4 space-y-2">
            {data.map((item) => (
                <MobileInventoryCard
                    key={item.productId}
                    item={item}
                    onTap={onItemTap}
                />
            ))}

            {/* Load more trigger element */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading indicator for pagination */}
            {isLoading && data.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                </div>
            )}

            {/* End of list indicator */}
            {!hasMore && data.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        {totalRows > 0 ? `Showing all ${totalRows} items` : 'No more items'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MobileInventoryCard;
