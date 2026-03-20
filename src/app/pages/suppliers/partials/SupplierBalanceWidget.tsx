import { FunctionComponent, useState, useEffect } from 'react';
import { DollarSign, FileText, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import { supplierInvoiceService } from '../../../services';
import { ROUTES } from '../../../utils/constants';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierBalanceWidgetProps {
    supplierId: string;
    supplierName?: string;
}

const SupplierBalanceWidget: FunctionComponent<SupplierBalanceWidgetProps> = ({
    supplierId,
    supplierName,
}) => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState<{ totalOutstanding: number; invoiceCount: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!supplierId) return;

        (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await supplierInvoiceService.getSupplierBalance(supplierId);
                setBalance(data);
            } catch (err: any) {
                setError('Failed to load balance');
                console.error('Supplier balance error:', err);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [supplierId]);

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Loading supplier balance...</span>
                </div>
            </div>
        );
    }

    if (error || !balance) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Supplier Balance
                </h3>
                <button
                    onClick={() => navigate(ROUTES.SUPPLIER_INVOICES)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                    View Invoices <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Outstanding Balance</p>
                    <p className={`text-xl font-bold ${balance.totalOutstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(balance.totalOutstanding)}
                    </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <FileText className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Open Invoices</p>
                    </div>
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {balance.invoiceCount}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SupplierBalanceWidget;
