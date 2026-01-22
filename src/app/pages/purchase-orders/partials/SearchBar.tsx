import { FunctionComponent } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
    searchTerm: string;
    onSearch: (value: string) => void;
    placeholder?: string;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({
    searchTerm,
    onSearch,
    placeholder = 'Search...',
}) => {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sky-500 dark:bg-gray-700 dark:text-white"
            />
        </div>
    );
};
