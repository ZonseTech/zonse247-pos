import React from 'react';
import { Search } from 'lucide-react';
import { PermissionScope } from '../../../utils/constants';

export const SearchFilter: React.FC<SearchFilterProps> = ({
    searchTerm,
    onSearchChange,
    showCategoryFilter = false,
    showScopeFilter = false,
    selectedCategory = 'all',
    selectedScope = 'all',
    categories = [],
    scopes = Object.values(PermissionScope),
    onCategoryChange,
    onScopeChange,
}) => {
    return (
        <div className="mb-1.5 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                />
            </div>

            {showCategoryFilter && onCategoryChange && (
                <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            )}

            {showScopeFilter && onScopeChange && (
                <select
                    value={selectedScope}
                    onChange={(e) => onScopeChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    <option value="all">All Scopes</option>
                    {scopes.map(scope => (
                        <option key={scope.toString()} value={scope.toString()}>{scope.toString()}</option>
                    ))}
                </select>
            )}
        </div>
    );
};