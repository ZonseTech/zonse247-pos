import { FC, useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Button } from '@radix-ui/themes';
import { ZonseThemeContext } from '../../../components';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import { getTableStyles } from '../../../utils/table-styles';

interface PurchaseOrderDesktopViewProps {
    columns: any[];
    data: PurchaseOrder[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    perPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
    onClearFilters: () => void;
}

const PurchaseOrderDesktopView: FC<PurchaseOrderDesktopViewProps> = ({
    columns,
    data,
    isLoading,
    hasActiveFilters,
    perPage,
    totalRows,
    onPageChange,
    onPerRowsChange,
    onClearFilters,
}) => {
    const { mode } = useContext(ZonseThemeContext);

    return (
        <DataTable
            columns={columns}
            data={data}
            theme={mode as Themes}
            customStyles={getTableStyles(mode)}
            progressPending={isLoading}
            progressComponent={
                <TableSkeleton
                    rows={perPage}
                    columns={7}
                    showCheckbox={false}
                    showActions
                />
            }
            highlightOnHover
            striped
            responsive
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
            onChangeRowsPerPage={onPerRowsChange}
            onChangePage={onPageChange}
            persistTableHead
            noDataComponent={
                <TableEmptyState
                    icon={<ShoppingCart />}
                    title={
                        hasActiveFilters
                            ? 'No matching purchase orders'
                            : 'No purchase orders yet'
                    }
                    description={
                        hasActiveFilters
                            ? 'Try adjusting your search or filters to find purchase orders.'
                            : 'Get started by creating your first purchase order.'
                    }
                    action={
                        hasActiveFilters ? (
                            <Button
                                variant="soft"
                                color="sky"
                                size="2"
                                onClick={onClearFilters}
                            >
                                Clear all filters
                            </Button>
                        ) : undefined
                    }
                />
            }
        />
    );
};

export default PurchaseOrderDesktopView;
