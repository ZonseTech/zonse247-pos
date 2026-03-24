import { FC, useRef } from "react";
import { Tag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, IconButton, Select, Spinner } from '@radix-ui/themes';

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
			<Flex align="center" gap="2">
				<Spinner size="2" />
				<Text size="2" color="gray">Loading categories...</Text>
			</Flex>
		);
	}

	if (isMobile) {
		return (
			<Flex align="center" gap="2" width="100%">
				<Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
					Category:
				</Text>
				<Select.Root value={selectedCategory} onValueChange={onChange}>
					<Select.Trigger
						variant="surface"
						placeholder="Select category"
						className="flex-1"
					/>
					<Select.Content position="popper">
						<Select.Item value="all">
							<Flex align="center" gap="2">
								<Tag className="w-4 h-4" />
								All Categories
							</Flex>
						</Select.Item>
						<Select.Separator />
						{categories.map((category) => (
							<Select.Item key={category.categoryId} value={category.categoryId}>
								{category.name as string}
							</Select.Item>
						))}
					</Select.Content>
				</Select.Root>
			</Flex>
		);
	}

	return (
		<Flex align="center" gap="2">
			<Text size={isEBN ? '1' : '2'} weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
				Category:
			</Text>

			{isEBN && categories.length > 4 && (
				<IconButton
					size="1"
					variant="ghost"
					color="gray"
					onClick={() => scroll('left')}
					aria-label="Scroll left"
				>
					<ChevronLeft className="w-4 h-4" />
				</IconButton>
			)}

			<Flex
				ref={scrollContainerRef}
				align="center"
				gap="1"
				className={`overflow-x-auto ${isEBN ? 'scrollbar-hide max-w-[400px]' : 'flex-wrap'}`}
				style={isEBN ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
			>
				<Button
					size={isEBN ? '1' : '2'}
					variant={selectedCategory === 'all' || !selectedCategory ? 'soft' : 'outline'}
					color={selectedCategory === 'all' || !selectedCategory ? 'sky' : 'gray'}
					onClick={() => onChange('all')}
					className="whitespace-nowrap"
				>
					<Tag className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
					All
				</Button>

				{categories.map((category) => (
					<Button
						key={category.categoryId}
						size={isEBN ? '1' : '2'}
						variant={selectedCategory === category.categoryId ? 'soft' : 'outline'}
						color={selectedCategory === category.categoryId ? 'sky' : 'gray'}
						onClick={() => onChange(category.categoryId)}
						className="whitespace-nowrap"
					>
						{category.name as string}
					</Button>
				))}
			</Flex>

			{/* Scroll right for EBN */}
			{isEBN && categories.length > 4 && (
				<IconButton
					size="1"
					variant="ghost"
					color="gray"
					onClick={() => scroll('right')}
					aria-label="Scroll right"
				>
					<ChevronRight className="w-4 h-4" />
				</IconButton>
			)}
		</Flex>
	);
};

export default CategoryFilter;
