import type { FunctionComponent } from 'react';
import { HiCheck } from 'react-icons/hi';

type CalculateAsType = 'monthly' | 'daily' | 'hourly';

interface CalculateAsFieldsProps {
    value: string;
    onChange: (value: CalculateAsType) => void;
}

const options: CalculateAsType[] = ['monthly', 'daily', 'hourly'];

const CalculateAsFields: FunctionComponent<CalculateAsFieldsProps> = ({ value, onChange }) => {
    return (
        <div className="flex gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`relative flex-1 py-2 px-2 rounded-md text-left transition-all ${value === option
                        ? 'bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'
                        }`}
                >
                    {value === option && (
                        <HiCheck className="absolute top-1.5 right-1.5 w-4 h-4 text-sky-500" />
                    )}
                    <span className="block text-xs text-gray-500 dark:text-gray-400">calculate_as</span>
                    <span
                        className={`block text-sm font-medium ${value === option
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-gray-700 dark:text-gray-300'
                            }`}
                    >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default CalculateAsFields;
