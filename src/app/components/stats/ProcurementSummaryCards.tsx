import React from 'react';
import { LucideIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { useIsEBN, useIsMobile } from '../../hooks/useMediaQuery';
import classNames from 'classnames';

export interface ProcurementSummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    icon: LucideIcon;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

interface ProcurementSummaryCardsProps {
    cards: ProcurementSummaryCard[];
    isLoading?: boolean;
}

interface CardContentProps {
    card: ProcurementSummaryCard;
    Icon: LucideIcon;
    displayValue: string;
}

const EBNCardContent: React.FC<CardContentProps> = ({
    card,
    Icon,
    displayValue,
}) => (
    <div className="flex items-center gap-2">
        <Avatar.Root
            className={classNames(
                card.iconBgColor,
                'p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center',
            )}
        >
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">
                {card.title}
            </p>
            <p
                className={classNames(
                    'text-xs font-bold leading-tight truncate',
                    card.textColor,
                )}
            >
                {displayValue}
            </p>
        </div>
    </div>
);

const MobileCardContent: React.FC<CardContentProps> = ({
    card,
    Icon,
    displayValue,
}) => (
    <div className="flex items-center gap-2">
        <Avatar.Root
            className={classNames(
                card.iconBgColor,
                'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center',
            )}
        >
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-4 h-4', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight truncate">
                {card.title}
            </p>
            <p
                className={classNames(
                    'text-xs font-bold leading-tight truncate',
                    card.textColor,
                )}
            >
                {displayValue}
            </p>
        </div>
    </div>
);

const DesktopCardContent: React.FC<CardContentProps> = ({
    card,
    Icon,
    displayValue,
}) => (
    <div className="flex items-center gap-2 sm:gap-3">
        <Avatar.Root
            className={classNames(
                card.iconBgColor,
                'p-2 sm:p-2.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center',
            )}
        >
            <Avatar.Fallback delayMs={0}>
                <Icon
                    className={classNames(
                        'w-4 h-4 sm:w-5 sm:h-5',
                        card.textColor,
                    )}
                />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                {card.title}
            </p>
            <p
                className={classNames(
                    'text-sm sm:text-lg font-bold truncate',
                    card.textColor,
                )}
            >
                {displayValue}
            </p>
        </div>
    </div>
);

const PopoverFullValue: React.FC<CardContentProps> = ({
    card,
    Icon,
    displayValue,
}) => (
    <div className="flex items-center gap-3">
        <Avatar.Root
            className={classNames(
                card.iconBgColor,
                'p-2 rounded-lg flex-shrink-0 inline-flex items-center justify-center',
            )}
        >
            <Avatar.Fallback delayMs={0}>
                <Icon className={classNames('w-5 h-5', card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {card.title}
            </p>
            <p
                className={classNames(
                    'text-base font-bold whitespace-nowrap',
                    card.textColor,
                )}
            >
                {displayValue}
            </p>
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
        <div
            className={classNames(
                'flex items-center',
                isEBN ? 'gap-2' : 'gap-2 sm:gap-3',
            )}
        >
            <div
                className={classNames(
                    'bg-gray-200 dark:bg-gray-600 flex-shrink-0 rounded-lg',
                    isEBN ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10',
                )}
            />
            <div className="flex-1 min-w-0">
                <div
                    className={classNames(
                        'bg-gray-200 dark:bg-gray-600 rounded',
                        isEBN ? 'h-2.5 w-12 mb-1' : 'h-3 w-14 mb-1.5',
                    )}
                />
                <div
                    className={classNames(
                        'bg-gray-200 dark:bg-gray-600 rounded',
                        isEBN ? 'h-4 w-16' : 'h-5 w-20',
                    )}
                />
            </div>
        </div>
    </div>
);

function getGridClass(count: number, isEBN: boolean): string {
    if (isEBN) {
        if (count >= 6) return 'grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2';
        if (count >= 5) return 'grid grid-cols-5 gap-1.5 p-2';
        return 'grid grid-cols-4 gap-1.5 p-2';
    }
    if (count >= 6)
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 py-3 sm:py-4';
    if (count >= 5)
        return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 py-3 sm:py-4';
    return 'grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 py-3 sm:py-4';
}

const ProcurementSummaryCards: React.FC<ProcurementSummaryCardsProps> = ({
    cards,
    isLoading,
}) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    const gridClass = getGridClass(cards.length, isEBN);

    if (isLoading) {
        return (
            <>
                <div className={gridClass}>
                    {cards.map((_, i) => (
                        <SkeletonCard key={i} isEBN={isEBN} />
                    ))}
                </div>
                <Separator.Root
                    decorative
                    className="h-px bg-gray-200 dark:bg-gray-700"
                />
            </>
        );
    }

    return (
        <Tooltip.Provider delayDuration={300}>
            <div className={gridClass}>
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    const displayValue =
                        card.displayValue ?? card.value.toLocaleString();
                    const contentProps: CardContentProps = {
                        card,
                        Icon,
                        displayValue,
                    };
                    const isRightSide = isMobile
                        ? idx % 2 === 1
                        : idx >= Math.ceil(cards.length / 2);

                    const cardBody = isEBN ? (
                        <EBNCardContent {...contentProps} />
                    ) : isMobile ? (
                        <MobileCardContent {...contentProps} />
                    ) : (
                        <DesktopCardContent {...contentProps} />
                    );

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
                                    <button
                                        type="button"
                                        className={classNames(
                                            cardClassName,
                                            'text-left w-full',
                                        )}
                                    >
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
                                <div className={cardClassName}>{cardBody}</div>
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
                                    {card.title}: {displayValue}
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

export default ProcurementSummaryCards;
