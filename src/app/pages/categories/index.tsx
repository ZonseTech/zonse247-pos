import CreateCategoryModal from './CreateCategoryModal';
import { useState, useEffect, FunctionComponent, Fragment } from 'react';
import categoriesService from '../../services/category.service';
import { ErrorAlert } from './partials/ErrorAlert';
import { PageHeader } from './partials/PageHeader';
import { SearchAndFilters } from './partials/SearchAndFilters';
import { LoadingState } from './partials/LoadingState';
import { CategoriesGrid } from './partials/CategoriesGrid';
import { StatisticsPanel } from './partials/StatisticsPanel';
import { EmptyState } from './partials/EmptyState';

const CategoriesManager: FunctionComponent = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'count'>('name');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await categoriesService.list();
            setCategories(data);
            setFilteredCategories(data);
        } catch (err) {
            console.error('Error loading categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        let filtered = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
                await loadCategories();
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

    const handleModalSuccess = async () => {
        setShowCreateModal(false);
        setEditingCategory(null);
        await loadCategories();
    };

    const handleErrorClose = () => {
        setError(null);
    };

    return (
        <div className="min-h-screen transition-colors duration-200 dark:bg-gray-900 bg-gray-50">
            {error && <ErrorAlert error={error} onClose={handleErrorClose} />}

            <PageHeader onCreateCategory={handleCreateCategory} />

            <SearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {loading ? (
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