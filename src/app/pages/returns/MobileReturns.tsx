import { FunctionComponent, useState, useCallback, useMemo } from 'react';
import { Calendar, Search, X, RotateCcw } from 'lucide-react';
import { Confirm } from 'notiflix';
import dayjs from 'dayjs';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import ReturnMobileCard from './partials/ReturnMobileCard';
import SalesLoadingState from '../../components/loader/LoadingState';
import MobilePagination from '../sales/partials/MobilePagination';
import ReturnDetailsModal from './partials/ReturnDetailsModal';
import RestockItemsModal from './partials/RestockItemsModal';
import { useReturns } from '../../hooks/useReturns';

const ITEMS_PER_PAGE = 15;

const MobileReturns: FunctionComponent = () => {
    const {
        isLoading,
        returns,
        filteredReturns,
        searchTerm,
        handleSearch,
        cancelReturn,
        loadReturns
    } = useReturns();

    const [expandedReturnId, setExpandedReturnId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [localSearchQuery, setLocalSearchQuery] = useState('');

    const [startDate, setStartDate] = useState<string>(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

    const [selectedReturn, setSelectedReturn] = useState<ReturnDetails | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

    // Filter returns by date range and local search
    const filteredReturnsByDate = useMemo(() => {
        let filtered = returns;

        // Filter by date range
        filtered = filtered.filter(returnData => {
            const returnDate = dayjs(returnData.createdAt || returnData.returnTransaction?.date);
            const start = dayjs(startDate).startOf('day');
            const end = dayjs(endDate).endOf('day');
            return returnDate.isAfter(start) && returnDate.isBefore(end);
        });

        // Filter by local search query
        if (localSearchQuery.trim()) {
            const query = localSearchQuery.toLowerCase();
            filtered = filtered.filter(returnData => {
                const returnNumber = (returnData.returnNumber || returnData.returnTransaction?.refNumber || '').toLowerCase();
                const customerName = (returnData.originalSale?.customer?.name || returnData.originalTransaction?.customer?.name || '').toLowerCase();
                return returnNumber.includes(query) || customerName.includes(query);
            });
        }

        return filtered;
    }, [returns, startDate, endDate, localSearchQuery]);

    const totalPages = Math.ceil(filteredReturnsByDate.length / ITEMS_PER_PAGE);

    const paginatedReturns = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredReturnsByDate.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredReturnsByDate, currentPage]);

    const handleToggleReturn = (returnId: string) => {
        setExpandedReturnId(prev => prev === returnId ? null : returnId);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setExpandedReturnId(null);
    };

    const handleViewDetails = useCallback((returnData: ReturnDetails) => {
        setSelectedReturn(returnData);
        setIsDetailsModalOpen(true);
    }, []);

    const handleRestock = useCallback((returnData: ReturnDetails) => {
        setSelectedReturn(returnData);
        setIsRestockModalOpen(true);
    }, []);

    const handleCancelReturn = useCallback((returnTransactionId: string, refNumber: string) => {
        Confirm.show(
            'Cancel Return',
            `Are you sure you want to cancel return ${refNumber}? This action cannot be undone.`,
            'Yes, Cancel',
            'No',
            async () => {
                await cancelReturn(returnTransactionId, refNumber);
            },
            () => { },
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [cancelReturn]);

    const handleRestockSuccess = useCallback(() => {
        loadReturns();
    }, [loadReturns]);

    const handleClearSearch = () => {
        setLocalSearchQuery('');
        setCurrentPage(1);
    };

    const renderContent = () => {
        if (isLoading) {
            return <SalesLoadingState />;
        }

        if (filteredReturnsByDate.length === 0) {
            if (localSearchQuery) {
                return (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            No returns found for "{localSearchQuery}"
                        </p>
                        <button
                            onClick={handleClearSearch}
                            className="mt-4 text-sky-500 text-sm font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                );
            }
            return (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <RotateCcw className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                        No returns yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                        Returns will appear here when customers return items.
                    </p>
                </div>
            );
        }

        return (
            <>
                <div className="space-y-2">
                    {paginatedReturns.map((returnData) => (
                        <ReturnMobileCard
                            key={returnData.returnId || returnData.returnTransaction?.transactionId}
                            returnData={returnData}
                            onViewDetails={handleViewDetails}
                            onRestock={handleRestock}
                            onCancel={handleCancelReturn}
                        />
                    ))}
                </div>

                <MobilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredReturnsByDate.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={handlePageChange}
                />
            </>
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
            <div className="fixed top-0 left-0 right-0 z-50">
                <MobilePageHeader
                    title="Returns"
                    className="bg-white dark:bg-gray-800"
                />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden pt-[52px]">
                <div className="h-full overflow-y-auto pb-24">
                    <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by return # or customer..."
                                value={localSearchQuery}
                                onChange={(e) => {
                                    setLocalSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-sm focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                            />
                            {localSearchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-sm focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200"
                                />
                            </div>
                            <span className="text-gray-400 text-sm">to</span>
                            <div className="flex-1 relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => {
                                        setEndDate(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-sm focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200"
                                />
                            </div>
                        </div>
                    </div>

                    {!isLoading && filteredReturnsByDate.length > 0 && (
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {filteredReturnsByDate.length} return{filteredReturnsByDate.length !== 1 ? 's' : ''} found
                            {localSearchQuery && ` for "${localSearchQuery}"`}
                        </div>
                    )}

                    <div className="px-4 pb-4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {selectedReturn && (
                <>
                    <ReturnDetailsModal
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedReturn(null);
                        }}
                        returnDetails={selectedReturn}
                    />

                    <RestockItemsModal
                        isOpen={isRestockModalOpen}
                        onClose={() => {
                            setIsRestockModalOpen(false);
                            setSelectedReturn(null);
                        }}
                        returnDetails={selectedReturn}
                        onSuccess={handleRestockSuccess}
                    />
                </>
            )}
        </div>
    );
};

export default MobileReturns;
