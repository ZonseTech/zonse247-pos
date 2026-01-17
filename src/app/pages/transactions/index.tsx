import { FC, useContext, useState, useCallback } from "react";
import DataTable, { type Themes } from "react-data-table-component";
import { HiOutlineMenuAlt4, HiOutlineDownload, HiOutlineFilter, HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { ReceiptEuro } from "lucide-react";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import Loader from "../../components/Loader";
import { Button, ZonseThemeContext, DateRangeFilter } from "../../components";
import { SearchBar } from "../../components/SearchBar";
import { getTableStyles, getCompactTableStyles } from "../../utils/table-styles";
import { useTransactions } from "../../hooks/useTransactions";
import { useTransactionSummary } from "../../hooks/useTransactionSummary";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { getTransactionTableColumns } from "./partials/TransactionTableColumns";
import { StatusFilter } from "./partials/StatusFilter";
import { PaymentMethodFilter } from "./partials/PaymentMethodFilter";
import TransactionDetailsModal from "./partials/TransactionDetailsModal";
import TransactionSummaryCards from "./partials/TransactionSummaryCards";
import { TransactionMobileList } from "./partials/TransactionMobileCard";
import InitiateReturnModal from "../returns/partials/InitiateReturnModal";
import { useNavigate } from "react-router";
import { ROUTES } from "../../utils/constants";
import { useIsMobile, useIsEBN } from "../../hooks/useMediaQuery";

const TransactionsPage: FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const { mode } = useContext(ZonseThemeContext);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction>({} as Transaction);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
    const [transactionForReturn, setTransactionForReturn] = useState<Transaction | null>(null);

    const {
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
        getTodayTransactions,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
        loadTransactions,
    } = useTransactions();

    const { paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();

    const { isLoadingSummary, getSummaryCards, loadSummary } = useTransactionSummary({
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
    });

    const handleViewDetails = useCallback((transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsOpenDetails(true);
    }, []);

    const handleInitiateReturn = useCallback((transaction: Transaction) => {
        setTransactionForReturn(transaction);
        setIsReturnModalOpen(true);
    }, []);

    const columns = getTransactionTableColumns({
        onViewDetails: handleViewDetails,
        onInitiateReturn: handleInitiateReturn,
        compact: isEBN,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Transactions"
                    description="Manage and view all transactions"
                    icon={<ReceiptEuro className={isEBN ? "w-6 h-6 text-blue-600 dark:text-blue-400" : "w-8 h-8 text-blue-600 dark:text-blue-400"} />}
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
                    compact={isEBN}
                >
                    <div className={isEBN ? "p-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600" : "p-3 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600"}>
                        <div className={isEBN ? "flex flex-col gap-2" : "flex flex-col gap-3 md:gap-4"}>
                            {/* Search Row */}
                            <div className={isEBN ? "flex flex-row gap-2 items-center" : "flex flex-col sm:flex-row gap-2 sm:gap-3"}>
                                <SearchBar
                                    placeholder="Search transactions..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className={isEBN ? "flex-1 max-w-[180px]" : "w-full sm:flex-1 sm:max-w-xs"}
                                    compact={isEBN}
                                />

                                {/* Action buttons - stack on mobile */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <button
                                        onClick={exportData}
                                        className={isEBN
                                            ? "flex items-center justify-center gap-1 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-xs font-medium text-gray-700 dark:text-gray-200"
                                            : "flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                                        }
                                    >
                                        <HiOutlineDownload className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                        <span className="hidden sm:inline">{isEBN ? "Exp" : "Export"}</span>
                                    </button>

                                    <button
                                        onClick={getTodayTransactions}
                                        className={isEBN
                                            ? "flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-md transition-colors duration-200"
                                            : "flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-200"
                                        }
                                    >
                                        <HiOutlineFilter className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                        <span className="hidden sm:inline">Today</span>
                                    </button>

                                    {(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all') && (
                                        <button
                                            onClick={clearFilters}
                                            className={isEBN
                                                ? "flex items-center justify-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200 border border-red-200 dark:border-red-700"
                                                : "flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                            }
                                        >
                                            <HiOutlineFilter className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
                                            <span className="hidden sm:inline">Clear</span>
                                        </button>
                                    )}
                                </div>
                                <DateRangeFilter
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateChange}
                                    compact={isEBN}
                                />
                            </div>

                            {/* Status and Payment Filters */}
                            <div className={isEBN ? "flex flex-row gap-2 flex-wrap" : "flex flex-col gap-3"}>
                                <StatusFilter
                                    selectedStatus={selectedStatus}
                                    onChange={handleStatusChange}
                                    compact={isEBN}
                                />

                                <PaymentMethodFilter
                                    selectedPaymentMethod={selectedPaymentMethod}
                                    onChange={handlePaymentMethodChange}
                                    paymentMethods={paymentMethods}
                                    isLoading={isLoadingPaymentMethods}
                                    compact={isEBN}
                                />
                            </div>
                        </div>
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <TransactionSummaryCards
                        cards={getSummaryCards()}
                        isLoading={isLoadingSummary}
                        compact={isEBN}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <TransactionMobileList
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
                                        No transactions found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all'
                                            ? "Try adjusting your filters to find transactions."
                                            : "Transactions will appear here once they are created."
                                        }
                                    </p>
                                    {(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all') && (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <TransactionMobileList
                                        transactions={getPaginatedData()}
                                        onViewDetails={handleViewDetails}
                                        onInitiateReturn={handleInitiateReturn}
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
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                                onChangeRowsPerPage={handlePerRowsChange}
                                onChangePage={handlePageChange}
                                fixedHeader
                                fixedHeaderScrollHeight={isEBN ? "calc(100vh - 320px)" : "calc(100vh - 380px)"}
                                dense={isEBN}
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
                                                className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}

                    <TransactionDetailsModal
                        transaction={selectedTransaction}
                        isOpenDetails={isOpenDetails}
                        setIsOpenDetails={setIsOpenDetails}
                    />

                    {transactionForReturn && (
                        <InitiateReturnModal
                            isOpen={isReturnModalOpen}
                            onClose={() => {
                                setIsReturnModalOpen(false);
                                setTransactionForReturn(null);
                            }}
                            transaction={transactionForReturn}
                            onSuccess={() => {
                                loadTransactions();
                                loadSummary();
                                setIsReturnModalOpen(false);
                                setTransactionForReturn(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default TransactionsPage;