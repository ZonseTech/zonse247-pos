import { FC, useRef } from "react";
import { Tag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';

interface ProductCategoryFilterProps {
	selectedCategory: string;
	onChange: (categoryId: string) => void;
	categories: Category[];
	isLoading?: boolean;
}

export const ProductCategoryFilter: FC<ProductCategoryFilterProps> = ({
	selectedCategory,
	onChange,
	categories,
	isLoading = false
}) => {
	const isMobile = useIsMobile();
	const isEBN = useIsEBN();
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: 'left' | 'right') => {
		if (scrollContainerRef.current) {
			const scrollAmount = 150;
			scrollContainerRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	};

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
                            focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
                            focus:border-sky-500 dark:focus:border-sky-400
                            transition-colors"
					>
						<option value="" className="bg-white dark:bg-gray-800">
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

	// EBN/Desktop: render as scrollable button row
	return (
		<div className="flex items-center gap-2">
			<span className={`text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap ${isEBN ? 'text-xs' : ''}`}>
				Category:
			</span>

			{/* Scroll buttons for EBN */}
			{isEBN && categories.length > 4 && (
				<button
					onClick={() => scroll('left')}
					className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
				>
					<ChevronLeft className="w-4 h-4 text-gray-500" />
				</button>
			)}

			<div
				ref={scrollContainerRef}
				className={`flex items-center gap-1.5 overflow-x-auto ${isEBN ? 'scrollbar-hide max-w-[400px]' : 'flex-wrap'}`}
				style={isEBN ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
			>
				{/* All Categories button */}
				<button
					onClick={() => onChange('')}
					className={`
                        flex items-center gap-1.5 
                        ${isEBN ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'}
                        rounded-lg border font-medium whitespace-nowrap
                        transition-all duration-200
                        ${!selectedCategory
							? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
							: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
						}
                    `}
				>
					<Tag className={isEBN ? "w-3 h-3" : "w-4 h-4"} />
					<span>All</span>
				</button>

				{categories.map((category) => (
					<button
						key={category.categoryId}
						onClick={() => onChange(category.categoryId)}
						className={`
                            flex items-center gap-1.5 
                            ${isEBN ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm'}
                            rounded-lg border font-medium whitespace-nowrap
                            transition-all duration-200
                            ${selectedCategory === category.categoryId
								? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
								: 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
							}
                        `}
					>
						<span>{category.name as string}</span>
					</button>
				))}
			</div>

			{/* Scroll buttons for EBN */}
			{isEBN && categories.length > 4 && (
				<button
					onClick={() => scroll('right')}
					className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
				>
					<ChevronRight className="w-4 h-4 text-gray-500" />
				</button>
			)}
		</div>
	);
};

export default ProductCategoryFilter;
