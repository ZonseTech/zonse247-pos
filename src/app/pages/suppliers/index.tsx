import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Truck, Settings2, X, Package, DollarSign } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';
import { HiOutlineFilter } from 'react-icons/hi';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext, ComponentLoader } from '../../components';
import { useSuppliers } from '../../hooks/useSuppliers';
import { getSupplierTableColumns } from './partials/SupplierTableColumns';
import { SupplierMobileList } from './partials/SupplierMobileCard';
import SupplierSummaryCards, { SupplierSummaryCard } from './partials/SupplierSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import SearchBar from '../../components/SearchBar';

const SupplierManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<Supplier[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        suppliers,
        isLoading,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deleteSupplier,
    } = useSuppliers();

    const hasActiveFilters = useMemo(() => {
        return !!searchTerm;
    }, [searchTerm]);

    // Calculate summary stats
    const summaryCards: SupplierSummaryCard[] = useMemo(() => {
        const allSuppliers = suppliers || [];
        const activeCount = allSuppliers.filter(s => s.isActive).length;
        const inactiveCount = allSuppliers.filter(s => !s.isActive).length;
        const totalOrders = allSuppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0);

        return [
            {
                title: 'Total Suppliers',
                value: totalRows,
                icon: 'total',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                textColor: 'text-blue-600 dark:text-blue-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-600 dark:text-emerald-400',
            },
            {
                title: 'Inactive',
                value: inactiveCount,
                icon: 'inactive',
                bgColor: 'bg-gray-50 dark:bg-gray-700/50',
                iconBgColor: 'bg-gray-100 dark:bg-gray-600',
                textColor: 'text-gray-600 dark:text-gray-400',
            },
            {
                title: 'Total Orders',
                value: totalOrders,
                icon: 'orders',
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-600 dark:text-amber-400',
            },
        ];
    }, [suppliers, totalRows]);

    const handleAddSupplier = useCallback(() => {
        navigate(ROUTES.SUPPLIER_FORM);
    }, [navigate]);

    const handleEdit = useCallback((supplierId: string) => {
        navigate(ROUTES.SUPPLIER_FORM, { state: { supplierId } });
    }, [navigate]);

    const handleDelete = useCallback((supplierId: string) => {
        Confirm.show(
            'Delete Supplier',
            'Are you sure you want to delete this supplier? This action cannot be undone.',
            'Yes, Delete',
            'Cancel',
            async () => {
                try {
                    await deleteSupplier(supplierId);
                    Notify.success('Supplier deleted successfully');
                } catch (error) {
                    Notify.failure('Failed to delete supplier');
                }
            },
            undefined,
            {
                okButtonBackground: '#ef4444',
                titleColor: '#ef4444',
            }
        );
    }, [deleteSupplier]);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
    }, [setSearchTerm]);

    const handleRowSelected = useCallback((state: { selectedRows: Supplier[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setPage(page);
    }, [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, page: number) => {
        setPerPage(newPerPage);
        setPage(page);
    }, [setPerPage, setPage]);

    const columns = getSupplierTableColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    icon={<Truck className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />}
                    title="Suppliers"
                    description="Manage your suppliers for purchase orders"
                    action={
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search suppliers by name, code, or contact..."
                            />

                            {selectedRows.length > 0 && !isMobile && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
                            )}

                            {hasActiveFilters && (
                                <button
                                    onClick={handleClearFilters}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 border border-red-200 dark:border-red-700"
                                >
                                    <HiOutlineFilter className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            )}

                            <Button
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={handleAddSupplier}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5"
                                theme="primary">
                                {!isMobile && <span className='hidden md:block'>
                                    Add Supplier
                                </span>}
                            </Button>
                        </div>
                    }
                />

                {/* Main Content Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

                    {/* Summary Cards */}
                    <SupplierSummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />

                    {/* Mobile View - Card List */}
                    {isMobile ? (
                        <div className="overflow-hidden">
                            {isLoading ? (
                                <SupplierMobileList
                                    suppliers={[]}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isLoading={true}
                                />
                            ) : suppliers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                        <Truck className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 text-center">
                                        {searchTerm ? 'No matching suppliers' : 'No suppliers yet'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm text-sm">
                                        {searchTerm
                                            ? "Try adjusting your search to find suppliers."
                                            : "Add your first supplier to get started."
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
                                    <SupplierMobileList
                                        suppliers={suppliers}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isLoading={false}
                                    />

                                    {/* Mobile Pagination */}
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                            {totalRows} total
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setPage(Math.max(1, page - 1))}
                                                disabled={page <= 1}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <HiOutlineChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {page} / {Math.ceil(totalRows / perPage) || 1}
                                            </span>
                                            <button
                                                onClick={() => setPage(Math.min(Math.ceil(totalRows / perPage), page + 1))}
                                                disabled={page >= Math.ceil(totalRows / perPage)}
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
                                data={suppliers}
                                theme={mode as Themes}
                                progressPending={isLoading}
                                progressComponent={<ComponentLoader loading={isLoading} />}
                                pagination
                                paginationServer
                                paginationTotalRows={totalRows}
                                paginationPerPage={perPage}
                                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
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
                                fixedHeaderScrollHeight="calc(100vh - 420px)"
                                persistTableHead
                                noDataComponent={
                                    <div className="flex flex-col items-center justify-center py-12 dark:bg-gray-800 flex-1">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                            <Truck className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {searchTerm ? 'No matching suppliers' : 'No suppliers yet'}
                                        </h3>
                                        <p className="mt-2 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
                                            {searchTerm
                                                ? 'Try adjusting your search terms or clear the search to see all suppliers.'
                                                : 'Get started by adding your first supplier.'
                                            }
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default SupplierManagement;
