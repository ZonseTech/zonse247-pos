import { FunctionComponent, useCallback, useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { RotateCcw, Settings2, Plus, FilterX, FileEdit, Truck, CheckCircle2, XCircle } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Box, Flex, Text, Select, Button, IconButton } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import MobilePagination from '../../components/MobilePagination';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader, SummaryCards } from '../../components';
import type { SummaryCardItem } from '../../components';
import { useSupplierReturns } from '../../hooks/useSupplierReturns';
import { getSupplierReturnTableColumns } from './partials/SupplierReturnTableColumns';
import { SupplierReturnMobileList } from './partials/SupplierReturnMobileCard';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

const SupplierReturnManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);

    const [selectedRows, setSelectedRows] = useState<SupplierReturnWithItems[]>([]);
    const [toggleCleared, setToggleCleared] = useState(false);

    const {
        returns,
        isLoading,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        approveReturn,
        shipReturn,
        completeReturn,
        cancelReturn,
        deleteReturn,
    } = useSupplierReturns();

    const hasActiveFilters = useMemo(() => !!statusFilter, [statusFilter]);

    const summaryCards: SummaryCardItem[] = useMemo(() => {
        const drafts = returns.filter(r => r.status === 'DRAFT').length;
        const shipped = returns.filter(r => r.status === 'SHIPPED').length;
        const completed = returns.filter(r => r.status === 'COMPLETED').length;
        const totalValue = returns
            .filter(r => r.status !== 'CANCELLED')
            .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        return [
            {
                title: 'Total Returns',
                value: totalRows,
                icon: <RotateCcw className="w-5 h-5" />,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Drafts',
                value: drafts,
                icon: <FileEdit className="w-5 h-5" />,
                bgColor: 'bg-gray-50 dark:bg-gray-800/40',
                iconBgColor: 'bg-gray-100 dark:bg-gray-700',
                textColor: 'text-gray-500 dark:text-gray-400',
            },
            {
                title: 'In Transit',
                value: shipped,
                icon: <Truck className="w-5 h-5" />,
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                iconBgColor: 'bg-purple-100 dark:bg-purple-900/40',
                textColor: 'text-purple-500 dark:text-purple-400',
            },
            {
                title: 'Completed',
                value: completed,
                icon: <CheckCircle2 className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Total Value',
                value: formatCurrency(totalValue),
                icon: <XCircle className="w-5 h-5" />,
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
                textColor: 'text-indigo-500 dark:text-indigo-400',
            },
        ];
    }, [returns, totalRows]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAdd = useCallback(() => {
        navigate(ROUTES.SUPPLIER_RETURN_FORM);
    }, [navigate]);

    const handleView = useCallback((r: SupplierReturnWithItems) => {
        navigate(ROUTES.SUPPLIER_RETURN_FORM, { state: { returnId: r.id } });
    }, [navigate]);

    const handleApprove = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Approve Return',
            `Approve return ${r.returnNumber}? This moves it to Approved status.`,
            'Yes, Approve',
            'Cancel',
            async () => { await approveReturn(r.id); },
        );
    }, [approveReturn]);

    const handleShip = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Ship Return',
            `Mark return ${r.returnNumber} as shipped? Goods are in transit to supplier.`,
            'Yes, Ship',
            'Cancel',
            async () => { await shipReturn(r.id); },
        );
    }, [shipReturn]);

    const handleComplete = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Complete Return',
            `Complete return ${r.returnNumber}? This will remove inventory and generate a credit note.`,
            'Yes, Complete',
            'Cancel',
            async () => { await completeReturn(r.id); },
        );
    }, [completeReturn]);

    const handleCancel = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Cancel Return',
            `Cancel return ${r.returnNumber}? This cannot be undone.`,
            'Yes, Cancel',
            'No',
            async () => { await cancelReturn(r.id); },
        );
    }, [cancelReturn]);

    const handleDelete = useCallback((r: SupplierReturnWithItems) => {
        Confirm.show(
            'Delete Return',
            `Permanently delete draft return ${r.returnNumber}?`,
            'Yes, Delete',
            'Cancel',
            async () => { await deleteReturn(r.id); },
        );
    }, [deleteReturn]);

    const handleClearFilters = useCallback(() => {
        setStatusFilter('');
    }, [setStatusFilter]);

    const handleRowSelected = useCallback((state: { selectedRows: SupplierReturnWithItems[] }) => {
        setSelectedRows(state.selectedRows);
    }, []);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getSupplierReturnTableColumns({
        onView: handleView,
        onApprove: handleApprove,
        onShip: handleShip,
        onComplete: handleComplete,
        onCancel: handleCancel,
        onDelete: handleDelete,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={<RotateCcw className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 dark:text-orange-400" />}
                    title="Supplier Returns"
                    description="Manage returns to suppliers and track credit notes"
                    action={
                        <Flex direction={{ initial: 'column', sm: 'row' }} gap={{ initial: '2', sm: '3' }} align="center">
                            <Select.Root
                                value={statusFilter || 'all'}
                                onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val as SupplierReturnStatusType)}
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Status"
                                    className="w-full sm:w-48"
                                />
                                <Select.Content position="popper">
                                    {STATUS_OPTIONS.map((opt) => (
                                        <Select.Item key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

                            {selectedRows.length > 0 && !isMobile && (
                                <Flex align="center" gap="2" px="4" py="2" className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                                    <Settings2 className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                    <Text size="2" weight="medium" className="text-orange-900 dark:text-orange-100">
                                        {selectedRows.length} selected
                                    </Text>
                                </Flex>
                            )}

                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    color="red"
                                    size="2"
                                    onClick={handleClearFilters}
                                >
                                    <FilterX className="w-4 h-4" />
                                    Clear
                                </Button>
                            )}

                            {isMobile ? (
                                <IconButton
                                    variant="outline"
                                    color="cyan"
                                    size="2"
                                    onClick={handleAdd}
                                    aria-label="New Return"
                                >
                                    <Plus className="w-4 h-4" />
                                </IconButton>
                            ) : (
                                <Button size="2" onClick={handleAdd}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden md:inline">New Return</span>
                                </Button>
                            )}
                        </Flex>
                    }
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <SummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                        variant="embedded"
                        gridClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
                    />

                    {isMobile ? (
                        <Box className="overflow-hidden">
                            {isLoading ? (
                                <SupplierReturnMobileList
                                    returns={[]}
                                    onView={handleView}
                                    onApprove={handleApprove}
                                    onShip={handleShip}
                                    onComplete={handleComplete}
                                    onCancel={handleCancel}
                                    onDelete={handleDelete}
                                    isLoading={true}
                                />
                            ) : returns.length === 0 ? (
                                <Flex direction="column" align="center" justify="center" py="9" px="4">
                                    <Flex align="center" justify="center" className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                        <RotateCcw className="w-8 h-8 text-gray-400" />
                                    </Flex>
                                    <Text as="p" size="4" weight="medium" align="center" className="text-gray-900 dark:text-white mb-2">
                                        {hasActiveFilters ? 'No matching returns' : 'No returns yet'}
                                    </Text>
                                    <Text as="p" size="2" color="gray" align="center" className="max-w-sm">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters.'
                                            : 'Create a supplier return to start the return process.'}
                                    </Text>
                                    {hasActiveFilters && (
                                        <Button
                                            variant="ghost"
                                            color="cyan"
                                            size="2"
                                            mt="4"
                                            onClick={handleClearFilters}
                                        >
                                            Clear filters
                                        </Button>
                                    )}
                                </Flex>
                            ) : (
                                <>
                                    <SupplierReturnMobileList
                                        returns={returns}
                                        onView={handleView}
                                        onApprove={handleApprove}
                                        onShip={handleShip}
                                        onComplete={handleComplete}
                                        onCancel={handleCancel}
                                        onDelete={handleDelete}
                                        isLoading={false}
                                    />
                                    <MobilePagination page={page} totalRows={totalRows} perPage={perPage} onPageChange={setPage} />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Box className="overflow-hidden">
                            <DataTable
                                columns={columns}
                                data={returns}
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
                                selectableRows
                                selectableRowsHighlight
                                onSelectedRowsChange={handleRowSelected}
                                clearSelectedRows={toggleCleared}
                                persistTableHead
                                noDataComponent={
                                    <Flex direction="column" align="center" justify="center" py="9" className="dark:bg-gray-800 flex-1">
                                        <Flex align="center" justify="center" className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700">
                                            <RotateCcw className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                        </Flex>
                                        <Text as="p" size="4" weight="bold" className="mt-4 text-gray-900 dark:text-gray-100">
                                            {hasActiveFilters ? 'No matching returns' : 'No returns yet'}
                                        </Text>
                                        <Text as="p" size="2" color="gray" align="center" className="mt-2 max-w-sm">
                                            {hasActiveFilters
                                                ? 'Try adjusting your filters.'
                                                : 'Create a supplier return to start the return process.'}
                                        </Text>
                                    </Flex>
                                }
                            />
                        </Box>
                    )}
                </Box>
            </Box>
        </AppLayout>
    );
};

export default SupplierReturnManagement;
