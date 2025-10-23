import { useState, useEffect, FunctionComponent, Fragment } from 'react';
import categoriesService from '../../services/category.service';
import { ErrorAlert } from './partials/ErrorAlert';
import { SearchAndFilters } from './partials/SearchAndFilters';
import { LoadingState } from './partials/LoadingState';
import { CategoriesGrid } from './partials/CategoriesGrid';
import { StatisticsPanel } from './partials/StatisticsPanel';
import { EmptyState } from './partials/EmptyState';
import CreateCategoryModal from './CreateCategoryModal';
import { useProductManagement } from '../../hooks/useProductManagement';
import { Button } from '../../components';
import { HiOutlinePlus } from 'react-icons/hi';
import PageHeader from '../../components/page/PageHeader';

const CategoriesManager: FunctionComponent = () => {
    const { categories, isLoading } = useProductManagement();
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFilteredCategories([]);

        let filtered = categories.filter(
            (category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (category.description &&
                    category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
                case 'count':
                    return (b.itemCount || 0) - (a.itemCount || 0);
                default:
                    return 0;
            }
        });

        setFilteredCategories(filtered);
    }, [searchTerm, categories, sortBy]);

    const handleDeleteCategory = async (categoryUuid: string) => {
        if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            try {
                await categoriesService.delete(categoryUuid);
                // await reloadProducts();
            } catch (err) {
                console.error('Error deleting category:', err);
                setError('Failed to delete category. Please try again.');
                setTimeout(() => setError(null), 5000);
            }
        }
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
    };

    const handleCreateCategory = () => {
        setShowCreateModal(true);
    };

    const handleModalClose = () => {
        setShowCreateModal(false);
        setEditingCategory(null);
    };

    const handleModalSuccess = async (newCategory: Category) => {
        try {
            if (editingCategory) {
                const updatedCategories = categories.map((cat) =>
                    cat.uuid === newCategory.uuid ? newCategory : cat
                );
                // setCategories(updatedCategories);
            } else {
                // setCategories([...categories, newCategory]);
            }
            setShowCreateModal(false);
            setEditingCategory(null);
            // await reloadProducts();
        } catch (err) {
            console.error('Error updating categories:', err);
            setError('Failed to update categories. Please try again.');
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleErrorClose = () => {
        setError(null);
    };

    return (
        <div className="min-h-screen max-w-full">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Categories"
                    description="Manage your product categories"
                />

                <div className="flex items-center space-x-4">
                    <SearchAndFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    <Button
                        onClick={handleCreateCategory}
                        theme='success'
                    >
                        <HiOutlinePlus size={20} />
                        <span>Add Category</span>
                    </Button>
                </div>
            </div>

            {error && <ErrorAlert error={error} onClose={handleErrorClose} />}


            {isLoading ? (
                <LoadingState />
            ) : filteredCategories.length > 0 ? (
                <Fragment>
                    <CategoriesGrid
                        categories={filteredCategories}
                        viewMode={viewMode}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                    />
                    <StatisticsPanel categories={categories} />
                </Fragment>
            ) : (
                <EmptyState searchTerm={searchTerm} onCreateCategory={handleCreateCategory} />
            )}

            <CreateCategoryModal
                category={editingCategory}
                isOpen={showCreateModal || !!editingCategory}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                showAddButton={false}
            />
        </div>
    );
};

export default CategoriesManager;