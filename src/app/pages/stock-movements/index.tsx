import { FunctionComponent, useContext, useMemo } from 'react';
import { useLocation } from 'react-router';
import { Activity } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader } from '../../components';
import { useStockMovements } from '../../hooks/useStockMovements';
import { getStockMovementTableColumns } from './partials/StockMovementTableColumns';
import StockMovementSummaryCards, { StockMovementSummaryCard } from './partials/StockMovementSummaryCards';
import Filters from './partials/Filters';
import { useIsMobile } from '../../hooks/useMediaQuery';
import MobileStockMovements from './MobileStockMovements';

const StockMovements: FunctionComponent = () => {
    const location = useLocation();
    const { mode } = useContext(ZonseThemeContext);
    const isMobile = useIsMobile();
    const productId = (location.state as any)?.productId;

    // For mobile, render the dedicated mobile component
    if (isMobile) {
        return <MobileStockMovements />;
    }

    // Desktop version continues below
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
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Stock In',
                value: inCount,
                icon: 'in',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Stock Out',
                value: outCount,
                icon: 'out',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                textColor: 'text-red-500 dark:text-red-400',
            },
            {
                title: 'Adjustments',
                value: adjustmentCount,
                icon: 'adjustment',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
        ];
    }, [movements, totalRows]);

    const columns = getStockMovementTableColumns();

    return (
        <AppLayout>
            <PageHeader
                icon={<Activity className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                title="Stock Movements"
                description={productId ? 'Product stock history' : 'All stock movements audit trail'}
                action={
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
                }
            />

            {/* Main Content Container */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                {/* Summary Cards */}
                <StockMovementSummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                />

                {/* Desktop View - Data Table */}
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
            </div>
        </AppLayout>
    );
};

export default StockMovements;