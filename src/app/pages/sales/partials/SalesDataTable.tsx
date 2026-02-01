import { type FunctionComponent, useContext, useState, useCallback } from "react";
import DataTable, { type Themes } from "react-data-table-component";
import { HiOutlineMenuAlt4, HiOutlineDownload, HiOutlineFilter } from "react-icons/hi";
import Loader from "../../../components/Loader";
import { DateRangeFilter, ZonseThemeContext } from "../../../components";
import { SearchBar } from "../../../components/SearchBar";
import { getTableStyles } from "../../../utils/table-styles";
import { useSales } from "../../../hooks/useSales";
import { getSaleTableColumns } from "./SaleTableColumns";
import SaleDetailsModal from "./SaleDetailsModal";

const SalesDataTable: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const [isOpenDetails, setIsOpenDetails] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction>({} as Transaction);

    const {
        totalRows,
        isLoading,
        searchTerm,
        startDate,
        endDate,
        perPage,
        getPaginatedData,
        handleSearch,
        handleDateChange,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
    } = useSales();

    const handleViewDetails = useCallback((sale: Transaction) => {
        setSelectedTransaction(sale);
        setIsOpenDetails(true);
    }, []);

    const handleInitiateReturn = useCallback((sale: Transaction) => {
        // This component is deprecated, functionality moved to index.tsx
        console.log('Return initiated for sale:', sale);
    }, []);

    const columns = getSaleTableColumns({
        onViewDetails: handleViewDetails,
        onInitiateReturn: handleInitiateReturn,
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onChange={handleDateChange}
                        />

                        {(searchTerm || startDate) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                            >
                                <HiOutlineFilter className="w-4 h-4" />
                                Clear Filters
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <SearchBar
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full sm:w-64"
                        />

                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            <HiOutlineDownload className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

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
                                {searchTerm || startDate
                                    ? "Try adjusting your search or date filters to find transactions."
                                    : "Transactions will appear here once they are created."
                                }
                            </p>
                            {(searchTerm || startDate) && (
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

            <SaleDetailsModal
                sale={selectedTransaction}
                isOpenDetails={isOpenDetails}
                setIsOpenDetails={setIsOpenDetails}
            />
        </div>
    );
};

export default SalesDataTable;