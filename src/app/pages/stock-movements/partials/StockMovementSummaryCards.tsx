import { FC } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, LucideIcon } from 'lucide-react';
import { Box, Flex, Text, Skeleton, Tooltip } from '@radix-ui/themes';

export interface StockMovementSummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    icon?: 'total' | 'in' | 'out' | 'adjustment';
}

interface StockMovementSummaryCardsProps {
    cards: StockMovementSummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    total: Activity,
    in: TrendingUp,
    out: TrendingDown,
    adjustment: RefreshCw,
};

const SkeletonCard: FC<{ index: number }> = ({ index }) => (
    <Tooltip content="Loading stock movement data…">
        <Box
            className="rounded-xl p-3 animate-pulse bg-gray-100 dark:bg-gray-700"
            aria-busy="true"
            aria-label={`Loading card ${index + 1}`}
        >
            <Flex align="center" gap="3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Flex direction="column" gap="2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-5 w-10 rounded" />
                </Flex>
            </Flex>
        </Box>
    </Tooltip>
);

const StockMovementSummaryCards: FC<StockMovementSummaryCardsProps> = ({ cards, isLoading = false }) => {
    if (isLoading) {
        return (
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-[var(--gray-a6)]">
                {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} index={i} />
                ))}
            </Box>
        );
    }

    return (
        <Box className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-[var(--gray-a6)]">
            {cards.map((card, index) => {
                const IconComponent = card.icon ? iconMap[card.icon] : Activity;
                return (
                    <Box
                        key={index}
                        className={`${card.bgColor} rounded-xl p-3 transition-all duration-200 hover:shadow-md`}
                    >
                        <Flex align="center" gap="3">
                            <Flex
                                align="center"
                                justify="center"
                                flexShrink="0"
                                className={`w-10 h-10 ${card.iconBgColor} rounded-lg`}
                            >
                                <IconComponent className={`w-5 h-5 ${card.textColor}`} />
                            </Flex>
                            <Box className="min-w-0">
                                <Text as="p" size="1" color="gray" truncate>{card.title}</Text>
                                <Text as="p" size="4" weight="bold" className={card.textColor}>
                                    {card.displayValue ?? card.value}
                                </Text>
                            </Box>
                        </Flex>
                    </Box>
                );
            })}
        </Box>
    );
};

export default StockMovementSummaryCards;
