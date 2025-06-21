import React from 'react'
import { HiMinus, HiPlus } from 'react-icons/hi2';

const QuantityControl: React.FC<{
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onInputChange: (value: number) => void;
}> = ({ quantity, onIncrease, onDecrease, onInputChange }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            onInputChange(1);
            return;
        }

        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            onInputChange(numValue);
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (isNaN(value) || value < 1) {
            onInputChange(1);
        }
    };

    const isMinimum = quantity <= 1;

    return (
        <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm overflow-hidden">
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
                type="text"
                value={quantity}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-12 h-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 
                 bg-white dark:bg-gray-800 border-0 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-inset
                 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
            />

            <button
                onClick={onIncrease}
                className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-300 
                 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                 transition-all duration-200 border-l border-gray-200 dark:border-gray-600"
                title="Increase quantity"
            >
                <HiPlus className="h-3.5 w-3.5" />
            </button>
        </div>
    );
};

export default QuantityControl