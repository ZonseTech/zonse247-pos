import { Edit2, Trash2, Package } from 'lucide-react';
import { FunctionComponent } from 'react';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryUuid: string) => void;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = ({ category, onEdit, onDelete }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 hover:shadow-xl dark:hover:shadow-gray-900/30 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                >
                    {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate max-w-[150px] sm:max-w-[180px]">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-0.5 truncate max-w-[150px] sm:max-w-[180px]">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(category)}
                    className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onDelete(category.categoryId)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${category.itemCount > 0
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                        }`}
                    disabled={category.itemCount > 0}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className="inline-flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {category.itemCount || 0} items
            </span>
            <span className="text-gray-400 dark:text-gray-500">
                {new Date(category.createdAt || '').toLocaleDateString()}
            </span>
        </div>
    </div>
);