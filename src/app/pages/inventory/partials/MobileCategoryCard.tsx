import React from 'react';
import { HiChevronUp, HiChevronDown, HiTrash } from 'react-icons/hi';
import { Tag, } from 'lucide-react';

interface CategoryCardProps {
    category: Category;
    onTap: () => void;
    onDelete?: (categoryId: string) => void;
    onMoveUp?: (categoryId: string) => void;
    onMoveDown?: (categoryId: string) => void;
    isFirst?: boolean;
    isLast?: boolean;
}

interface CategoryListProps {
    categories: Category[];
    isLoading: boolean;
    onCategoryTap: (category: Category) => void;
    onDeleteCategory?: (categoryId: string) => void;
    onReorderCategory?: (categoryId: string, direction: 'up' | 'down') => void;
}

const CategoryCardSkeleton: React.FC = () => (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
            <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    </div>
);

const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onTap,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst = false,
    isLast = false,
}) => {
    const firstLetter = category.name?.charAt(0)?.toUpperCase() || '?';

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(category.categoryId);
    };

    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMoveUp?.(category.categoryId);
    };

    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMoveDown?.(category.categoryId);
    };

    return (
        <button
            onClick={onTap}
            className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-3 text-left active:scale-[0.98] transition-all shadow-sm"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-sky-500 dark:text-sky-400">
                        {firstLetter}
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {category.name}
                    </p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={handleDelete}
                        className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-colors"
                    >
                        <HiTrash className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleMoveUp}
                        disabled={isFirst}
                        className={`p-1.5 rounded-md transition-colors ${isFirst
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                            }`}
                    >
                        <HiChevronUp className="w-5 h-5" />
                    </button>

                    <button
                        onClick={handleMoveDown}
                        disabled={isLast}
                        className={`p-1.5 rounded-md transition-colors ${isLast
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95'
                            }`}
                    >
                        <HiChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </button>
    );
};

const CategoryEmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            No categories found
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Create categories to organize your inventory items
        </p>
    </div>
);

const CategoryLoadingState: React.FC = () => (
    <div className="h-full overflow-y-auto pb-24 px-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
            <CategoryCardSkeleton key={i} />
        ))}
    </div>
);

export const CategoryList: React.FC<CategoryListProps> = ({
    categories,
    isLoading,
    onCategoryTap,
    onDeleteCategory,
    onReorderCategory,
}) => {
    if (isLoading) {
        return <CategoryLoadingState />;
    }

    if (categories.length === 0) {
        return <CategoryEmptyState />;
    }

    const handleMoveUp = (categoryId: string) => {
        onReorderCategory?.(categoryId, 'up');
    };

    const handleMoveDown = (categoryId: string) => {
        onReorderCategory?.(categoryId, 'down');
    };

    return (
        <div className="h-full overflow-y-auto pb-24 px-4 space-y-3">
            {categories.map((category, index) => (
                <CategoryCard
                    key={category.categoryId}
                    category={category}
                    onTap={() => onCategoryTap(category)}
                    onDelete={onDeleteCategory}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    isFirst={index === 0}
                    isLast={index === categories.length - 1}
                />
            ))}
        </div>
    );
};

export default CategoryCard;
