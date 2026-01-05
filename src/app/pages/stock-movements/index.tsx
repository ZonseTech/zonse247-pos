import { FunctionComponent, useContext } from 'react';
import { useLocation } from 'react-router';
import { Activity } from 'lucide-react';
import DataTable from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext } from '../../components';
import { useStockMovements } from '../../hooks/useStockMovements';
import { getStockMovementTableColumns } from './partials/StockMovementTableColumns';
import Filters from './partials/Filters';

const StockMovements: FunctionComponent = () => {
    const location = useLocation();
    const { mode } = useContext(ZonseThemeContext);
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

    const columns = getStockMovementTableColumns();

    return (
        <AppLayout>
            <PageHeader
                icon={<Activity className="w-8 h-8 text-blue-600" />}
                title="Stock Movements"
                description={productId ? 'Product stock history' : 'All stock movements audit trail'}
                action={
                    <Filters
                        movementTypeFilter={movementTypeFilter}
                        onMovementTypeChange={setMovementTypeFilter}
                        startDate={startDate}
                        onStartDateChange={setStartDate}
                        endDate={endDate}
                        onEndDateChange={setEndDate}
                    />
                }
            />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <DataTable
                    columns={columns}
                    data={movements}
                    progressPending={isLoading}
                    pagination
                    paginationServer
                    paginationTotalRows={totalRows}
                    onChangeRowsPerPage={setPerPage}
                    onChangePage={setPage}
                    customStyles={getTableStyles(mode)}
                    highlightOnHover
                    responsive
                    persistTableHead
                    noDataComponent={
                        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No stock movements found</p>
                        </div>
                    }
                />
            </div>
        </AppLayout>
    );
};

export default StockMovements;
