import React, { useState, useRef, useEffect } from 'react';
import { Edit2, MoreVertical, Package, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CategoryMobileCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string, categoryName: string) => void;
}

const CategoryMobileCard: React.FC<CategoryMobileCardProps> = ({
    category,
    onEdit,
    onDelete,
}) => {
    const [showActions, setShowActions] = useState(false);
    const actionsRef = useRef<HTMLDivElement>(null);

    const canDelete = !category.itemCount || category.itemCount === 0;

    useEffect(() => {
        if (!showActions) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
                setShowActions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showActions]);

    return (
        <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 active:scale-[0.99] transition-transform touch-manipulation">
            <div className="p-3.5">
                {/* Header: avatar + name + actions */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                        >
                            {category.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActions(prev => !prev); }}
                        className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors -mr-1"
                        aria-label="Actions"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        <Package className="w-3 h-3" />
                        {category.itemCount || 0} product{(category.itemCount || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {category.createdAt
                            ? formatDistanceToNow(new Date(category.createdAt), { addSuffix: true })
                            : '—'}
                    </span>
                </div>
            </div>

            {/* Context menu */}
            {showActions && (
                <div
                    ref={actionsRef}
                    className="absolute top-10 right-3 z-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700
                             shadow-lg min-w-[150px] py-1 animate-in fade-in-0 zoom-in-95 duration-150"
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowActions(false); onEdit(category); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300
                                 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <Edit2 className="w-4 h-4 text-sky-500" />
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(false);
                            if (canDelete) onDelete(category.categoryId, category.name);
                        }}
                        disabled={!canDelete}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                            ${canDelete
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

/** Skeleton card for loading state */
export const CategoryMobileCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 animate-pulse">
        <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40" />
            </div>
        </div>
        <div className="flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
    </div>
);

export default CategoryMobileCard;
