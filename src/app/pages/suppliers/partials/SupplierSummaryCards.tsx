import React from 'react';
import { Truck, CheckCircle, XCircle, Package, LucideIcon } from 'lucide-react';
import ProcurementSummaryCards, {
    type ProcurementSummaryCard,
} from '../../../components/stats/ProcurementSummaryCards';

export interface SupplierSummaryCard {
    title: string;
    value: number;
    displayValue?: string;
    icon: 'total' | 'active' | 'inactive' | 'orders';
    bgColor: string;
    iconBgColor: string;
    textColor: string;
}

interface SupplierSummaryCardsProps {
    cards: SupplierSummaryCard[];
    isLoading?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
    total: Truck,
    active: CheckCircle,
    inactive: XCircle,
    orders: Package,
};

const SupplierSummaryCards: React.FC<SupplierSummaryCardsProps> = ({
    cards,
    isLoading,
}) => {
    const mappedCards: ProcurementSummaryCard[] = cards.map((card) => ({
        ...card,
        icon: iconMap[card.icon] || Truck,
    }));

    return (
        <ProcurementSummaryCards cards={mappedCards} isLoading={isLoading} />
    );
};

export default SupplierSummaryCards;
