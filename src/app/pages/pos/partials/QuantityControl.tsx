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

    const isMinimum = quantity <= 1;
    const isAtMaxStock = !isDefaultItem && maxStock !== undefined && quantity >= maxStock;

    return (
        <div className={classNames(
            "inline-flex items-center overflow-hidden border transition-colors",
            compact ? "rounded-md h-7" : "rounded-md h-8",
            isActive
                ? 'border-sky-500 dark:border-sky-400'
                : isAtMaxStock
                    ? 'border-orange-400 dark:border-orange-500'
                    : 'border-gray-300 dark:border-gray-600',
        )}>
            <button
                onClick={onDecrease}
                disabled={isMinimum}
                className={classNames(
                    "flex items-center justify-center",
                    "text-gray-500 dark:text-gray-400",
                    "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-800",
                    "focus:outline-none transition-colors",
                    compact ? "w-6 h-full" : "w-8 h-full"
                )}
                title="Decrease quantity"
            >
                <HiMinus className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
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
                    "text-center font-medium text-gray-900 dark:text-gray-100",
                    "bg-white dark:bg-gray-900 border-x border-gray-300 dark:border-gray-600",
                    "focus:outline-none transition-colors",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    compact ? "w-8 h-full text-xs" : "w-10 h-full text-sm"
                )}
                min="0"
            />

            <button
                onClick={onIncrease}
                disabled={isAtMaxStock}
                className={classNames(
                    "flex items-center justify-center",
                    "text-gray-500 dark:text-gray-400",
                    "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700",
                    "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-800",
                    "focus:outline-none transition-colors",
                    compact ? "w-6 h-full" : "w-8 h-full"
                )}
                title={isAtMaxStock ? `Maximum stock reached (${maxStock})` : "Increase quantity"}
            >
                <HiPlus className={compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"} />
            </button>
        </div>
    );
};

export default QuantityControl;