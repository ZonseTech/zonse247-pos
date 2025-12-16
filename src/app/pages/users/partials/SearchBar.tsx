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
    placeholder = 'Search users...'
}) => {
    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiOutlineSearch className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-colors duration-200"
                placeholder={placeholder}
            />
        </div>
    );
};
