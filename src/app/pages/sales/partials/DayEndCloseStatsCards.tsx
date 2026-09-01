import { FC } from "react";
import classNames from "classnames";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";
import * as Avatar from "@radix-ui/react-avatar";
import * as Separator from "@radix-ui/react-separator";
import { Package, DollarSign, ShoppingCart, TrendingUp, Receipt, Wallet, LucideIcon } from "lucide-react";
import { useIsEBN, useIsMobile } from "../../../hooks/useMediaQuery";
import { formatCurrency } from "../../../utils";

interface DayEndCloseStatsCardsProps {
    quantitySold: number;
    salesValue: number;
    costOfSales: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
}

interface StatCard {
    title: string;
    value: number;
    isMonetary: boolean;
    icon: LucideIcon;
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

const formatCurrencyShort = (value: number): string => {
    const sign = value < 0 ? "-" : "";
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${sign}MK ${(abs / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${sign}MK ${(abs / 1000).toFixed(1)}K`;
    return `${sign}MK ${abs.toFixed(0)}`;
};

interface CardContentProps {
    card: StatCard;
    IconComponent: LucideIcon;
    displayValue: string;
    fullValue: string;
}

const EBNCardContent: FC<CardContentProps> = ({ card, IconComponent, displayValue }) => (
    <div className="flex items-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, "p-1.5 rounded-lg flex-shrink-0 inline-flex items-center justify-center")}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames("w-4 h-4", card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight truncate">
                {card.title}
            </p>
            <p className={classNames("text-xs font-bold leading-tight truncate", card.textColor)}>
                {displayValue}
            </p>
        </div>
    </div>
);

const MobileCardContent: FC<CardContentProps> = ({ card, IconComponent, displayValue }) => (
    <div className="flex flex-col items-center text-center gap-1">
        <Avatar.Root className={classNames(card.iconBgColor, "p-2 rounded-lg inline-flex items-center justify-center")}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames("w-5 h-5", card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <p className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
            {card.title}
        </p>
        <p className={classNames("text-xs font-bold leading-tight truncate w-full", card.textColor)}>
            {displayValue}
        </p>
    </div>
);

const DesktopCardContent: FC<CardContentProps> = ({ card, IconComponent, fullValue }) => (
    <div className="flex items-center gap-3">
        <Avatar.Root className={classNames(card.iconBgColor, "p-2.5 rounded-xl flex-shrink-0 inline-flex items-center justify-center")}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames("w-6 h-6", card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight truncate">
                {card.title}
            </p>
            <p className={classNames("text-base font-bold leading-tight truncate", card.textColor)}>
                {fullValue}
            </p>
        </div>
    </div>
);

const PopoverFullValue: FC<CardContentProps> = ({ card, IconComponent, fullValue }) => (
    <div className="flex flex-col items-center text-center gap-2">
        <Avatar.Root className={classNames(card.iconBgColor, "p-2 rounded-lg inline-flex items-center justify-center")}>
            <Avatar.Fallback delayMs={0}>
                <IconComponent className={classNames("w-5 h-5", card.textColor)} />
            </Avatar.Fallback>
        </Avatar.Root>
        <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
            <p className={classNames("text-base font-bold whitespace-nowrap", card.textColor)}>{fullValue}</p>
        </div>
    </div>
);

const DayEndCloseStatsCards: FC<DayEndCloseStatsCardsProps> = ({
    quantitySold,
    salesValue,
    costOfSales,
    grossProfit,
    operatingExpenses,
    netProfit,
}) => {
    const isEBN = useIsEBN();
    const isMobile = useIsMobile();

    const cards: StatCard[] = [
        {
            title: "Quantity Sold",
            value: quantitySold,
            isMonetary: false,
            icon: Package,
            bgColor: "bg-sky-50 dark:bg-sky-900/20",
            iconBgColor: "bg-sky-100 dark:bg-sky-900/40",
            textColor: "text-sky-700 dark:text-sky-400",
        },
        {
            title: "Sales Value",
            value: salesValue,
            isMonetary: true,
            icon: DollarSign,
            bgColor: "bg-green-50 dark:bg-green-900/20",
            iconBgColor: "bg-green-100 dark:bg-green-900/40",
            textColor: "text-green-700 dark:text-green-400",
        },
        {
            title: "Cost of Sales",
            value: costOfSales,
            isMonetary: true,
            icon: ShoppingCart,
            bgColor: "bg-orange-50 dark:bg-orange-900/20",
            iconBgColor: "bg-orange-100 dark:bg-orange-900/40",
            textColor: "text-orange-700 dark:text-orange-400",
        },
        {
            title: "Gross Profit",
            value: grossProfit,
            isMonetary: true,
            icon: TrendingUp,
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconBgColor: "bg-purple-100 dark:bg-purple-900/40",
            textColor: "text-purple-700 dark:text-purple-400",
        },
        {
            title: "Operating Expenses",
            value: operatingExpenses,
            isMonetary: true,
            icon: Receipt,
            bgColor: "bg-red-50 dark:bg-red-900/20",
            iconBgColor: "bg-red-100 dark:bg-red-900/40",
            textColor: "text-red-700 dark:text-red-400",
        },
        {
            title: "Net Profit",
            value: netProfit,
            isMonetary: true,
            icon: Wallet,
            bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
            iconBgColor: "bg-emerald-100 dark:bg-emerald-900/40",
            textColor: "text-emerald-700 dark:text-emerald-400",
        },
    ];

    const gridClass = classNames(
        isEBN
            ? "grid grid-cols-6 gap-1.5 p-2"
            : "grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 py-3 sm:py-4"
    );

    return (
        <Tooltip.Provider delayDuration={300}>
            <div className={gridClass}>
                {cards.map((card, idx) => {
                    const displayValue = card.isMonetary ? formatCurrencyShort(card.value) : card.value.toLocaleString();
                    const fullValue = card.isMonetary ? formatCurrency(card.value) : card.value.toLocaleString();
                    const contentProps: CardContentProps = { card, IconComponent: card.icon, displayValue, fullValue };
                    const isRightSide = isMobile ? idx % 3 === 2 : idx >= 3;

                    const cardBody = isEBN
                        ? <EBNCardContent {...contentProps} />
                        : isMobile
                            ? <MobileCardContent {...contentProps} />
                            : <DesktopCardContent {...contentProps} />;

                    const cardClassName = classNames(
                        card.bgColor,
                        "transition-all duration-200",
                        isEBN
                            ? "rounded-lg p-2 hover:shadow-sm cursor-pointer select-none"
                            : ["rounded-xl p-2 sm:p-4 hover:shadow-md", isMobile && "cursor-pointer select-none"]
                    );

                    if (isMobile || isEBN) {
                        return (
                            <Popover.Root key={card.title}>
                                <Popover.Trigger asChild>
                                    <button type="button" className={classNames(cardClassName, "text-left w-full")}>
                                        {cardBody}
                                    </button>
                                </Popover.Trigger>

                                <Popover.Portal>
                                    <Popover.Content
                                        side="bottom"
                                        align={isRightSide ? "end" : "start"}
                                        sideOffset={isEBN ? 4 : 8}
                                        className={classNames(
                                            card.bgColor,
                                            "rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 p-3",
                                            "z-50 whitespace-nowrap",
                                            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                                        )}
                                    >
                                        <PopoverFullValue {...contentProps} />
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        );
                    }

                    return (
                        <Tooltip.Root key={card.title}>
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
                                        "z-50 rounded-lg px-3 py-2 shadow-lg",
                                        "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900",
                                        "text-xs font-semibold",
                                        "data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0",
                                        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
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
            <Separator.Root decorative className="h-px bg-gray-200 dark:bg-gray-700" />
        </Tooltip.Provider>
    );
};

export default DayEndCloseStatsCards;
