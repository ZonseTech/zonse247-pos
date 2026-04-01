import { FunctionComponent } from 'react';
import { Send, Package, Ban } from 'lucide-react';
import { Button } from '../../../components';
import { formatCurrency, formatDate, poStatusConfig } from './helpers';

interface POStatusCardProps {
    purchaseOrder: PurchaseOrder;
    onSend: () => void;
    onReceive: () => void;
    onCancel: () => void;
}

const POStatusCard: FunctionComponent<POStatusCardProps> = ({ purchaseOrder, onSend, onReceive, onCancel }) => {
    const statusCfg = poStatusConfig[purchaseOrder.status];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    {statusCfg && (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.label}
                        </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {purchaseOrder.poNumber}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {['DRAFT', 'PENDING'].includes(purchaseOrder.status) && (
                        <Button type="button" theme="primary" onClick={onSend}>
                            <Send className="w-4 h-4 mr-2" />
                            Send to Supplier
                        </Button>
                    )}
                    {['SENT', 'SHIPPED', 'PARTIALLY_RECEIVED'].includes(purchaseOrder.status) && (
                        <Button type="button" theme="success" onClick={onReceive}>
                            <Package className="w-4 h-4 mr-2" />
                            Quick Receive
                        </Button>
                    )}
                    {['DRAFT', 'SENT'].includes(purchaseOrder.status) && (
                        <Button type="button" theme="danger" layout="outline" onClick={onCancel}>
                            <Ban className="w-4 h-4 mr-2" />
                            Cancel Order
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                        {purchaseOrder.supplier?.name || '—'}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                        {formatDate(purchaseOrder.orderDate)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expected Delivery</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5">
                        {formatDate(purchaseOrder.expectedDeliveryDate)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                        {formatCurrency(purchaseOrder.totalAmount ?? 0)}
                    </p>
                </div>
                {purchaseOrder.requisition && (
                    <div className="col-span-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">From Requisition</p>
                        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {purchaseOrder.requisition.requisitionNumber}
                        </p>
                    </div>
                )}
                {purchaseOrder.notes && (
                    <div className="col-span-2 sm:col-span-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Notes</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                            {purchaseOrder.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default POStatusCard;
