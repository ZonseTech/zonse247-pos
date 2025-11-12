import { FunctionComponent } from 'react';
import { CategoryCard } from './CategoryCard';
import { CategoryListItem } from './CategoryListItem';

interface CategoriesGridProps {
    categories: Category[];
    viewMode: 'grid' | 'list';
    onEdit: (category: Category) => void;
    onDelete: (categoryUuid: string) => void;
}

export const CategoriesGrid: FunctionComponent<CategoriesGridProps> = ({
    categories,
    viewMode,
    onEdit,
    onDelete,
}) => (
    <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        : "space-y-3"
    }>
        {categories.map((category) => (
            viewMode === 'grid'
                ? <CategoryCard key={category.categoryId} category={category} onEdit={onEdit} onDelete={onDelete} />
                : <CategoryListItem key={category.categoryId} category={category} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
);