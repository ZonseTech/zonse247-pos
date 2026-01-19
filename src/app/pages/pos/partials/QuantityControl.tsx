import React, { useRef, useEffect } from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi2';
import { useFocusManager } from '../../../hooks/useFocusManager';
import classNames from 'classnames';

interface QuantityControlProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onInputChange: (value: number) => void;
    itemId: string;
    focusManager?: ReturnType<typeof useFocusManager>;
    maxStock?: number;
    isDefaultItem?: boolean;
    compact?: boolean;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    onInputChange,
    itemId,
    focusManager,
    maxStock,
    isDefaultItem = false,
    compact = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isActive = focusManager?.isActive('quantity', itemId) || false;

    useEffect(() => {
        if (isActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            onInputChange(0);
            return;
        }

        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0) {
            onInputChange(numValue);
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 0) {
            onInputChange(0);
        }

        if (focusManager) {
            focusManager.clearFocus();
        }
    };

    const handleInputFocus = () => {
        if (focusManager) {
            focusManager.setActiveComponent('quantity', itemId);
        }
    };

    const handleInputClick = () => {
        if (focusManager) {
            focusManager.setActiveComponent('quantity', itemId);
        }
    };

    const isMinimum = quantity <= 0;
    const isAtMaxStock = !isDefaultItem && maxStock !== undefined && quantity >= maxStock;

    return (
        <div className={classNames(
            "inline-flex items-center bg-gray-50 dark:bg-gray-800 overflow-hidden shadow-sm",
            compact ? "rounded-lg" : "rounded-xl",
            isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400 shadow-blue-500/20' : 'ring-1 ring-gray-200 dark:ring-gray-700',
            isAtMaxStock ? 'ring-2 ring-orange-400 dark:ring-orange-500 shadow-orange-500/20' : ''
        )}>
            <button
                onClick={onDecrease}
                disabled={isMinimum}
                className={classNames(
                    "flex items-center justify-center text-gray-600 dark:text-gray-300",
                    "bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:text-gray-600",
                    "focus:outline-none active:scale-95 transition-all duration-200",
                    compact ? "w-6 h-6" : "w-10 h-10"
                )}
                title="Decrease quantity"
            >
                <HiMinus className={compact ? "h-3 w-3" : "h-4 w-4"} />
            </button>

            <input
                ref={inputRef}
                type="text"
                value={quantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                className={classNames(
                    "text-center font-bold text-gray-900 dark:text-gray-100",
                    "bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700",
                    "focus:outline-none transition-all duration-200",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : '',
                    compact ? "w-10 h-6 text-xs" : "w-14 h-10 text-base"
                )}
                min="0"
            />

            <button
                onClick={onIncrease}
                disabled={isAtMaxStock}
                className={classNames(
                    "flex items-center justify-center text-gray-600 dark:text-gray-300",
                    "bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700 disabled:hover:text-gray-600",
                    "focus:outline-none active:scale-95 transition-all duration-200",
                    compact ? "w-6 h-6" : "w-10 h-10"
                )}
                title={isAtMaxStock ? `Maximum stock reached (${maxStock})` : "Increase quantity"}
            >
                <HiPlus className={compact ? "h-3 w-3" : "h-4 w-4"} />
            </button>
        </div>
    );
};

export default QuantityControl;