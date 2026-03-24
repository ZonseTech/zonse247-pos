import { FunctionComponent, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X, Plus, Download } from 'lucide-react';
import DataTable, { type Themes, type ExpanderComponentProps } from 'react-data-table-component';
import { Button, Badge, Box, Flex, Separator } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { getTableStyles } from '../../utils/table-styles';
import { formatCurrencyShort, formatCurrencyFull } from '../../utils';
import { useInventoryStats } from '../../hooks/useInventoryStats';
import InventorySummaryCards, { InventorySummaryCard } from './partials/InventorySummaryCards';
import { ZonseThemeContext } from '../../components';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import { SearchBar } from '../../components/SearchBar';
import { getInventoryTableColumns } from './partials/InventoryTableColumns';
import StockStatusFilter from './partials/StockStatusFilter';
import CategoryFilter from './partials/CategoryFilter';
import BulkActionsModal from './partials/BulkActionsModal';
import AdjustQuantityModal from './partials/AdjustQuantityModal';
import ConvertToVariantModal from './partials/ConvertToVariantModal';
import StockMovementModal from './partials/StockMovementModal';
import ExpandedVariantRow from './partials/ExpandedVariantRow';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { ROUTES } from '../../utils/constants';

const InventoryManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const { stats, isLoading: statsLoading, fetchAllStats, fetchOverview } = useInventoryStats();
    const { overview } = stats;

    const inventorySummaryCards: InventorySummaryCard[] = useMemo(() => {
        if (!overview) return [];

        const lowStockTotal = (overview.lowStockCount || 0) + (overview.outOfStockCount || 0);
        const hasLowStock = lowStockTotal > 0;

        return [
            {
                title: 'Products',
                value: overview.totalProducts,
                icon: 'products',
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Total Units',
                value: overview.totalStockQuantity,
                icon: 'units',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                iconBgColor: 'bg-purple-100 dark:bg-purple-900/40',
                textColor: 'text-purple-600 dark:text-purple-400',
            },
            {
                title: 'Stock Value',
                value: overview.totalStockValue,
                displayValue: formatCurrencyShort(overview.totalStockValue),
                fullValue: formatCurrencyFull(overview.totalStockValue),
                icon: 'stockValue',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Retail Value',
                value: overview.totalRetailValue,
                displayValue: formatCurrencyShort(overview.totalRetailValue),
                fullValue: formatCurrencyFull(overview.totalRetailValue),
                icon: 'retailValue',
                bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
                iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
                textColor: 'text-cyan-600 dark:text-cyan-400',
            },
            {
                title: 'Profit Margin',
                value: overview.profitMargin,
                displayValue: `${overview.profitMargin.toFixed(1)}%`,
                icon: 'profit',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                iconBgColor: 'bg-green-100 dark:bg-green-900/40',
                textColor: 'text-green-500 dark:text-green-400',
            },
            {
                title: 'Low/Out Stock',
                value: lowStockTotal,
                icon: 'lowStock',
                bgColor: hasLowStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700/50',
                iconBgColor: hasLowStock ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-600',
                textColor: hasLowStock ? 'text-amber-500 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400',
            },
        ];
    }, [overview]);

    const [selectedRows, setSelectedRows] = useState<ApiProduct[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

    const [isAdjustQuantityOpen, setIsAdjustQuantityOpen] = useState(false);
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<ApiProduct | null>(null);

    const [isConvertToVariantOpen, setIsConvertToVariantOpen] = useState(false);
    const [selectedItemForConvert, setSelectedItemForConvert] = useState<ApiProduct | null>(null);

    const [isStockMovementOpen, setIsStockMovementOpen] = useState(false);
    const [selectedItemForMovements, setSelectedItemForMovements] = useState<ApiProduct | null>(null);

    const {
        isLoading,
        data,
        totalRows,
        categories,
        searchTerm,
        categoryId,
        startDate,
        endDate,
        perPage,
        loadInventory,
        loadCategories,
        handleSearch,
        handleVoidItem,
        handleFilterByCategory,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
        setCategoryId,
        setStartDate,
        setEndDate,
        activeFilter,
        applyFilters
    } = useInventoryManagement();

    const statsQuery = useMemo(() => ({
        search: searchTerm || undefined,
        filter: activeFilter !== 'all' ? activeFilter : undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    }), [searchTerm, activeFilter, categoryId, startDate, endDate]);

    useEffect(() => {
        fetchOverview(statsQuery);
    }, [statsQuery, fetchOverview]);

    useEffect(() => {
        loadCategories();
        fetchAllStats(statsQuery);
    }, []);

    const handleAddItem = useCallback(() => {
        navigate(ROUTES.INVENTORY_FORM);
    }, [navigate]);

    const handleEdit = useCallback((item: ApiProduct) => {
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: item.id } });
    }, [navigate]);

    const handleDelete = useCallback((productId: string) => {
        Confirm.show(
            'Delete Item',
            'Are you sure you want to delete this inventory item? This action cannot be undone.',
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await handleVoidItem(productId);
                    Notify.success('Item deleted successfully');
                    loadInventory();
                } catch (error) {
                    Notify.failure('Failed to delete item');
                }
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [handleVoidItem, loadInventory]);

    const handleClearFilters = useCallback(async () => {
        handleSearch('');
        setActiveFilter('all');
        setCategoryId(undefined);
        setStartDate('');
        setEndDate('');
        applyFilters({ filter: 'all', search: '', categoryId: undefined, startDate: '', endDate: '' });
        fetchOverview({});
    }, [handleSearch, setActiveFilter, setCategoryId, setStartDate, setEndDate, applyFilters, fetchOverview]);

    const exportData = useCallback(() => {
        const headers = ['Name', 'Barcode', 'Category', 'Total Quantity', 'Reserved', 'Unit', 'Cost Price', 'Sell Price', 'Reorder Point', 'Variants', 'Status'];
        const csvData = data.map(item => {
            const defaultVariant = item.variants?.find(v => v.isDefault) || item.variants?.[0];
            const quantity = item.totalAvailableQuantity ?? 0;
            const reserved = item.totalReservedQuantity ?? 0;
            const reorderPoint = defaultVariant?.inventory?.reorderPoint ?? 0;
            return [
                item.name,
                defaultVariant?.primaryBarcode || '',
                item.categoryDetails?.name || '',
                quantity,
                reserved,
                defaultVariant?.unit || item.defaultUnit || 'pc',
                defaultVariant?.costPrice || 0,
                defaultVariant?.sellingPrice || 0,
                reorderPoint,
                item.variantCount || 1,
                quantity <= 0 ? 'Out of Stock' : quantity <= reorderPoint ? 'Low Stock' : 'In Stock'
            ];
        });

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [data]);

    const hasActiveFilters = useMemo(() => {
        return activeFilter !== 'all' || !!categoryId || !!startDate || !!endDate || !!searchTerm;
    }, [activeFilter, categoryId, startDate, endDate, searchTerm]);

    const handleRowSelected = useCallback((state: { selectedRows: ApiProduct[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handleAdjustQuantity = useCallback((item: ApiProduct) => {
        setSelectedItemForAdjust(item);
        setIsAdjustQuantityOpen(true);
    }, []);

    const handleConvertToVariant = useCallback((item: ApiProduct) => {
        setSelectedItemForConvert(item);
        setIsConvertToVariantOpen(true);
    }, []);

    const handleViewStockMovements = useCallback((item: ApiProduct) => {
        setSelectedItemForMovements(item);
        setIsStockMovementOpen(true);
    }, []);

    const handleBulkSuccess = useCallback(() => {
        setToggleCleared(!toggleCleared);
        setSelectedRows([]);
        loadInventory();
        fetchOverview(statsQuery);
    }, [toggleCleared, loadInventory, fetchOverview, statsQuery]);

    const handleAdjustSuccess = useCallback(() => {
        loadInventory();
        fetchOverview(statsQuery);
    }, [loadInventory, fetchOverview, statsQuery]);

    const handleConvertSuccess = useCallback(() => {
        loadInventory();
        fetchOverview(statsQuery);
    }, [loadInventory, fetchOverview, statsQuery]);

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');
    }, [setStartDate, setEndDate]);

    const columns = getInventoryTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onAdjustQuantity: handleAdjustQuantity,
        onConvertToVariant: handleConvertToVariant,
        onViewStockMovements: handleViewStockMovements,
    });

    return (
        <AppLayout>
            <PageHeader
                icon={<Package className="w-8 h-8 text-sky-500" />}
                title="Inventory"
                description="Manage your inventory items, track stock levels, and monitor expiration dates."
                action={
                    <Button
                        size="2"
                        onClick={handleAddItem}
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                }
            />

            <Box className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                        placeholder="Search by name, barcode, SKU..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:flex-1 sm:max-w-xs"
                    />

                    <Flex align="center" gap="2" wrap="wrap">
                        <MobileDateFilter
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                            align="right"
                        />

                        <Button variant="outline" color="gray" size="2" onClick={exportData}>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>

                        {hasActiveFilters && (
                            <Button variant="soft" color="red" size="2" onClick={handleClearFilters}>
                                <X className="w-4 h-4" />
                                <span className="hidden sm:inline">Clear</span>
                            </Button>
                        )}

                        {selectedRows.length > 0 && (
                            <Button
                                variant="soft"
                                color="purple"
                                size="2"
                                onClick={() => setIsBulkActionsOpen(true)}
                            >
                                <Settings2 className="w-4 h-4" />
                                Bulk
                                <Badge color="purple" variant="solid" size="1">
                                    {selectedRows.length}
                                </Badge>
                            </Button>
                        )}
                    </Flex>
                </Flex>

                <Flex direction="column" gap="2" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                    <StockStatusFilter
                        selectedStatus={activeFilter}
                        onChange={(status) => {
                            setActiveFilter(status);
                            applyFilters({ filter: status });
                        }}
                    />
                    <CategoryFilter
                        selectedCategory={categoryId || 'all'}
                        onChange={handleFilterByCategory}
                        categories={categories}
                        isLoading={false}
                    />
                </Flex>

                <Box px="4">
                    <InventorySummaryCards
                        cards={inventorySummaryCards}
                        isLoading={statsLoading}
                    />
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
                    onChangeRowsPerPage={handlePerRowsChange}
                    onChangePage={handlePageChange}
                    selectableRows
                    selectableRowsHighlight
                    onSelectedRowsChange={handleRowSelected}
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
                                    <Button
                                        variant="ghost"

                                        size="2"
                                        onClick={handleClearFilters}
                                    >
                                        Clear filters
                                    </Button>
                                ) : undefined
                            }
                        />
                    }
                />
            </Box>

            <BulkActionsModal
                isOpen={isBulkActionsOpen}
                onClose={() => setIsBulkActionsOpen(false)}
                selectedItems={selectedRows}
                categories={categories}
                onSuccess={handleBulkSuccess}
            />

            <AdjustQuantityModal
                isOpen={isAdjustQuantityOpen}
                onClose={() => {
                    setIsAdjustQuantityOpen(false);
                    setSelectedItemForAdjust(null);
                }}
                item={selectedItemForAdjust}
                onSuccess={handleAdjustSuccess}
            />

            <ConvertToVariantModal
                isOpen={isConvertToVariantOpen}
                onClose={() => {
                    setIsConvertToVariantOpen(false);
                    setSelectedItemForConvert(null);
                }}
                item={selectedItemForConvert}
                onSuccess={handleConvertSuccess}
            />

            {selectedItemForMovements && selectedItemForMovements.variants?.[0] && (
                <StockMovementModal
                    isOpen={isStockMovementOpen}
                    onClose={() => {
                        setIsStockMovementOpen(false);
                        setSelectedItemForMovements(null);
                    }}
                    variantId={selectedItemForMovements.variants[0].id}
                    variantName={selectedItemForMovements.variants[0].variantName || 'Default'}
                    productName={selectedItemForMovements.name}
                    sku={selectedItemForMovements.variants[0].sku}
                />
            )}
        </AppLayout>
    );
};

export default InventoryManagement;