import { TableColumn } from 'react-data-table-component';
import { Eye } from 'lucide-react';

export const creditNoteStatusConfig: Record<CreditNoteStatusType, { label: string; bg: string; text: string }> = {
    PENDING: {
        label: 'Pending',
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-700 dark:text-amber-300',
    },
    APPLIED: {
        label: 'Applied',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-700 dark:text-emerald-300',
    },
    CANCELLED: {
        label: 'Cancelled',
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-300',
    },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface CreditNoteColumnOptions {
    onView: (cn: SupplierCreditNote) => void;
}

export const getCreditNoteTableColumns = ({
    onView,
}: CreditNoteColumnOptions): TableColumn<SupplierCreditNote>[] => [
        {
            name: 'Credit Note #',
            selector: (row) => row.creditNoteNumber,
            sortable: true,
            cell: (row) => (
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    {row.creditNoteNumber}
                </span>
            ),
            minWidth: '160px',
            grow: 1,
        },
        {
            name: 'Supplier',
            selector: (row) => row.supplier?.name || '',
            sortable: true,
            cell: (row) => (
                <div className="text-sm py-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate block">
                        {row.supplier?.name || '—'}
                    </span>
                    {row.supplierReturn?.returnNumber && (
                        <p className="text-xs text-sky-600 dark:text-sky-400">
                            Return: {row.supplierReturn.returnNumber}
                        </p>
                    )}
                </div>
            ),
            minWidth: '160px',
            grow: 2,
        },
        {
            name: 'Status',
            selector: (row) => row.status,
            sortable: true,
            cell: (row) => {
                const cfg = creditNoteStatusConfig[row.status];
                return (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                    </span>
                );
            },
            minWidth: '120px',
        },
        {
            name: 'Amount',
            selector: (row) => row.amount,
            sortable: true,
            cell: (row) => (
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.amount)}
                </span>
            ),
            minWidth: '140px',
            grow: 1,
            right: true,
        },
        {
            name: 'Date',
            selector: (row) => row.creditNoteDate?.toString() || '',
            sortable: true,
            cell: (row) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {row.creditNoteDate
                        ? new Date(row.creditNoteDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                        })
                        : '—'}
                </span>
            ),
            minWidth: '130px',
            grow: 1,
        },
        {
            name: 'Applied To',
            cell: (row) => {
                if (!row.appliedToInvoice) return <span className="text-sm text-gray-400 dark:text-gray-500">—</span>;
                return (
                    <span className="text-sm text-sky-600 dark:text-sky-400 font-medium">
                        {row.appliedToInvoice.invoiceNumber || 'Invoice'}
                    </span>
                );
            },
            minWidth: '140px',
            grow: 1,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(row)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                        title="View Return"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            ),
            minWidth: '80px',
            right: true,
        },
    ];
