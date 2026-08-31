import { useCallback, useState } from "react";

export type SalesViewId = "transactions" | "day-close";

const DEFAULT_VIEW: SalesViewId = "transactions";

export const useSalesView = (initialView: SalesViewId = DEFAULT_VIEW) => {
    const [view, setView] = useState<SalesViewId>(initialView);

    const handleViewChange = useCallback((value: string) => {
        setView(value as SalesViewId);
    }, []);

    return {
        view,
        isTransactionsView: view === "transactions",
        isDayCloseView: view === "day-close",
        handleViewChange,
    };
};
