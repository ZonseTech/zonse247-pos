import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import reportsService, { ReportSummary, ReportSummaryQuery } from '../services/reports.service';

interface UseReportSummaryParams {
    startDate?: Date | null;
    endDate?: Date | null;
    branchId?: string;
    autoFetch?: boolean;
}

interface UseReportSummaryReturn {
    summary: ReportSummary | null;
    isLoading: boolean;
    error: string | null;
    fetchSummary: () => Promise<void>;
    refetch: () => Promise<void>;
}

const defaultSummary: ReportSummary = {
    totalSales: 0,
    grossProfit: 0,
    topStocks: 0,
    topCategory: '',
    receiptCount: 0,
    paymentModes: 0,
};

export const useReportSummary = ({
    startDate,
    endDate,
    branchId,
    autoFetch = true,
}: UseReportSummaryParams = {}): UseReportSummaryReturn => {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const query: ReportSummaryQuery = {};

            if (startDate) {
                query.startDate = dayjs(startDate).format('YYYY-MM-DD');
                query.endDate = endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs(startDate).format('YYYY-MM-DD');
            }

            if (branchId) {
                query.branchId = branchId;
            }

            const response = await reportsService.getSummary(query);
            setSummary(response);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || 'Failed to fetch report summary';
            setError(message);
            console.error('Error fetching report summary:', err);
            toast.error(message);
            setSummary(defaultSummary);
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, branchId]);

    const refetch = useCallback(async () => {
        await fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        if (autoFetch) {
            fetchSummary();
        }
    }, [autoFetch, fetchSummary]);

    return {
        summary,
        isLoading,
        error,
        fetchSummary,
        refetch,
    };
};

export default useReportSummary;
