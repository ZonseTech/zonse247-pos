import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import transactionService from '../services/transactions.service';

export interface TransactionSummaryCard {
    title: string;
    value: number;
    displayValue: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
    isMonetary: boolean;
}

interface UseTransactionSummaryParams {
    searchTerm?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    selectedStatus?: TransactionStatus | 'all';
    selectedPaymentMethod?: string | 'all';
}

const defaultSummary: TransactionSummaryResponse = {
    totalSales: 0,
    totalReturns: 0,
    netSales: 0,
    totalTransactions: 0,
    salesCount: 0,
    returnsCount: 0,
};

export const useTransactionSummary = ({
    searchTerm,
    startDate,
    endDate,
    selectedStatus,
    selectedPaymentMethod,
}: UseTransactionSummaryParams) => {
    const [summary, setSummary] = useState<TransactionSummaryResponse>(defaultSummary);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    const loadSummary = useCallback(async () => {
        try {
            setIsLoadingSummary(true);

            const queryParams: TransactionQueryParams = {};

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
                queryParams.status = selectedStatus;
            }

            if (selectedPaymentMethod && selectedPaymentMethod !== 'all') {
                queryParams.paymentMethodId = selectedPaymentMethod;
            }

            const response = await transactionService.getSummary(queryParams);
            setSummary(response);
        } catch (error: any) {
            console.error('Error loading transaction summary:', error);
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
                value: summary.totalSales,
                displayValue: formatCurrency(summary.totalSales),
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                textColor: 'text-green-700 dark:text-green-400',
                iconBgColor: 'bg-green-100 dark:bg-green-900/40',
                isMonetary: true,
            },
            {
                title: 'Total Returns',
                value: summary.totalReturns,
                displayValue: formatCurrency(summary.totalReturns),
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                textColor: 'text-red-700 dark:text-red-400',
                iconBgColor: 'bg-red-100 dark:bg-red-900/40',
                isMonetary: true,
            },
            {
                title: 'Net Sales',
                value: summary.netSales,
                displayValue: formatCurrency(summary.netSales),
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
                textColor: 'text-blue-700 dark:text-blue-400',
                iconBgColor: 'bg-blue-100 dark:bg-blue-900/40',
                isMonetary: true,
            },
            {
                title: 'Total Transactions',
                value: summary.totalTransactions,
                displayValue: summary.totalTransactions.toLocaleString(),
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
