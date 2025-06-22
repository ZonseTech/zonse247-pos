import { Edit2, Trash2 } from 'lucide-react';
import { FunctionComponent } from 'react';

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryUuid: string) => void;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = ({ category, onEdit, onDelete }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                />
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{category.name}</h3>
                    {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{category.description}</p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => onDelete(category.uuid)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{category.itemCount || 0} items</span>
            <span>{new Date(category.createdAt || '').toLocaleDateString()}</span>
        </div>
    </div>
);