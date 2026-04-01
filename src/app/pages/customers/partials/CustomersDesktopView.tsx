import { FC, useContext } from 'react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Users, UserPlus } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import { ZonseThemeContext } from '../../../components';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import { getTableStyles } from '../../../utils/table-styles';

interface CustomersDesktopViewProps {
    columns: any[];
    data: Customer[];
    isLoading: boolean;
    searchTerm: string;
    perPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
    onAddCustomer: () => void;
}

const CustomersDesktopView: FC<CustomersDesktopViewProps> = ({
    columns,
    data,
    isLoading,
    searchTerm,
    perPage,
    totalRows,
    onPageChange,
    onPerRowsChange,
    onAddCustomer,
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
                <TableSkeleton rows={perPage} columns={5} showCheckbox={false} showActions />
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
            noDataComponent={
                <TableEmptyState
                    icon={<Users />}
                    title={searchTerm ? 'No customers found' : 'No customers yet'}
                    description={
                        searchTerm
                            ? 'Try adjusting your search terms or clear the filter.'
                            : 'Get started by adding your first customer to track purchases and build relationships.'
                    }
                    action={
                        !searchTerm ? (
                            <Button variant="soft" color="sky" size="2" onClick={onAddCustomer}>
                                <UserPlus className="w-4 h-4" />
                                Add Customer
                            </Button>
                        ) : undefined
                    }
                />
            }
        />
    );
};

export default CustomersDesktopView;
