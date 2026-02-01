import { FunctionComponent } from 'react';
import { formatCurrency } from '../../../../utils';
import { decodeHtmlEntities } from '../../../../utils/text-encoding';
import { SolidDivider } from './ReceiptDividers';

interface ReceiptItemsListProps {
    items: SaleItem[];
}

const ReceiptItemsList: FunctionComponent<ReceiptItemsListProps> = ({ items }) => {
    return (
        <>
            {/* Items Header */}
            <div className="px-4 py-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="flex-1">Item</span>
                    <span className="w-12 text-center">Qty</span>
                    <span className="w-16 text-right">Price</span>
                    <span className="w-16 text-right">Total</span>
                </div>
            </div>

            <div className="border-t border-gray-300 dark:border-gray-600" />

            {/* Items List */}
            <div className="px-4 py-1 space-y-1">
                {items.map((item, index) => (
                    <div key={item.id || index}>
                        <div className="text-[11px] font-medium truncate">
                            {decodeHtmlEntities(item.product?.name) || 'Unknown Product'}
                        </div>
                        <div className="flex justify-between text-[10px]">
                            <span className="flex-1"></span>
                            <span className="w-12 text-center">{item.quantity}</span>
                            <span className="w-16 text-right">{formatCurrency(item.unitPrice)}</span>
                            <span className="w-16 text-right">{formatCurrency(item.totalAmount)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <SolidDivider />
        </>
    );
};

export default ReceiptItemsList;
