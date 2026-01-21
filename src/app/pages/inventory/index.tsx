import { FunctionComponent, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { HiOutlinePlus, HiOutlineDownload, HiOutlineFilter, HiOutlineMenuAlt4, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import Loader from '../../components/Loader';
import { getTableStyles } from '../../utils/table-styles';
import { useInventoryStats } from '../../hooks/useInventoryStats';
import InventorySummaryCards, { InventorySummaryCard } from './partials/InventorySummaryCards';
import { Button, ZonseThemeContext, DateRangeFilter } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { getInventoryTableColumns } from './partials/InventoryTableColumns';
import StockStatusFilter from './partials/StockStatusFilter';
import CategoryFilter from './partials/CategoryFilter';
import BulkActionsModal from './partials/BulkActionsModal';
import AdjustQuantityModal from './partials/AdjustQuantityModal';
import MobileInventoryList from './partials/MobileInventoryList';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useInventorySummary } from '../../hooks/useInventorySummary';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

// Format currency for display
const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `MK ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `MK ${(value / 1000).toFixed(1)}K`;
    }
    return `MK ${value.toFixed(0)}`;
};

const InventoryManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    // Inventory stats
    const { stats, isLoading: statsLoading, fetchAllStats, fetchOverview } = useInventoryStats();
    const { overview } = stats;

    // Calculate inventory summary cards
    const inventorySummaryCards: InventorySummaryCard[] = useMemo(() => {
        if (!overview) return [];

        const lowStockTotal = (overview.lowStockCount || 0) + (overview.outOfStockCount || 0);
        const hasLowStock = lowStockTotal > 0;

        return [
            {
                title: 'Products',
                value: overview.totalProducts,
                icon: 'products',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-600 dark:text-blue-400',
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
                displayValue: formatCurrency(overview.totalStockValue),
                icon: 'stockValue',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                title: 'Retail Value',
                value: overview.totalRetailValue,
                displayValue: formatCurrency(overview.totalRetailValue),
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
                textColor: 'text-green-600 dark:text-green-400',
            },
            {
                title: 'Low/Out Stock',
                value: lowStockTotal,
                icon: 'lowStock',
                bgColor: hasLowStock ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700/50',
                iconBgColor: hasLowStock ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-gray-100 dark:bg-gray-600',
                textColor: hasLowStock ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400',
            },
        ];
    }, [overview]);

    const [selectedRows, setSelectedRows] = useState<InventoryItem[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

    const [isAdjustQuantityOpen, setIsAdjustQuantityOpen] = useState(false);
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const {
        isLoading,
        data,
        totalRows,
        categories,
        searchTerm,
        categoryId,
        startDate,
        endDate,
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

    const { summaryData, loadSummary } = useInventorySummary(setActiveFilter, loadInventory, applyFilters);

    // Build stats query from current filters
    const statsQuery = useMemo(() => ({
        search: searchTerm || undefined,
        filter: activeFilter !== 'all' ? activeFilter : undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    }), [searchTerm, activeFilter, categoryId, startDate, endDate]);

    // Fetch stats when filters change
    useEffect(() => {
        fetchOverview(statsQuery);
    }, [statsQuery, fetchOverview]);

    useEffect(() => {
        loadSummary();
        loadCategories();
        fetchAllStats(statsQuery);
    }, []);

    const handleAddItem = useCallback(() => {
        navigate(ROUTES.INVENTORY_FORM);
    }, [navigate]);

    const handleEdit = useCallback((item: InventoryItem) => {
        navigate(ROUTES.INVENTORY_FORM, { state: { productId: item.productId } });
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
                    loadSummary();
                } catch (error) {
                    Notify.failure('Failed to delete item');
                }
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
            }
        );
    }, [handleVoidItem, loadInventory, loadSummary]);

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
        // Export inventory data to CSV
        const headers = ['Name', 'Barcode', 'Category', 'Quantity', 'Unit', 'Cost Price', 'Sell Price', 'Min Stock', 'Status'];
        const csvData = data.map(item => [
            item.name,
            item.barcode || '',
            item.categoryDetails?.name || '',
            item.quantity,
            item.unit || 'pc',
            item.costPrice,
            item.sellPrice,
            item.minStock || 0,
            Number(item.quantity) <= 0 ? 'Out of Stock' : Number(item.quantity) <= Number(item.minStock || 0) ? 'Low Stock' : 'In Stock'
        ]);

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

    const handleRowSelected = useCallback((state: { selectedRows: InventoryItem[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handleAdjustQuantity = useCallback((item: InventoryItem) => {
        setSelectedItemForAdjust(item);
        setIsAdjustQuantityOpen(true);
    }, []);

    const handleBulkSuccess = useCallback(() => {
        setToggleCleared(!toggleCleared);
        setSelectedRows([]);
        loadInventory();
        loadSummary();
        fetchOverview(statsQuery);
    }, [toggleCleared, loadInventory, loadSummary, fetchOverview, statsQuery]);

    const handleAdjustSuccess = useCallback(() => {
        loadInventory();
        loadSummary();
        fetchOverview(statsQuery);
    }, [loadInventory, loadSummary, fetchOverview, statsQuery]);

    const handleMobileSelectItem = useCallback((item: InventoryItem, selected: boolean) => {
        if (selected) {
            setSelectedRows(prev => [...prev, item]);
        } else {
            setSelectedRows(prev => prev.filter(i => i.productId !== item.productId));
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
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-8 h-8 text-blue-600" />}
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
                    <div className="p-3 md:p-6 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col gap-3 md:gap-4">
                            {/* Search Row */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <SearchBar
                                    placeholder="Search by name, barcode, SKU..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full sm:flex-1 sm:max-w-xs"
                                />

                                {/* Action buttons - stack on mobile */}
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
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-lg transition-colors duration-200"
                                    >
                                        <HiOutlineFilter className="w-4 h-4" />
                                        <span className="hidden sm:inline">Low Stock</span>
                                    </button>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
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

                            {/* Stock Status and Category Filters */}
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
                                            className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
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

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {currentPage}
                                            </span>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={totalRows <= currentPage * perPage}
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
                                data={data}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<Loader isLoading={isLoading} />}
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
                                fixedHeader
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                fixedHeaderScrollHeight="calc(100vh - 380px)"
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
                                                className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
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
        </AppLayout>
    );
};

export default InventoryManagement;