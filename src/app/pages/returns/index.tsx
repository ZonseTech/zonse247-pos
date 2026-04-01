import { FC, Fragment, useState, useCallback, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Box } from '@radix-ui/themes';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { useIsInsideHub } from '../../context/HubContext';
import { useReturns } from '../../hooks/useReturns';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getReturnColumns } from './partials/ReturnTableColumns';
import { ReturnStatusFilter } from './partials/ReturnStatusFilter';
import ReturnSummaryCards, { ReturnSummaryCard } from './partials/ReturnSummaryCards';
import ReturnDetailsModal from './partials/ReturnDetailsModal';
import RestockItemsModal from './partials/RestockItemsModal';
import ReturnsToolbar from './partials/ReturnsToolbar';
import ReturnsActiveFilterChips from './partials/ReturnsActiveFilterChips';
import ReturnsMobileView from './partials/ReturnsMobileView';
import ReturnsDesktopView from './partials/ReturnsDesktopView';
import ReturnsFilterSheet from './partials/ReturnsFilterSheet';

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

const ReturnsPage: FC = () => {
    const isMobile = useIsMobile();
    const isInsideHub = useIsInsideHub();
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    const {
        isLoading,
        searchTerm,
        totalRows,
        activeFilter,
        perPage,
        page,
        getPaginatedData,
        getSummaryData,
        handleSearch,
        handleClearFilters,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
        cancelReturn,
        loadReturns,
    } = useReturns();

    const totalPages = Math.ceil(totalRows / perPage);

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

    const handleCancelReturn = useCallback(
        (returnTransactionId: string, refNumber: string) => {
            Confirm.show(
                'Cancel Return',
                `Are you sure you want to cancel return ${refNumber}? This action cannot be undone.`,
                'Yes, Cancel',
                'No',
                async () => {
                    await cancelReturn(returnTransactionId, refNumber);
                },
                () => { },
                { okButtonBackground: '#ef4444' },
            );
        },
        [cancelReturn],
    );

    const handleRestockSuccess = useCallback(() => {
        loadReturns();
    }, [loadReturns]);

    const handleStatusChange = useCallback(
        (status: RestockFilter) => {
            if (status === 'all') {
                handleClearFilters();
            } else {
                setActiveFilter(status);
            }
        },
        [handleClearFilters, setActiveFilter],
    );

    const handleOpenFilters = useCallback(() => {
        setIsFilterSheetOpen(true);
    }, []);

    const handleCloseFilters = useCallback(() => {
        setIsFilterSheetOpen(false);
    }, []);

    // Individual clear handlers for filter chips
    const handleClearSearch = useCallback(() => handleSearch(""), [handleSearch]);
    const handleClearStatus = useCallback(() => setActiveFilter('all'), [setActiveFilter]);

    const columns = getReturnColumns(handleViewDetails, handleRestock, handleCancelReturn);

    const summaryData = getSummaryData();
    const statusCounts = useMemo(() => {
        const total = summaryData.find((s) => s.title === 'Total Returns')?.value || 0;
        const pending = summaryData.find((s) => s.title === 'Pending Restock')?.value || 0;
        const restocked = summaryData.find((s) => s.title === 'Restocked')?.value || 0;
        const damaged = summaryData.find((s) => s.title === 'Damaged')?.value || 0;
        return {
            total: Number(total),
            pending: Number(pending),
            restocked: Number(restocked),
            damaged: Number(damaged),
        };
    }, [summaryData]);

    const summaryCards: ReturnSummaryCard[] = useMemo(
        () => [
            {
                title: 'Total Returns',
                value: statusCounts.total,
                displayValue: String(statusCounts.total),
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Pending Restock',
                value: statusCounts.pending,
                displayValue: String(statusCounts.pending),
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
            {
                title: 'Restocked',
                value: statusCounts.restocked,
                displayValue: String(statusCounts.restocked),
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Damaged',
                value: statusCounts.damaged,
                displayValue: String(statusCounts.damaged),
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
        ],
        [statusCounts],
    );

    const hasActiveFilters = !!(searchTerm || activeFilter !== 'all');

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (activeFilter !== 'all') count++;
        return count;
    }, [searchTerm, activeFilter]);

    const Wrapper = isInsideHub ? Fragment : AppLayout;

    return (
        <Wrapper>
            {/* Header: full on desktop, compact on mobile — hidden inside hub tabs */}
            {!isInsideHub && (
                isMobile ? (
                    <PageHeader title="Returns" compact />
                ) : (
                    <PageHeader
                        title="Returns"
                        description="Manage product returns, process refunds, and track restock status"
                        icon={<RotateCcw className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                    />
                )
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0">
                {/* Toolbar: search + filter button (mobile) or search + clear (desktop) */}
                <ReturnsToolbar
                    searchTerm={searchTerm}
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    onSearch={handleSearch}
                    onClearFilters={handleClearFilters}
                    onOpenFilters={isMobile ? handleOpenFilters : undefined}
                />

                {/* Mobile: active filter chips (inline, scrollable) */}
                {isMobile && hasActiveFilters && (
                    <ReturnsActiveFilterChips
                        searchTerm={searchTerm}
                        selectedStatus={activeFilter as RestockFilter}
                        onClearSearch={handleClearSearch}
                        onClearStatus={handleClearStatus}
                        onClearAll={handleClearFilters}
                    />
                )}

                {/* Desktop: inline status filter row (always visible) */}
                {!isMobile && (
                    <div
                        className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3"
                        role="group"
                        aria-label="Return filters"
                    >
                        <ReturnStatusFilter
                            selectedStatus={activeFilter as RestockFilter}
                            onChange={handleStatusChange}
                            counts={statusCounts}
                        />
                    </div>
                )}

                {/* Summary Cards */}
                <Box px={{ initial: "2", sm: "4" }}>
                    <ReturnSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />
                </Box>

                {/* Mobile Card List / Desktop DataTable */}
                {isMobile ? (
                    <ReturnsMobileView
                        data={getPaginatedData()}
                        isLoading={isLoading}
                        hasActiveFilters={hasActiveFilters}
                        page={page}
                        totalPages={totalPages}
                        totalRows={totalRows}
                        perPage={perPage}
                        onViewDetails={handleViewDetails}
                        onRestock={handleRestock}
                        onCancel={handleCancelReturn}
                        onPageChange={handlePageChange}
                        onClearFilters={handleClearFilters}
                    />
                ) : (
                    <ReturnsDesktopView
                        columns={columns}
                        data={getPaginatedData()}
                        isLoading={isLoading}
                        hasActiveFilters={hasActiveFilters}
                        perPage={perPage}
                        totalRows={totalRows}
                        onPageChange={handlePageChange}
                        onPerRowsChange={handlePerRowsChange}
                        onClearFilters={handleClearFilters}
                    />
                )}
            </Box>

            {/* Mobile: Filter bottom sheet */}
            {isMobile && (
                <ReturnsFilterSheet
                    isOpen={isFilterSheetOpen}
                    onClose={handleCloseFilters}
                    selectedStatus={activeFilter as RestockFilter}
                    onStatusChange={handleStatusChange}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                />
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
        </Wrapper>
    );
};

export default ReturnsPage;
