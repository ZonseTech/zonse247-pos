import { FunctionComponent, ChangeEvent } from 'react';
import { HiOutlineSearch, HiX } from 'react-icons/hi';
import { TextField, IconButton } from '@radix-ui/themes';

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
        <div className={className}>
            <TextField.Root
                size={compact ? '1' : '2'}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
            >
                <TextField.Slot side="right">
                    {value && (
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
