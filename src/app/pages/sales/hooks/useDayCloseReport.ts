import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import salesService, { DayCloseReportRow } from '../../../services/sales.service';

interface UseDayCloseReportParams {
    startDate?: Date | null;
    endDate?: Date | null;
}

export const useDayCloseReport = ({ startDate, endDate }: UseDayCloseReportParams) => {
    const [rows, setRows] = useState<DayCloseReportRow[]>([]);
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

            const response = await salesService.getDayCloseReport(query);
            setRows(response || []);
        } catch (error: any) {
            console.error('Error loading day close report:', error);
            toast.error('Error loading day close report: ' + (error?.message || 'Unknown error'));
            setRows([]);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

    return { rows, isLoading, loadReport };
};
