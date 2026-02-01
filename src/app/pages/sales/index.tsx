import { FC, useContext, useState, useCallback } from "react";
import DataTable, { type Themes } from "react-data-table-component";
import { HiOutlineMenuAlt4, HiOutlineDownload, HiOutlineFilter, HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { ReceiptEuro } from "lucide-react";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import Loader from "../../components/Loader";
import { Button, ZonseThemeContext, DateRangeFilter } from "../../components";
import { SearchBar } from "../../components/SearchBar";
import { getTableStyles } from "../../utils/table-styles";
import { useSales } from "../../hooks/useSales";
import { useSaleSummary } from "../../hooks/useSaleSummary";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { getSaleTableColumns } from "./partials/SaleTableColumns";
import { StatusFilter } from "./partials/StatusFilter";
import { PaymentMethodFilter } from "./partials/PaymentMethodFilter";
import SaleDetailsModal from "./partials/SaleDetailsModal";
import SaleSummaryCards from "./partials/SaleSummaryCards";
import { SaleMobileList } from "./partials/SaleMobileCard";
import InitiateReturnModal from "../returns/partials/InitiateReturnModal";
import { useNavigate } from "react-router";
import { ROUTES } from "../../utils/constants";
import { useIsMobile } from "../../hooks/useMediaQuery";

const SalesPage: FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
    const [saleForReturn, setSaleForReturn] = useState<Sale | null>(null);

    const {
        page,
        totalRows,
        isLoading,
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
        perPage,
        getPaginatedData,
        handleSearch,
        handleDateChange,
        handleStatusChange,
        handlePaymentMethodChange,
        getTodaySales,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
        loadSales,
    } = useSales();

    const totalPages = Math.ceil(totalRows / perPage);

    const { paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();

    const { isLoadingSummary, getSummaryCards, loadSummary } = useSaleSummary({
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
    });

    // Use union type for both Sale and Transaction data
    type SaleOrTransaction = (Sale | Transaction) & {
        saleNumber?: string;
        refNumber?: string;
        transactionId?: string;
    };

    const handleViewDetails = useCallback((sale: SaleOrTransaction) => {
        setSelectedSale(sale as Sale);
        setIsOpenDetails(true);
    }, []);

    const handleInitiateReturn = useCallback((sale: SaleOrTransaction) => {
        setSaleForReturn(sale as Sale);
        setIsReturnModalOpen(true);
    }, []);

    const columns = getSaleTableColumns({
        onViewDetails: handleViewDetails,
        onInitiateReturn: handleInitiateReturn,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Sales"
                    description="Manage and view all sales transactions"
                    icon={<ReceiptEuro className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={() => navigate(ROUTES.POS)}
                            theme="primary">
                            {!isMobile && <span className='hidden md:block'>
                                New Sale
                            </span>}
                        </Button>
                    }
                >
                    <div className="p-3 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col gap-3 md:gap-4">
                            {/* Search Row */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <SearchBar
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:flex-1 sm:max-w-xs"
                                />

                                {/* Action buttons - stack on mobile */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={exportData}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        <HiOutlineDownload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>

                                    <button
                                        onClick={getTodaySales}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-700 rounded-lg transition-colors duration-200"
                                    >
                                        <HiOutlineFilter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Today</span>
                                    </button>

                                    {(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all') && (
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                        >
                                            <HiOutlineFilter className="w-4 h-4" />
                                            <span className="hidden sm:inline">Clear</span>
                                        </button>
                                    )}
                                </div>
                                <DateRangeFilter
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateChange}
                                />
                            </div>

                            {/* Status and Payment Filters */}
                            <div className="flex flex-col gap-3">
                                <StatusFilter
                                    selectedStatus={selectedStatus}
                                    onChange={handleStatusChange}
                                />

                                <PaymentMethodFilter
                                    selectedPaymentMethod={selectedPaymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    paymentMethods={paymentMethods}
                                    isLoading={isLoadingPaymentMethods}
                                />
                            </div>
                        </div>
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <SaleSummaryCards
                        cards={getSummaryCards()}
                        isLoading={isLoadingSummary}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <SaleMobileList
                                    transactions={[]}
                                    onViewDetails={handleViewDetails}
                                    onInitiateReturn={handleInitiateReturn}
                                    isLoading={true}
                                />
                            ) : getPaginatedData().length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineMenuAlt4 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        No sales found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all'
                                            ? "Try adjusting your filters to find sales."
                                            : "Sales will appear here once they are created."
                                        }
                                    </p>
                                    {(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all') && (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <SaleMobileList
                                        transactions={getPaginatedData()}
                                        onViewDetails={handleViewDetails}
                                        onInitiateReturn={handleInitiateReturn}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Page {page} of {totalPages} ({totalRows} total)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={page >= totalPages}
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
                                customStyles={getTableStyles(mode)}
                                progressPending={isLoading}
                                progressComponent={<Loader isLoading={isLoading} />}
                                highlightOnHover
                                striped
                                responsive
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                fixedHeader
                                fixedHeaderScrollHeight="calc(100vh - 380px)"
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                            <HiOutlineMenuAlt4 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No transactions found
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                            {searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all'
                                                ? "Try adjusting your search, date, status, or payment method filters to find transactions."
                                                : "Transactions will appear here once they are created."
                                            }
                                        </p>
                                        {(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all') && (
                                            <button
                                                onClick={clearFilters}
                                                className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}

                    <SaleDetailsModal
                        sale={selectedSale}
                        isOpenDetails={isOpenDetails}
                        setIsOpenDetails={setIsOpenDetails}
                    />

                    {saleForReturn && (
                        <InitiateReturnModal
                            isOpen={isReturnModalOpen}
                            onClose={() => {
                                setIsReturnModalOpen(false);
                                setSaleForReturn(null);
                            }}
                            sale={saleForReturn}
                            onSuccess={() => {
                                loadSales();
                                loadSummary();
                                setIsReturnModalOpen(false);
                                setSaleForReturn(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default SalesPage;