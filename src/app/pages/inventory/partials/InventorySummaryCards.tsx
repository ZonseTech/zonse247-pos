import { FC } from 'react';
import classNames from 'classnames';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import {
    Boxes,
    Package,
    DollarSign,
    BarChart3,
    TrendingUp,
    AlertTriangle,
    LucideIcon,
} from 'lucide-react';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';

export interface InventorySummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    fullValue?: string;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
    icon?: 'products' | 'units' | 'stockValue' | 'retailValue' | 'profit' | 'lowStock';
}

interface InventorySummaryCardsProps {
    cards: InventorySummaryCard[];
    isLoading?: boolean;
    compact?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    products: Boxes,
    units: Package,
    stockValue: DollarSign,
    retailValue: BarChart3,
    profit: TrendingUp,
    lowStock: AlertTriangle,
};


interface CardContentProps {
    card: InventorySummaryCard;
    IconComponent: LucideIcon;
    displayValue: string;
    fullValue: string;
}

const EBNCardContent: FC<CardContentProps> = ({ card, IconComponent, displayValue }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                {card.title}
            </p>
            <p className={classNames('text-xs font-bold leading-tight truncate', card.textColor)}>
                {displayValue}
            </p>
        </div>
    </div>
);

const MobileCardContent: FC<CardContentProps> = ({ card, IconComponent, displayValue }) => (
    <div className="flex flex-col items-center text-center gap-1">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames('w-5 h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
            {card.title}
        </p>
        <p className={classNames('text-xs font-bold leading-tight truncate w-full', card.textColor)}>
            {displayValue}
        </p>
    </div>
);

const DesktopCardContent: FC<CardContentProps> = ({ card, IconComponent, fullValue }) => (
    <div className="flex items-center gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2.5 rounded-xl flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames('w-6 h-6', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">
                {card.title}
            </p>
            <p className={classNames('text-base font-bold leading-tight truncate', card.textColor)}>
                {fullValue}
            </p>
        </div>
    </div>
);

const PopoverFullValue: FC<CardContentProps> = ({ card, IconComponent, fullValue }) => (
    <div className="flex flex-col items-center text-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames('w-5 h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {card.title}
            </p>
            <p className={classNames('text-base font-bold whitespace-nowrap', card.textColor)}>
                {fullValue}
            </p>
        </div>
    </div>
);

const SkeletonCard: FC<{ isEBN: boolean }> = ({ isEBN }) => (
    <Tooltip.Root>
        <Tooltip.Trigger asChild>
            <div
                className={classNames(
                    'bg-gray-50 dark:bg-gray-700/50 animate-pulse',
                    isEBN ? 'rounded-lg p-2' : 'rounded-xl p-3 sm:p-4',
                )}
                aria-busy="true"
                aria-label="Loading card"
            >
                <div className={classNames('flex items-center', isEBN ? 'gap-2' : 'gap-2 sm:gap-3')}>
                    <Avatar.Root
                        className={classNames(
                            'bg-gray-200 dark:bg-gray-600 flex-shrink-0 inline-flex items-center justify-center',
                            isEBN ? 'w-8 h-8 rounded-lg' : 'w-10 h-10 sm:w-12 sm:h-12 rounded-xl',
                        )}
                    >
                        <Avatar.Fallback delayMs={0} className="w-full h-full" />
                    </Avatar.Root>
                    <div className="flex-1 min-w-0">
                        <Separator.Root
                            decorative
                            className={classNames(
                                'bg-gray-200 dark:bg-gray-600 rounded',
                                isEBN ? 'h-2.5 w-12 mb-1' : 'h-3 w-14 mb-1.5',
                            )}
                        />
                        <Separator.Root
                            decorative
                            className={classNames(
                                'bg-gray-200 dark:bg-gray-600 rounded',
                                isEBN ? 'h-4 w-16' : 'h-5 w-20',
                            )}
                        />
                    </div>
                </div>
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
                Loading…
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
            </Tooltip.Content>
        </Tooltip.Portal>
    </Tooltip.Root>
);

const InventorySummaryCards: FC<InventorySummaryCardsProps> = ({ cards, isLoading = false }) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    const gridClass = classNames(
        isEBN
            ? 'grid grid-cols-6 gap-1.5 p-2'
            : 'grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 py-3 sm:py-4',
    );

    if (isLoading) {
        return (
            <Tooltip.Provider delayDuration={300}>
                <div className={gridClass}>
                    {Array.from({ length: 6 }, (_, i) => (
                        <SkeletonCard key={i} isEBN={isEBN} />
                    ))}
                </div>
                <Separator.Root
                    decorative
                    className="h-px bg-gray-200 dark:bg-gray-700"
                />
            </Tooltip.Provider>
        );
    }

    return (
        <Tooltip.Provider delayDuration={300}>
            <div className={gridClass}>
                {cards.map((card, idx) => {
                    const IconComponent = card.icon ? iconMap[card.icon] : Boxes;
                    const displayValue = card.displayValue ?? card.value.toLocaleString();
                    const fullValue = card.fullValue ?? displayValue;
                    const contentProps: CardContentProps = { card, IconComponent, displayValue, fullValue };
                    const isRightSide = isMobile ? idx % 3 === 2 : idx >= 3;

                    const cardBody = isEBN
                        ? <EBNCardContent {...contentProps} />
                        : isMobile
                            ? <MobileCardContent {...contentProps} />
                            : <DesktopCardContent {...contentProps} />;

                    const cardClassName = classNames(
                        card.bgColor,
                        'transition-all duration-200',
                        isEBN
                            ? 'rounded-lg p-2 hover:shadow-sm cursor-pointer select-none'
                            : [
                                'rounded-xl p-2 sm:p-4 hover:shadow-md',
                                isMobile && 'cursor-pointer select-none',
                            ],
                    );

                    if (isMobile || isEBN) {
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
                                        sideOffset={isEBN ? 4 : 8}
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
                                    {card.title}: {fullValue}
                                    <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-100" />
                                </Tooltip.Content>
                            </Tooltip.Portal>
                        </Tooltip.Root>
                    );
                })}
            </div>
            <Separator.Root
                decorative
                className="h-px bg-gray-200 dark:bg-gray-700"
            />
        </Tooltip.Provider>
    );
};

export default InventorySummaryCards;
