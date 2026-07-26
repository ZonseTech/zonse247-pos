import { FunctionComponent, useCallback, useContext, useState } from 'react';
import { Receipt, Pencil, Trash2 } from 'lucide-react';
import DataTable, { type TableColumn, type Themes } from 'react-data-table-component';
import { Box, Flex, Text, Badge, IconButton, Tooltip } from '@radix-ui/themes';
import { Confirm } from 'notiflix';
import AppLayout from '../../layouts/AppLayout';
import PageHeader from '../../components/page/PageHeader';
import { getTableStyles } from '../../utils/table-styles';
import { ZonseThemeContext, ComponentLoader } from '../../components';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';
import CreateExpenseCategoryModal from './CreateExpenseCategoryModal';

const ExpenseCategoryManagement: FunctionComponent = () => {
    const { mode } = useContext(ZonseThemeContext);
    const { categories, isLoading, deleteCategory } = useExpenseCategories();
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

    const handleEdit = useCallback((category: ExpenseCategory) => {
        setEditingCategory(category);
    }, []);

    const handleDelete = useCallback((category: ExpenseCategory) => {
        Confirm.show(
            'Delete Category',
            `Are you sure you want to delete "${category.name}"? This can't be undone, and only works if no expenses use this category.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteCategory(category.categoryId);
            },
        );
    }, [deleteCategory]);

    const columns: TableColumn<ExpenseCategory>[] = [
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
            cell: (row) => (
                <Text size="2" weight="medium">
                    {row.name}
                </Text>
            ),
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => (row.isActive ? 'Active' : 'Inactive'),
            sortable: true,
            cell: (row) => (
                <Badge variant="soft" color={row.isActive ? 'green' : 'gray'} radius="full" size="1">
                    {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
            minWidth: '100px',
        },
        {
            name: 'Sort Order',
            selector: (row) => row.sortOrder ?? 0,
            sortable: true,
            cell: (row) => <Text size="2" color="gray">{row.sortOrder ?? 0}</Text>,
            minWidth: '100px',
        },
        {
            name: 'Actions',
            cell: (row) => (
                <Flex align="center" gap="1">
                    <Tooltip content="Edit">
                        <IconButton
                            variant="ghost"
                            color="gray"
                            size="1"
                            onClick={() => handleEdit(row)}
                            aria-label="Edit category"
                        >
                            <Pencil className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete">
                        <IconButton
                            variant="ghost"
                            color="red"
                            size="1"
                            onClick={() => handleDelete(row)}
                            aria-label="Delete category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </IconButton>
                    </Tooltip>
                </Flex>
            ),
            minWidth: '100px',
            right: true,
        },
    ];

    return (
        <AppLayout>
            <Box className="max-w-full">
                <PageHeader
                    icon={<Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500 dark:text-emerald-400" />}
                    title="Expense Categories"
                    description="Manage the categories used when recording expenses"
                    showBackButton
                    action={<CreateExpenseCategoryModal />}
                />

                <Box className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={categories}
                        theme={mode as Themes}
                        progressPending={isLoading}
                        progressComponent={<ComponentLoader loading={isLoading} />}
                        customStyles={getTableStyles(mode)}
                        highlightOnHover
                        striped
                        responsive
                        persistTableHead
                        noDataComponent={
                            <Flex direction="column" align="center" justify="center" py="9" className="dark:bg-gray-800 flex-1">
                                <Flex align="center" justify="center" className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700">
                                    <Receipt className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                </Flex>
                                <Text as="p" size="4" weight="bold" className="mt-4 text-gray-900 dark:text-gray-100">
                                    No expense categories yet
                                </Text>
                                <Text as="p" size="2" color="gray" align="center" className="mt-2 max-w-sm">
                                    Add a category like Rent, Utilities, or Transport to start recording expenses.
                                </Text>
                            </Flex>
                        }
                    />
                </Box>

                <CreateExpenseCategoryModal
                    category={editingCategory ?? undefined}
                    showAddButton={false}
                    isOpen={!!editingCategory}
                    onClose={() => setEditingCategory(null)}
                    onSuccess={() => setEditingCategory(null)}
                />
            </Box>
        </AppLayout>
    );
};

export default ExpenseCategoryManagement;
