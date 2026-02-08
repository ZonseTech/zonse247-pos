import { FunctionComponent, ReactNode } from 'react';

export interface ToggleOption<T extends string> {
    value: T;
    label: string;
    icon?: ReactNode;
}

interface ToggleButtonGroupProps<T extends string> {
    options: ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

function ToggleButtonGroup<T extends string>({
    options,
    value,
    onChange,
    className = '',
}: ToggleButtonGroupProps<T>) {
    return (
        <div className={`flex ${className}`}>
            {options.map((option, index) => {
                const isFirst = index === 0;
                const isLast = index === options.length - 1;
                const isActive = value === option.value;

                let roundedClass = '';
                if (isFirst) roundedClass = 'rounded-l-sm';
                if (isLast) roundedClass = 'rounded-r-sm';
                if (options.length === 1) roundedClass = 'rounded-sm';

                const borderClass = isFirst ? 'border' : 'border border-l-0';

                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 ${roundedClass} font-medium transition-colors ${borderClass} ${isActive
                            ? 'bg-sky-500 text-white border-sky-500'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default ToggleButtonGroup;
