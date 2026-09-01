import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import salesService, { DayCloseReportSummary } from '../../../services/sales.service';

interface UseDayCloseReportSummaryParams {
    startDate?: Date | null;
    endDate?: Date | null;
}

const defaultSummary: DayCloseReportSummary = {
    revenue: 0,
    costOfSales: 0,
    grossProfit: 0,
    expenses: 0,
    netProfit: 0,
};

export const useDayCloseReportSummary = ({ startDate, endDate }: UseDayCloseReportSummaryParams) => {
    const [summary, setSummary] = useState<DayCloseReportSummary>(defaultSummary);
    const [isLoading, setIsLoading] = useState(false);

    const loadSummary = useCallback(async () => {
        try {
            setIsLoading(true);

            const query: { startDate?: string; endDate?: string } = {};
            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD');
                query.endDate = endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs(startDate).format('YYYY-MM-DD');
            }

            const response = await salesService.getDayCloseReportSummary(query);
            setSummary(response || defaultSummary);
        } catch (error: any) {
            console.error('Error loading day close report summary:', error);
            toast.error('Error loading day close report summary: ' + (error?.message || 'Unknown error'));
            setSummary(defaultSummary);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    return { summary, isLoading, loadSummary };
};
