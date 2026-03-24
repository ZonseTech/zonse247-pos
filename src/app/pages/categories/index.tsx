import { Confirm } from 'notiflix';
import { FolderOpen, LayoutGrid, List, Plus, Search } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useCategories } from '../../hooks/useCategories';
import { FunctionComponent, useContext, useMemo, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import SummaryCards, { type SummaryCardItem } from '../../components/stats/SummaryCards';
import { ZonseThemeContext } from '../../components';
import { Button, Box, Flex } from '@radix-ui/themes';
import { getCategoryColumns, getMobileCategoryColumns } from './partials/CategoryTableColumns';
import CreateCategoryModal from './CreateCategoryModal';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CategoriesManager: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const {
        categories,
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        setPage,
        setPerPage,
        getPaginatedData,
        deleteCategory,
        loadCategories,
    } = useCategories();

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setShowCreateModal(true);
    };

    const handleDelete = (categoryId: string, categoryName: string) => {
        Confirm.show(
            'Delete Category',
            `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`,
            'Yes, Delete',
            'Cancel',
            async () => {
                await deleteCategory(categoryId);
            },
            () => {
                // do nothing
            },
            {
                titleColor: '#ef4444',
                okButtonBackground: '#ef4444',
            }
        );
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setEditingCategory(null);
    };

    const handleModalSuccess = async () => {
        await loadCategories();
        handleModalClose();
    };

    const columns = isMobile
        ? getMobileCategoryColumns(handleEdit, handleDelete)
        : getCategoryColumns(handleEdit, handleDelete);

    const summaryCards: SummaryCardItem[] = useMemo(() => [
        {
            title: 'Total',
            value: totalRows,
            icon: <FolderOpen className="w-5 h-5" />,
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-500 dark:text-sky-400',
        },
        {
            title: 'Active',
            value: categories.filter(c => c.itemCount > 0).length,
            icon: <LayoutGrid className="w-5 h-5" />,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
        {
            title: 'Empty',
            value: categories.filter(c => !c.itemCount || c.itemCount === 0).length,
            icon: <List className="w-5 h-5" />,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-500 dark:text-amber-400',
        },
        {
            title: 'Showing',
            value: getPaginatedData().length,
            icon: <Search className="w-5 h-5" />,
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            iconBgColor: 'bg-purple-100 dark:bg-purple-900/40',
            textColor: 'text-purple-600 dark:text-purple-400',
        },
    ], [totalRows, categories, getPaginatedData]);

    return (
        <AppLayout>
            <PageHeader
                title="Categories"
                description="Manage your product categories"
                icon={<FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                action={
                    <Flex align="center" gap={{ initial: '2', sm: '3' }}>
                        {!isMobile && (
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        )}

                        <Button size="2" onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4" />
                            {!isMobile && 'Add Category'}
                        </Button>
                    </Flex>
                }
            >
                {isMobile && (
                    <Box px="4" pb="4">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </Box>
                )}
            </PageHeader>

            <Box className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

                <SummaryCards
                    cards={summaryCards}
                    isLoading={isLoading}
                    skeletonCount={4}
                    variant="embedded"
                />

                <Box className="overflow-hidden">
                    <DataTable
                        columns={columns}
                        data={getPaginatedData()}
                        theme={mode as string}
                        progressPending={isLoading}
                        progressComponent={<TableSkeleton rows={10} columns={4} />}
                        highlightOnHover
                        responsive
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={(newPerPage, page) => {
                            setPage(page);
                            setPerPage(newPerPage);
                        }}
                        onChangePage={setPage}
                        persistTableHead
                        customStyles={getTableStyles(mode)}
                        noDataComponent={
                            <TableEmptyState
                                icon={<FolderOpen />}
                                title={searchTerm ? 'No categories found' : 'No categories yet'}
                                description={
                                    searchTerm
                                        ? 'Try adjusting your search terms or clear the filter'
                                        : 'Get started by creating your first category to organize your products'
                                }
                                action={
                                    !searchTerm ? (
                                        <Button size="2" onClick={() => setShowCreateModal(true)}>
                                            <Plus className="w-4 h-4" />
                                            Create Category
                                        </Button>
                                    ) : undefined
                                }
                            />
                        }
                    />
                </Box>
            </Box>

            <CreateCategoryModal
                category={editingCategory || undefined}
                isOpen={showCreateModal || !!editingCategory}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                showAddButton={false}
                categoriesCount={categories.length}
            />
        </AppLayout>
    );
};

export default CategoriesManager;