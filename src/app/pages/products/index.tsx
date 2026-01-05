import { FunctionComponent, useCallback, useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Package, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, Select, ZonseThemeContext, DateRangeFilter } from '../../components';
import { useProducts } from '../../hooks/useProducts';
import { useProductSummary } from '../../hooks/useProductSummary';
import { useCategories } from '../../hooks/useCategories';
import { SearchBar } from './partials/SearchBar';
import { getProductTableColumns } from './partials/ProductTableColumns';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Filters from './partials/Filters';

const ProductManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
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

    const hasActiveFilters = useMemo(() => {
        return activeFilter !== 'all' || !!categoryFilter || !!statusFilter || !!searchTerm || !!startDate || !!endDate;
    }, [activeFilter, categoryFilter, statusFilter, searchTerm, startDate, endDate]);

    const handleAddProduct = useCallback(() => {
        navigate(ROUTES.PRODUCT_FORM);
    }, [navigate]);

    const handleEdit = useCallback((product: Product) => {
        navigate(ROUTES.PRODUCT_FORM, { state: { productId: product.productId } });
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

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Package className="w-8 h-8 text-blue-600" />}
                    title="Products"
                    description="Manage your product catalog with barcode support"
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={handleAddProduct}
                            theme="primary">
                            {!isMobile && <span className='hidden md:block'>
                                Add Product
                            </span>}
                        </Button>
                    }
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                placeholder="Search by name, SKU, or barcode..."
                            />

                            <Select
                                value={categoryFilter || ''}
                                onChange={(e) => setCategoryFilter(e.target.value)}
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
                                onChange={(dates) => {
                                    const [start, end] = dates;
                                    setStartDate(start ? start.toISOString().split('T')[0] : '');
                                    setEndDate(end ? end.toISOString().split('T')[0] : '');
                                }}
                            />

                            {selectedRows.length > 0 && (
                                <Button
                                    onClick={() => { }}
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
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                        fixedHeaderScrollHeight="calc(100vh - 380px)"
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
                                        : 'Get started by adding your first product.'
                                    }
                                </p>
                            </div>
                        }
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default ProductManagement;
