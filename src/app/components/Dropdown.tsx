import { FunctionComponent, useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, ChevronDown, LucideIcon } from 'lucide-react';

export interface DropdownOption<T = any> {
    value: string;
    label: string;
    description?: string;
    badges?: { text: string; color: string }[];
    data?: T;
    disabled?: boolean;
}

interface DropdownOptionProps<T = any> {
    options: DropdownOption<T>[];
    selectedValue?: string;
    onSelect: (option: DropdownOption<T> | null) => void;
    disabled?: boolean;
    placeholder?: string;
    disabledPlaceholder?: string;
    icon?: LucideIcon;
    maxHeight?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
    renderOption?: (option: DropdownOption<T>) => React.ReactNode;
    renderSelected?: (option: DropdownOption<T>) => React.ReactNode;
    filterOptions?: (options: DropdownOption<T>[], searchTerm: string) => DropdownOption<T>[];
    onSearchChange?: (searchTerm: string) => void;
    allowClear?: boolean;
    autoFocus?: boolean;
    debounceDelay?: number;
    emptyStateMessage?: string;
    noResultsMessage?: string;
    isLoading?: boolean;
    loadingMessage?: string;
    className?: string;
    error?: string;
}

export const Dropdown: FunctionComponent<DropdownOptionProps> = ({
    options = [],
    selectedValue,
    onSelect,
    disabled = false,
    placeholder = 'Select an option...',
    disabledPlaceholder = 'Disabled',
    icon: Icon,
    maxHeight = 'max-h-80',
    searchable = true,
    searchPlaceholder = 'Search...',
    renderOption,
    renderSelected,
    filterOptions,
    onSearchChange,
    allowClear = true,
    autoFocus = false,
    debounceDelay = 300,
    emptyStateMessage = 'No options available',
    noResultsMessage = 'No results found',
    isLoading = false,
    loadingMessage = 'Loading...',
    className = '',
    error,
}) => {
    const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>(options);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setFilteredOptions(options);
    }, [options]);

    useEffect(() => {
        if (selectedValue && options.length > 0) {
            const option = options.find((opt) => opt.value === selectedValue);
            if (option) {
                setSelectedOption(option);
                if (searchable) {
                    setSearchTerm(option.label);
                }
            }
        } else if (!selectedValue) {
            setSelectedOption(null);
            setSearchTerm('');
        }
    }, [selectedValue, options, searchable]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
                if (selectedOption && searchable) {
                    setSearchTerm(selectedOption.label);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption, searchable]);

    const performSearch = useCallback(
        (value: string) => {
            if (!value.trim()) {
                setFilteredOptions(options);
                return;
            }

            if (filterOptions) {
                setFilteredOptions(filterOptions(options, value));
            } else {
                const lowerValue = value.toLowerCase();
                const filtered = options.filter(
                    (option) =>
                        option.label.toLowerCase().includes(lowerValue) ||
                        option.description?.toLowerCase().includes(lowerValue)
                );
                setFilteredOptions(filtered);
            }
        },
        [options, filterOptions]
    );

    const handleSearch = (value: string) => {
        setSearchTerm(value);

        if (onSearchChange) {
            onSearchChange(value);
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performSearch(value);
        }, debounceDelay);
    };

    const handleOptionSelect = (option: DropdownOption) => {
        if (option.disabled) return;

        setSelectedOption(option);
        if (searchable) {
            setSearchTerm(option.label);
        }
        setIsDropdownOpen(false);
        onSelect(option);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchTerm('');
        setSelectedOption(null);
        setFilteredOptions(options);
        setIsDropdownOpen(false);
        onSelect(null);
    };

    const handleToggleDropdown = () => {
        if (!disabled) {
            setIsDropdownOpen(!isDropdownOpen);
            if (!isDropdownOpen && !searchTerm) {
                setFilteredOptions(options);
            }
        }
    };

    const defaultRenderOption = (option: DropdownOption) => (
        <div className="flex-1">
            <div className="flex items-start justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                </h4>
                {option.badges && option.badges.length > 0 && (
                    <div className="flex gap-1">
                        {option.badges.map((badge, idx) => (
                            <span
                                key={idx}
                                className={`px-2 py-0.5 text-xs rounded-full ${badge.color}`}
                            >
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {option.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {option.description}
                </p>
            )}
        </div>
    );

    const defaultRenderSelected = (option: DropdownOption) => (
        <div className="flex items-start space-x-2 flex-1">
            <Check className="h-5 w-5 text-g-600 dark:text-g-400 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex items-start">
                    {option.label}
                </span>
                {option.description && (
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {option.description}
                    </span>
                )}
            </div>
        </div>
    );

    const borderColor = error
        ? 'border-red-500 dark:border-red-400'
        : 'border-gray-300 dark:border-gray-600';

    const bgColor = selectedOption
        ? 'bg-gray-50 dark:bg-g-900/20'
        : disabled
            ? 'bg-gray-100 dark:bg-gray-800'
            : 'bg-white dark:bg-gray-700';

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                {searchable && !selectedOption ? (
                    <div className="relative">
                        {Icon && (
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        )}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            onFocus={handleToggleDropdown}
                            disabled={disabled || isLoading}
                            placeholder={disabled ? disabledPlaceholder : placeholder}
                            autoFocus={autoFocus}
                            className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-3 border-2 rounded-lg leading-5 transition-all duration-200 sm:text-sm
                                ${disabled ? 'cursor-not-allowed' : 'focus:border-g-500 dark:focus:border-g-400 focus:ring-2 focus:ring-g-200 dark:focus:ring-g-800'}
                                ${borderColor} ${bgColor}
                                text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400`}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleToggleDropdown}
                        disabled={disabled || isLoading}
                        className={`flex items-center justify-between w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 border-2 rounded-lg transition-all duration-200
                            ${disabled ? 'cursor-not-allowed' : 'hover:border-g-400 dark:hover:border-g-500'}
                            ${borderColor} ${bgColor}`}
                    >
                        {Icon && (
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        )}
                        {selectedOption ? (
                            <>
                                {renderSelected ? renderSelected(selectedOption) : defaultRenderSelected(selectedOption)}
                                {allowClear && !disabled && (
                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={handleClear}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(e as any); }}
                                        className="ml-2 p-1 hover:bg-g-100 dark:hover:bg-g-900/40 rounded transition-colors duration-200 cursor-pointer"
                                    >
                                        <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                    {disabled ? disabledPlaceholder : placeholder}
                                </span>
                                <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                            </>
                        )}
                    </button>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            {isDropdownOpen && !disabled && (
                <div
                    className={`absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-gray-300 dark:border-gray-600 ${maxHeight} overflow-y-auto`}
                >
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-g-600 dark:border-g-400"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{loadingMessage}</p>
                        </div>
                    ) : filteredOptions.length > 0 ? (
                        <div className="py-2">
                            {filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleOptionSelect(option)}
                                    disabled={option.disabled}
                                    className={`w-full px-4 py-3 text-left transition-colors duration-150 flex items-center space-x-3 group
                                        ${option.disabled
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                        }
                                        ${selectedOption?.value === option.value ? 'bg-g-50 dark:bg-g-900/20' : ''}`}
                                >
                                    {renderOption ? renderOption(option) : defaultRenderOption(option)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-8 text-center">
                            {Icon && <Icon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {searchTerm ? noResultsMessage : emptyStateMessage}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};