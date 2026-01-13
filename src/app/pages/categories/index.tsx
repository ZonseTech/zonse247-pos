import { Confirm } from 'notiflix';
import { FolderOpen, LayoutGrid, List, Plus, Search } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineFolderOpen } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useCategories } from '../../hooks/useCategories';
import { FunctionComponent, useContext, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
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

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Categories"
                    description="Manage your product categories"
                    icon={<HiOutlineFolderOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />}
                    action={
                        <div className='flex items-center gap-2 sm:gap-3'>
                            {!isMobile && (
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            )}

                            <Button
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={() => setShowCreateModal(true)}
                                className="!px-3 sm:!px-4 !py-2 sm:!py-2.5 rounded-xl shadow-lg shadow-blue-500/20"
                                theme="primary">
                                {!isMobile && <span className='hidden md:block'>
                                    Add Category
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {isMobile && (
                        <div className='px-4 pb-4'>
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Stats Summary - Mobile Friendly */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 px-4 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Total</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{totalRows}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Active</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{categories.filter(c => c.itemCount > 0).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <List className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Empty</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{categories.filter(c => !c.itemCount || c.itemCount === 0).length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Showing</p>
                                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{getPaginatedData().length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mx-4 sm:mx-0">
                    <DataTable
                        columns={columns}
                        data={getPaginatedData()}
                        theme={mode as string}
                        progressPending={isLoading}
                        highlightOnHover
                        striped
                        responsive
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangeRowsPerPage={(newPerPage, page) => {
                            setPage(page);
                            setPerPage(newPerPage);
                        }}
                        onChangePage={setPage}
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 450px)"
                        customStyles={getTableStyles(mode)}
                        noDataComponent={
                            <div className="text-center py-12 sm:py-16 px-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {searchTerm ? 'No categories found' : 'No categories yet'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                    {searchTerm
                                        ? 'Try adjusting your search terms or clear the filter'
                                        : 'Get started by creating your first category to organize your products'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Category
                                    </button>
                                )}
                            </div>
                        }
                    />
                </div>

                <CreateCategoryModal
                    category={editingCategory || undefined}
                    isOpen={showCreateModal || !!editingCategory}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    showAddButton={false}
                    categoriesCount={categories.length}
                />
            </div>
        </AppLayout>
    );
};

export default CategoriesManager;