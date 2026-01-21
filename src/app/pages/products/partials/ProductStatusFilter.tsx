import { FC } from "react";
import { Package, PackageCheck, PackageX, AlertTriangle, Ban } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';

interface ProductStatusFilterProps {
	selectedStatus: string;
	onChange: (status: string) => void;
}

const statusOptions: Array<{ value: string; label: string; icon: any; color: string }> = [
	{ value: 'all', label: 'All Products', icon: Package, color: 'gray' },
	{ value: 'active', label: 'Active', icon: PackageCheck, color: 'green' },
	{ value: 'inactive', label: 'Inactive', icon: PackageX, color: 'gray' },
	{ value: 'out-of-stock', label: 'Out of Stock', icon: AlertTriangle, color: 'orange' },
	{ value: 'discontinued', label: 'Discontinued', icon: Ban, color: 'red' },
];

export const ProductStatusFilter: FC<ProductStatusFilterProps> = ({ selectedStatus, onChange }) => {
	const isMobile = useIsMobile();
	const isEBN = useIsEBN();

	const getColorClasses = (color: string, isSelected: boolean) => {
		const baseClasses = "transition-all duration-200";

		if (isSelected) {
			const colors: Record<string, string> = {
				gray: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
				green: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
				orange: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700",
				red: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
			};
			return `${baseClasses} ${colors[color] || colors.gray}`;
		}

		return `${baseClasses} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50`;
	};

	// Mobile: render as dropdown
	if (isMobile) {
		const selectedOption = statusOptions.find(opt => opt.value === selectedStatus);
		const SelectedIcon = selectedOption?.icon || Package;

		return (
			<div className="flex items-center gap-2 w-full">
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Status:</span>
				<div className="relative flex-1">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
						<SelectedIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
					</div>
					<select
						value={selectedStatus}
						onChange={(e) => onChange(e.target.value)}
						className="w-full h-10 pl-10 pr-8 
                            appearance-none cursor-pointer
                            rounded-lg text-sm font-medium
                            bg-white dark:bg-gray-800 
                            text-gray-700 dark:text-gray-200
                            border border-gray-300 dark:border-gray-600
                            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                            focus:border-blue-500 dark:focus:border-blue-400
                            transition-colors"
					>
						{statusOptions.map((option) => (
							<option
								key={option.value}
								value={option.value}
								className="bg-white dark:bg-gray-800"
							>
								{option.label}
							</option>
						))}
					</select>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
						<svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</div>
				</div>
			</div>
		);
	}

	// EBN/Desktop: render as scrollable button row
	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className={`text-sm font-medium text-gray-700 dark:text-gray-300 mr-1 ${isEBN ? 'text-xs' : ''}`}>
				Status:
			</span>
			<div className={`flex items-center gap-1.5 overflow-x-auto ${isEBN ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600' : ''}`}>
				{statusOptions.map((option) => {
					const Icon = option.icon;
					const isSelected = selectedStatus === option.value;

					return (
						<button
							key={option.value}
							onClick={() => onChange(option.value)}
							className={`
                                flex items-center gap-1.5 
                                ${isEBN ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'}
                                rounded-lg border font-medium whitespace-nowrap
                                ${getColorClasses(option.color, isSelected)}
                            `}
						>
							<Icon className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
							<span>{option.label}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default ProductStatusFilter;
