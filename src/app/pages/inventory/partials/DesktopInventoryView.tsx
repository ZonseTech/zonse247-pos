import React, { FC, useContext } from 'react';
import { Package, Plus } from 'lucide-react';
import { Button, Box, Flex } from '@radix-ui/themes';
import DataTable, { type Themes, type ExpanderComponentProps } from 'react-data-table-component';
import { ZonseThemeContext } from '../../../components';
import { getTableStyles } from '../../../utils/table-styles';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../../components/TableEmptyState';
import InventoryToolbar from './InventoryToolbar';
import InventorySummaryCards, { InventorySummaryCard } from './InventorySummaryCards';
import StockStatusFilter from './StockStatusFilter';
import CategoryFilter from './CategoryFilter';
import ExpandedVariantRow from './ExpandedVariantRow';
import { getInventoryTableColumns } from './InventoryTableColumns';

interface DesktopInventoryViewProps {
    /** Data & loading */
    data: ApiProduct[];
    isLoading: boolean;
    totalRows: number;
    perPage: number;
    categories: Category[];

    /** Summary cards */
    summaryCards: InventorySummaryCard[];
    statsLoading: boolean;

    /** Search & filters */
    searchTerm: string;
    onSearch: (value: string) => void;
    activeFilter: string;
    onFilterChange: (status: string) => void;
    categoryId?: string;
    onCategoryChange: (categoryId: string) => void;
    startDate: string;
    endDate: string;
    onDateChange: (start: Date | null, end: Date | null) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onExport?: () => void;

    /** Pagination */
    onPageChange: (page: number) => void;
    onPerRowsChange: (newPerPage: number, page: number) => void;

    /** Item actions */
    onEdit?: (item: ApiProduct) => void;
    onDelete?: (productId: string) => void;
    onAdjustQuantity?: (item: ApiProduct) => void;
    onConvertToVariant?: (item: ApiProduct) => void;
    onViewStockMovements?: (item: ApiProduct) => void;

    /** Row selection */
    selectedRows: ApiProduct[];
    onSelectedRowsChange: (state: { selectedRows: ApiProduct[] }) => void;
    toggleCleared: boolean;
    onBulkActions?: () => void;

    /** Filters apply */
    applyFilters: (params: Record<string, unknown>) => void;
}

const DesktopInventoryView: FC<DesktopInventoryViewProps> = ({
    data,
    isLoading,
    totalRows,
    perPage,
    categories,
    summaryCards,
    statsLoading,
    searchTerm,
    onSearch,
    activeFilter,
    onFilterChange,
    categoryId,
    onCategoryChange,
    startDate,
    endDate,
    onDateChange,
    hasActiveFilters,
    onClearFilters,
    onExport,
    onPageChange,
    onPerRowsChange,
    onEdit,
    onDelete,
    onAdjustQuantity,
    onConvertToVariant,
    onViewStockMovements,
    selectedRows,
    onSelectedRowsChange,
    toggleCleared,
    onBulkActions,
    applyFilters,
}) => {
    const { mode } = useContext(ZonseThemeContext);

    const columns = getInventoryTableColumns({
        onEdit,
        onDelete,
        onAdjustQuantity,
        onConvertToVariant,
        onViewStockMovements,
    });

    return (
        <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <InventoryToolbar
                searchTerm={searchTerm}
                onSearch={onSearch}
                startDate={startDate}
                endDate={endDate}
                onDateChange={onDateChange}
                onExport={onExport}
                onClearFilters={onClearFilters}
                hasActiveFilters={hasActiveFilters}
                selectedRowCount={selectedRows.length}
                onBulkActions={onBulkActions}
            />

            <Flex direction="column" gap="2" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                <StockStatusFilter
                    selectedStatus={activeFilter}
                    onChange={(status) => {
                        onFilterChange(status);
                        applyFilters({ filter: status });
                    }}
                />
                <CategoryFilter
                    selectedCategory={categoryId || 'all'}
                    onChange={onCategoryChange}
                    categories={categories}
                    isLoading={false}
                />
            </Flex>

            <Box px="4">
                <InventorySummaryCards cards={summaryCards} isLoading={statsLoading} />
            </Box>

            <DataTable
                columns={columns}
                data={data}
                theme={mode as Themes}
                progressPending={isLoading}
                progressComponent={<TableSkeleton rows={perPage} columns={6} showCheckbox showActions />}
                highlightOnHover
                responsive
                pagination
                paginationServer
                paginationTotalRows={totalRows}
                paginationPerPage={perPage}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                onChangeRowsPerPage={onPerRowsChange}
                onChangePage={onPageChange}
                selectableRows
                selectableRowsHighlight
                onSelectedRowsChange={onSelectedRowsChange}
                clearSelectedRows={toggleCleared}
                expandableRows
                expandableRowsComponent={ExpandedVariantRow as React.ComponentType<ExpanderComponentProps<ApiProduct>>}
                expandableRowsHideExpander
                expandOnRowClicked
                expandableRowDisabled={(row) => (row.variantCount ?? 1) <= 1}
                customStyles={getTableStyles(mode)}
                persistTableHead
                noDataComponent={
                    <TableEmptyState
                        icon={<Package />}
                        title="No inventory found"
                        description={
                            hasActiveFilters
                                ? 'Try adjusting your search, date, status, or category filters to find items.'
                                : 'Inventory items will appear here once they are added.'
                        }
                        action={
                            hasActiveFilters ? (
                                <Button variant="ghost" size="2" onClick={onClearFilters}>
                                    Clear filters
                                </Button>
                            ) : undefined
                        }
                    />
                }
            />
        </Box>
    );
};

export default DesktopInventoryView;
