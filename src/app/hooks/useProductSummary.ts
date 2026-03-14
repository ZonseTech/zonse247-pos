import { useState } from 'react';
import { toast } from 'react-toastify';
import { productService } from '../services';

export interface SummaryCard {
    title: string;
    value: number;
    bgColor: string;
    onClick: () => void;
}

export const useProductSummary = (
    setActiveFilter: (filter: string) => void,
    setStatusFilter: (status: ProductStatus | '') => void
) => {
    const [summaryData, setSummaryData] = useState<SummaryCard[]>([
        { title: 'Total Products', value: 0, bgColor: 'bg-sky-400', onClick: () => ({}) },
        { title: 'Active', value: 0, bgColor: 'bg-green-400', onClick: () => ({}) },
        { title: 'Inactive', value: 0, bgColor: 'bg-gray-400', onClick: () => ({}) },
        { title: 'Out of Stock', value: 0, bgColor: 'bg-orange-400', onClick: () => ({}) },
        { title: 'Discontinued', value: 0, bgColor: 'bg-red-500', onClick: () => ({}) },
    ]);

    const loadSummary = async (products: ProductWithInventory[]) => {
        try {
            const totalProducts = products.length;
            const active = products.filter(p => p.status === 'ACTIVE' || (p.isActive && !p.status)).length;
            const inactive = products.filter(p => p.status === 'INACTIVE' || (!p.isActive && !p.status)).length;
            const outOfStock = products.filter(p => p.status === 'OUT_OF_STOCK').length;
            const discontinued = products.filter(p => p.status === 'DISCONTINUED').length;

            const newSummaryData = [
                {
                    title: 'Total Products',
                    value: totalProducts,
                    bgColor: 'bg-sky-400',
                    onClick: () => {
                        setActiveFilter('all');
                        setStatusFilter('');
                    }
                },
                {
                    title: 'Active',
                    value: active,
                    bgColor: 'bg-green-400',
                    onClick: () => {
                        setActiveFilter('active');
                        setStatusFilter('ACTIVE');
                    }
                },
                {
                    title: 'Inactive',
                    value: inactive,
                    bgColor: 'bg-gray-400',
                    onClick: () => {
                        setActiveFilter('inactive');
                        setStatusFilter('INACTIVE');
                    }
                },
                {
                    title: 'Out of Stock',
                    value: outOfStock,
                    bgColor: 'bg-orange-400',
                    onClick: () => {
                        setActiveFilter('out-of-stock');
                        setStatusFilter('OUT_OF_STOCK');
                    }
                },
                {
                    title: 'Discontinued',
                    value: discontinued,
                    bgColor: 'bg-red-500',
                    onClick: () => {
                        setActiveFilter('discontinued');
                        setStatusFilter('DISCONTINUED');
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
