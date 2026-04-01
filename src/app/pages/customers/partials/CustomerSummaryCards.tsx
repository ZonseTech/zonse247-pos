import React, { FC } from 'react';
import { Users, UserPlus, Mail, Phone, LucideIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import classNames from 'classnames';
import { useIsMobile } from '../../../hooks/useMediaQuery';

interface StatCard {
    label: string;
    value: number;
    icon: LucideIcon;
    iconBg: string;
    iconColor: string;
    bgColor: string;
}

interface CustomerSummaryCardsProps {
    totalRows: number;
    showing: number;
    withEmail: number;
    withPhone: number;
    isLoading?: boolean;
}

// --- Card content variants ---

interface CardContentProps {
    card: StatCard;
}

const MobileCardContent: FC<CardContentProps> = ({ card }) => {
    const Icon = card.icon;
    return (
        <div className="flex items-center gap-2">
            <Avatar.Root className={classNames(card.iconBg, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
                <Avatar.Fallback delayMs={0}>
                    <Icon className={classNames('w-4 h-4', card.iconColor)} />
                </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">{card.label}</p>
                <p className="text-xs font-bold leading-tight truncate text-gray-900 dark:text-white">{card.value}</p>
            </div>
        </div>
    );
};

const DesktopCardContent: FC<CardContentProps> = ({ card }) => {
    const Icon = card.icon;
    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <Avatar.Root className={classNames(card.iconBg, 'p-2 sm:p-2.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
                <Avatar.Fallback delayMs={0}>
                    <Icon className={classNames('w-4 h-4 sm:w-5 sm:h-5', card.iconColor)} />
                </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.label}</p>
                <p className="text-sm sm:text-lg font-bold truncate text-gray-900 dark:text-white">{card.value}</p>
            </div>
        </div>
    );
};

const PopoverFullValue: FC<CardContentProps> = ({ card }) => {
    const Icon = card.icon;
    return (
        <div className="flex items-center gap-3">
            <Avatar.Root className={classNames(card.iconBg, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
                <Avatar.Fallback delayMs={0}>
                    <Icon className={classNames('w-5 h-5', card.iconColor)} />
                </Avatar.Fallback>
            </Avatar.Root>
            <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-base font-bold whitespace-nowrap text-gray-900 dark:text-white">{card.value}</p>
            </div>
        </div>
    );
};

// --- Skeleton ---
const SkeletonCard: FC = () => (
    <div className="bg-gray-50 dark:bg-gray-700/50 animate-pulse rounded-lg p-2 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 flex-shrink-0 rounded-lg" />
            <div className="flex-1 min-w-0">
                <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-600 rounded w-12 sm:w-14 mb-1 sm:mb-1.5" />
                <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded w-16 sm:w-20" />
            </div>
        </div>
    </div>
);

const CustomerSummaryCards: FC<CustomerSummaryCardsProps> = ({
    totalRows,
    showing,
    withEmail,
    withPhone,
    isLoading,
}) => {
    const isMobile = useIsMobile();

    const cards: StatCard[] = [
        {
            label: 'Total Customers',
            value: totalRows,
            icon: Users,
            iconBg: 'bg-sky-100 dark:bg-sky-900/30',
            iconColor: 'text-sky-500 dark:text-sky-400',
            bgColor: 'bg-white dark:bg-gray-800',
        },
        {
            label: 'Showing',
            value: showing,
            icon: UserPlus,
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-500 dark:text-green-400',
            bgColor: 'bg-white dark:bg-gray-800',
        },
        {
            label: 'With Email',
            value: withEmail,
            icon: Mail,
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-500 dark:text-amber-400',
            bgColor: 'bg-white dark:bg-gray-800',
        },
        {
            label: 'With Phone',
            value: withPhone,
            icon: Phone,
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-600 dark:text-purple-400',
            bgColor: 'bg-white dark:bg-gray-800',
        },
    ];

    const gridClass = classNames('grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 py-3 sm:py-4 px-3 sm:px-4');

    if (isLoading) {
        return (
            <>
                <div className={gridClass}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
                <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700" />
            </>
        );
    }

    return (
        <Tooltip.Provider delayDuration={300}>
            <div className={gridClass}>
                {cards.map((card, idx) => {
                    const isRightSide = isMobile ? idx % 2 === 1 : idx >= 2;
                    const contentProps: CardContentProps = { card };

                    const cardBody = isMobile
                        ? <MobileCardContent {...contentProps} />
                        : <DesktopCardContent {...contentProps} />;

                    const cardClassName = classNames(
                        card.bgColor,
                        'rounded-lg p-2 sm:p-4 transition-all duration-200 hover:shadow-md',
                        isMobile && 'cursor-pointer select-none',
                    );

                    // Mobile: use Popover (tap to expand)
                    if (isMobile) {
                        return (
                            <Popover.Root key={idx}>
                                <Popover.Trigger asChild>
                                    <button type="button" className={classNames(cardClassName, 'text-left w-full')}>
                                        {cardBody}
                                    </button>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content
                                        side="bottom"
                                        align={isRightSide ? 'end' : 'start'}
                                        sideOffset={8}
                                        className={classNames(
                                            card.bgColor,
                                            'rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-3',
                                            'z-50 whitespace-nowrap',
                                            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                                        )}
                                    >
                                        <PopoverFullValue {...contentProps} />
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        );
                    }

                    // Desktop: use Tooltip
                    return (
                        <Tooltip.Root key={idx}>
                            <Tooltip.Trigger asChild>
                                <div className={cardClassName}>
                                    {cardBody}
                                </div>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                                <Tooltip.Content
                                    side="bottom"
                                    sideOffset={6}
                                    className={classNames(
                                        'z-50 rounded-lg px-3 py-2 shadow-lg',
                                        'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900',
                                        'text-xs font-semibold',
                                        'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
                                        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
                                    )}
                                >
                                    {card.label}: {card.value}
                                    <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    );
                })}
            </div>
            <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700" />
        </Tooltip.Provider>
    );
};

export default CustomerSummaryCards;
