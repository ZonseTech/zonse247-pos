import React, { useMemo } from 'react';
import { Clock, Send, CheckCircle, Package, LucideIcon } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Popover from '@radix-ui/react-popover';
import * as Avatar from '@radix-ui/react-avatar';
import * as Separator from '@radix-ui/react-separator';
import { useIsEBN, useIsMobile } from '../../../hooks/useMediaQuery';
import classNames from 'classnames';

export interface POSummaryCard {
    title: string;
    value: number;
    displayValue: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
}

interface PurchaseOrderSummaryCardsProps {
    purchaseOrders: PurchaseOrder[];
    totalRows: number;
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    'Pending / Draft': Clock,
    'Sent / In Transit': Send,
    'Partial Received': Package,
    'Received': CheckCircle,
};

const getIcon = (title: string): LucideIcon => iconMap[title] || Clock;

// --- Card content variants ---

interface CardContentProps {
    card: POSummaryCard;
    Icon: LucideIcon;
}

const EBNCardContent: React.FC<CardContentProps> = ({ card, Icon }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, 'p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center')}>
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

// --- Skeleton ---
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

function buildSummaryCards(purchaseOrders: PurchaseOrder[], totalRows: number): POSummaryCard[] {
    const pendingCount = purchaseOrders.filter(po => po.status === 'PENDING' || po.status === 'DRAFT').length;
    const sentCount = purchaseOrders.filter(po => po.status === 'SENT' || po.status === 'SHIPPED').length;
    const partialCount = purchaseOrders.filter(po => po.status === 'PARTIALLY_RECEIVED').length;
    const receivedCount = purchaseOrders.filter(po => po.status === 'RECEIVED').length;

    return [
        {
            title: 'Pending / Draft',
            value: pendingCount,
            displayValue: String(pendingCount),
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-500 dark:text-amber-400',
        },
        {
            title: 'Sent / In Transit',
            value: sentCount,
            displayValue: String(sentCount),
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
            textColor: 'text-indigo-500 dark:text-indigo-400',
        },
        {
            title: 'Partial Received',
            value: partialCount,
            displayValue: String(partialCount),
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
            textColor: 'text-cyan-500 dark:text-cyan-400',
        },
        {
            title: 'Received',
            value: receivedCount,
            displayValue: String(receivedCount),
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
    ];
}

const PurchaseOrderSummaryCards: React.FC<PurchaseOrderSummaryCardsProps> = ({ purchaseOrders, totalRows, isLoading }) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    const cards = useMemo(() => buildSummaryCards(purchaseOrders, totalRows), [purchaseOrders, totalRows]);

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
                    const contentProps: CardContentProps = { card, Icon };
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

                    // Mobile/EBN: use Popover for full value
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

export default PurchaseOrderSummaryCards;
