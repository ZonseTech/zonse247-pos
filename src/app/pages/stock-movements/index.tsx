import { FunctionComponent, useContext, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Activity } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader } from '../../components';
import { useStockMovements } from '../../hooks/useStockMovements';
import { getStockMovementTableColumns } from './partials/StockMovementTableColumns';
import { StockMovementMobileList } from './partials/StockMovementMobileCard';
import StockMovementSummaryCards, { StockMovementSummaryCard } from './partials/StockMovementSummaryCards';
import Filters from './partials/Filters';
import { useIsMobile } from '../../hooks/useMediaQuery';

const StockMovements: FunctionComponent = () => {
    const location = useLocation();
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const productId = (location.state as any)?.productId;

    const {
        movements,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        movementTypeFilter,
        setMovementTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
    } = useStockMovements(productId);

    // Calculate summary stats
    const summaryCards: StockMovementSummaryCard[] = useMemo(() => {
        const inCount = movements.filter(m => m.direction === 'IN').length;
        const outCount = movements.filter(m => m.direction === 'OUT').length;
        const adjustmentCount = movements.filter(m => m.direction === 'ADJUSTMENT').length;

        return [
            {
                title: 'Total Movements',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-600 dark:text-blue-400',
            },
            {
                title: 'Stock In',
                value: inCount,
                icon: 'in',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                title: 'Stock Out',
                value: outCount,
                icon: 'out',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-600 dark:text-red-400',
            },
            {
                title: 'Adjustments',
                value: adjustmentCount,
                icon: 'adjustment',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-600 dark:text-amber-400',
            },
        ];
    }, [movements, totalRows]);

    const columns = getStockMovementTableColumns();

    return (
        <AppLayout>
            <PageHeader
                icon={<Activity className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />}
                title="Stock Movements"
                description={productId ? 'Product stock history' : 'All stock movements audit trail'}
            >
                <div className='px-4 pb-4'>
                    <Filters
                        movementTypeFilter={movementTypeFilter}
                        onMovementTypeChange={setMovementTypeFilter}
                        startDate={startDate}
                        onStartDateChange={setStartDate}
                        endDate={endDate}
                        onEndDateChange={setEndDate}
                    />
                </div>
            </PageHeader>

            {/* Main Content Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                {/* Summary Cards */}
                <StockMovementSummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                />

                {/* Mobile View - Card List */}
                {isMobile ? (
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <StockMovementMobileList
                                movements={[]}
                                isLoading={true}
                            />
                        ) : movements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                    No stock movements found
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                    {movementTypeFilter || startDate || endDate
                                        ? "Try adjusting your filters to see movements."
                                        : "Stock movements will appear here as inventory changes."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <StockMovementMobileList
                                    movements={movements}
                                    isLoading={false}
                                />

                                {/* Mobile Pagination */}
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {totalRows} total
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page <= 1}
                                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <HiOutlineChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {page} / {Math.ceil(totalRows / perPage) || 1}
                                        </span>
                                        <button
                                            onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                            disabled={page >= Math.ceil(totalRows / perPage)}
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
                            data={movements}
                            theme={mode as string}
                            progressPending={isLoading}
                            progressComponent={<ComponentLoader loading={isLoading} />}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            paginationPerPage={perPage}
                            paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                            onChangeRowsPerPage={setPerPage}
                            onChangePage={setPage}
                            customStyles={getTableStyles(mode)}
                            highlightOnHover
                            responsive
                            persistTableHead
                            fixedHeader
                            fixedHeaderScrollHeight="calc(100vh - 450px)"
                            noDataComponent={
                                <div className="text-center py-12">
                                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No stock movements found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {movementTypeFilter || startDate || endDate
                                            ? "Try adjusting your filters."
                                            : "Stock movements will appear here."}
                                    </p>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default StockMovements;
