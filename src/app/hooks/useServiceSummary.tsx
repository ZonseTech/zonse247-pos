import { useState, useEffect, useCallback } from 'react';
import { Wrench, TrendingUp, DollarSign, Clock } from 'lucide-react';
import serviceService from '../services/service.service';
import type { SummaryCardItem } from '../components';

interface UseServiceSummaryParams {
    statusFilter: 'all' | 'active' | 'inactive';
    pricingTypeFilter: ServicePricingType | 'all';
    categoryFilter: string | 'all';
}

const defaultSummary: ServiceSummary = {
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    pricing: {
        averagePrice: 0,
        highestPrice: 0,
        lowestPrice: 0,
        servicesWithNoPrice: 0,
    },
    byPricingType: [],
    byCategory: [],
    duration: {
        averageDurationMin: 0,
        shortestDurationMin: 0,
        longestDurationMin: 0,
        servicesWithNoDuration: 0,
    },
};

const formatMK = (amount: number): string =>
    `MK ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDuration = (mins: number): string => {
    if (!mins) return '—';
    if (mins >= 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m ? `${h}h ${m}m` : `${h}h`;
    }
    return `${mins}m`;
};

export const useServiceSummary = ({
    statusFilter,
    pricingTypeFilter,
    categoryFilter,
}: UseServiceSummaryParams) => {
    const [summary, setSummary] = useState<ServiceSummary>(defaultSummary);
    const [isLoading, setIsLoading] = useState(false);

    const loadSummary = useCallback(async () => {
        try {
            setIsLoading(true);
            const query: ServiceSummaryQuery = {};
            if (statusFilter === 'active') query.isActive = 'true';
            else if (statusFilter === 'inactive') query.isActive = 'false';
            if (pricingTypeFilter !== 'all') query.pricingType = pricingTypeFilter;
            if (categoryFilter !== 'all') query.categoryId = categoryFilter;

            const result = await serviceService.summary(query);
            setSummary(result);
        } catch (error: any) {
            console.error('Error loading service summary:', error);
            setSummary(defaultSummary);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, pricingTypeFilter, categoryFilter]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const getSummaryCards = useCallback((): SummaryCardItem[] => {
        const { totalServices, pricing, duration } = summary;

        return [
            {
                title: 'Total Services',
                value: totalServices,
                icon: <Wrench className="w-5 h-5" />,
                bgColor: 'bg-sky-50 dark:bg-sky-900/20',
                iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
                textColor: 'text-sky-500 dark:text-sky-400',
            },
            {
                title: 'Avg. Price',
                value: formatMK(pricing.averagePrice),
                icon: <TrendingUp className="w-5 h-5" />,
                bgColor: 'bg-violet-50 dark:bg-violet-900/20',
                iconBgColor: 'bg-violet-100 dark:bg-violet-900/40',
                textColor: 'text-violet-500 dark:text-violet-400',
            },
            {
                title: 'Price Range',
                value: pricing.highestPrice > 0
                    ? `${formatMK(pricing.lowestPrice)} – ${formatMK(pricing.highestPrice)}`
                    : '—',
                icon: <DollarSign className="w-5 h-5" />,
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
                textColor: 'text-emerald-500 dark:text-emerald-400',
            },
            {
                title: 'Avg. Duration',
                value: formatDuration(Math.round(duration.averageDurationMin)),
                icon: <Clock className="w-5 h-5" />,
                bgColor: 'bg-amber-50 dark:bg-amber-900/20',
                iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
                textColor: 'text-amber-500 dark:text-amber-400',
            },
        ];
    }, [summary]);

    return {
        summary,
        isLoading,
        loadSummary,
        getSummaryCards,
    };
};
