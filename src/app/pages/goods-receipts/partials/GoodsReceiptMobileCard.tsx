import { FC } from 'react';
import { Eye, CheckCircle, FileCheck, Ban, Package, ChevronRight } from 'lucide-react';
import { grnStatusConfig } from './GoodsReceiptTableColumns';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK' }).format(value);

// ─── Single Card ────────────────────────────────────────────────────────────

interface CardProps {
    grn: GoodsReceiptWithItems;
    onView: (grn: GoodsReceiptWithItems) => void;
    onVerify: (grn: GoodsReceiptWithItems) => void;
    onPost: (grn: GoodsReceiptWithItems) => void;
    onCancel: (grn: GoodsReceiptWithItems) => void;
}

const GoodsReceiptMobileCard: FC<CardProps> = ({ grn, onView, onVerify, onPost, onCancel }) => {
    const statusCfg = grnStatusConfig[grn.status];
    const totalCost = grn.items?.reduce(
        (sum, item) => sum + (item.totalCost || item.receivedQuantity * item.unitCost),
        0,
    ) || 0;

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {grn.receiptNumber}
                        </p>
                        {grn.purchaseOrder?.poNumber && (
                            <p className="text-xs text-sky-600 dark:text-sky-400">
                                PO: {grn.purchaseOrder.poNumber}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text} flex-shrink-0`}>
                    {statusCfg.label}
                </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Items</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{grn.items?.length || 0}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Cost</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(totalCost)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {grn.purchaseOrder?.supplier?.name || '—'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={() => onView(grn)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
                >
                    <Eye className="w-3.5 h-3.5" />
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {grn.status === 'DRAFT' && (
                    <button
                        onClick={() => onVerify(grn)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verify
                    </button>
                )}

                {grn.status === 'VERIFIED' && (
                    <button
                        onClick={() => onPost(grn)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                    >
                        <FileCheck className="w-3.5 h-3.5" />
                        Post
                    </button>
                )}

                {['DRAFT', 'VERIFIED'].includes(grn.status) && (
                    <button
                        onClick={() => onCancel(grn)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                        <Ban className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
};

// ─── List Wrapper ───────────────────────────────────────────────────────────

interface MobileListProps {
    goodsReceipts: GoodsReceiptWithItems[];
    onView: (grn: GoodsReceiptWithItems) => void;
    onVerify: (grn: GoodsReceiptWithItems) => void;
    onPost: (grn: GoodsReceiptWithItems) => void;
    onCancel: (grn: GoodsReceiptWithItems) => void;
    isLoading?: boolean;
}

export const GoodsReceiptMobileList: FC<MobileListProps> = ({
    goodsReceipts,
    onView,
    onVerify,
    onPost,
    onCancel,
    isLoading,
}) => {
    if (isLoading) {
        return (
            <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg" />
                            <div className="space-y-1 flex-1">
                                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-32" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="space-y-1">
                                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            {goodsReceipts.map((grn) => (
                <GoodsReceiptMobileCard
                    key={grn.id}
                    grn={grn}
                    onView={onView}
                    onVerify={onVerify}
                    onPost={onPost}
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
};

export default GoodsReceiptMobileCard;
