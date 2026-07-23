import type { ReactNode } from 'react';
import { DollarSign, TrendingUp, Users, Package, Tag, Receipt, CreditCard, Coins } from 'lucide-react';
import type { ReportId, ReportVisualKey } from '../../../hooks/useReportsSummary';

export interface ReportVisual {
    icon: ReactNode;
    accent: string;
}

export const REPORT_VISUALS: Record<ReportVisualKey, ReportVisual> = {
    revenue: { icon: <DollarSign className="w-5 h-5 text-sky-600 dark:text-sky-400" />, accent: 'bg-sky-500' },
    profit: { icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, accent: 'bg-emerald-500' },
    'service-orders': { icon: <Users className="w-5 h-5 text-rose-600 dark:text-rose-400" />, accent: 'bg-rose-500' },
    'top-stocks': { icon: <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />, accent: 'bg-purple-500' },
    'top-category': { icon: <Tag className="w-5 h-5 text-amber-600 dark:text-amber-400" />, accent: 'bg-amber-500' },
    'receipt-count': { icon: <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, accent: 'bg-indigo-500' },
    'payment-modes': { icon: <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />, accent: 'bg-teal-500' },
    'average-sale': { icon: <Coins className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />, accent: 'bg-fuchsia-500' },
};

/**
 * Neutral (uncolored) icons for the six detail reports, keyed directly by report id —
 * used in Panel headers (dashboard/partials/Panel.tsx wraps the icon in its own gray span,
 * matching TopSellingProducts/PaymentMethodsChart/RevenueChart's convention of passing plain icons).
 */
export const REPORT_ID_ICONS: Record<NonNullable<ReportId>, ReactNode> = {
    'total-sales': <DollarSign className="w-4 h-4" />,
    'gross-profit': <TrendingUp className="w-4 h-4" />,
    'top-stocks': <Package className="w-4 h-4" />,
    'top-category': <Tag className="w-4 h-4" />,
    'receipt-count': <Receipt className="w-4 h-4" />,
    'payment-modes': <CreditCard className="w-4 h-4" />,
};
