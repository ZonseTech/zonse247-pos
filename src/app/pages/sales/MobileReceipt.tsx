import { FunctionComponent, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Calendar, Search, X } from 'lucide-react';
import dayjs from 'dayjs';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import CollapsibleSaleCard from './partials/CollapsibleSaleCard';
import SalesEmptyState from './partials/SalesEmptyState';
import SalesLoadingState from '../../components/loader/LoadingState';
import MobilePagination from './partials/MobilePagination';
import PaymentMethodFilterPopup from './partials/PaymentMethodFilterPopup';
import salesService from '../../services/sales.service';
import { ROUTES } from '../../utils/constants';

const ITEMS_PER_PAGE = 15;

const MobileReceipt: FunctionComponent = () => {
    const navigate = useNavigate();

    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

    const loadReceipts = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await salesService.list({
                startDate,
                endDate,
                includeItems: true,
                ...(selectedPaymentMethod && { paymentMethodId: selectedPaymentMethod }),
            });

            setSales(response.sales || []);
        } catch (error) {
            console.error('Failed to load receipts:', error);
            setSales([]);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, selectedPaymentMethod]);

    useEffect(() => {
        loadReceipts();
    }, [loadReceipts]);

    const filteredSales = useMemo(() => {
        if (!searchQuery.trim()) return sales;

        const query = searchQuery.toLowerCase();
        return sales.filter(sale => {
            const saleNumber = (sale.saleNumber || sale.id?.slice(-8) || '').toLowerCase();
            const customerName = (sale.customer?.name || '').toLowerCase();
            return saleNumber.includes(query) || customerName.includes(query);
        });
    }, [sales, searchQuery]);

    const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);

    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredSales, currentPage]);

    const handleToggleSale = (saleId: string) => {
        setExpandedSaleId(prev => prev === saleId ? null : saleId);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setExpandedSaleId(null);
    };

    const handleViewSale = (sale: Sale) => {
        navigate(`${ROUTES.RECEIPT_DETAILS.replace(':saleId', sale.id)}`);
    };

    const handleReturnSale = (sale: Sale) => {
        console.log('Return sale:', sale.id);
    };

    const handleDeleteSale = (sale: Sale) => {
        console.log('Delete sale:', sale.id);
    };

    const handlePaymentMethodFilter = (methodId: string | null) => {
        setSelectedPaymentMethod(methodId);
        setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    const renderContent = () => {
        if (isLoading) {
            return <SalesLoadingState />;
        }

        if (filteredSales.length === 0) {
            if (searchQuery) {
                return (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            No receipts found for "{searchQuery}"
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
            return <SalesEmptyState />;
        }

        return (
            <>
                <div className="space-y-2">
                    {paginatedSales.map((sale) => (
                        <CollapsibleSaleCard
                            key={sale.id}
                            sale={sale}
                            isExpanded={expandedSaleId === sale.id}
                            onToggle={() => handleToggleSale(sale.id)}
                            onView={() => handleViewSale(sale)}
                            onReturn={() => handleReturnSale(sale)}
                            onDelete={() => handleDeleteSale(sale)}
                            showFullDate
                        />
                    ))}
                </div>

                <MobilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredSales.length}
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
                    title="Receipts"
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
                                placeholder="Search by receipt # or customer..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-sm focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
                            />
                            {searchQuery && (
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

                    {!isLoading && filteredSales.length > 0 && (
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                            {filteredSales.length} receipt{filteredSales.length !== 1 ? 's' : ''} found
                            {searchQuery && ` for "${searchQuery}"`}
                        </div>
                    )}

                    <div className="px-4 pb-4">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <PaymentMethodFilterPopup
                isOpen={isFilterOpen}
                selectedPaymentMethod={selectedPaymentMethod}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                onSelect={handlePaymentMethodFilter}
                fabClassName='bottom-6'
            />
        </div>
    );
};

export default MobileReceipt;