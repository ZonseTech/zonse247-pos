import { FC } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import type { SalesViewId } from "../hooks/useSalesView";

const TAB_LINK_CLASS =
    "pb-0.5 text-sm font-medium border-b-2 outline-none cursor-pointer whitespace-nowrap transition-colors duration-200 " +
    "text-gray-500 dark:text-gray-400 border-transparent " +
    "hover:text-sky-600 dark:hover:text-sky-400 " +
    "data-[state=active]:text-sky-600 dark:data-[state=active]:text-sky-400 " +
    "data-[state=active]:border-sky-500 dark:data-[state=active]:border-sky-400";

const SALES_VIEWS: { id: SalesViewId; label: string }[] = [
    { id: "transactions", label: "Transactions" },
    { id: "day-close", label: "Day-end Close" },
];

interface SalesViewTabsProps {
    value: SalesViewId;
    onValueChange: (value: string) => void;
}

const SalesViewTabs: FC<SalesViewTabsProps> = ({ value, onValueChange }) => (
    <Tabs.Root value={value} onValueChange={onValueChange}>
        <Tabs.List className="flex items-center gap-4">
            {SALES_VIEWS.map((tab) => (
                <Tabs.Trigger key={tab.id} value={tab.id} className={TAB_LINK_CLASS}>
                    {tab.label}
                </Tabs.Trigger>
            ))}
        </Tabs.List>
    </Tabs.Root>
);

export default SalesViewTabs;
