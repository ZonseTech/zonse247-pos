import { FunctionComponent, useCallback, useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { HiOutlinePlus, HiOutlineDownload, HiOutlineMenuAlt4 } from 'react-icons/hi';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import Loader from '../../components/Loader';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, DateRangeFilter } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import { useProducts } from '../../hooks/useProducts';
import { useProductSummary } from '../../hooks/useProductSummary';
import { useCategories } from '../../hooks/useCategories';
import { getProductTableColumns } from './partials/ProductTableColumns';
import { ROUTES } from '../../utils/constants';
import { useIsMobile, useIsEBN } from '../../hooks/useMediaQuery';
import ProductSummaryCards, { type ProductSummaryCard } from './partials/ProductSummaryCards';
import ProductStatusFilter from './partials/ProductStatusFilter';
import ProductCategoryFilter from './partials/ProductCategoryFilter';
import MobileProductList from './partials/MobileProductList';

const ProductManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const isEBN = useIsEBN();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<Product[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const {
        products,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        deleteProduct,
    } = useProducts();

    const { categories, loadCategories } = useCategories();
    const { summaryData, loadSummary } = useProductSummary(setActiveFilter, setStatusFilter);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadSummary(products);
    }, [products]);

    // Calculate product summary cards for EBN display
    const productSummaryCards: ProductSummaryCard[] = useMemo(() => {
        return summaryData.map((item) => {
            const iconMap: Record<string, 'total' | 'active' | 'inactive' | 'outOfStock' | 'discontinued'> = {
                'Total Products': 'total',
                'Active': 'active',
                'Inactive': 'inactive',
                'Out of Stock': 'outOfStock',
                'Discontinued': 'discontinued',
            };

            const colorMap: Record<string, { bgColor: string; iconBgColor: string; textColor: string }> = {
                'Total Products': {
                    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                    iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                    textColor: 'text-blue-600 dark:text-blue-400',
                },
                'Active': {
                    bgColor: 'bg-green-50 dark:bg-green-900/20',
                    iconBgColor: 'bg-green-100 dark:bg-green-900/40',
                    textColor: 'text-green-600 dark:text-green-400',
                },
                'Inactive': {
                    bgColor: 'bg-gray-50 dark:bg-gray-700/50',
                    iconBgColor: 'bg-gray-100 dark:bg-gray-600',
                    textColor: 'text-gray-600 dark:text-gray-400',
                },
                'Out of Stock': {
                    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                    iconBgColor: 'bg-orange-100 dark:bg-orange-900/40',
                    textColor: 'text-orange-600 dark:text-orange-400',
                },
                'Discontinued': {
                    bgColor: 'bg-red-50 dark:bg-red-900/20',
                    iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                    textColor: 'text-red-600 dark:text-red-400',
                },
            };

            const colors = colorMap[item.title] || colorMap['Total Products'];

            return {
                title: item.title,
                value: typeof item.value === 'number' ? item.value : parseInt(item.value as string, 10) || 0,
                icon: iconMap[item.title] || 'total',
                bgColor: colors.bgColor,
                iconBgColor: colors.iconBgColor,
                textColor: colors.textColor,
                onClick: item.onClick,
            };
        });
    }, [summaryData]);

    const hasActiveFilters = useMemo(() => {
        return activeFilter !== 'all' || !!categoryFilter || !!statusFilter || !!searchTerm || !!startDate || !!endDate;
    }, [activeFilter, categoryFilter, statusFilter, searchTerm, startDate, endDate]);

    const handleAddProduct = useCallback(() => {
        navigate(ROUTES.PRODUCT_FORM);
    }, [navigate]);

    const handleEdit = useCallback((product: Product) => {
        navigate(ROUTES.PRODUCT_FORM, { state: { productId: product.id } });
    }, [navigate]);

    const handleDelete = useCallback((productId: string) => {
        Confirm.show(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.',
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await deleteProduct(productId);
                    Notify.success('Product deleted successfully');
                } catch (error) {
                    Notify.failure('Failed to delete product');
                }
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
                titleColor: '#ef4444',
            }
        );
    }, [deleteProduct]);

    const handleClearFilters = useCallback(() => {
        setActiveFilter('all');
        setCategoryFilter('');
        setStatusFilter('');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
    }, [setActiveFilter, setCategoryFilter, setStatusFilter, setSearchTerm, setStartDate, setEndDate]);

    const handleRowSelected = useCallback((state: { selectedRows: Product[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handleViewStock = useCallback((product: Product) => {
        navigate(ROUTES.STOCK_MOVEMENTS, { state: { productId: product.productId } });
    }, [navigate]);

    const handleMobileSelectItem = useCallback((product: Product, selected: boolean) => {
        if (selected) {
            setSelectedRows((prev) => [...prev, product]);
        } else {
            setSelectedRows((prev) => prev.filter((p) => p.productId !== product.productId));
        }
    }, []);

    const handleDateChange = useCallback(
        (dates: [Date | null, Date | null]) => {
            const [start, end] = dates;
            setStartDate(start ? start.toISOString().split('T')[0] : '');
            setEndDate(end ? end.toISOString().split('T')[0] : '');
        },
        [setStartDate, setEndDate]
    );

    const columns = getProductTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        onViewStock: handleViewStock,
    });

    const handlePageChange = useCallback((page: number) => {
        setPage(page);
    }, [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setPage(page);
    }, [setPerPage, setPage]);

    // Export products to CSV
    const exportData = useCallback(() => {
        const headers = ['Name', 'SKU', 'Barcode', 'Category', 'Selling Price', 'Unit', 'Status'];
        const csvData = products.map(product => [
            product.name,
            product.sku || '',
            product.primaryBarcode || '',
            product.categoryDetails?.name || '',
            product.sellingPrice,
            product.unit || 'pc',
            product.status || 'ACTIVE'
        ]);

        const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [products]);

    // Handle status filter change
    const handleStatusFilterChange = useCallback((status: string) => {
        setActiveFilter(status);
        if (status === 'all') {
            setStatusFilter('');
        } else if (status === 'active') {
            setStatusFilter('ACTIVE');
        } else if (status === 'inactive') {
            setStatusFilter('INACTIVE');
        } else if (status === 'out-of-stock') {
            setStatusFilter('OUT_OF_STOCK');
        } else if (status === 'discontinued') {
            setStatusFilter('DISCONTINUED');
        }
    }, [setActiveFilter, setStatusFilter]);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-8 h-8 text-blue-600" />}
                    title="Products"
                    description={isMobile ? undefined : "Manage your product catalog with barcode support."}
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={handleAddProduct}
                            theme="primary"
                        >
                            {!isMobile && <span className="hidden md:block">Add Product</span>}
                        </Button>
                    }
                >
                    <div className={`p-3 ${isEBN ? '' : 'md:p-6'} bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600`}>
                        <div className={`flex flex-col gap-3 ${isEBN ? 'gap-2' : 'md:gap-4'}`}>
                            {/* Search Row */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <SearchBar
                                    placeholder="Search by name, SKU, barcode..."
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    className="w-full sm:flex-1 sm:max-w-xs"
                                />

                                {/* Action buttons - stack on mobile */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={exportData}
                                        className={`flex items-center justify-center gap-2 ${isEBN ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors duration-200 font-medium text-gray-700 dark:text-gray-200`}
                                    >
                                        <HiOutlineDownload className={isEBN ? "w-3.5 h-3.5" : "w-4 h-4"} />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>

                                    {hasActiveFilters && (
                                        <button
                                            onClick={handleClearFilters}
                                            className={`flex items-center justify-center gap-1 ${isEBN ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700`}
                                        >
                                            <X className={isEBN ? "w-3.5 h-3.5" : "w-4 h-4"} />
                                            <span className="hidden sm:inline">Clear</span>
                                        </button>
                                    )}

                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={() => { }}
                                            className={`flex items-center justify-center gap-1.5 ${isEBN ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-700 rounded-lg transition-colors duration-200`}
                                        >
                                            <Settings2 className={isEBN ? "w-3.5 h-3.5" : "w-4 h-4"} />
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

                            {/* Status and Category Filters */}
                            <div className={`flex flex-col gap-3 ${isEBN ? 'gap-2' : ''}`}>
                                <ProductStatusFilter
                                    selectedStatus={activeFilter}
                                    onChange={handleStatusFilterChange}
                                />

                                <ProductCategoryFilter
                                    selectedCategory={categoryFilter || ''}
                                    onChange={setCategoryFilter}
                                    categories={categories}
                                    isLoading={false}
                                />
                            </div>
                        </div>
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Summary Cards */}
                    <ProductSummaryCards
                        cards={productSummaryCards}
                        isLoading={isLoading && products.length === 0}
                        activeFilter={activeFilter}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 px-4">
                                    <Loader isLoading={isLoading} />
                                </div>
                            ) : products.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineMenuAlt4 className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        No products found
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {hasActiveFilters
                                            ? "Try adjusting your filters to find products."
                                            : "Products will appear here once they are added."}
                                    </p>
                                </div>
                            ) : (
                                <MobileProductList
                                    data={products}
                                    isLoading={isLoading}
                                    searchTerm={searchTerm}
                                    selectedItems={selectedRows}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewStock={handleViewStock}
                                    onSelectItem={handleMobileSelectItem}
                                    totalRows={totalRows}
                                />
                            )}
                        </div>
                    ) : (
                        /* Desktop/EBN View - DataTable */
                        <DataTable
                            columns={columns}
                            data={products}
                            theme={mode as Themes}
                            progressPending={isLoading}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            customStyles={getTableStyles(mode)}
                            highlightOnHover
                            striped
                            responsive
                            fixedHeader
                            selectableRows
                            selectableRowsHighlight
                            onSelectedRowsChange={handleRowSelected}
                            clearSelectedRows={toggleCleared}
                            fixedHeaderScrollHeight={isEBN ? "calc(100vh - 420px)" : "calc(100vh - 380px)"}
                            persistTableHead
                            noDataComponent={
                                <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        {searchTerm ? 'No matching products' : 'No products yet'}
                                    </h3>
                                    <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                        {searchTerm
                                            ? 'Try adjusting your search terms or clear the search to see all products.'
                                            : 'Get started by adding your first product.'}
                                    </p>
                                </div>
                            }
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ProductManagement;
