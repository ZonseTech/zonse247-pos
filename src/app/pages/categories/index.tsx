import { Confirm } from 'notiflix';
import { FolderOpen } from 'lucide-react';
import AppLayout from '../../layouts/AppLayout';
import { HiOutlinePlus, HiOutlineFolderOpen } from 'react-icons/hi2';
import { SearchBar } from '../../components/SearchBar';
import DataTable from 'react-data-table-component';
import { useCategories } from '../../hooks/useCategories';
import { FunctionComponent, useContext, useState } from 'react';
import { getTableStyles } from '../../utils/table-styles';
import PageHeader from '../../components/page/PageHeader';
import { Button, ZonseThemeContext } from '../../components';
import { getCategoryColumns } from './partials/CategoryTableColumns';
import CreateCategoryModal from './CreateCategoryModal';
import { useIsMobile } from '../../hooks/useMediaQuery';

const CategoriesManager: FunctionComponent = () => {
    const isMobile = useIsMobile();
    const { mode } = useContext(ZonseThemeContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const {
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

    const columns = getCategoryColumns(handleEdit, handleDelete);

    return (
        <AppLayout>
            <div className="max-w-full">
                <PageHeader
                    title="Categories"
                    description="Manage your product categories"
                    icon={<HiOutlineFolderOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
                    action={
                        <div className='flex items-center justify-between gap-2'>
                            {
                                !isMobile && (
                                    <SearchBar
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                )
                            }

                            <Button
                                icon={HiOutlinePlus}
                                layout={isMobile ? 'outline' : 'primary'}
                                onClick={() => setShowCreateModal(true)}
                                theme="primary">
                                {!isMobile && <span className='hidden md:block'>
                                    Add Category
                                </span>}
                            </Button>
                        </div>
                    }
                >
                    {
                        isMobile && (
                            <div className='m-4 mt-0'>
                                <SearchBar
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )
                    }
                </PageHeader>

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
                    fixedHeaderScrollHeight="calc(100vh - 350px)"
                    customStyles={getTableStyles(mode)}
                    noDataComponent={
                        <div className="text-center py-8">
                            <FolderOpen className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm
                                    ? 'No categories found matching your search.'
                                    : 'No categories found.'}
                            </p>
                        </div>
                    }
                />

                <CreateCategoryModal
                    category={editingCategory || undefined}
                    isOpen={showCreateModal || !!editingCategory}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    showAddButton={false}
                />
            </div>
        </AppLayout>
    );
};

export default CategoriesManager;