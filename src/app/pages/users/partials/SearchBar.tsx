import { FunctionComponent, ChangeEvent } from 'react';
import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

interface SearchBarProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({
    value,
    onChange,
    onClear,
    placeholder = 'Search users...',
    className = '',
}) => {
    const handleClear = () => {
        if (onClear) {
            onClear();
        } else {
            // Create a synthetic event to clear the input
            const syntheticEvent = {
                target: { value: '' },
            } as ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
    };

    return (
        <div className={`relative flex-1 sm:flex-none sm:min-w-[200px] md:min-w-[280px] ${className}`}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <HiOutlineSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                className="block w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm transition-colors duration-200"
                placeholder={placeholder}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <HiOutlineX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            )}
        </div>
    );
};
