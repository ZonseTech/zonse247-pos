import { FunctionComponent, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X, Filter, SlidersHorizontal } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, Select, ZonseThemeContext, DateRangeFilter } from '../../components';
import { SearchBar } from './partials/SearchBar';
import { getInventoryTableColumns } from './partials/InventoryTableColumns';
import Filters from './partials/Filters';
import BulkActionsModal from './partials/BulkActionsModal';
import AdjustQuantityModal from './partials/AdjustQuantityModal';
import MobileInventoryList from './partials/MobileInventoryList';
import MobileFilterDrawer from './partials/MobileFilterDrawer';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useInventorySummary } from '../../hooks/useInventorySummary';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const InventoryManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<InventoryItem[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [isBulkActionsOpen, setIsBulkActionsOpen] = useState(false);

    const [isAdjustQuantityOpen, setIsAdjustQuantityOpen] = useState(false);
    const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

    useEffect(() => {
        loadSummary();
        loadCategories();
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
    }, [setActiveFilter, setCategoryId, setStartDate, setEndDate, applyFilters]);

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
    }, [toggleCleared, loadInventory, loadSummary]);

    const handleAdjustSuccess = useCallback(() => {
        loadInventory();
        loadSummary();
    }, [loadInventory, loadSummary]);

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
                    {/* Mobile-first filter layout */}
                    {isMobile ? (
                        <div className="flex flex-col gap-3 px-4">
                            {/* Search - Full width on mobile */}
                            <SearchBar
                                value={searchTerm}
                                onChange={handleSearch}
                                onClear={() => applyFilters()}
                                placeholder="Search by name, barcode, or SKU..."
                                className="w-full"
                            />

                            {/* Filter row */}
                            <div className="flex items-center gap-2">
                                {/* Quick filter dropdown */}
                                <div className="flex-1">
                                    <Filters
                                        summaryData={summaryData}
                                        activeFilter={activeFilter}
                                        onClear={handleClearFilters}
                                    />
                                </div>

                                {/* Filter button */}
                                <button
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className={`
                                        flex items-center justify-center gap-2 h-10 px-3
                                        rounded-lg border transition-colors
                                        ${hasActiveFilters
                                            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
                                            : 'bg-white border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                                        }
                                    `}
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    {hasActiveFilters && (
                                        <span className="text-xs font-medium">Active</span>
                                    )}
                                </button>
                            </div>

                            {/* Bulk actions button - shown when items selected */}
                            {selectedRows.length > 0 && (
                                <Button
                                    onClick={() => setIsBulkActionsOpen(true)}
                                    theme="primary"
                                    layout="outline"
                                    className="w-full flex items-center justify-center gap-2 h-10"
                                >
                                    <Settings2 className="w-4 h-4" />
                                    Bulk Actions ({selectedRows.length})
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Desktop filter layout */
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onClear={() => applyFilters()}
                                    placeholder="Search by name, barcode, or SKU..."
                                    className="w-full sm:w-64"
                                />

                                <Select
                                    value={categoryId || ''}
                                    onChange={(e) => handleFilterByCategory(e.target.value)}
                                    className="h-9 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full sm:w-48"
                                >
                                    <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                        All Categories
                                    </option>
                                    {categories.map((category: Category) => (
                                        <option
                                            key={category.categoryId}
                                            value={category.categoryId}
                                            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        >
                                            {category.name as string}
                                        </option>
                                    ))}
                                </Select>

                                <DateRangeFilter
                                    startDate={startDate ? new Date(startDate) : null}
                                    endDate={endDate ? new Date(endDate) : null}
                                    onChange={handleDateChange}
                                />

                                {selectedRows.length > 0 && (
                                    <Button
                                        onClick={() => setIsBulkActionsOpen(true)}
                                        theme="neutral"
                                        layout="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Settings2 className="w-4 h-4" />
                                        Bulk Actions ({selectedRows.length})
                                    </Button>
                                )}

                                {hasActiveFilters && (
                                    <Button
                                        onClick={handleClearFilters}
                                        theme="neutral"
                                        layout="outline"
                                        className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-300 dark:border-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            <Filters
                                summaryData={summaryData}
                                activeFilter={activeFilter}
                                onClear={handleClearFilters}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Mobile: Card-based list / Desktop: DataTable */}
                {isMobile ? (
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
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <DataTable
                            columns={columns}
                            data={data}
                            theme={mode as Themes}
                            progressPending={isLoading}
                            highlightOnHover
                            striped
                            responsive
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
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
                                <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {searchTerm ? 'No matching items' : 'No inventory items yet'}
                                    </h3>
                                    <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                        {searchTerm
                                            ? 'Try adjusting your search terms or clear the search to see all items.'
                                            : 'Get started by adding your first inventory item.'
                                        }
                                    </p>
                                </div>
                            }
                        />
                    </div>
                )}
            </div>

            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                categories={categories}
                categoryId={categoryId}
                startDate={startDate}
                endDate={endDate}
                onFilterByCategory={handleFilterByCategory}
                onDateChange={handleDateChange}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
            />

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