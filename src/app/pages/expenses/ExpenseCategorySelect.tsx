import { useState, useEffect, useRef, useMemo, FunctionComponent } from 'react';
import { ChevronDown, Search, X, Tag, Plus } from 'lucide-react';
import { useExpenseCategories } from '../../hooks/useExpenseCategories';
import CreateExpenseCategoryModal from './CreateExpenseCategoryModal';

interface ExpenseCategorySelectProps {
    value: string;
    onChange: (categoryId: string) => void;
    error?: string;
    touched?: boolean;
    disabled?: boolean;
    required?: boolean;
    /** Show the "Add New Category" option and let the user create a category inline. Defaults to true. */
    allowCreate?: boolean;
}

const ExpenseCategorySelect: FunctionComponent<ExpenseCategorySelectProps> = ({
    value,
    onChange,
    error,
    touched,
    disabled = false,
    required = true,
    allowCreate = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { categories, isLoading: loading, loadCategories } = useExpenseCategories();

    const activeCategories = useMemo(() => categories.filter((c) => c.isActive), [categories]);

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return activeCategories;
        return activeCategories.filter((category) =>
            category.name?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [activeCategories, searchTerm]);

    const selectedCategory = useMemo(
        () => activeCategories.find((c) => c.categoryId === value) || null,
        [activeCategories, value],
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (category: ExpenseCategory) => {
        onChange(category.categoryId);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        onChange('');
        setSearchTerm('');
    };

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    };

    const handleAddCategoryClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(false);
        setShowCreateModal(true);
    };

    const handleCategoryCreated = async (newCategory?: ExpenseCategory) => {
        await loadCategories();
        setShowCreateModal(false);

        if (newCategory?.categoryId) {
            onChange(newCategory.categoryId);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category {required && <span className="text-red-500">*</span>}
            </label>

            <div
                className={`flex items-center justify-between w-full px-4 py-2.5 border rounded-sm cursor-pointer transition-all ${disabled
                    ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed'
                    : 'bg-white dark:bg-gray-800 hover:border-sky-400'
                    } ${error && touched
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600 focus:ring-sky-500'
                    }`}
                onClick={toggleDropdown}
            >
                <div className="flex items-center gap-2 flex-1">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {selectedCategory ? (
                        <span className="text-gray-900 dark:text-gray-100">
                            {selectedCategory.name}
                        </span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                            {loading ? 'Loading...' : 'Select a category...'}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {selectedCategory && !disabled && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </div>

            {error && touched && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search categories..."
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 min-h-0">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                Loading categories...
                            </div>
                        ) : filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                                <div
                                    key={category.categoryId}
                                    onClick={() => handleSelect(category)}
                                    className={`px-4 py-3 cursor-pointer transition-colors ${selectedCategory?.categoryId === category.categoryId
                                        ? 'bg-sky-50 dark:bg-sky-900/30'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {category.name}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                No categories found
                            </div>
                        )}
                    </div>

                    {allowCreate && (
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button
                                type="button"
                                onClick={handleAddCategoryClick}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-sky-500 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add New Category
                            </button>
                        </div>
                    )}
                </div>
            )}

            {allowCreate && (
                <CreateExpenseCategoryModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCategoryCreated}
                    showAddButton={false}
                />
            )}
        </div>
    );
};

export default ExpenseCategorySelect;
