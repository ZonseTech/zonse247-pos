import React from 'react';
import { Receipt, Clock, CheckCircle2, XCircle, DollarSign, LucideIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';
import { formatCurrencyShort, formatCurrencyFull } from '../../../utils';
import classNames from 'classnames';

export interface ExpenseSummaryCard {
    title: string;
    count: number;
    amount?: number;
    countLabel?: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
}

interface ExpenseSummaryCardsProps {
    cards: ExpenseSummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    'Total': Receipt,
    'Awaiting Approval': Clock,
    'Rejected': XCircle,
    'Approved': CheckCircle2,
};

const getIcon = (title: string): LucideIcon => iconMap[title] || DollarSign;

const describeCount = (card: ExpenseSummaryCard) => `${card.count.toLocaleString()} ${card.countLabel || 'records'}`;

interface CardContentProps {
    card: ExpenseSummaryCard;
    Icon: LucideIcon;
    primaryLabel: string;
    countCaption?: string;
}

const EBNCardContent: React.FC<CardContentProps> = ({ card, Icon, primaryLabel, countCaption }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">{card.title}</p>
            <p className={classNames('text-xs font-bold leading-tight truncate', card.textColor)}>{primaryLabel}</p>
            {countCaption && (
                <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight truncate">{countCaption}</p>
            )}
        </div>
    </div>
);

const MobileCardContent: React.FC<CardContentProps> = ({ card, Icon, primaryLabel, countCaption }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">{card.title}</p>
            <p className={classNames('text-sm font-bold leading-tight truncate', card.textColor)}>{primaryLabel}</p>
            {countCaption && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight truncate">{countCaption}</p>
            )}
        </div>
    </div>
);

const DesktopCardContent: React.FC<CardContentProps> = ({ card, Icon, primaryLabel, countCaption }) => (
    <div className="flex items-center gap-2 sm:gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 sm:p-2.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4 sm:w-5 sm:h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{card.title}</p>
            <p className={classNames('text-base sm:text-xl font-bold truncate leading-tight', card.textColor)}>{primaryLabel}</p>
            {countCaption && (
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{countCaption}</p>
            )}
        </div>
    </div>
);

const PopoverFullValue: React.FC<CardContentProps> = ({ card, Icon, primaryLabel, countCaption }) => (
    <div className="flex items-center gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-5 h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
            <p className={classNames('text-lg font-bold whitespace-nowrap', card.textColor)}>{primaryLabel}</p>
            {countCaption && (
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{countCaption}</p>
            )}
        </div>
    </div>
);

const SkeletonCard: React.FC<{ isEBN: boolean }> = ({ isEBN }) => (
    <div
        className={classNames(
            'bg-gray-50 dark:bg-gray-700/50 animate-pulse',
            isEBN ? 'rounded-lg p-2' : 'rounded-lg p-3 sm:p-4',
        )}
    >
        <div className={classNames('flex items-center', isEBN ? 'gap-2' : 'gap-2 sm:gap-3')}>
            <div className={classNames(
                'bg-gray-200 dark:bg-gray-600 flex-shrink-0 rounded-lg',
                isEBN ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10',
            )} />
            <div className="flex-1 min-w-0">
                <div className={classNames('bg-gray-200 dark:bg-gray-600 rounded', isEBN ? 'h-2.5 w-12 mb-1' : 'h-3 w-14 mb-1.5')} />
                <div className={classNames('bg-gray-200 dark:bg-gray-600 rounded', isEBN ? 'h-4 w-16' : 'h-5 w-20')} />
            </div>
        </div>
    </div>
);

const ExpenseSummaryCards: React.FC<ExpenseSummaryCardsProps> = ({ cards, isLoading }) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    const gridClass = classNames(
        isEBN
            ? 'grid grid-cols-4 gap-1.5 p-2'
            : 'grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 py-3 sm:py-4',
    );

    if (isLoading) {
        return (
            <>
                <div className={gridClass}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonCard key={i} isEBN={isEBN} />
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
                    const Icon = getIcon(card.title);
                    const hasAmount = card.amount !== undefined;
                    const primaryLabel = hasAmount ? formatCurrencyShort(card.amount!) : card.count.toLocaleString();
                    const primaryLabelFull = hasAmount ? formatCurrencyFull(card.amount!) : card.count.toLocaleString();
                    const countCaption = hasAmount ? describeCount(card) : undefined;
                    const contentProps: CardContentProps = { card, Icon, primaryLabel, countCaption };
                    const contentPropsFull: CardContentProps = { card, Icon, primaryLabel: primaryLabelFull, countCaption };
                    const isRightSide = isMobile ? idx % 2 === 1 : idx >= 2;

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
                                'rounded-lg p-2 sm:p-4 hover:shadow-md',
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
                                        <PopoverFullValue {...contentPropsFull} />
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
                                    {card.title}: {primaryLabelFull}
                                    {countCaption && ` · ${countCaption}`}
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

export default ExpenseSummaryCards;
