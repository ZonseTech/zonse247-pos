import { Edit2, Trash2, Package } from 'lucide-react';
import { FunctionComponent } from 'react';

interface CategoryListItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryUuid: string) => void;
}

export const CategoryListItem: FunctionComponent<CategoryListItemProps> = ({ category, onEdit, onDelete }) => (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-sm flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                >
                    {category.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {category.name}
                    </h3>
                    {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm truncate">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                <span className="hidden xs:inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                    <Package className="w-3.5 h-3.5" />
                    {category.itemCount || 0}
                </span>
                <span className="hidden md:block text-gray-400 dark:text-gray-500">
                    {new Date(category.createdAt || '').toLocaleDateString()}
                </span>
                <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 sm:p-2 text-sky-600 dark:text-sky-400 sm:text-gray-400 sm:dark:text-gray-500 sm:hover:text-sky-600 sm:dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(category.categoryId)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-colors ${category.itemCount > 0
                            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'text-red-500 dark:text-red-400 sm:text-gray-400 sm:dark:text-gray-500 sm:hover:text-red-600 sm:dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                            }`}
                        disabled={category.itemCount > 0}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);