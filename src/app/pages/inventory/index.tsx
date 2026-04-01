import { FunctionComponent, useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Plus, ShoppingBag, FolderTree, ArrowLeftRight, Calculator, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import FloatingHubNavButton, { type HubNavLink } from '../../components/buttons/FloatingHubNavButton';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import { formatCurrencyShort, formatCurrencyFull } from '../../utils';
import { useInventoryStats } from '../../hooks/useInventoryStats';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { InventorySummaryCard } from './partials/InventorySummaryCards';
import BulkActionsModal from './partials/BulkActionsModal';
import AdjustQuantityModal from './partials/AdjustQuantityModal';
import ConvertToVariantModal from './partials/ConvertToVariantModal';
import StockMovementModal from './partials/StockMovementModal';
import DesktopInventoryView from './partials/DesktopInventoryView';
import MobileInventoryView from './partials/MobileInventoryView';
import { useInventoryModals } from './hooks/useInventoryModals';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { ROUTES } from '../../utils/constants';

const InventoryManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    // Data & stats
    const { stats, isLoading: statsLoading, fetchAllStats, fetchOverview } = useInventoryStats();
    const { overview } = stats;

    const {
        isLoading,
        data,
        totalRows,
        categories,
        searchTerm,
        debouncedSearchTerm,
        categoryId,
        startDate,
        endDate,
        perPage,
        page,
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

    const modals = useInventoryModals();

    const hubLinks: HubNavLink[] = useMemo(() => [
        { id: 'inventory', label: 'Products', path: ROUTES.INVENTORY, icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'categories', label: 'Categories', path: ROUTES.CATEGORIES, icon: <FolderTree className="w-4 h-4" /> },
        { id: 'stock-movements', label: 'Stock Movements', path: ROUTES.STOCK_MOVEMENTS, icon: <ArrowLeftRight className="w-4 h-4" /> },
        { id: 'valuation', label: 'Valuation', path: ROUTES.INVENTORY_VALUATION, icon: <Calculator className="w-4 h-4" /> },
        { id: 'cogs', label: 'COGS & Profit', path: ROUTES.COGS_PROFITABILITY, icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'aging', label: 'Aging', path: ROUTES.INVENTORY_AGING, icon: <Clock className="w-4 h-4" /> },
    ], []);

    const [selectedRows, setSelectedRows] = useState<ApiProduct[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

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

    const statsQuery = useMemo(() => ({
        search: debouncedSearchTerm || undefined,
        filter: activeFilter !== 'all' ? activeFilter : undefined,
        categoryId: categoryId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    }), [debouncedSearchTerm, activeFilter, categoryId, startDate, endDate]);

    useEffect(() => {
        fetchOverview(statsQuery);
    }, [statsQuery, fetchOverview]);

    useEffect(() => {
        loadCategories();
        fetchAllStats(statsQuery);
    }, []);

    const hasActiveFilters = useMemo(() => {
        return activeFilter !== 'all' || !!categoryId || !!startDate || !!endDate || !!searchTerm;
    }, [activeFilter, categoryId, startDate, endDate, searchTerm]);

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
            { okButtonBackground: '#ef4444' }
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

    const handleDateChange = useCallback((start: Date | null, end: Date | null) => {
        setStartDate(start ? start.toISOString().split('T')[0] : '');
        setEndDate(end ? end.toISOString().split('T')[0] : '');
    }, [setStartDate, setEndDate]);

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

    const handleRowSelected = useCallback((state: { selectedRows: ApiProduct[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handleFilterChange = useCallback((status: string) => {
        setActiveFilter(status);
        applyFilters({ filter: status });
    }, [setActiveFilter, applyFilters]);

    const handleBulkSuccess = useCallback(() => {
        setToggleCleared(prev => !prev);
        setSelectedRows([]);
        loadInventory();
        fetchOverview(statsQuery);
    }, [loadInventory, fetchOverview, statsQuery]);

    const handleAdjustSuccess = useCallback(() => {
        loadInventory();
        fetchOverview(statsQuery);
    }, [loadInventory, fetchOverview, statsQuery]);

    const handleConvertSuccess = useCallback(() => {
        loadInventory();
        fetchOverview(statsQuery);
    }, [loadInventory, fetchOverview, statsQuery]);

    return (
        <AppLayout>
            {isMobile ? (
                <>
                    <MobilePageHeader
                        title="Inventory"
                        showLeftButton={true}
                    />
                    <MobileInventoryView
                        data={data}
                        isLoading={isLoading}
                        totalRows={totalRows}
                        categories={categories}
                        summaryCards={inventorySummaryCards}
                        statsLoading={statsLoading}
                        searchTerm={searchTerm}
                        onSearch={handleSearch}
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                        categoryId={categoryId}
                        onCategoryChange={handleFilterByCategory}
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={handleDateChange}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                        onExport={exportData}
                        page={page ?? 1}
                        perPage={perPage}
                        onPageChange={handlePageChange}
                        onAddItem={handleAddItem}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdjustQuantity={modals.openAdjustQuantity}
                        onViewStockMovements={modals.openStockMovement}
                        selectedRowCount={selectedRows.length}
                        onBulkActions={modals.openBulkActions}
                    />
                </>
            ) : (
                <>
                    <PageHeader
                        icon={<Package className="w-8 h-8 text-sky-500" />}
                        title="Inventory"
                        description="Manage your inventory items, track stock levels, and monitor expiration dates."
                        action={
                            <Button size="2" onClick={handleAddItem}>
                                <Plus className="w-4 h-4" />
                                Add Item
                            </Button>
                        }
                    />
                    <DesktopInventoryView
                        data={data}
                        isLoading={isLoading}
                        totalRows={totalRows}
                        perPage={perPage}
                        categories={categories}
                        summaryCards={inventorySummaryCards}
                        statsLoading={statsLoading}
                        searchTerm={searchTerm}
                        onSearch={handleSearch}
                        activeFilter={activeFilter}
                        onFilterChange={handleFilterChange}
                        categoryId={categoryId}
                        onCategoryChange={handleFilterByCategory}
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={handleDateChange}
                        hasActiveFilters={hasActiveFilters}
                        onClearFilters={handleClearFilters}
                        onExport={exportData}
                        onPageChange={handlePageChange}
                        onPerRowsChange={handlePerRowsChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdjustQuantity={modals.openAdjustQuantity}
                        onConvertToVariant={modals.openConvertToVariant}
                        onViewStockMovements={modals.openStockMovement}
                        selectedRows={selectedRows}
                        onSelectedRowsChange={handleRowSelected}
                        toggleCleared={toggleCleared}
                        onBulkActions={modals.openBulkActions}
                        applyFilters={applyFilters}
                    />
                </>
            )}

            {isMobile && <FloatingHubNavButton links={hubLinks} />}

            <BulkActionsModal
                isOpen={modals.isBulkActionsOpen}
                onClose={modals.closeBulkActions}
                selectedItems={selectedRows}
                categories={categories}
                onSuccess={handleBulkSuccess}
            />

            <AdjustQuantityModal
                isOpen={modals.isAdjustQuantityOpen}
                onClose={modals.closeAdjustQuantity}
                item={modals.selectedItemForAdjust}
                onSuccess={handleAdjustSuccess}
            />

            <ConvertToVariantModal
                isOpen={modals.isConvertToVariantOpen}
                onClose={modals.closeConvertToVariant}
                item={modals.selectedItemForConvert}
                onSuccess={handleConvertSuccess}
            />

            {modals.selectedItemForMovements && modals.selectedItemForMovements.variants?.[0] && (
                <StockMovementModal
                    isOpen={modals.isStockMovementOpen}
                    onClose={modals.closeStockMovement}
                    variantId={modals.selectedItemForMovements.variants[0].id}
                    variantName={modals.selectedItemForMovements.variants[0].variantName || 'Default'}
                    productName={modals.selectedItemForMovements.name}
                    sku={modals.selectedItemForMovements.variants[0].sku}
                />
            )}
        </AppLayout>
    );
};

export default InventoryManagement;