import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import salesService, { DayCloseReportRow, DayCloseReportSummary } from '../../../services/sales.service';

interface UseDayCloseReportParams {
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

export const useDayCloseReport = ({ startDate, endDate }: UseDayCloseReportParams) => {
    const [rows, setRows] = useState<DayCloseReportRow[]>([]);
    const [summary, setSummary] = useState<DayCloseReportSummary>(defaultSummary);
    const [isLoading, setIsLoading] = useState(false);

    const loadReport = useCallback(async () => {
        try {
            setIsLoading(true);

            const query: { startDate?: string; endDate?: string } = {};
            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD');
                query.endDate = endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs(startDate).format('YYYY-MM-DD');
            }

            // Fetched together and behind one loading flag so the stats
            // cards and the table never resolve out of sync with each other.
            const [rowsResponse, summaryResponse] = await Promise.all([
                salesService.getDayCloseReport(query),
                salesService.getDayCloseReportSummary(query),
            ]);

            setRows(rowsResponse || []);
            setSummary(summaryResponse || defaultSummary);
        } catch (error: any) {
            console.error('Error loading day close report:', error);
            toast.error('Error loading day close report: ' + (error?.message || 'Unknown error'));
            setRows([]);
            setSummary(defaultSummary);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    return { rows, summary, isLoading, loadReport };
};
