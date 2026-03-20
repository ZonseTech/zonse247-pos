import type { FunctionComponent } from 'react';
import { Eye, CheckCircle, Truck, PackageCheck, Ban, Trash2 } from 'lucide-react';
import { returnStatusConfig } from './SupplierReturnTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

interface SupplierReturnMobileCardProps {
    returnItem: SupplierReturnWithItems;
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
}

const SupplierReturnMobileCard: FunctionComponent<SupplierReturnMobileCardProps> = ({
    returnItem,
    onView,
    onApprove,
    onShip,
    onComplete,
    onCancel,
    onDelete,
}) => {
    const cfg = returnStatusConfig[returnItem.status];

    return (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {returnItem.returnNumber}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {returnItem.supplier?.name || '—'}
                    </p>
                    {returnItem.purchaseOrder?.poNumber && (
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                            PO: {returnItem.purchaseOrder.poNumber}
                        </p>
                    )}
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {formatCurrency(returnItem.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {returnItem.items?.length || 0} item(s)
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {returnItem.returnDate && (
                        <span>
                            {new Date(returnItem.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(returnItem)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {returnItem.status === 'DRAFT' && (
                        <button
                            onClick={() => onApprove(returnItem)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                    {returnItem.status === 'APPROVED' && (
                        <button
                            onClick={() => onShip(returnItem)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        >
                            <Truck className="w-4 h-4" />
                        </button>
                    )}
                    {returnItem.status === 'SHIPPED' && (
                        <button
                            onClick={() => onComplete(returnItem)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        >
                            <PackageCheck className="w-4 h-4" />
                        </button>
                    )}
                    {['DRAFT', 'APPROVED'].includes(returnItem.status) && (
                        <button
                            onClick={() => onCancel(returnItem)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Ban className="w-4 h-4" />
                        </button>
                    )}
                    {returnItem.status === 'DRAFT' && (
                        <button
                            onClick={() => onDelete(returnItem)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Mobile List Wrapper ────────────────────────────────────────────────────

interface SupplierReturnMobileListProps {
    returns: SupplierReturnWithItems[];
    onView: (r: SupplierReturnWithItems) => void;
    onApprove: (r: SupplierReturnWithItems) => void;
    onShip: (r: SupplierReturnWithItems) => void;
    onComplete: (r: SupplierReturnWithItems) => void;
    onCancel: (r: SupplierReturnWithItems) => void;
    onDelete: (r: SupplierReturnWithItems) => void;
    isLoading: boolean;
}

export const SupplierReturnMobileList: FunctionComponent<SupplierReturnMobileListProps> = ({
    returns,
    onView,
    onApprove,
    onShip,
    onComplete,
    onCancel,
    onDelete,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            </div>
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {returns.map((r) => (
                <SupplierReturnMobileCard
                    key={r.id}
                    returnItem={r}
                    onView={onView}
                    onApprove={onApprove}
                    onShip={onShip}
                    onComplete={onComplete}
                    onCancel={onCancel}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
};

export default SupplierReturnMobileCard;
