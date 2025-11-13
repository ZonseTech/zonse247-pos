import dayjs from 'dayjs';
import AppLayout from '../../layouts/AppLayout'
import relativeTime from 'dayjs/plugin/relativeTime'
import EditProductModal from './EditProductModal';
import Filters from './partials/Filters';
import CreateProductModal from './CreateProductModal';
import DataTable, { type Themes } from "react-data-table-component";
import { Input, Select, ZonseThemeContext } from '../../components';
import { HiOutlineSearch } from 'react-icons/hi';
import { FunctionComponent, useContext, useEffect } from 'react';
import { PackagePlusIcon } from 'lucide-react';
import { getProductColumns } from './config/tableColumns';
import { useProductManagement } from '../../hooks/useProductManagement';
import { useProductSummary } from '../../hooks/useProductSummary';
import { getTableStyles } from '../../utils/table-styles';

dayjs.extend(relativeTime);

const Products: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const {
        isLoading,
        data,
        totalRows,
        categories,
        searchTerm,
        selectedProduct,
        loadProducts,
        loadCategories,
        handleSearch,
        handleVoidProduct,
        handleEditProduct,
        handleFilterByCategory,
        handlePageChange,
        handlePerRowsChange,
        setActiveFilter,
        activeFilter,
        applyFilters
    } = useProductManagement();

    const { summaryData, loadSummary } = useProductSummary(setActiveFilter, loadProducts, applyFilters);
    const columns = getProductColumns(handleEditProduct, handleVoidProduct);

    const handleOnProductAdded = async () => {
        await Promise.all([loadSummary(), loadProducts()]);
    }

    const handleOnProductUpdateed = async () => {
        await Promise.all([loadSummary(), loadProducts()]);
    }

    useEffect(() => {
        loadSummary()
        loadCategories()
    }, [])

    return (
        <AppLayout>
            <div className="bg-white dark:bg-gray-800">
                <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200 flex-1 flex items-center space-x-2">
                            <CreateProductModal onProductAdded={handleOnProductAdded} />

                            <span>Products</span>
                        </h2>
                    </div>

                    <div className='flex flex-col lg:flex-row justify-end gap-3 pr-4'>
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <Select
                                onChange={(e) => handleFilterByCategory(parseInt(e.target.value))}
                                className="h-9 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full sm:w-48"
                            >
                                <option value={''} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                    Filter by Category
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
                            <div className="relative w-full sm:w-64">
                                <Input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        const cleanedValue = value.endsWith('$') ? value.slice(0, -1) : value;
                                        handleSearch(cleanedValue);
                                    }}
                                    className="rounded-md px-3 h-9 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <HiOutlineSearch
                                        className="h-5 w-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                                        onClick={() => applyFilters()}
                                        title="Clear search"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-full lg:w-auto">
                            <Filters
                                summaryData={summaryData}
                                activeFilter={activeFilter}
                                onClear={async () => {
                                    setActiveFilter('all');
                                    applyFilters({ filter: 'all', search: '', categoryId: undefined });
                                }}
                            />
                        </div>
                    </div>
                </div>

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
                    fixedHeaderScrollHeight="calc(100vh - 250px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full dark:bg-gray-800">
                                <PackagePlusIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {searchTerm ? 'No matching products' : 'No products yet'}
                            </h3>
                            <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                {searchTerm
                                    ? 'Try adjusting your search terms or clear the search to see all products.'
                                    : 'Get started by creating your first product.'
                                }
                            </p>
                        </div>
                    }
                />
                {selectedProduct && <EditProductModal
                    product={selectedProduct}
                    onProductUpdate={handleOnProductUpdateed}
                />}
            </div>
        </AppLayout >
    )
}

export default Products