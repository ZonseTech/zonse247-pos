import { useState, useEffect, useRef, FunctionComponent } from 'react';
import { ChevronDown, Search, X, Tag, Plus } from 'lucide-react';
import categoriesService from '../../../services/category.service';
import CreateCategoryModal from '../CreateCategoryModal';

interface CategorySearchProps {
    value: string;
    onChange: (categoryId: string) => void;
    error?: string;
    touched?: boolean;
    disabled?: boolean;
}

export const CategorySearch: FunctionComponent<CategorySearchProps> = ({
    value,
    onChange,
    error,
    touched,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoriesService.list();
            setCategories(data);
            setFilteredCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (value && categories.length > 0) {
            const found = categories.find(c => c.categoryId?.toString() === value);
            setSelectedCategory(found || null);
        }
    }, [value, categories]);

    useEffect(() => {
        if (searchTerm) {
            const filtered = categories.filter(category =>
                category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories(categories);
        }
    }, [searchTerm, categories]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (category: Category) => {
        setSelectedCategory(category);
        onChange(category.categoryId?.toString() || '');
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedCategory(null);
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

    const handleCategoryCreated = async () => {
        await fetchCategories();
        setShowCreateModal(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category <span className="text-red-500">*</span>
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
                            Select a category...
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
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
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

                    <div className="overflow-y-auto max-h-60">
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
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color || '#6B7280' }}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {category.name}
                                            </div>
                                            {category.description && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {category.description}
                                                </div>
                                            )}
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

                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleAddCategoryClick}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Category
                        </button>
                    </div>
                </div>
            )}

            <CreateCategoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCategoryCreated}
                showAddButton={false}
                categoriesCount={categories.length}
            />
        </div>
    );
};

export default CategorySearch;
