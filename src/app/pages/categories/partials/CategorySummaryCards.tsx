import React from 'react';
import { FolderOpen, LayoutGrid, FolderX, LucideIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { useIsMobile } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

export interface CategorySummaryCard {
    title: string;
    value: number;
    displayValue: string;
    icon: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

interface CategorySummaryCardsProps {
    cards: CategorySummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    'total': FolderOpen,
    'active': LayoutGrid,
    'empty': FolderX,
};

const getIcon = (icon: string): LucideIcon => iconMap[icon] || FolderOpen;

interface CardContentProps {
    card: CategorySummaryCard;
    Icon: LucideIcon;
}

const MobileCardContent: React.FC<CardContentProps> = ({ card, Icon }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">{card.title}</p>
            <p className={classNames('text-xs font-bold leading-tight truncate', card.textColor)}>{card.displayValue}</p>
        </div>
    </div>
);

const DesktopCardContent: React.FC<CardContentProps> = ({ card, Icon }) => (
    <div className="flex items-center gap-2 sm:gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 sm:p-2.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4 sm:w-5 sm:h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
            <p className={classNames('text-sm sm:text-lg font-bold truncate', card.textColor)}>{card.displayValue}</p>
        </div>
    </div>
);

const PopoverFullValue: React.FC<CardContentProps> = ({ card, Icon }) => (
    <div className="flex items-center gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-5 h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
            <p className={classNames('text-base font-bold whitespace-nowrap', card.textColor)}>{card.displayValue}</p>
        </div>
    </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-gray-50 dark:bg-gray-700/50 animate-pulse rounded-lg p-2 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-600 flex-shrink-0 rounded-lg" />
            <div className="flex-1 min-w-0">
                <div className="h-3 w-14 bg-gray-200 dark:bg-gray-600 rounded mb-1.5" />
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
            </div>
        </div>
    </div>
);

const CategorySummaryCards: React.FC<CategorySummaryCardsProps> = ({ cards, isLoading }) => {
    const isMobile = useIsMobile();

    const gridClass = 'grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4';

    if (isLoading) {
        return (
            <>
                <div className={gridClass}>
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
                <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700" />
            </>
        );
    }

    return (
        <Tooltip.Provider delayDuration={300}>
            <div className={gridClass}>
                {cards.map((card, idx) => {
                    const Icon = getIcon(card.icon);
                    const contentProps: CardContentProps = { card, Icon };

                    const cardBody = isMobile
                        ? <MobileCardContent {...contentProps} />
                        : <DesktopCardContent {...contentProps} />;

                    const cardClassName = classNames(
                        card.bgColor,
                        'transition-all duration-200 rounded-lg',
                        isMobile ? 'p-2 cursor-pointer select-none' : 'p-2 sm:p-4 hover:shadow-md',
                    );

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
                                        align={idx === 2 ? 'end' : idx === 0 ? 'start' : 'center'}
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
                                    {card.title}: {card.displayValue}
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

export default CategorySummaryCards;
