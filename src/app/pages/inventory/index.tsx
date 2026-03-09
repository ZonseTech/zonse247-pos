import { FunctionComponent, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X } from 'lucide-react';
import DataTable, { type Themes, type ExpanderComponentProps } from 'react-data-table-component';
import { HiOutlinePlus, HiOutlineDownload, HiOutlineFilter, HiOutlineMenuAlt4, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import Loader from '../../components/Loader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import { getTableStyles } from '../../utils/table-styles';
import { formatCurrencyShort, formatCurrencyFull } from '../../utils';
import { useInventoryStats } from '../../hooks/useInventoryStats';
import InventorySummaryCards, { InventorySummaryCard } from './partials/InventorySummaryCards';
import { Button, ZonseThemeContext, DateRangeFilter } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { getInventoryTableColumns } from './partials/InventoryTableColumns';
import StockStatusFilter from './partials/StockStatusFilter';
import CategoryFilter from './partials/CategoryFilter';
import BulkActionsModal from './partials/BulkActionsModal';
import AdjustQuantityModal from './partials/AdjustQuantityModal';
import ConvertToVariantModal from './partials/ConvertToVariantModal';
import StockMovementModal from './partials/StockMovementModal';
import MobileInventoryList from './partials/MobileItemTile';
import ExpandedVariantRow from './partials/ExpandedVariantRow';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const InventoryManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
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
        page,
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

    const totalPages = Math.ceil(totalRows / perPage);

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
        setActiveFilter('all');
        setCategoryId(undefined);
        setStartDate('');
        setEndDate('');
        applyFilters({ filter: 'all', search: '', categoryId: undefined, startDate: '', endDate: '' });
        // Refresh stats with no filters
        fetchOverview({});
    }, [setActiveFilter, setCategoryId, setStartDate, setEndDate, applyFilters, fetchOverview]);

    const exportData = useCallback(() => {
        // Export inventory data to CSV using aggregate quantities
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

    const getLowStockItems = useCallback(() => {
        setActiveFilter('low-stock');
        applyFilters({ filter: 'low-stock' });
    }, [setActiveFilter, applyFilters]);

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

    const handleMobileSelectItem = useCallback((item: ApiProduct, selected: boolean) => {
        if (selected) {
            setSelectedRows(prev => [...prev, item]);
        } else {
            setSelectedRows(prev => prev.filter(i => i.id !== item.id));
        }
    }, []);

    const handleDateChange = useCallback((dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
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
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-8 h-8 text-sky-500" />}
                    title="Inventory"
                    description={isMobile ? undefined : "Manage your inventory items, track stock levels, and monitor expiration dates."}
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={handleAddItem}
                            theme="primary">
                            {!isMobile && <span className='hidden md:block'>
                                Add Item
                            </span>}
                        </Button>
                    }
                >
                    <div className="sticky top-12 md:top-16 z-40 p-3 md:p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 shadow-sm">
                        <div className="flex flex-col gap-3 md:gap-4">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <SearchBar
                                    placeholder="Search by name, barcode, SKU..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:flex-1 sm:max-w-xs"
                                />

                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={exportData}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium text-gray-700 dark:text-gray-200"
                                    >
                                        <HiOutlineDownload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>

                                    <button
                                        onClick={getLowStockItems}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-500 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg transition-colors duration-200"
                                    >
                                        <HiOutlineFilter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Low Stock</span>
                                    </button>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                            <span className="hidden sm:inline">Clear</span>
                                        </button>
                                    )}

                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={() => setIsBulkActionsOpen(true)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-lg transition-colors duration-200"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Bulk ({selectedRows.length})</span>
                                        </button>
                                    )}
                                </div>
                                <DateRangeFilter
                                    startDate={startDate ? new Date(startDate) : null}
                                    endDate={endDate ? new Date(endDate) : null}
                                    onChange={handleDateChange}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
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
                            </div>
                        </div>
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <InventorySummaryCards
                        cards={inventorySummaryCards}
                        isLoading={statsLoading && !overview}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4">
                                    <Loader isLoading={isLoading} />
                                </div>
                            ) : data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineMenuAlt4 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        No inventory found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to find items."
                                            : "Inventory items will appear here once they are added."
                                        }
                                    </p>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium text-sm"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="px-4 py-2">
                                        <MobileInventoryList
                                            data={data}
                                            isLoading={isLoading}
                                            searchTerm={searchTerm}
                                            selectedItems={selectedRows}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAdjustQuantity={handleAdjustQuantity}
                                            onSelectItem={handleMobileSelectItem}
                                            totalRows={totalRows}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            Page {page} of {totalPages} ({totalRows} total)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={page >= totalPages}
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
                        <div className="overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={data}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<TableSkeleton rows={perPage} columns={6} showCheckbox showActions />}
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
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            No inventory found
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                                            {hasActiveFilters
                                                ? "Try adjusting your search, date, status, or category filters to find items."
                                                : "Inventory items will appear here once they are added."
                                            }
                                        </p>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={handleClearFilters}
                                                className="mt-4 text-sky-500 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>

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