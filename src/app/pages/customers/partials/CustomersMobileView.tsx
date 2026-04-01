import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Users, Loader2, UserPlus } from 'lucide-react';
import CustomerMobileCard, { CustomerMobileCardSkeleton } from './CustomerMobileCard';

interface CustomersMobileViewProps {
    customers: Customer[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    totalRows: number;
    searchTerm: string;
    onPageChange: (page: number) => void;
    onEdit: (customer: Customer) => void;
    onDelete: (customerId: string, customerName: string) => void;
    onAddCustomer: () => void;
}

const CustomersMobileView: FC<CustomersMobileViewProps> = ({
    customers,
    isLoading,
    page,
    totalPages,
    totalRows,
    searchTerm,
    onPageChange,
    onEdit,
    onDelete,
    onAddCustomer,
}) => {
    const [accumulatedData, setAccumulatedData] = useState<Customer[]>([]);
    const [reachedEnd, setReachedEnd] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const hasMore = totalRows > 0 && accumulatedData.length < totalRows && !reachedEnd;

    // Accumulate items for infinite scroll
    useEffect(() => {
        if (customers && customers.length > 0) {
            setReachedEnd(false);
            if (page === 1) {
                setAccumulatedData(customers);
            } else {
                setAccumulatedData(prev => {
                    const existingIds = new Set(prev.map(c => c.customerId));
                    const newItems = customers.filter(c => !existingIds.has(c.customerId));
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
    }, [customers, page]);

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

    // Loading skeleton
    if (isLoading && accumulatedData.length === 0) {
        return (
            <div className="py-1">
                {Array.from({ length: 6 }, (_, i) => (
                    <CustomerMobileCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // Empty state
    if (accumulatedData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {searchTerm ? 'No customers found' : 'No customers yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                    {searchTerm
                        ? 'Try adjusting your search terms.'
                        : 'Get started by adding your first customer.'}
                </p>
                {!searchTerm && (
                    <button
                        onClick={onAddCustomer}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-500 hover:text-sky-600 active:scale-95 transition-all"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Customer
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
                    ? `${accumulatedData.length} of ${totalRows} customer${totalRows === 1 ? '' : 's'}`
                    : `${accumulatedData.length} customer${accumulatedData.length === 1 ? '' : 's'}`}
            </p>

            {/* Customer list */}
            {accumulatedData.map(customer => (
                <CustomerMobileCard
                    key={customer.customerId}
                    customer={customer}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} className="h-1" />

            {/* Loading more indicator */}
            {isLoading && accumulatedData.length > 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 text-sky-500 animate-spin" />
                </div>
            )}

            {/* All loaded message */}
            {!hasMore && accumulatedData.length > 0 && (
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                    {totalRows > 0 ? `All ${totalRows} customers loaded` : 'No more customers'}
                </p>
            )}
        </div>
    );
};

export default CustomersMobileView;
