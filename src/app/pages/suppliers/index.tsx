import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Truck, Settings2, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { HiOutlinePlus } from 'react-icons/hi2';
import { getTableStyles } from '../../utils/table-styles';
import { Button, ZonseThemeContext } from '../../components';
import { useSuppliers } from '../../hooks/useSuppliers';
import { SearchBar } from './partials/SearchBar';
import { getSupplierTableColumns } from './partials/SupplierTableColumns';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

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
                    icon={<Truck className="w-8 h-8 text-blue-600" />}
                    title="Suppliers"
                    description="Manage your suppliers for purchase orders"
                    action={
                        <Button
                            icon={HiOutlinePlus}
                            layout={isMobile ? 'outline' : 'primary'}
                            onClick={handleAddSupplier}
                            theme="primary">
                            {!isMobile && <span className='hidden md:block'>
                                Add Supplier
                            </span>}
                        </Button>
                    }
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <SearchBar
                                searchTerm={searchTerm}
                                onSearch={setSearchTerm}
                                placeholder="Search suppliers..."
                            />

                            {selectedRows.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        {selectedRows.length} selected
                                    </span>
                                </div>
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
                    </div>
                </PageHeader>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <DataTable
                        columns={columns}
                        data={suppliers}
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
            </div>
        </AppLayout>
    );
};

export default SupplierManagement;
