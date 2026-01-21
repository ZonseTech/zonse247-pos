import { FC } from "react";
import { Tag, Loader2 } from "lucide-react";
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface CategoryFilterProps {
	selectedCategory: string;
	onChange: (categoryId: string) => void;
	categories: Category[];
	isLoading?: boolean;
}

export const CategoryFilter: FC<CategoryFilterProps> = ({
	selectedCategory,
	onChange,
	categories,
	isLoading = false
}) => {
	const isMobile = useIsMobile();

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<Loader2 className="w-4 h-4 animate-spin text-gray-400" />
				<span className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</span>
			</div>
		);
	}

	// Mobile: render as dropdown
	if (isMobile) {
		return (
			<div className="flex items-center gap-2 w-full">
				<span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Category:</span>
				<div className="relative flex-1">
					<div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
						<Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
					</div>
					<select
						value={selectedCategory}
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
						<option value="all" className="bg-white dark:bg-gray-800">
							All Categories
						</option>
						{categories.map((category) => (
							<option
								key={category.categoryId}
								value={category.categoryId}
								className="bg-white dark:bg-gray-800"
							>
								{category.name as string}
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

	// Desktop: render as scrollable button row
	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Category:</span>
			<div className="flex flex-wrap items-center gap-2">
				{/* All Categories button */}
				<button
					onClick={() => onChange('all')}
					className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border
                        transition-all duration-200
                        ${selectedCategory === 'all' || !selectedCategory
							? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
							: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
						}
                    `}
				>
					<Tag className="w-4 h-4" />
					<span>All</span>
				</button>

				{/* Category buttons */}
				{categories.slice(0, 5).map((category) => {
					const isSelected = selectedCategory === category.categoryId;

					return (
						<button
							key={category.categoryId}
							onClick={() => onChange(category.categoryId)}
							className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border
                                transition-all duration-200
                                ${isSelected
									? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
									: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
								}
                            `}
						>
							{category.color && (
								<span
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: category.color }}
								/>
							)}
							<span className="truncate max-w-[100px]">{category.name as string}</span>
						</button>
					);
				})}

				{/* More categories dropdown if more than 5 */}
				{categories.length > 5 && (
					<div className="relative">
						<select
							value={categories.slice(5).some(c => c.categoryId === selectedCategory) ? selectedCategory : ''}
							onChange={(e) => e.target.value && onChange(e.target.value)}
							className="h-8 pl-3 pr-8 
                                appearance-none cursor-pointer
                                rounded-lg text-sm font-medium
                                bg-white dark:bg-gray-800 
                                text-gray-700 dark:text-gray-200
                                border border-gray-200 dark:border-gray-700
                                hover:bg-gray-50 dark:hover:bg-gray-700/50
                                focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                                transition-colors"
						>
							<option value="">+{categories.length - 5} more</option>
							{categories.slice(5).map((category) => (
								<option
									key={category.categoryId}
									value={category.categoryId}
									className="bg-white dark:bg-gray-800"
								>
									{category.name as string}
								</option>
							))}
						</select>
						<div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
							<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CategoryFilter;
