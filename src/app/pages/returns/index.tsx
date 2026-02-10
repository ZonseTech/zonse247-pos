import { FC, useState, useContext, useCallback, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { HiOutlineFilter, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import DataTable, { type Themes } from 'react-data-table-component';
import Loader from '../../components/Loader';
import ReturnDetailsModal from './partials/ReturnDetailsModal';
import RestockItemsModal from './partials/RestockItemsModal';
import Filters from './partials/Filters';
import ReturnSummaryCards, { ReturnSummaryCard } from './partials/ReturnSummaryCards';
import { ReturnMobileList } from './partials/ReturnMobileCard';
import { useReturns } from '../../hooks/useReturns';
import { getTableStyles, getCompactTableStyles } from '../../utils/table-styles';
import { getReturnColumns } from './partials/ReturnTableColumns';
import { ZonseThemeContext } from '../../components';
import { useIsMobile, useIsEBN } from '../../hooks/useMediaQuery';
import SearchBar from '../../components/SearchBar';

const ReturnsPage: FC = () => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const { mode } = useContext(ZonseThemeContext);
    const {
        isLoading,
        searchTerm,
        totalRows,
        activeFilter,
        perPage,
        getPaginatedData,
        getSummaryData,
        handleSearch,
        handleClearFilters,
        handlePageChange,
        handlePerRowsChange,
        cancelReturn,
        loadReturns
    } = useReturns();

    const [selectedReturn, setSelectedReturn] = useState<ReturnDetails | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

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

    const columns = getReturnColumns(handleViewDetails, handleRestock, handleCancelReturn, isEBN);
    const summaryData = getSummaryData();

    // Transform summary data to card format
    const summaryCards: ReturnSummaryCard[] = useMemo(() => {
        const totalReturns = summaryData.find(s => s.title === 'Total Returns')?.value || 0;
        const pendingRestock = summaryData.find(s => s.title === 'Pending Restock')?.value || 0;
        const restocked = summaryData.find(s => s.title === 'Restocked')?.value || 0;
        const damaged = summaryData.find(s => s.title === 'Damaged')?.value || 0;

        return [
            {
                title: 'Total Returns',
                value: totalReturns,
                displayValue: String(totalReturns),
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending Restock',
                value: pendingRestock,
                displayValue: String(pendingRestock),
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Restocked',
                value: restocked,
                displayValue: String(restocked),
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Damaged',
                value: damaged,
                displayValue: String(damaged),
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ];
    }, [summaryData]);

    const hasActiveFilters = searchTerm || activeFilter !== 'all';

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<RotateCcw className={isEBN ? "w-5 h-5 text-sky-500 dark:text-sky-400" : "w-8 h-8 text-sky-500 dark:text-sky-400"} />}
                    title="Returns"
                    description={(isMobile || isEBN) ? undefined : "Manage product returns, process refunds, and track restock status"}
                    compact={isEBN}
                >
                    {/* Filters Section */}
                    {isEBN ? (
                        <div className="flex flex-wrap items-center gap-2 px-2 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                            <SearchBar
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-32"
                                compact
                            />

                            <Filters
                                summaryData={summaryData}
                                activeFilter={activeFilter}
                                onClear={handleClearFilters}
                                compact
                            />

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded border border-red-200 dark:border-red-700"
                                >
                                    <HiOutlineFilter className="w-3 h-3" />
                                    Clear
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex flex-row items-center justify-between gap-3 md:gap-4">
                                {/* Search Row */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <SearchBar
                                        placeholder="Search by return ID, transaction, or customer..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                        className="w-full sm:flex-1 sm:max-w-xs"
                                    />

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                            >
                                                <HiOutlineFilter className="w-4 h-4" />
                                                <span className="hidden sm:inline">Clear</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Status Filters */}
                                <div className="flex flex-col gap-3">
                                    <Filters
                                        summaryData={summaryData}
                                        activeFilter={activeFilter}
                                        onClear={handleClearFilters}
                                        compact={isEBN}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </PageHeader>

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <ReturnSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                        compact={isEBN}
                        mobile={isMobile}
                    />

                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <ReturnMobileList
                                    returns={[]}
                                    onViewDetails={handleViewDetails}
                                    onRestock={handleRestock}
                                    onCancel={handleCancelReturn}
                                    isLoading={true}
                                />
                            ) : getPaginatedData().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <RotateCcw className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm ? 'No matching returns' : 'No returns yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to find returns."
                                            : "Returns will appear here when customers return items."
                                        }
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <ReturnMobileList
                                        returns={getPaginatedData()}
                                        onViewDetails={handleViewDetails}
                                        onRestock={handleRestock}
                                        onCancel={handleCancelReturn}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, Math.ceil(totalRows / perPage) - 1))}
                                                disabled={totalRows <= perPage}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(2)}
                                                disabled={totalRows <= perPage}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Desktop View - Data Table */
                        <div className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={getPaginatedData()}
                                theme={mode as Themes}
                                customStyles={isEBN ? getCompactTableStyles(mode) : getTableStyles(mode)}
                                progressPending={isLoading}
                                progressComponent={<Loader isLoading={isLoading} />}
                                highlightOnHover
                                striped
                                responsive
                                dense={isEBN}
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                fixedHeader
                                fixedHeaderScrollHeight={isEBN ? "calc(100vh - 280px)" : "calc(100vh - 420px)"}
                                noDataComponent={
                                    <div className={isEBN ? "flex flex-col items-center justify-center py-6" : "flex flex-col items-center justify-center py-12"}>
                                        <div className={isEBN
                                            ? "w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2"
                                            : "w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4"
                                        }>
                                            <RotateCcw className={isEBN ? "w-5 h-5 text-gray-400" : "w-8 h-8 text-gray-400"} />
                                        </div>
                                        <h3 className={isEBN
                                            ? "text-sm font-medium text-gray-900 dark:text-white mb-1"
                                            : "text-lg font-medium text-gray-900 dark:text-white mb-2"
                                        }>
                                            {searchTerm ? 'No matching returns' : 'No returns yet'}
                                        </h3>
                                        {!isEBN && (
                                            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                                {hasActiveFilters
                                                    ? "Try adjusting your search or status filters to find returns."
                                                    : "Returns will appear here when customers return items."
                                                }
                                            </p>
                                        )}
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleClearFilters}
                                                className={isEBN
                                                    ? "mt-2 text-xs text-sky-500 dark:text-sky-400 font-medium"
                                                    : "mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                                }
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}

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
            </div>
        </AppLayout>
    );
};

export default ReturnsPage;
