import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import salesService, { DayCloseReportDetails } from '../../../services/sales.service';

export const useDayCloseReportDetails = (date: string | undefined) => {
    const [details, setDetails] = useState<DayCloseReportDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadDetails = useCallback(async () => {
        if (!date) return;

        try {
            setIsLoading(true);
            const response = await salesService.getDayCloseReportDetails(date);
            setDetails(response);
        } catch (error: any) {
            console.error('Error loading day close report details:', error);
            toast.error('Error loading day close report details: ' + (error?.message || 'Unknown error'));
            setDetails(null);
        } finally {
            setIsLoading(false);
        }
    }, [date]);

    useEffect(() => {
        loadDetails();
    }, [loadDetails]);

    return { details, isLoading, loadDetails };
};
