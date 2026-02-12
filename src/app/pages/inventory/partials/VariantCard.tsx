import { FunctionComponent } from 'react';
import {
    BarcodeIcon,
    Package,
    Calendar,
    Tag,
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
    const sellingPrice = Number(variant.sellingPrice) || 0;
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
                        {formatCurrency(sellingPrice, true)}
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
                <div className={`p-1.5 rounded-sm ${variant.primaryBarcode || (variant.barcodes && variant.barcodes.length > 0) ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <BarcodeIcon className="w-3 h-3 text-white" />
                </div>
                <div className={`p-1.5 rounded-sm ${variant.expirationDate || variant.manufactureDate ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <Calendar className="w-3 h-3 text-white" />
                </div>
                <div className={`p-1.5 rounded-sm ${variant.description ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <Tag className="w-3 h-3 text-white" />
                </div>
                <div className={`p-1.5 rounded-sm ${variant.sku ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <Package className="w-3 h-3 text-white" />
                </div>
            </div>
        </FormFieldCard>
    );
};

export default VariantCard;
