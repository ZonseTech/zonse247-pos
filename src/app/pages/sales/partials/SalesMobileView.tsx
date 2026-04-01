import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Receipt, Loader2 } from "lucide-react";
import { Button } from "@radix-ui/themes";
import { SaleMobileList, SaleMobileCardSkeleton } from "./SaleMobileCard";

type SaleOrTransaction = (Sale | Transaction) & {
    saleNumber?: string;
    refNumber?: string;
    transactionId?: string;
};

interface SalesMobileViewProps {
    data: SaleOrTransaction[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    page: number;
    totalPages: number;
    totalRows: number;
    perPage: number;
    onViewDetails: (sale: SaleOrTransaction) => void;
    onInitiateReturn: (sale: SaleOrTransaction) => void;
    onPageChange: (page: number) => void;
    onClearFilters: () => void;
}

const SalesMobileView: FC<SalesMobileViewProps> = ({
    data,
    isLoading,
    hasActiveFilters,
    page,
    totalPages,
    totalRows,
    perPage,
    onViewDetails,
    onInitiateReturn,
    onPageChange,
    onClearFilters,
}) => {
    const [accumulatedData, setAccumulatedData] = useState<SaleOrTransaction[]>([]);
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
                    const existingIds = new Set(prev.map(item => item.id || (item as Transaction).transactionId));
                    const newItems = data.filter(item => !existingIds.has(item.id || (item as Transaction).transactionId));
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
    }, [handleObserver, accumulatedData.length]);

    // Loading state
    if (isLoading && accumulatedData.length === 0) {
        return (
            <div className="px-3 py-3 space-y-2">
                {Array.from({ length: 5 }, (_, i) => (
                    <SaleMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (accumulatedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Receipt className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    No sales found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    {hasActiveFilters
                        ? "Try adjusting your filters to find sales."
                        : "Sales will appear here once they are created."}
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
                    ? `${accumulatedData.length} of ${totalRows} transaction${totalRows === 1 ? '' : 's'}`
                    : `${accumulatedData.length} transaction${accumulatedData.length === 1 ? '' : 's'}`}
            </p>

            <SaleMobileList
                transactions={accumulatedData}
                onViewDetails={onViewDetails}
                onInitiateReturn={onInitiateReturn}
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
                    {totalRows > 0 ? `All ${totalRows} transactions loaded` : 'No more transactions'}
                </p>
            )}
        </div>
    );
};

export default SalesMobileView;
