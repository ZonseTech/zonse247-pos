import { useMemo } from 'react';
import { useAppSelector } from '../../../hooks/redux';

export const useDayEndCloseTotals = () => {
    const items = useAppSelector((state) => state.dayEndClose.items);

    const totals = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                if (item.isLoading || item.physicalCount === '') return acc;

                const physicalCount = parseFloat(item.physicalCount);
                const quantitySold = item.bookBalance - physicalCount;
                const salesValue = quantitySold * item.unitPrice;
                const costOfSales = quantitySold * item.costPrice;

                acc.quantitySold += quantitySold;
                acc.salesValue += salesValue;
                acc.costOfSales += costOfSales;
                return acc;
            },
            { quantitySold: 0, salesValue: 0, costOfSales: 0 }
        );
    }, [items]);

    const grossProfit = totals.salesValue - totals.costOfSales;
    const operatingExpenses = 0;
    const netProfit = grossProfit - operatingExpenses;

    const hasCountedSales = items.some((item) => !item.isLoading && item.physicalCount !== '');

    return { ...totals, grossProfit, operatingExpenses, netProfit, hasCountedSales };
};
