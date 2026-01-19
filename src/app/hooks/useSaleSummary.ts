import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import salesService from '../services/sales.service';

/**
 * Hook for sales summary (migrated from transaction summary)
 */

export interface SaleSummaryCard {
    title: string;
    value: number;
    displayValue: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
    isMonetary: boolean;
}

/** @deprecated Use SaleSummaryCard instead */
export type TransactionSummaryCard = SaleSummaryCard;

interface UseSaleSummaryParams {
    searchTerm?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    selectedStatus?: SaleStatus | TransactionStatus | 'all';
    selectedPaymentMethod?: string | 'all';
}

/** @deprecated Use UseSaleSummaryParams instead */
type UseTransactionSummaryParams = UseSaleSummaryParams;

const defaultSummary: SaleSummaryResponse = {
    totalSales: 0,
    totalVoided: 0,
    netSales: 0,
    totalCount: 0,
    completedCount: 0,
    voidedCount: 0,
    refundedCount: 0,
};

export const useSaleSummary = ({
    searchTerm,
    startDate,
    endDate,
    selectedStatus,
    selectedPaymentMethod,
}: UseSaleSummaryParams) => {
    const [summary, setSummary] = useState<SaleSummaryResponse>(defaultSummary);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const loadSummary = useCallback(async () => {
        try {
            setIsLoadingSummary(true);

            const queryParams: SaleQueryParams = {};

            if (searchTerm) {
                queryParams.search = searchTerm;
            }

            if (startDate) {
                queryParams.startDate = dayjs(startDate).format('YYYY-MM-DD');
                queryParams.endDate = endDate
                    ? dayjs(endDate).format('YYYY-MM-DD')
                    : dayjs(startDate).format('YYYY-MM-DD');
            }

            if (selectedStatus && selectedStatus !== 'all') {
                queryParams.status = selectedStatus as SaleStatus;
            }

            if (selectedPaymentMethod && selectedPaymentMethod !== 'all') {
                queryParams.paymentMethodId = selectedPaymentMethod;
            }

            const response = await salesService.getSummary(queryParams);
            setSummary(response);
        } catch (error: any) {
            console.error('Error loading sales summary:', error);
            toast.error('Error loading summary: ' + (error?.message || 'Unknown error'));
            setSummary(defaultSummary);
        } finally {
            setIsLoadingSummary(false);
        }
    }, [searchTerm, startDate, endDate, selectedStatus, selectedPaymentMethod]);

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
            .format(amount || 0)
            .replace(/^/, 'MK');
    };

    const getSummaryCards = useCallback((): TransactionSummaryCard[] => {
        return [
            {
                title: 'Total Sales',
                value: summary.totalSales || 0,
                displayValue: formatCurrency(summary.totalSales || 0),
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                textColor: 'text-green-700 dark:text-green-400',
                iconBgColor: 'bg-green-100 dark:bg-green-900/40',
                isMonetary: true,
            },
            {
                title: 'Total Voided',
                value: summary.totalVoided || 0,
                displayValue: formatCurrency(summary.totalVoided || 0),
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-400',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                isMonetary: true,
            },
            {
                title: 'Net Sales',
                value: summary.netSales || 0,
                displayValue: formatCurrency(summary.netSales || 0),
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-700 dark:text-blue-400',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                isMonetary: true,
            },
            {
                title: 'Total Sales Count',
                value: summary.totalCount || 0,
                displayValue: (summary.totalCount || 0).toLocaleString(),
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-700 dark:text-purple-400',
                iconBgColor: 'bg-purple-100 dark:bg-purple-900/40',
                isMonetary: false,
            },
        ];
    }, [summary]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    return {
        summary,
        isLoadingSummary,
        loadSummary,
        getSummaryCards,
    };
};

/** @deprecated Use useSaleSummary instead */
export const useTransactionSummary = useSaleSummary;
