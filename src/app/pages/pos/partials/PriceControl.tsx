import { formatCurrency } from '../../../utils';
import { DEFAULT_SEED_KEY } from '../../../constants';
import { useFocusManager } from '../../../hooks/useFocusManager';
import type { FunctionComponent } from 'react';
import { useRef, useEffect } from 'react';

interface PriceControlProps {
    sellPrice: number;
    categoryUuid: string;
    productUuid: string;
    customPriceInput: string;
    onPriceChange: (productUuid: string, value: string) => void;
    focusManager: ReturnType<typeof useFocusManager>;
}

const PriceControl: FunctionComponent<PriceControlProps> = ({
    sellPrice,
    categoryUuid,
    productUuid,
    customPriceInput,
    onPriceChange,
    focusManager
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isCustomItem = categoryUuid === DEFAULT_SEED_KEY;
    const isActive = focusManager.isActive('price', productUuid);

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isActive]);

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isCustomItem) {
            focusManager.setActiveComponent('price', productUuid);
        }

        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const handleFocus = () => {
        if (isCustomItem) {
            focusManager.setActiveComponent('price', productUuid);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            onPriceChange(productUuid, value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '' || isNaN(parseFloat(value)) || parseFloat(value) < 0) {
            onPriceChange(productUuid, '0.00');
        } else {
            const numericValue = parseFloat(value);
            onPriceChange(productUuid, numericValue.toFixed(2));
        }

        focusManager.clearFocus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            focusManager.clearFocus();
            inputRef.current?.blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const currentValue = parseFloat(customPriceInput) || 0;
            const newValue = Math.min(999999.99, currentValue + 1);
            onPriceChange(productUuid, newValue.toFixed(2));
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const currentValue = parseFloat(customPriceInput) || 0;
            const newValue = Math.max(0, currentValue - 1);
            onPriceChange(productUuid, newValue.toFixed(2));
        }
    };

    if (isCustomItem) {
        return (
            <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm z-10">
                    MK
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={customPriceInput}
                    onChange={handleChange}
                    onClick={handleClick}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className={`w-28 pl-8 pr-3 py-2 border rounded-sm text-sm text-center 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                 transition-all duration-200 focus:outline-none
                                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                                 ${isActive
                            ? 'border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-500/20 dark:ring-yellow-400/20 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent'
                        }`}
                    min="0"
                    max="999999.99"
                    step="0.01"
                    placeholder="0.00"
                />
            </div>
        );
    }

    return (
        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
            {formatCurrency(sellPrice)}
        </span>
    );
};

export default PriceControl;