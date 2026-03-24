import { FC, useState, useContext, useCallback, useMemo } from 'react';
import DataTable, { type Themes } from 'react-data-table-component';
import { HiOutlineMenuAlt4 } from 'react-icons/hi';
import { RotateCcw, X, Download } from 'lucide-react';
import { Button, Box, Flex } from '@radix-ui/themes';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { ZonseThemeContext } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { getTableStyles } from '../../utils/table-styles';
import { useReturns } from '../../hooks/useReturns';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getReturnColumns } from './partials/ReturnTableColumns';
import { ReturnStatusFilter } from './partials/ReturnStatusFilter';
import ReturnSummaryCards, { ReturnSummaryCard } from './partials/ReturnSummaryCards';
import { ReturnMobileList } from './partials/ReturnMobileCard';
import ReturnDetailsModal from './partials/ReturnDetailsModal';
import RestockItemsModal from './partials/RestockItemsModal';

type RestockFilter = 'all' | 'pending-restock' | 'restocked' | 'damaged';

const ReturnsPage: FC = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        searchTerm,
        totalRows,
        activeFilter,
        perPage,
        page,
        returns,
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

    return (
        <AppLayout>
            <PageHeader
                title="Returns"
                description="Manage product returns, process refunds, and track restock status"
                icon={<RotateCcw className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
            />

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search & Actions Bar */}
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
                        placeholder="Search returns..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />

                    <Flex align="center" gap="2" wrap="wrap">
                        {hasActiveFilters && (
                            <Button variant="soft" color="red" size="2" onClick={handleClearFilters}>
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </Button>
                        )}
                    </Flex>
                </Flex>

                {/* Status Filter */}
                <Flex direction="column" gap="2" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                    <ReturnStatusFilter
                        selectedStatus={activeFilter as RestockFilter}
                        onChange={handleStatusChange}
                        counts={statusCounts}
                    />
                </Flex>

                {/* Summary Cards */}
                <Box px="4">
                    <ReturnSummaryCards cards={summaryCards} isLoading={isLoading} />
                </Box>

                {/* Mobile Card List / Desktop DataTable */}
                {isMobile ? (
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <ReturnMobileList
                                returns={[]}
                                onViewDetails={handleViewDetails}
                                onRestock={handleRestock}
                                onCancel={handleCancelReturn}
                                isLoading
                            />
                        ) : getPaginatedData().length === 0 ? (
                            <TableEmptyState
                                icon={<HiOutlineMenuAlt4 />}
                                title="No returns found"
                                description={
                                    hasActiveFilters
                                        ? 'Try adjusting your filters to find returns.'
                                        : 'Returns will appear here when customers return items.'
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={handleClearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <ReturnMobileList
                                    returns={getPaginatedData()}
                                    onViewDetails={handleViewDetails}
                                    onRestock={handleRestock}
                                    onCancel={handleCancelReturn}
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
                        progressComponent={<TableSkeleton rows={perPage} columns={7} showCheckbox={false} showActions />}
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
                                title="No returns found"
                                description={
                                    hasActiveFilters
                                        ? 'Try adjusting your search or status filters to find returns.'
                                        : 'Returns will appear here when customers return items.'
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={handleClearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                )}
            </Box>

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
        </AppLayout>
    );
};

export default ReturnsPage;
