import { FC, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Confirm, Notify } from 'notiflix';
import { Truck, Plus, X } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Button, Box, Flex, Tooltip } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { ZonseThemeContext } from '../../components';
import { SearchBar } from '../../components/SearchBar';
import MobileDateFilter from '../../components/reports/MobileDateFilter';
import { getTableStyles } from '../../utils/table-styles';
import { useSuppliers } from '../../hooks/useSuppliers';
import { getSupplierTableColumns } from './partials/SupplierTableColumns';
import { SupplierMobileList } from './partials/SupplierMobileCard';
import { SupplierStatusFilter } from './partials/SupplierStatusFilter';
import SupplierSummaryCards, { type SupplierSummaryCard } from './partials/SupplierSummaryCards';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';

const SupplierManagement: FC = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const {
        suppliers,
        isLoading,
        searchTerm,
        setSearchTerm,
        clearSearch,
        statusFilter,
        setStatusFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        deleteSupplier,
    } = useSuppliers();

    const totalPages = Math.ceil(totalRows / perPage);

    const hasActiveFilters = useMemo(
        () => !!searchTerm || !!statusFilter || !!startDate || !!endDate,
        [searchTerm, statusFilter, startDate, endDate],
    );

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
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Active',
                value: activeCount,
                icon: 'active',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
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
                textColor: 'text-amber-500 dark:text-amber-400',
            },
        ];
    }, [suppliers, totalRows]);

    const handleAddSupplier = useCallback(() => {
        navigate(ROUTES.SUPPLIER_FORM);
    }, [navigate]);

    const handleView = useCallback((supplierId: string) => {
        navigate(ROUTES.SUPPLIER_DETAILS.replace(':supplierId', supplierId));
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
        clearSearch();
        setStatusFilter('');
        setStartDate('');
        setEndDate('');
    }, [clearSearch, setStatusFilter, setStartDate, setEndDate]);

    const handleStatusChange = useCallback(
        (status: SupplierStatus | '') => {
            setStatusFilter(status);
            setPage(1);
        },
        [setStatusFilter, setPage],
    );

    const handleDateChange = useCallback(
        (start: Date | null, end: Date | null) => {
            setStartDate(start ? start.toISOString().split('T')[0] : '');
            setEndDate(end ? end.toISOString().split('T')[0] : '');
            setPage(1);
        },
        [setStartDate, setEndDate, setPage],
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, newPage: number) => {
        setPerPage(newPerPage);
        setPage(newPage);
    }, [setPerPage, setPage]);

    const columns = getSupplierTableColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <PageHeader
                title="Suppliers"
                description="Manage your suppliers for purchase orders"
                icon={<Truck className="w-8 h-8 text-sky-500 dark:text-sky-400" />}
                action={
                    <Button size="2" onClick={handleAddSupplier}>
                        <Plus className="w-4 h-4" />
                        Add Supplier
                    </Button>
                }
                showBackButton={false}
            />

            <Box className="rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Flex
                    align="center"
                    justify="between"
                    gap="3"
                    px="4"
                    py="3"
                    className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                >
                    <SearchBar
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1 max-w-xs"
                    />

                    <Flex align="center" gap="2">
                        <MobileDateFilter
                            mode="single"
                            startDate={startDate ? new Date(startDate) : null}
                            endDate={endDate ? new Date(endDate) : null}
                            onChange={handleDateChange}
                            align="right"
                        />

                        {hasActiveFilters && (
                            <Tooltip content="Clear all filters">
                                <Button variant="soft" color="red" size="2" onClick={handleClearFilters} aria-label="Clear all filters">
                                    <X className="w-4 h-4" />
                                    Clear
                                </Button>
                            </Tooltip>
                        )}
                    </Flex>
                </Flex>

                <Flex direction="column" gap="2" px="4" py="3" className="border-b border-gray-200 dark:border-gray-700">
                    <SupplierStatusFilter
                        selectedStatus={statusFilter}
                        onChange={handleStatusChange}
                    />
                </Flex>

                <Box px="4">
                    <SupplierSummaryCards cards={summaryCards} isLoading={isLoading} />
                </Box>

                {isMobile ? (
                    <div className="overflow-hidden">
                        {isLoading ? (
                            <SupplierMobileList
                                suppliers={[]}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                isLoading
                            />
                        ) : suppliers.length === 0 ? (
                            <TableEmptyState
                                icon={<Truck />}
                                title={searchTerm ? 'No matching suppliers' : 'No suppliers yet'}
                                description={
                                    searchTerm
                                        ? 'Try adjusting your search to find suppliers.'
                                        : 'Add your first supplier to get started.'
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={handleClearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <SupplierMobileList
                                    suppliers={suppliers}
                                    onView={handleView}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    isLoading={false}
                                />

                                <Flex
                                    align="center"
                                    justify="between"
                                    px="4"
                                    py="3"
                                    className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                >
                                    <span className="text-xs text-gray-600 dark:text-gray-400">
                                        Page {page} of {totalPages} ({totalRows} total)
                                    </span>
                                    <Flex align="center" gap="2">
                                        <Button
                                            variant="ghost"
                                            color="gray"
                                            size="1"
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page <= 1}
                                        >
                                            ‹
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            color="gray"
                                            size="1"
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page >= totalPages}
                                        >
                                            ›
                                        </Button>
                                    </Flex>
                                </Flex>
                            </>
                        )}
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={suppliers}
                        theme={mode as Themes}
                        customStyles={getTableStyles(mode)}
                        progressPending={isLoading}
                        progressComponent={<TableSkeleton rows={perPage} columns={6} showCheckbox={false} showActions />}
                        highlightOnHover
                        responsive
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        paginationPerPage={perPage}
                        paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        persistTableHead
                        noDataComponent={
                            <TableEmptyState
                                icon={<Truck />}
                                title={searchTerm ? 'No matching suppliers' : 'No suppliers yet'}
                                description={
                                    searchTerm
                                        ? 'Try adjusting your search terms or clear the search to see all suppliers.'
                                        : 'Get started by adding your first supplier.'
                                }
                                action={
                                    hasActiveFilters ? (
                                        <Button variant="ghost" size="2" onClick={handleClearFilters}>
                                            Clear filters
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                )}
            </Box>
        </AppLayout>
    );
};

export default SupplierManagement;
