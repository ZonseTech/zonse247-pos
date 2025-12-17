import { FunctionComponent, useCallback, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, Select, ZonseThemeContext } from '../../components';
import { SearchBar } from './partials/SearchBar';
import { getInventoryTableColumns } from './partials/InventoryTableColumns';
import Filters from './partials/Filters';
import { useInventoryManagement } from '../../hooks/useInventoryManagement';
import { useInventorySummary } from '../../hooks/useInventorySummary';
import { ROUTES } from '../../utils/constants';

const InventoryManagement: FunctionComponent = () => {
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        isLoading,
        data,
        totalRows,
        categories,
        searchTerm,
        loadInventory,
        loadCategories,
        handleSearch,
        handleVoidItem,
        handleFilterByCategory,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
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
        applyFilters({ filter: 'all', search: '', categoryId: undefined });
    }, [setActiveFilter, applyFilters]);

    const columns = getInventoryTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-8 h-8 text-blue-600" />}
                    title="Inventory Management"
                    description="Manage your inventory items, track stock levels, and monitor expiration dates."
                    action={
                        <Button
                            onClick={handleAddItem}
                            theme="primary"
                            className="flex items-center gap-2"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                            Add Item
                        </Button>
                    }
                />

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    {/* Filters Section */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <Select
                                    onChange={(e) => handleFilterByCategory(parseInt(e.target.value))}
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

                                <SearchBar
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onClear={() => applyFilters()}
                                    placeholder="Search by name, barcode, or SKU..."
                                    className="w-full sm:w-64"
                                />
                            </div>

                            <div className="w-full lg:w-auto">
                                <Filters
                                    summaryData={summaryData}
                                    activeFilter={activeFilter}
                                    onClear={handleClearFilters}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
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
                                {!searchTerm && (
                                    <Button
                                        onClick={handleAddItem}
                                        theme="primary"
                                        className="mt-4 flex items-center gap-2"
                                    >
                                        <HiOutlinePlus className="w-5 h-5" />
                                        Add First Item
                                    </Button>
                                )}
                            </div>
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default InventoryManagement;