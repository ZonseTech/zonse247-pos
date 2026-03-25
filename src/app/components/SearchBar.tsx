import { FunctionComponent, ChangeEvent, useState, useEffect, useRef, useCallback } from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';
import { TextField, IconButton } from '@radix-ui/themes';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    compact?: boolean;
    /** When set, the component manages its own local state for instant display
     *  and only calls onChange after the user stops typing for this many ms. */
    debounce?: number;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    className = '',
    compact = false,
    debounce
}) => {
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    // Sync local state when parent value changes externally (e.g. clear filters)
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        if (debounce) {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => onChange(newValue), debounce);
        } else {
            onChange(newValue);
        }
    }, [debounce, onChange]);

    const handleClear = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setLocalValue('');
        onChange('');
        onClear?.();
    }, [onChange, onClear]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const displayValue = debounce ? localValue : value;

    return (
        <div className={className}>
            <TextField.Root
                size={compact ? '1' : '2'}
                placeholder={placeholder}
                value={displayValue}
                onChange={handleChange}
            >
                <TextField.Slot side="right">
                    {displayValue && (
                        <IconButton
                            type="button"
                            size="1"
                            variant="ghost"
                            color="gray"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClear();
                            }}
                        >
                            <HiX className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                        </IconButton>
                    )}
                    <HiOutlineSearch className={compact ? 'h-3.5 w-3.5 text-gray-400' : 'h-4 w-4 text-gray-400'} />
                </TextField.Slot>
            </TextField.Root>
        </div>
    );
};

export default SearchBar;
