import { FunctionComponent, ChangeEvent } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

interface SearchBarProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({
    value,
    onChange,
    placeholder = 'Search categories...',
}) => {
    return (
        <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiOutlineSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-colors"
            />
        </div>
    );
};
