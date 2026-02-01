import { FunctionComponent } from 'react';
import { Banknote, CreditCard, Smartphone, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils';

const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
};

interface CollapsibleSaleCardProps {
    sale: Sale;
    isExpanded: boolean;
    onToggle: () => void;
    onView?: (sale: Sale) => void;
    onReturn?: (sale: Sale) => void;
    onDelete?: (sale: Sale) => void;
}

const getPaymentIcon = (paymentMethodId?: string) => {
    switch (paymentMethodId) {
        case 'cash':
            return <Banknote className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
        case 'mobile-money':
            return <Smartphone className="w-5 h-5 text-sky-500 dark:text-sky-400" />;
        case 'bank-transfer':
            return <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
        default:
            return <Banknote className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
    }
};

const getPaymentBgColor = (paymentMethodId?: string) => {
    switch (paymentMethodId) {
        case 'cash':
            return 'bg-emerald-100 dark:bg-emerald-900/30';
        case 'mobile-money':
            return 'bg-sky-100 dark:bg-sky-900/30';
        case 'bank-transfer':
            return 'bg-purple-100 dark:bg-purple-900/30';
        default:
            return 'bg-gray-100 dark:bg-gray-800';
    }
};

const CollapsibleSaleCard: FunctionComponent<CollapsibleSaleCardProps> = ({
    sale,
    isExpanded,
    onToggle,
    onView,
    onReturn,
    onDelete,
}) => {
    const saleNumber = sale.saleNumber || sale.id?.slice(-8) || 'N/A';
    const saleDate = sale.createdAt ? formatDate(sale.createdAt.toString()) : 'N/A';
    const itemCount = sale.items?.length || 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getPaymentBgColor(sale.paymentMethodId)} flex items-center justify-center`}>
                        {getPaymentIcon(sale.paymentMethodId)}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            #{saleNumber}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{saleDate}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="font-bold text-emerald-500 dark:text-emerald-400">
                            {formatCurrency(sale.totalAmount, true)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </button>

            {isExpanded && sale.items && sale.items.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-3 space-y-0.5">
                        {sale.items.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="flex items-center justify-between py-1 px-2 bg-white dark:bg-gray-700/50 rounded-md"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                        {decodeHtmlEntities(item.product?.name || 'Unknown Product')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        x{item.quantity}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-white min-w-[80px] text-right">
                                        {formatCurrency(item.quantity * item.unitPrice)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-3 pb-3">
                        <div className="flex justify-end items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView?.(sale);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors text-xs font-semibold"
                                    aria-label="View sale"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onReturn?.(sale);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-xs font-semibold"
                                    aria-label="Return sale"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Return
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(sale);
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-semibold"
                                    aria-label="Delete sale"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollapsibleSaleCard;
