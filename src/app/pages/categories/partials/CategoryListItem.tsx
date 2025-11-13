import { Edit2, Trash2 } from 'lucide-react';
import { FunctionComponent } from 'react';

interface CategoryListItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryUuid: string) => void;
}

export const CategoryListItem: FunctionComponent<CategoryListItemProps> = ({ category, onEdit, onDelete }) => (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/20 transition-all duration-200">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{category.description}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="hidden sm:block">{category.itemCount || 0} items</span>
                <span className="hidden md:block">{new Date(category.createdAt || '').toLocaleDateString()}</span>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(category.categoryId)}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    </div>
);