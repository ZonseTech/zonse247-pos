import { FC, ReactNode } from 'react';
import { Box, Flex, Text, Skeleton, Tooltip } from '@radix-ui/themes';

export interface SummaryCardItem {
    title: string;
    value: string | number;
    subtitle?: string;
    displayValue?: string;
    icon: ReactNode;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

export interface SummaryCardsProps {
    cards: SummaryCardItem[];
    isLoading?: boolean;
    skeletonCount?: number;
    gridClassName?: string;
    variant?: 'standalone' | 'embedded';
}

const SkeletonCard: FC = () => (
    <Tooltip content="Loading…">
        <Box
            className="rounded-xl animate-pulse"
            p={{ initial: '3', sm: '4' }}
            style={{ backgroundColor: 'var(--gray-a3)' }}
            aria-busy="true"
            aria-label="Loading card"
        >
            <Flex align="center" gap={{ initial: '2', sm: '3' }}>
                <Skeleton
                    width="44px"
                    height="44px"
                    className="rounded-xl !w-10 !h-10 sm:!w-11 sm:!h-11"
                />
                <Flex direction="column" gap="1" flexGrow="1" minWidth="0">
                    <Skeleton width="56px" height="12px" />
                    <Skeleton width="72px" height="20px" />
                </Flex>
            </Flex>
        </Box>
    </Tooltip>
);


const SummaryCards: FC<SummaryCardsProps> = ({
    cards,
    isLoading = false,
    skeletonCount,
    gridClassName = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    variant = 'standalone',
}) => {
    const count = (skeletonCount ?? cards.length) || 4;

    const wrapperClass = variant === 'embedded'
        ? `grid ${gridClassName} gap-3 p-4 border-b border-[var(--gray-a6)]`
        : `grid ${gridClassName} gap-4 mb-6`;

    if (isLoading) {
        return (
            <div className={wrapperClass}>
                {[...Array(count)].map((_, i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className={wrapperClass}>
            {cards.map((card, index) => {
                const display = card.displayValue ?? (typeof card.value === 'number' ? card.value.toLocaleString() : card.value);

                return (
                    <Box
                        key={index}
                        className={`${card.bgColor} rounded-lg border border-transparent transition-all duration-200 hover:shadow-md`}
                        p="4"
                    >
                        <Flex align="center" gap="3">
                            <Box className={`${card.iconBgColor} ${card.textColor} rounded-lg`} p="2" flexShrink="0">
                                {card.icon}
                            </Box>
                            <Box minWidth="0">
                                <Text as="p" size="1" weight="medium" color="gray" truncate>
                                    {card.title}
                                </Text>
                                <Text as="p" size="4" weight="bold" className={`${card.textColor} leading-tight`}>
                                    {display}
                                </Text>
                                {card.subtitle && (
                                    <Text as="p" size="1" color="gray" truncate>
                                        {card.subtitle}
                                    </Text>
                                )}
                            </Box>
                        </Flex>
                    </Box>
                );
            })}
        </div>
    );
};

export default SummaryCards;
