import { ChangeEvent, FunctionComponent } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';
import Input from '../Input';

interface SearchBarProps {
	value: string;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({ value, onChange }) => {
	return (
		<div className="relative">
			<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
			</div>
			<Input
				type="text"
				placeholder="Search subscriptions..."
				value={value}
				onChange={onChange}
				className="pl-10 pr-3 py-2.5"
			/>
		</div>
	);
};