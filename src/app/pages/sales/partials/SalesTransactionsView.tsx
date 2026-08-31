import { FC } from "react";
import { Box } from "@radix-ui/themes";
import { SaleSummaryCard } from "../../../hooks/useSaleSummary";
import SaleSummaryCards from "./SaleSummaryCards";
import SalesFilters from "./SalesFilters";
import ActiveFilterChips from "./ActiveFilterChips";
import SalesMobileView from "./SalesMobileView";
import SalesDesktopView from "./SalesDesktopView";

type SaleOrTransaction = (Sale | Transaction) & {
    saleNumber?: string;
    refNumber?: string;
    transactionId?: string;
};

interface SalesTransactionsViewProps {
    isMobile: boolean;

    // Filters (shared toolbar lives at the page level)
    searchTerm: string;
    startDate: Date | null;
    endDate: Date | null;
    hasActiveFilters: boolean;
    onClearFilters: () => void;

    selectedStatus: SaleStatus | TransactionStatus | "all";
    selectedPaymentMethod: string | "all";
    paymentMethods: PaymentMethod[];
    isLoadingPaymentMethods: boolean;
    onStatusChange: (status: SaleStatus | TransactionStatus | "all") => void;
    onPaymentMethodChange: (methodId: string | "all") => void;

    onClearSearch: () => void;
    onClearDate: () => void;
    onClearStatus: () => void;
    onClearPaymentMethod: () => void;

    // Summary cards
    summaryCards: SaleSummaryCard[];
    isLoadingSummary: boolean;

    // Table
    columns: any[];
    data: SaleOrTransaction[];
    isLoading: boolean;
    page: number;
    totalPages: number;
    totalRows: number;
    perPage: number;
    onViewDetails: (sale: SaleOrTransaction) => void;
    onInitiateReturn?: (sale: SaleOrTransaction) => void;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
}

const SalesTransactionsView: FC<SalesTransactionsViewProps> = ({
    isMobile,
    searchTerm,
    startDate,
    endDate,
    hasActiveFilters,
    onClearFilters,
    selectedStatus,
    selectedPaymentMethod,
    paymentMethods,
    isLoadingPaymentMethods,
    onStatusChange,
    onPaymentMethodChange,
    onClearSearch,
    onClearDate,
    onClearStatus,
    onClearPaymentMethod,
    summaryCards,
    isLoadingSummary,
    columns,
    data,
    isLoading,
    page,
    totalPages,
    totalRows,
    perPage,
    onViewDetails,
    onInitiateReturn,
    onPageChange,
    onPerRowsChange,
}) => (
    <>
        {/* Mobile: active filter chips (inline, scrollable) */}
        {isMobile && hasActiveFilters && (
            <ActiveFilterChips
                searchTerm={searchTerm}
                startDate={startDate}
                endDate={endDate}
                selectedStatus={selectedStatus}
                selectedPaymentMethod={selectedPaymentMethod}
                paymentMethods={paymentMethods}
                onClearSearch={onClearSearch}
                onClearDate={onClearDate}
                onClearStatus={onClearStatus}
                onClearPaymentMethod={onClearPaymentMethod}
                onClearAll={onClearFilters}
            />
        )}

        {/* Desktop: inline filter rows (always visible) */}
        {!isMobile && (
            <SalesFilters
                selectedStatus={selectedStatus}
                selectedPaymentMethod={selectedPaymentMethod}
                paymentMethods={paymentMethods}
                isLoadingPaymentMethods={isLoadingPaymentMethods}
                onStatusChange={onStatusChange}
                onPaymentMethodChange={onPaymentMethodChange}
            />
        )}

        <Box px={{ initial: "2", sm: "4" }}>
            <SaleSummaryCards
                cards={summaryCards}
                isLoading={isLoadingSummary}
            />
        </Box>

        {isMobile ? (
            <SalesMobileView
                data={data}
                isLoading={isLoading}
                hasActiveFilters={hasActiveFilters}
                page={page}
                totalPages={totalPages}
                totalRows={totalRows}
                perPage={perPage}
                onViewDetails={onViewDetails}
                onInitiateReturn={onInitiateReturn}
                onPageChange={onPageChange}
                onClearFilters={onClearFilters}
            />
        ) : (
            <SalesDesktopView
                columns={columns}
                data={data}
                isLoading={isLoading}
                hasActiveFilters={hasActiveFilters}
                perPage={perPage}
                totalRows={totalRows}
                onPageChange={onPageChange}
                onPerRowsChange={onPerRowsChange}
                onClearFilters={onClearFilters}
            />
        )}
    </>
);

export default SalesTransactionsView;
