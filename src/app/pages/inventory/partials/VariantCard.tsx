import { FunctionComponent } from 'react';
import {
    BarcodeIcon,
    Receipt,
    Package,
    Calendar,
    Palette,
    Truck,
} from 'lucide-react';
import { FormFieldCard } from '../../../components';
import { formatCurrency } from '../../../utils';
import { Variant } from '../types/variant.types';

interface VariantCardProps {
    variant: Variant;
    index: number;
    onClick: () => void;
}

const VariantCard: FunctionComponent<VariantCardProps> = ({ variant, index, onClick }) => {
    const sellPrice = Number(variant.sellPrice) || 0;
    const costPrice = Number(variant.costPrice) || 0;
    const quantity = Number(variant.quantity) || 0;

    return (
        <FormFieldCard onClick={onClick} className="cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors !p-3">
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    {variant.variantName || `Enter Variant Name`}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 py-2 border-y border-gray-200 dark:border-gray-700">
                <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Selling Price <span>*</span></span>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(sellPrice, true)}
                    </p>
                </div>
                <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Cost Price</span>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {costPrice > 0 ? formatCurrency(costPrice, true) : '-'}
                    </p>
                </div>
                <div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Stock</span>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {quantity > 0 ? quantity : '-'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <BarcodeIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <Receipt className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <Package className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <Calendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <Palette className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    <Truck className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                </div>
            </div>
        </FormFieldCard>
    );
};

export default VariantCard;
