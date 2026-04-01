import { FC, useContext } from "react";
import DataTable, { type Themes } from "react-data-table-component";
import { ReceiptEuro } from "lucide-react";
import { Button } from "@radix-ui/themes";
import { ZonseThemeContext } from "../../../components";
import TableSkeleton from "../../../components/skeleton/TableSkeleton";
import TableEmptyState from "../../../components/TableEmptyState";
import { getTableStyles } from "../../../utils/table-styles";

interface SalesDesktopViewProps {
    columns: any[];
    data: any[];
    isLoading: boolean;
    hasActiveFilters: boolean;
    perPage: number;
    totalRows: number;
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;
    onClearFilters: () => void;
}

const SalesDesktopView: FC<SalesDesktopViewProps> = ({
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
                <TableSkeleton rows={perPage} columns={8} showCheckbox={false} showActions />
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
                    icon={<ReceiptEuro />}
                    title="No transactions found"
                    description={
                        hasActiveFilters
                            ? "Try adjusting your search, date, status, or payment method filters."
                            : "Transactions will appear here once they are created."
                    }
                    action={
                        hasActiveFilters ? (
                            <Button variant="soft" color="sky" size="2" onClick={onClearFilters}>
                                Clear all filters
                            </Button>
                        ) : undefined
                    }
                />
            }
        />
    );
};

export default SalesDesktopView;
