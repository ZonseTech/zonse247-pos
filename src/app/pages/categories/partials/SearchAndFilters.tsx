import { Search, Filter, Grid, List } from 'lucide-react';
import { FunctionComponent } from 'react';
import { Input } from '../../../components';

interface SearchAndFiltersProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: 'name' | 'date' | 'count';
    onSortChange: (sort: 'name' | 'date' | 'count') => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

export const SearchAndFilters: FunctionComponent<SearchAndFiltersProps> = ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange,
}) => (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <Input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 "
            />
        </div>

        <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border border-gray-300 dark:border-gray-600 rounded-sm px-3 py-1 bg-white dark:bg-gray-700">
                <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as 'name' | 'date' | 'count')}
                    className="px-3 border-none py-2 text-sm text-gray-900 dark:text-white"
                >
                    <option value="name">Sort by Name</option>
                    <option value="date">Sort by Date</option>
                    <option value="count">Sort by Items</option>
                </select>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-sm p-1">
                <button
                    onClick={() => onViewModeChange('grid')}
                    className={`p-2 rounded transition-colors ${viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-sky-600 dark:text-sky-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <Grid size={16} />
                </button>
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded transition-colors ${viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 shadow-sm text-sky-600 dark:text-sky-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <List size={16} />
                </button>
            </div>
        </div>
    </div>
);