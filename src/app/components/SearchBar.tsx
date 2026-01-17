import { FunctionComponent, ChangeEvent } from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';
import Input from './Input';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    compact?: boolean;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    className = '',
    compact = false
}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleClear = () => {
        onChange('');
        onClear?.();
    };

    return (
        <div className={`relative ${className}`}>
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={compact
                    ? "rounded-md px-2 h-6 pr-8 text-xs bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                    : "rounded-md px-3 h-9 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors w-full"
                }
            />
            <div className={compact
                ? "absolute inset-y-0 right-0 flex items-center pr-1.5 gap-0.5"
                : "absolute inset-y-0 right-0 flex items-center pr-3 gap-1"
            }>
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        <HiX className={compact ? "h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" : "h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"} />
                    </button>
                )}
                <HiOutlineSearch
                    className={compact
                        ? "h-3.5 w-3.5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        : "h-5 w-5 text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                    }
                    title="Search"
                />
            </div>
        </div>
    );
};

export default SearchBar;
