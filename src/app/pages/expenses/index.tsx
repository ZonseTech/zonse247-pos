import { FunctionComponent, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Receipt, Plus, X, Settings2 } from 'lucide-react';
import DataTable, { type Themes } from 'react-data-table-component';
import { Box, Flex, Select, Button, Tooltip } from '@radix-ui/themes';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { SearchBar } from '../../components/SearchBar';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext } from '../../components';
import { formatCurrency } from '../../utils';
import { useExpenses } from '../../hooks/useExpenses';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';
import { useExpenseSummary } from '../../hooks/useExpenseSummary';
import { getExpenseTableColumns } from './partials/ExpenseTableColumns';
import { ExpenseStatusFilter } from './partials/ExpenseStatusFilter';
import ExpenseSummaryCards, { type ExpenseSummaryCard } from './partials/ExpenseSummaryCards';
import ExpenseModal from './ExpenseModal';
import { ROUTES } from '../../utils/constants';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { Confirm } from 'notiflix';

const ExpenseManagement: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const { mode } = useContext(ZonseThemeContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

    const {
        expenses,
        isLoading,
        searchTerm,
        debouncedTerm,
        setSearchTerm,
        clearSearch,
        page,
        setPage,
        perPage,
        setPerPage,
        totalRows,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,
        loadExpenses,
        approveExpense,
        rejectExpense,
        voidExpense,
    } = useExpenses();

    const { categories } = useExpenseCategories();

    const { summary, isLoadingSummary, loadSummary } = useExpenseSummary({
        searchTerm: debouncedTerm,
        statusFilter,
        categoryFilter,
    });

    const hasActiveFilters = useMemo(
        () => !!searchTerm || !!statusFilter || !!categoryFilter,
        [searchTerm, statusFilter, categoryFilter],
    );

    const summaryCards: ExpenseSummaryCard[] = useMemo(() => [
        {
            title: 'Total',
            count: summary.totalCount,
            amount: summary.totalAmount,
            countLabel: 'records',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-500 dark:text-sky-400',
        },
        {
            title: 'Awaiting Approval',
            count: summary.pendingApprovalCount,
            amount: summary.pendingApprovalAmount,
            countLabel: 'not yet approved',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            iconBgColor: 'bg-orange-100 dark:bg-orange-900/40',
            textColor: 'text-orange-500 dark:text-orange-400',
        },
        {
            title: 'Rejected',
            count: summary.rejectedCount,
            amount: summary.rejectedAmount,
            countLabel: 'rejected',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            iconBgColor: 'bg-red-100 dark:bg-red-900/40',
            textColor: 'text-red-500 dark:text-red-400',
        },
        {
            title: 'Approved',
            count: summary.approvedCount,
            amount: summary.approvedAmount,
            countLabel: 'approved',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
    ], [summary]);

    const handleAdd = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleCreateModalClose = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        setShowCreateModal(false);
        loadExpenses();
        loadSummary();
    }, [loadExpenses, loadSummary]);

    const handleView = useCallback((expense: Expense) => {
        setViewingExpense(expense);
    }, []);

    const handleViewModalClose = useCallback(() => {
        setViewingExpense(null);
    }, []);

    const handleViewModalSuccess = useCallback(() => {
        setViewingExpense(null);
        loadExpenses();
        loadSummary();
    }, [loadExpenses, loadSummary]);

    const handleManageCategories = useCallback(() => {
        navigate(ROUTES.EXPENSE_CATEGORIES);
    }, [navigate]);

    const handleApprove = useCallback((expense: Expense) => {
        Confirm.show(
            'Approve Expense',
            `Approve ${expense.expenseNumber} for ${formatCurrency(expense.amount, true)}?`,
            'Yes, Approve',
            'Cancel',
            async () => {
                await approveExpense(expense.id);
            },
        );
    }, [approveExpense]);

    const handleReject = useCallback((expense: Expense) => {
        Confirm.show(
            'Reject Expense',
            `Are you sure you want to reject ${expense.expenseNumber}?`,
            'Yes, Reject',
            'Cancel',
            async () => {
                await rejectExpense(expense.id, 'Rejected from list');
            },
        );
    }, [rejectExpense]);

    const handleVoid = useCallback((expense: Expense) => {
        Confirm.show(
            'Void Expense',
            `Are you sure you want to void ${expense.expenseNumber}? This cannot be undone.`,
            'Yes, Void',
            'Cancel',
            async () => {
                await voidExpense(expense.id, 'Voided from list');
            },
        );
    }, [voidExpense]);

    const handleClearFilters = useCallback(() => {
        clearSearch();
        setStatusFilter('');
        setCategoryFilter('');
        setPage(1);
    }, [clearSearch, setStatusFilter, setCategoryFilter, setPage]);

    const handleStatusChange = useCallback((status: ExpenseStatusType | '') => {
        setStatusFilter(status);
        setPage(1);
    }, [setStatusFilter, setPage]);

    const handleCategoryChange = useCallback((categoryId: string) => {
        setCategoryFilter(categoryId === 'all' ? '' : categoryId);
        setPage(1);
    }, [setCategoryFilter, setPage]);

    const handlePageChange = useCallback((p: number) => setPage(p), [setPage]);

    const handlePerRowsChange = useCallback((newPerPage: number, p: number) => {
        setPerPage(newPerPage);
        setPage(p);
    }, [setPerPage, setPage]);

    const columns = getExpenseTableColumns({
        onView: handleView,
        onApprove: handleApprove,
        onReject: handleReject,
        onVoid: handleVoid,
    });

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={<Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />}
                    title="Expenses"
                    description="Record and approve business expenses"
                    action={
                        <Flex align="center" gap="2">
                            <Button variant="outline" size="2" onClick={handleManageCategories}>
                                <Settings2 className="w-4 h-4" />
                                <span className="hidden md:inline">Categories</span>
                            </Button>
                            <Button size="2" onClick={handleAdd}>
                                <Plus className="w-4 h-4" />
                                <span className="hidden md:inline">Record Expense</span>
                            </Button>
                        </Flex>
                    }
                />

                <Box className="rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Flex
                        align="center"
                        justify="between"
                        wrap="wrap"
                        gap="3"
                        px="4"
                        py="3"
                        className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                    >
                        <SearchBar
                            placeholder="Search by expense #, category, supplier, reference, notes..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                            className="flex-1 min-w-[220px] max-w-sm"
                        />

                        <Flex align="center" gap="2">
                            <Select.Root
                                value={categoryFilter || 'all'}
                                onValueChange={handleCategoryChange}
                            >
                                <Select.Trigger
                                    variant="surface"
                                    placeholder="All Categories"
                                    className="w-full sm:w-44"
                                />
                                <Select.Content position="popper">
                                    <Select.Item value="all">All Categories</Select.Item>
                                    {categories.map((c) => (
                                        <Select.Item key={c.categoryId} value={c.categoryId}>
                                            {c.name}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>

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
                        <ExpenseStatusFilter
                            selectedStatus={statusFilter}
                            onChange={handleStatusChange}
                        />
                    </Flex>

                    <Box px="4">
                        <ExpenseSummaryCards cards={summaryCards} isLoading={isLoadingSummary} />
                    </Box>

                    <Box className="overflow-hidden">
                        <DataTable
                            columns={columns}
                            data={expenses}
                            theme={mode as Themes}
                            progressPending={isLoading}
                            progressComponent={<TableSkeleton rows={perPage > 10 ? 10 : perPage} columns={6} showCheckbox={false} showActions />}
                            pagination
                            paginationServer
                            paginationTotalRows={totalRows}
                            paginationPerPage={perPage}
                            paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                            onChangeRowsPerPage={handlePerRowsChange}
                            onChangePage={handlePageChange}
                            onRowClicked={handleView}
                            customStyles={getTableStyles(mode)}
                            pointerOnHover
                            highlightOnHover
                            striped
                            responsive={!isMobile}
                            persistTableHead
                            noDataComponent={
                                <TableEmptyState
                                    icon={<Receipt />}
                                    title={hasActiveFilters ? 'No matching expenses' : 'No expenses yet'}
                                    description={
                                        hasActiveFilters
                                            ? 'Try adjusting your search or filters to find what you’re looking for.'
                                            : 'Record an expense to start tracking business spending.'
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
                    </Box>
                </Box>
            </Box>

            <ExpenseModal
                isOpen={showCreateModal}
                onClose={handleCreateModalClose}
                onSuccess={handleCreateSuccess}
            />

            <ExpenseModal
                isOpen={!!viewingExpense}
                onClose={handleViewModalClose}
                onSuccess={handleViewModalSuccess}
                expense={viewingExpense}
            />
        </AppLayout>
    );
};

export default ExpenseManagement;
