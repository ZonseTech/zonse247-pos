import { FunctionComponent, ReactNode } from 'react';

interface TabOptionButtonProps {
    isSelected: boolean;
    onClick: () => void;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    layout?: 'vertical' | 'horizontal';
    rounded?: 'none' | 'left' | 'right' | 'full';
}

const TabOptionButton: FunctionComponent<TabOptionButtonProps> = ({
    isSelected,
    onClick,
    label,
    icon,
    disabled = false,
    size = 'md',
    layout = 'vertical',
    rounded = 'full',
}) => {
    const sizeClasses = {
        sm: 'py-2 px-3 text-xs',
        md: 'py-3 px-4 text-sm',
        lg: 'py-4 px-5 text-base',
    };

    const layoutClasses = layout === 'vertical'
        ? 'flex-col items-center gap-1.5'
        : 'flex-row items-center justify-center gap-2';

    const roundedClasses = {
        none: '',
        left: 'rounded-l-lg',
        right: 'rounded-r-lg',
        full: 'rounded-lg',
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                relative flex-1 flex ${layoutClasses} ${sizeClasses[size]}
                ${roundedClasses[rounded]} border
                transition-all duration-150 ease-in-out
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98]
                ${isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 z-10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
            `}
        >
            {icon && (
                <span className={`transition-colors ${isSelected ? 'text-sky-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {icon}
                </span>
            )}
            <span className={`font-medium transition-colors ${isSelected
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-gray-600 dark:text-gray-400'
                }`}>
                {label}
            </span>
        </button>
    );
};

export default TabOptionButton;
