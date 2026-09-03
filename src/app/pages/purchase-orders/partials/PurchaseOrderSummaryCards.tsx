import React, { useMemo } from 'react';
import { Clock, Send, CheckCircle, Package, LucideIcon } from 'lucide-react';
import ProcurementSummaryCards, {
    type ProcurementSummaryCard,
} from '../../../components/stats/ProcurementSummaryCards';

export interface POSummaryCard {
    title: string;
    value: number;
    displayValue: string;
    bgColor: string;
    textColor: string;
    iconBgColor: string;
}

interface PurchaseOrderSummaryCardsProps {
    purchaseOrders: PurchaseOrder[];
    totalRows: number;
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    'Pending / Draft': Clock,
    'Sent / In Transit': Send,
    'Partial Received': Package,
    Received: CheckCircle,
};

function buildSummaryCards(
    purchaseOrders: PurchaseOrder[],
    totalRows: number,
): POSummaryCard[] {
    const pendingCount = purchaseOrders.filter(
        (po) => po.status === 'PENDING' || po.status === 'DRAFT',
    ).length;
    const sentCount = purchaseOrders.filter(
        (po) => po.status === 'SENT' || po.status === 'SHIPPED',
    ).length;
    const partialCount = purchaseOrders.filter(
        (po) => po.status === 'PARTIALLY_RECEIVED',
    ).length;
    const receivedCount = purchaseOrders.filter(
        (po) => po.status === 'RECEIVED',
    ).length;

    return [
        {
            title: 'Pending / Draft',
            value: pendingCount,
            displayValue: String(pendingCount),
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-500 dark:text-amber-400',
        },
        {
            title: 'Sent / In Transit',
            value: sentCount,
            displayValue: String(sentCount),
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
            textColor: 'text-indigo-500 dark:text-indigo-400',
        },
        {
            title: 'Partial Received',
            value: partialCount,
            displayValue: String(partialCount),
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            iconBgColor: 'bg-cyan-100 dark:bg-cyan-900/40',
            textColor: 'text-cyan-500 dark:text-cyan-400',
        },
        {
            title: 'Received',
            value: receivedCount,
            displayValue: String(receivedCount),
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
    ];
}

const PurchaseOrderSummaryCards: React.FC<PurchaseOrderSummaryCardsProps> = ({
    purchaseOrders,
    totalRows,
    isLoading,
}) => {
    const cards = useMemo(
        () => buildSummaryCards(purchaseOrders, totalRows),
        [purchaseOrders, totalRows],
    );

    const mappedCards: ProcurementSummaryCard[] = cards.map((card) => ({
        ...card,
        icon: iconMap[card.title] || Clock,
    }));

    return (
        <ProcurementSummaryCards cards={mappedCards} isLoading={isLoading} />
    );
};

export default PurchaseOrderSummaryCards;
