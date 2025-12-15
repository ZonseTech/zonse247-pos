import { ChangeEvent } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import { Input } from '../../../components';

interface SearchBarProps {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
    <div className="flex relative">
        <Input
            type="text"
            placeholder="Search branches..."
            value={value}
            onChange={onChange}
            className="rounded-md px-3 py-2.5 pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <HiOutlineSearch className="h-5 w-5 text-gray-400" />
        </div>
    </div>
);
