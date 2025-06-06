import React from 'react'
import { HiMinus, HiPlus } from 'react-icons/hi2';

const QuantityControl: React.FC<{
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onInputChange: (value: number) => void;
}> = ({ quantity, onIncrease, onDecrease, onInputChange }) => {
    return (
        <div className="flex items-center">
            <button
                onClick={onDecrease}
                className="px-3 py-2 bg-gray-200 border border-gray-200 rounded-l-md hover:bg-gray-300"
            >
                <HiMinus className="h-4 w-4" />
            </button>
            <input
                type="text"
                value={quantity}
                min={1}
                onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                        onInputChange(value);
                    }
                }}
                className="w-12 text-center py-1 border-y border-gray-200 focus:outline-none focus:ring-0 focus:border-transparent"
            />
            <button
                onClick={onIncrease}
                className="px-3 py-2 bg-gray-200 border border-gray-200 rounded-r-md hover:bg-gray-300"
            >
                <HiPlus className="h-4 w-4" />
            </button>
        </div>
    );
};

export default QuantityControl