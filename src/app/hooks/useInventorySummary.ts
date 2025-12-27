import { useState } from 'react';
import { toast } from 'react-toastify';
import inventoryService from '../services/inventory.service';

export interface SummaryCard {
    title: string;
    value: number;
    bgColor: string;
    onClick: () => void;
}

export const useInventorySummary = (
    setActiveFilter: (filter: string) => void,
    loadInventory: () => void,
    applyFilters: (filters: { search?: string; categoryId?: number; filter?: string }) => void
) => {
    const [summaryData, setSummaryData] = useState<SummaryCard[]>([
        { title: 'Total Stock', value: 0, bgColor: 'bg-green-400', onClick: () => ({}) },
        { title: 'New Stock', value: 0, bgColor: 'bg-green-400', onClick: () => ({}) },
        { title: 'Low Stock', value: 0, bgColor: 'bg-amber-400', onClick: () => ({}) },
        { title: 'Expiring Soon', value: 0, bgColor: 'bg-yellow-400', onClick: () => ({}) },
        { title: 'Expired', value: 0, bgColor: 'bg-red-500', onClick: () => ({}) },
    ]);

    const loadSummary = async () => {
        try {
            const [summary, count] = await Promise.all([
                inventoryService.getSummary(),
                inventoryService.getCount().catch(() => ({ lowStock: 0 } as any))
            ]);

            const newSummaryData = [
                {
                    title: 'Total Stock',
                    value: summary.totalStock,
                    bgColor: 'bg-green-400',
                    onClick: () => {
                        setActiveFilter('all');
                        loadInventory();
                    }
                },
                {
                    title: 'New Stock',
                    value: summary.newStock,
                    bgColor: 'bg-green-400',
                    onClick: () => {
                        setActiveFilter('new');
                        applyFilters({ filter: 'new' });
                    }
                },
                {
                    title: 'Low Stock',
                    value: count?.lowStock ?? 0,
                    bgColor: 'bg-amber-400',
                    onClick: () => {
                        setActiveFilter('low-stock');
                        applyFilters({ filter: 'low-stock' });
                    }
                },
                {
                    title: 'Expiring Soon',
                    value: summary.expiringSoon,
                    bgColor: 'bg-yellow-400',
                    onClick: () => {
                        setActiveFilter('expiring');
                        applyFilters({ filter: 'expiring' });
                    }
                },
                {
                    title: 'Expired',
                    value: summary.expired,
                    bgColor: 'bg-red-500',
                    onClick: () => {
                        setActiveFilter('expired');
                        applyFilters({ filter: 'expired' });
                    }
                }
            ];
            setSummaryData(newSummaryData);
        } catch (error: any) {
            toast.error("Error loading summary: " + error?.error?.response?.data?.message);
        }
    };

    return {
        summaryData,
        loadSummary
    };
};