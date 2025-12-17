import { FunctionComponent } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

interface SearchBarProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({ value, onChange }) => {
    return (
        <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Search customers..."
                value={value}
                onChange={onChange}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
        </div>
    );
};
