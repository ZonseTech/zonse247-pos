import React, { useRef, useEffect } from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi2';
import { useFocusManager } from '../../../hooks/useFocusManager';

interface QuantityControlProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onInputChange: (value: number) => void;
    itemId: string;
    focusManager?: ReturnType<typeof useFocusManager>;
    maxStock?: number;
    isDefaultItem?: boolean;
}

const QuantityControl: React.FC<QuantityControlProps> = ({
    quantity,
    onIncrease,
    onDecrease,
    onInputChange,
    itemId,
    focusManager,
    maxStock,
    isDefaultItem = false
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
        <div className={`inline-flex items-center rounded-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 overflow-hidden ${isActive ? 'ring-1 ring-blue-500 dark:ring-blue-400' : ''
            } ${isAtMaxStock ? 'border-orange-400 dark:border-orange-500' : ''}`}>
            <button
                onClick={onDecrease}
                disabled={isMinimum}
                className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300
         bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-700
         focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
         transition-all duration-200 border-r border-gray-200 dark:border-gray-600"
                title="Decrease quantity"
            >
                <HiMinus className="h-3.5 w-3.5" />
            </button>

            <input
                ref={inputRef}
                type="text"
                value={quantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                className={`w-12 h-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100
         bg-white dark:bg-gray-800 border-0
         transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
         ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                min="0"
            />

            <button
                onClick={onIncrease}
                disabled={isAtMaxStock}
                className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300
         bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-700
         focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
         transition-all duration-200 border-l border-gray-200 dark:border-gray-600"
                title={isAtMaxStock ? `Maximum stock reached (${maxStock})` : "Increase quantity"}
            >
                <HiPlus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};

export default QuantityControl;