import type { FunctionComponent } from 'react';
import { HiCheck } from 'react-icons/hi';

type CalculateAsType = 'monthly' | 'daily' | 'hourly';

interface CalculateAsOptionProps {
    value: string;
    selected: boolean;
    onChange: () => void;
}

const CalculateAsOption: FunctionComponent<CalculateAsOptionProps> = ({
    value,
    selected,
    onChange
}) => (
    <button
        type="button"
        onClick={onChange}
        className={`relative flex-1 py-3 px-4 rounded-lg text-center transition-all ${selected
                ? 'bg-sky-50 dark:bg-sky-900/30 border-2 border-sky-500 dark:border-sky-400'
                : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
            }`}
    >
        {selected && (
            <HiCheck className="absolute top-2 right-2 w-4 h-4 text-sky-500 dark:text-sky-400" />
        )}
        <span className={`text-sm font-medium ${selected ? 'text-sky-600 dark:text-sky-400' : 'text-gray-700 dark:text-gray-300'
            }`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
    </button>
);

interface CalculateAsSelectorProps {
    value: string;
    onChange: (value: CalculateAsType) => void;
    options?: CalculateAsType[];
    label?: string;
}

const CalculateAsSelector: FunctionComponent<CalculateAsSelectorProps> = ({
    value,
    onChange,
    options = ['monthly', 'daily', 'hourly'],
    label = 'Calculate Salary As'
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
        </label>
        <div className="flex gap-3">
            {options.map((option) => (
                <CalculateAsOption
                    key={option}
                    value={option}
                    selected={value === option}
                    onChange={() => onChange(option)}
                />
            ))}
        </div>
    </div>
);

export default CalculateAsSelector;
export { CalculateAsOption };
export type { CalculateAsType };
