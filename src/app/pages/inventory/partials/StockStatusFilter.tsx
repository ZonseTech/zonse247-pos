import { FC } from "react";
import { Package, PackageCheck, PackageX, Clock, TrendingDown, AlertTriangle } from "lucide-react";
import { useIsMobile, useIsEBN } from '../../../hooks/useMediaQuery';
import { Flex, Text, Button, Select, SegmentedControl } from '@radix-ui/themes';

interface StockStatusFilterProps {
	selectedStatus: string;
	onChange: (status: string) => void;
	compact?: boolean;
}

type RadixColor = 'sky' | 'gray' | 'green' | 'yellow' | 'red' | 'orange';

const statusOptions: Array<{ value: string; label: string; icon: any; color: RadixColor }> = [
	{ value: 'all', label: 'All Items', icon: Package, color: 'sky' },
	{ value: 'in-stock', label: 'In Stock', icon: PackageCheck, color: 'green' },
	{ value: 'low-stock', label: 'Low Stock', icon: TrendingDown, color: 'yellow' },
	{ value: 'out-of-stock', label: 'Out of Stock', icon: PackageX, color: 'red' },
	{ value: 'expiring-soon', label: 'Expiring', icon: Clock, color: 'orange' },
	{ value: 'expired', label: 'Expired', icon: AlertTriangle, color: 'red' },
];

export const StockStatusFilter: FC<StockStatusFilterProps> = ({ selectedStatus, onChange, compact = false }) => {
	const isMobile = useIsMobile();
	const isEBN = useIsEBN();

	if (isMobile) {
		return (
			<Flex align="center" gap="2" width="100%">
				<Text size="2" weight="medium" className="text-gray-700 dark:text-gray-300 whitespace-nowrap">
					Stock:
				</Text>
				<Select.Root value={selectedStatus} onValueChange={onChange}>
					<Select.Trigger
						variant="surface"
						placeholder="Select status"
						className="flex-1"
					/>
					<Select.Content position="popper">
						{statusOptions.map((option) => {
							const Icon = option.icon;
							return (
								<Select.Item key={option.value} value={option.value}>
									<Flex align="center" gap="2">
										<Icon className="w-4 h-4" />
										{option.label}
									</Flex>
								</Select.Item>
							);
						})}
					</Select.Content>
				</Select.Root>
			</Flex>
		);
	}

	return (
		<Flex align="center" gap="2" wrap="wrap">
			<Text size={isEBN ? '1' : '2'} weight="medium" className="text-gray-700 dark:text-gray-300 mr-1">
				Stock:
			</Text>
			<Flex align="center" gap="1" className={`overflow-x-auto ${isEBN ? 'scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600' : ''}`}>
				{statusOptions.map((option) => {
					const Icon = option.icon;
					const isSelected = selectedStatus === option.value;

					return (
						<Button
							key={option.value}
							size={isEBN ? '1' : '2'}
							variant={isSelected ? 'soft' : 'outline'}
							color={isSelected ? option.color : 'gray'}
							onClick={() => onChange(option.value)}
							className="whitespace-nowrap"
						>
							<Icon className={isEBN ? 'w-3 h-3' : 'w-4 h-4'} />
							{option.label}
						</Button>
					);
				})}
			</Flex>
		</Flex>
	);
};

export default StockStatusFilter;
