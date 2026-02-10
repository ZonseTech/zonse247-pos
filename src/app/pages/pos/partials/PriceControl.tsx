import { formatCurrency } from '../../../utils';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { useFocusManager } from '../../../hooks/useFocusManager';
import type { FunctionComponent } from 'react';
import { useRef, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import classNames from 'classnames';

interface PriceControlProps {
    sellPrice: number;
    categoryId: string;
    productId: string;
    customPriceInput: string;
    onPriceChange: (productId: string, value: string) => void;
    focusManager?: ReturnType<typeof useFocusManager>;
    compact?: boolean;
}

const PriceControl: FunctionComponent<PriceControlProps> = ({
    sellPrice,
    categoryId,
    productId,
    customPriceInput,
    onPriceChange,
    focusManager,
    compact = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isCustomItem = categoryId === DEFAULT_SEED_KEY;
    const isActive = focusManager?.isActive('price', productId) ?? false;

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isActive]);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCustomItem && focusManager) {
            focusManager.setActiveComponent('price', productId);
        }

        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const handleFocus = () => {
        if (isCustomItem && focusManager) {
            focusManager.setActiveComponent('price', productId);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            onPriceChange(productId, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '' || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
            onPriceChange(productId, '0.00');
        } else {
            const numericValue = parseFloat(value);
            onPriceChange(productId, numericValue.toFixed(2));
        }

        focusManager?.clearFocus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            focusManager?.clearFocus();
            inputRef.current?.blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const currentValue = parseFloat(customPriceInput) || 0;
            const newValue = Math.min(999999.99, currentValue + 1);
            onPriceChange(productId, newValue.toFixed(2));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const currentValue = parseFloat(customPriceInput) || 0;
            const newValue = Math.max(0, currentValue - 1);
            onPriceChange(productId, newValue.toFixed(2));
        }
    };

    if (isCustomItem) {
        return (
            <div className={classNames(
                "relative inline-flex items-center overflow-hidden shadow-sm",
                compact ? "rounded-lg" : "rounded-xl",
                isActive
                    ? 'ring-2 ring-amber-500 dark:ring-amber-400 shadow-amber-500/20'
                    : 'ring-1 ring-gray-200 dark:ring-gray-700'
            )}>
                <div className={classNames(
                    "flex items-center justify-center transition-all duration-200",
                    compact ? "w-5 h-5" : "w-10 h-10",
                    isActive
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}>
                    <span className={compact ? "text-[7px] font-bold" : "text-xs font-bold"}>MK</span>
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={customPriceInput}
                    onChange={handleChange}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={classNames(
                        "font-bold text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",
                        "border-0 focus:outline-none transition-all duration-200",
                        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                        isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : '',
                        compact ? "w-12 h-5 px-1 text-[10px]" : "w-24 h-10 px-3 text-base"
                    )}
                    min="0"
                    max="9999999.99"
                    step="0.01"
                    placeholder="0.00"
                />
            </div>
        );
    }

    return (
        <div className={classNames(
            "inline-flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-200 dark:ring-emerald-500/30",
            compact ? "px-1 py-0.5 rounded" : "px-3 py-2 rounded-xl"
        )}>
            <DollarSign size={compact ? 10 : 16} className="text-emerald-500 dark:text-emerald-400" />
            <span className={classNames(
                "font-bold text-emerald-700 dark:text-emerald-400",
                compact ? "text-[10px]" : "text-base"
            )}>
                {formatCurrency(sellPrice)}
            </span>
        </div>
    );
};

export default PriceControl;