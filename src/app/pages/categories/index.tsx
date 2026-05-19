import { Confirm } from 'notiflix';
import { FolderOpen, Plus, Search } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useCategories } from '../../hooks/useCategories';
import { Fragment, FunctionComponent, useCallback, useContext, useMemo, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import MobilePageHeader from '../../components/page/MobilePageHeader';
import TableSkeleton from '../../components/skeleton/TableSkeleton';
import TableEmptyState from '../../components/TableEmptyState';
import { ZonseThemeContext } from '../../components';
import { Button, Box, Flex } from '@radix-ui/themes';
import { getCategoryColumns } from './partials/CategoryTableColumns';
import CreateCategoryModal from './CreateCategoryModal';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { useIsInsideHub } from '../../context/HubContext';
import CategoriesMobileView from './partials/CategoriesMobileView';
import CategorySummaryCards, { type CategorySummaryCard } from './partials/CategorySummaryCards';

const CategoriesManager: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const isInsideHub = useIsInsideHub();
    const { mode } = useContext(ZonseThemeContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const {
        categories,
        isLoading,
        searchTerm,
        setSearchTerm,
        totalRows,
        page,
        perPage,
        setPage,
        setPerPage,
        getPaginatedData,
        deleteCategory,
        loadCategories,
    } = useCategories();

    const handleEdit = useCallback((category: Category) => {
        setEditingCategory(category);
        setShowCreateModal(true);
    }, []);

    const handleDelete = useCallback((categoryId: string, categoryName: string) => {
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
    }, [deleteCategory]);

    const handleModalClose = useCallback(() => {
        setShowCreateModal(false);
        setEditingCategory(null);
    }, []);

    const handleModalSuccess = useCallback(async () => {
        await loadCategories();
        handleModalClose();
    }, [loadCategories, handleModalClose]);

    const handleAddCategory = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleClearFilters = useCallback(() => {
        setSearchTerm('');
    }, [setSearchTerm]);

    const hasActiveFilters = !!searchTerm;

    const columns = getCategoryColumns(handleEdit, handleDelete);

    const summaryCards: CategorySummaryCard[] = useMemo(() => [
        {
            title: 'Total Categories',
            value: totalRows,
            displayValue: totalRows.toLocaleString(),
            icon: 'total',
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-500 dark:text-sky-400',
        },
        {
            title: 'Active',
            value: categories.filter(c => c.itemCount > 0).length,
            displayValue: categories.filter(c => c.itemCount > 0).length.toLocaleString(),
            icon: 'active',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
        {
            title: 'Empty',
            value: categories.filter(c => !c.itemCount || c.itemCount === 0).length,
            displayValue: categories.filter(c => !c.itemCount || c.itemCount === 0).length.toLocaleString(),
            icon: 'empty',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-500 dark:text-amber-400',
        },
    ], [totalRows, categories]);

    const Wrapper = isInsideHub ? Fragment : AppLayout;

    return (
        <Wrapper>
            {/* Header */}
            {!isInsideHub && (
                isMobile ? (
                    <MobilePageHeader
                        title="Categories"
                        showLeftButton={true}
                    />
                ) : (
                    <PageHeader
                        title="Categories"
                        description="Manage your product categories"
                        icon={<FolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500 dark:text-sky-400" />}
                        action={
                            <Flex align="center" gap="3">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                                <Button size="2" onClick={handleAddCategory}>
                                    <Plus className="w-4 h-4" />
                                    Add Category
                                </Button>
                            </Flex>
                        }
                    />
                )
            )}

            <Box className="sm:rounded-lg shadow-sm border-y sm:border border-gray-200 dark:border-gray-700 sm:overflow-clip -mx-2 sm:mx-0">
                {/* Mobile: search bar inside the card */}
                {isMobile && (
                    <Box px="3" pt="3" pb="1">
                        <SearchBar
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </Box>
                )}

                <Box px={{ initial: '2', sm: '4' }}>
                    <CategorySummaryCards
                        cards={summaryCards}
                        isLoading={isLoading}
                    />
                </Box>

                {isMobile ? (
                    <CategoriesMobileView
                        data={getPaginatedData()}
                        isLoading={isLoading}
                        hasActiveFilters={hasActiveFilters}
                        page={page}
                        totalRows={totalRows}
                        perPage={perPage}
                        onPageChange={setPage}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onClearFilters={handleClearFilters}
                        onAddCategory={handleAddCategory}
                    />
                ) : (
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
                            onChangeRowsPerPage={(newPerPage, newPage) => {
                                setPage(newPage);
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
                                            <Button size="2" onClick={handleAddCategory}>
                                                <Plus className="w-4 h-4" />
                                                Create Category
                                            </Button>
                                        ) : undefined
                                    }
                                />
                            }
                        />
                    </Box>
                )}
            </Box>

            {/* Mobile: floating add button */}
            {isMobile && (
                <button
                    onClick={handleAddCategory}
                    className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-sky-500 text-white shadow-lg
                             flex items-center justify-center active:scale-95 transition-transform
                             hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:focus:ring-sky-900"
                    aria-label="Add category"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            <CreateCategoryModal
                category={editingCategory || undefined}
                isOpen={showCreateModal || !!editingCategory}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                showAddButton={true}
                categoriesCount={categories.length}
            />
        </Wrapper>
    );
};

export default CategoriesManager;