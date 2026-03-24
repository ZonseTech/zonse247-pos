import { FC, useContext, useState, useCallback } from "react";
import DataTable, { type Themes } from "react-data-table-component";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { ReceiptEuro, Plus, Download, X } from "lucide-react";
import { Button, Box, Flex } from "@radix-ui/themes";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import TableEmptyState from "../../components/TableEmptyState";
import { ZonseThemeContext } from "../../components";
import MobileDateFilter from "../../components/reports/MobileDateFilter";
import { SearchBar } from "../../components/SearchBar";
import { getTableStyles } from "../../utils/table-styles";
import { useSales } from "../../hooks/useSales";
import { useSaleSummary } from "../../hooks/useSaleSummary";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { useMraCompliance } from "../../hooks/useMraCompliance";
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
    const { isMraEnabled } = useMraCompliance();
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
        handleDateChange: handleDateChangeTuple,
        handleStatusChange,
        handlePaymentMethodChange,
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
        loadSales,
    } = useSales();

    const totalPages = Math.ceil(totalRows / perPage);

    const handleDateChange = useCallback(
        (start: Date | null, end: Date | null) => {
            handleDateChangeTuple([start, end]);
        },
        [handleDateChangeTuple],
    );

    const { paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();

    const { isLoadingSummary, getSummaryCards, loadSummary } = useSaleSummary({
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
    });

    type SaleOrTransaction = (Sale | Transaction) & {
        saleNumber?: string;
        refNumber?: string;
        transactionId?: string;
    };

    const handleViewDetails = useCallback((sale: SaleOrTransaction) => {
        const saleId = sale.id || (sale as Sale).saleNumber;
        if (!isMobile && saleId) {
            // Desktop: Navigate to details page
            navigate(ROUTES.SALE_DETAILS.replace(':saleId', saleId));
        } else {
            // Mobile: Use modal
            setSelectedSale(sale as Sale);
            setIsOpenDetails(true);
        }
    }, [isMobile, navigate]);

    const handleInitiateReturn = useCallback((sale: SaleOrTransaction) => {
        setSaleForReturn(sale as Sale);
        setIsReturnModalOpen(true);
    }, []);

    const columns = getSaleTableColumns({
        onViewDetails: handleViewDetails,
        onInitiateReturn: handleInitiateReturn,
        isMraEnabled,  // Pass MRA compliance status to show/hide MRA status column
    });

    const hasActiveFilters = !!(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all');

    return (
        <AppLayout>
            <PageHeader
                title="Sales"
                description="Manage and view all sales transactions"
                icon={<ReceiptEuro className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                action={
                    <Button size="2" onClick={() => navigate(ROUTES.POS)}>
                        <Plus className="w-4 h-4" />
                        New Sale
                    </Button>
                }
            />

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Flex
                    direction={{ initial: 'column', sm: 'row' }}
                    align={{ initial: 'start', sm: 'center' }}
                    justify="between"
                    gap={{ initial: '2', sm: '3' }}
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700"
                >
                    <SearchBar
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />

                    <Flex align="center" gap="2" wrap="wrap">
                        <MobileDateFilter
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                            align="right"
                        />

                        <Button variant="outline" color="gray" size="2" onClick={exportData}>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        {hasActiveFilters && (
                            <Button variant="soft" color="red" size="2" onClick={clearFilters}>
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </Button>
                        )}
                    </Flex>
                </Flex>

                <Flex direction="column" gap="2" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
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
                </Flex>

                <Box px="4">
                    <SaleSummaryCards
                        cards={getSummaryCards()}
                        isLoading={isLoadingSummary}
                    />
                </Box>

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
                            <TableEmptyState
                                icon={<HiOutlineMenuAlt4 />}
                                title="No sales found"
                                description={
                                    hasActiveFilters
                                        ? "Try adjusting your filters to find sales."
                                        : "Sales will appear here once they are created."
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <SaleMobileList
                                    transactions={getPaginatedData()}
                                    onViewDetails={handleViewDetails}
                                    onInitiateReturn={handleInitiateReturn}
                                    isLoading={false}
                                />

                                <Flex
                                    align="center"
                                    justify="between"
                                    px="4"
                                    py="3"
                                    className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                >
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages} ({totalRows} total)
                                    </span>
                                    <Flex align="center" gap="2">
                                        <Button
                                            variant="ghost"
                                            color="gray"
                                            size="1"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page <= 1}
                                        >
                                            ‹
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            color="gray"
                                            size="1"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page >= totalPages}
                                        >
                                            ›
                                        </Button>
                                    </Flex>
                                </Flex>
                            </>
                        )}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={getPaginatedData()}
                        theme={mode as Themes}
                        customStyles={getTableStyles(mode)}
                        progressPending={isLoading}
                        progressComponent={<TableSkeleton rows={perPage} columns={8} showCheckbox={false} showActions />}
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
                        noDataComponent={
                            <TableEmptyState
                                icon={<HiOutlineMenuAlt4 />}
                                title="No transactions found"
                                description={
                                    hasActiveFilters
                                        ? "Try adjusting your search, date, status, or payment method filters to find transactions."
                                        : "Transactions will appear here once they are created."
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={clearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                )}
            </Box>

            {isMobile && (
                <SaleDetailsModal
                    sale={selectedSale}
                    isOpenDetails={isOpenDetails}
                    setIsOpenDetails={setIsOpenDetails}
                    isMraEnabled={isMraEnabled}
                />
            )}

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
        </AppLayout>
    );
};

export default SalesPage;