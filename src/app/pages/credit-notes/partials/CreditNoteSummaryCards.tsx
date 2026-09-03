import type { FunctionComponent } from 'react';
import { Receipt, Clock, CheckCircle2, XCircle, Banknote } from 'lucide-react';
import ProcurementSummaryCards, {
    type ProcurementSummaryCard,
} from '../../../components/stats/ProcurementSummaryCards';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'MWK',
    }).format(value);

interface CreditNoteSummaryCardsProps {
    creditNotes: SupplierCreditNote[];
    isLoading?: boolean;
}

const CreditNoteSummaryCards: FunctionComponent<
    CreditNoteSummaryCardsProps
> = ({ creditNotes, isLoading }) => {
    const total = creditNotes.length;
    const pending = creditNotes.filter((cn) => cn.status === 'PENDING').length;
    const applied = creditNotes.filter((cn) => cn.status === 'APPLIED').length;
    const cancelled = creditNotes.filter(
        (cn) => cn.status === 'CANCELLED',
    ).length;
    const totalValue = creditNotes
        .filter((cn) => cn.status !== 'CANCELLED')
        .reduce((sum, cn) => sum + (cn.amount || 0), 0);

    const cards: ProcurementSummaryCard[] = [
        {
            title: 'Total Notes',
            value: total,
            icon: Receipt,
            bgColor: 'bg-sky-50 dark:bg-sky-900/20',
            iconBgColor: 'bg-sky-100 dark:bg-sky-900/40',
            textColor: 'text-sky-500 dark:text-sky-400',
        },
        {
            title: 'Pending',
            value: pending,
            icon: Clock,
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            iconBgColor: 'bg-amber-100 dark:bg-amber-900/40',
            textColor: 'text-amber-500 dark:text-amber-400',
        },
        {
            title: 'Applied',
            value: applied,
            icon: CheckCircle2,
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            iconBgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
            textColor: 'text-emerald-500 dark:text-emerald-400',
        },
        {
            title: 'Cancelled',
            value: cancelled,
            icon: XCircle,
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            iconBgColor: 'bg-red-100 dark:bg-red-900/40',
            textColor: 'text-red-500 dark:text-red-400',
        },
        {
            title: 'Total Value',
            value: totalValue,
            displayValue: formatCurrency(totalValue),
            icon: Banknote,
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            iconBgColor: 'bg-indigo-100 dark:bg-indigo-900/40',
            textColor: 'text-indigo-500 dark:text-indigo-400',
        },
    ];

    return <ProcurementSummaryCards cards={cards} isLoading={isLoading} />;
};

export default CreditNoteSummaryCards;
