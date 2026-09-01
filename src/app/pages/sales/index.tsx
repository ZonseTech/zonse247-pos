import { FC, Fragment, useState, useCallback, useMemo } from "react";
import { ReceiptEuro, Plus, SlidersHorizontal, CalendarCheck2 } from "lucide-react";
import { Button, Box, Flex } from "@radix-ui/themes";
import AppLayout from "../../layouts/AppLayout";
import PageHeader from "../../components/page/PageHeader";
import MobilePageHeader from "../../components/page/MobilePageHeader";
import { useIsInsideHub } from "../../context/HubContext";
import { useSales } from "../../hooks/useSales";
import { useSaleSummary } from "../../hooks/useSaleSummary";
import { usePaymentMethods } from "../../hooks/usePaymentMethods";
import { getLeafPaymentMethods } from "../../utils/paymentMethod.helper";
import { useMraCompliance } from "../../hooks/useMraCompliance";
import { useSalesView } from "./hooks/useSalesView";
import { getSaleTableColumns } from "./partials/SaleTableColumns";
import SaleDetailsModal from "./partials/SaleDetailsModal";
import SaleItemsModal from "./partials/SaleItemsModal";
import SalesFilterSheet from "./partials/SalesFilterSheet";
import SalesToolbar from "./partials/SalesToolbar";
import SalesViewTabs from "./partials/SalesViewTabs";
import SalesTransactionsView from "./partials/SalesTransactionsView";
import SalesDayCloseReport from "./partials/SalesDayCloseReport";
import InitiateReturnModal from "../returns/partials/InitiateReturnModal";
import { useNavigate } from "react-router";
import { ROUTES } from "../../utils/constants";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useAuth } from "../../context/AuthProvider";
import { hasAnyPermission, hasPermission } from "../../utils";

type SaleOrTransaction = (Sale | Transaction) & {
    saleNumber?: string;
    refNumber?: string;
    transactionId?: string;
};

const SalesPage: FC = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const isInsideHub = useIsInsideHub();
    const { user } = useAuth();
    const { isMraEnabled } = useMraCompliance();
    const canCreateSale = hasPermission(user, 'sales.create');
    const canInitiateReturn = hasPermission(user, 'refunds.process');
    const canExportSales = hasAnyPermission(user, ['reports.export', 'reports.sales.daily', 'reports.sales.detailed']);
    const canExportReceipt = hasPermission(user, 'reports.export');

    const [isOpenDetails, setIsOpenDetails] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [saleForReturn, setSaleForReturn] = useState<Sale | null>(null);
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
    const [saleForItems, setSaleForItems] = useState<Sale | null>(null);
    const { view: salesView, isTransactionsView, handleViewChange: handleSalesViewChange } = useSalesView();

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
        clearFilters,
        handlePageChange,
        handlePerRowsChange,
        exportData,
        loadSales,
    } = useSales();

    const totalPages = Math.ceil(totalRows / perPage);

    const { paymentMethods: allPaymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();
    // Filter out parent-only nodes (e.g. "Bank") - only leaves (Cash, POS, Bank
    // Transfer, Mobile Money, ...) are ever actually used on a SalePayment.
    const paymentMethods = useMemo(() => getLeafPaymentMethods(allPaymentMethods), [allPaymentMethods]);

    const { isLoadingSummary, getSummaryCards, loadSummary } = useSaleSummary({
        searchTerm,
        startDate,
        endDate,
        selectedStatus,
        selectedPaymentMethod,
    });

    const handleViewDetails = useCallback((sale: SaleOrTransaction) => {
        const saleId = sale.id || (sale as Sale).saleNumber;
        if (!isMobile && saleId) {
            navigate(ROUTES.SALE_DETAILS.replace(':saleId', saleId));
        } else {
            setSelectedSale(sale as Sale);
            setIsOpenDetails(true);
        }
    }, [isMobile, navigate]);

    const handleInitiateReturn = useCallback((sale: SaleOrTransaction) => {
        if (!canInitiateReturn) {
            return;
        }

        setSaleForReturn(sale as Sale);
        setIsReturnModalOpen(true);
    }, [canInitiateReturn]);

    const handleViewItems = useCallback((sale: SaleOrTransaction) => {
        setSaleForItems(sale as Sale);
        setIsItemsModalOpen(true);
    }, []);

    const handleCloseItems = useCallback(() => {
        setIsItemsModalOpen(false);
        setSaleForItems(null);
    }, []);

    const columns = getSaleTableColumns({
        onViewDetails: handleViewDetails,
        onInitiateReturn: canInitiateReturn ? handleInitiateReturn : undefined,
        onViewItems: handleViewItems,
        isMraEnabled,
        canInitiateReturn,
    });

    const hasActiveFilters = !!(searchTerm || startDate || selectedStatus !== 'all' || selectedPaymentMethod !== 'all');

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (startDate) count++;
        if (selectedStatus !== 'all') count++;
        if (selectedPaymentMethod !== 'all') count++;
        return count;
    }, [searchTerm, startDate, selectedStatus, selectedPaymentMethod]);

    const handleOpenFilters = useCallback(() => {
        setIsFilterSheetOpen(true);
    }, []);

    const handleCloseFilters = useCallback(() => {
        setIsFilterSheetOpen(false);
    }, []);

    // Individual clear handlers for filter chips
    const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);
    const handleClearDate = useCallback(() => handleDateChange([null, null]), [handleDateChange]);
    const handleClearStatus = useCallback(() => handleStatusChange("all"), [handleStatusChange]);
    const handleClearPaymentMethod = useCallback(() => handlePaymentMethodChange("all"), [handlePaymentMethodChange]);

    const handleReturnSuccess = useCallback(() => {
        loadSales();
        loadSummary();
        setIsReturnModalOpen(false);
        setSaleForReturn(null);
    }, [loadSales, loadSummary]);

    const handleReturnClose = useCallback(() => {
        setIsReturnModalOpen(false);
        setSaleForReturn(null);
    }, []);

    const Wrapper = isInsideHub ? Fragment : AppLayout;

    return (
        <Wrapper>
            {/* Header: full on desktop, compact on mobile — hidden inside hub tabs */}
            {!isInsideHub && (
                isMobile ? (
                    <MobilePageHeader
                        title="Sales"
                        showLeftButton={true}
                    />
                ) : (
                    <PageHeader
                        title="Sales"
                        description="Manage and view all sales transactions"
                        icon={<ReceiptEuro className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                        action={
                            <Flex align="center" gap="4">
                                <SalesViewTabs value={salesView} onValueChange={handleSalesViewChange} />

                                {canCreateSale && (
                                    <Button size="2" variant="soft" onClick={() => navigate(ROUTES.DAY_END_CLOSE_FORM)}>
                                        <CalendarCheck2 className="w-4 h-4" />
                                        Add Day-end Close
                                    </Button>
                                )}

                                {canCreateSale && (
                                    <Button size="2" onClick={() => navigate(ROUTES.POS)}>
                                        <Plus className="w-4 h-4" />
                                        New Sale
                                    </Button>
                                )}
                            </Flex>
                        }
                    />
                )
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0">
                {/* Shared toolbar: search + date filter + export + clear, common to both tabs */}
                <SalesToolbar
                    searchTerm={searchTerm}
                    startDate={startDate}
                    endDate={endDate}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onSearch={handleSearch}
                    onDateChange={handleDateChange}
                    onExport={exportData}
                    onClearFilters={clearFilters}
                    canExport={canExportSales}
                />

                {isTransactionsView ? (
                    <SalesTransactionsView
                        isMobile={isMobile}
                        searchTerm={searchTerm}
                        startDate={startDate}
                        endDate={endDate}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={clearFilters}
                        selectedStatus={selectedStatus}
                        selectedPaymentMethod={selectedPaymentMethod}
                        paymentMethods={paymentMethods}
                        isLoadingPaymentMethods={isLoadingPaymentMethods}
                        onStatusChange={handleStatusChange}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        onClearSearch={handleClearSearch}
                        onClearDate={handleClearDate}
                        onClearStatus={handleClearStatus}
                        onClearPaymentMethod={handleClearPaymentMethod}
                        summaryCards={getSummaryCards()}
                        isLoadingSummary={isLoadingSummary}
                        columns={columns}
                        data={getPaginatedData()}
                        isLoading={isLoading}
                        page={page}
                        totalPages={totalPages}
                        totalRows={totalRows}
                        perPage={perPage}
                        onViewDetails={handleViewDetails}
                        onInitiateReturn={canInitiateReturn ? handleInitiateReturn : undefined}
                        onPageChange={handlePageChange}
                        onPerRowsChange={handlePerRowsChange}
                    />
                ) : (
                    <SalesDayCloseReport startDate={startDate} endDate={endDate} />
                )}
            </Box>

            {/* Mobile: Filter bottom sheet */}
            {isMobile && (
                <SalesFilterSheet
                    isOpen={isFilterSheetOpen}
                    onClose={handleCloseFilters}
                    selectedStatus={selectedStatus}
                    onStatusChange={handleStatusChange}
                    selectedPaymentMethod={selectedPaymentMethod}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    paymentMethods={paymentMethods}
                    isLoadingPaymentMethods={isLoadingPaymentMethods}
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={handleDateChange}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                />
            )}

            {/* Mobile: floating filter button */}
            {isMobile && (
                <button
                    onClick={handleOpenFilters}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal className="w-5 h-5" />
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            )}

            {/* Modals */}
            {isMobile && (
                <SaleDetailsModal
                    sale={selectedSale}
                    isOpenDetails={isOpenDetails}
                    setIsOpenDetails={setIsOpenDetails}
                    isMraEnabled={isMraEnabled}
                    canInitiateReturn={canInitiateReturn}
                    canExportReceipt={canExportReceipt}
                />
            )}

            {canInitiateReturn && saleForReturn && (
                <InitiateReturnModal
                    isOpen={isReturnModalOpen}
                    onClose={handleReturnClose}
                    sale={saleForReturn}
                    onSuccess={handleReturnSuccess}
                />
            )}

            <SaleItemsModal
                isOpen={isItemsModalOpen}
                onClose={handleCloseItems}
                sale={saleForItems}
            />
        </Wrapper>
    );
};

export default SalesPage;