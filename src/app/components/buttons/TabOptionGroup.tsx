import { ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';

interface TabOptionGroupProps<T> {
    options: Array<{
        value: T;
        label: string;
        icon?: ReactNode;
    }>;
    /** Formik field name - if provided, integrates with Formik automatically */
    name?: string;
    /** Controlled value - use when not using Formik */
    value?: T;
    /** Optional onChange handler - if not provided with name, uses Formik's setFieldValue */
    onChange?: (value: T) => void;
    columns?: number;
    size?: 'sm' | 'md' | 'lg';
    layout?: 'vertical' | 'horizontal';
}

function TabOptionGroup<T extends string | number>({
    options,
    name,
    value: controlledValue,
    onChange,
    columns,
    size = 'md',
    layout = 'vertical',
}: TabOptionGroupProps<T>) {
    // Use Formik integration if name is provided
    const formikContext = useFormikContext();
    const hasFormik = !!name && !!formikContext;

    // Only call useField when we have a valid Formik context and name
    const fieldResult = hasFormik ? useField(name) : null;
    const field = fieldResult?.[0];
    const helpers = fieldResult?.[2];

    // Determine the current value
    const currentValue = hasFormik ? (field?.value as T) : controlledValue;

    // Handle value change
    const handleChange = (newValue: T) => {
        if (onChange) {
            onChange(newValue);
        } else if (hasFormik && helpers) {
            helpers.setValue(newValue);
        }
    };

    const sizeClasses = {
        sm: 'py-2 px-3 text-xs',
        md: 'py-3 px-4 text-sm',
        lg: 'py-4 px-5 text-base',
    };

    const layoutClasses = layout === 'vertical'
        ? 'flex-col items-center gap-1.5'
        : 'flex-row items-center justify-center gap-2';

    const containerClass = columns
        ? `grid grid-cols-${columns} gap-0`
        : 'flex gap-0';

    const getButtonRoundedClass = (index: number, total: number) => {
        if (columns) {
            // Grid layout - no rounded corners between buttons
            const isFirstRow = index < columns;
            const isLastRow = index >= total - columns;
            const isFirstCol = index % columns === 0;
            const isLastCol = (index + 1) % columns === 0;

            let rounded = '';
            if (isFirstRow && isFirstCol) rounded += ' rounded-tl-lg';
            if (isFirstRow && isLastCol) rounded += ' rounded-tr-lg';
            if (isLastRow && isFirstCol) rounded += ' rounded-bl-lg';
            if (isLastRow && isLastCol) rounded += ' rounded-br-lg';
            return rounded || '';
        }

        // Flex layout - first and last get rounded ends
        if (total === 1) return 'rounded-lg';
        if (index === 0) return 'rounded-l-lg';
        if (index === total - 1) return 'rounded-r-lg';
        return '';
    };

    const getBorderClass = (index: number, total: number, isSelected: boolean) => {
        const baseSelected = 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 z-10';
        const baseUnselected = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50';

        if (columns) {
            // Grid layout
            return isSelected ? `border ${baseSelected}` : `border ${baseUnselected}`;
        }

        // Flex layout - avoid double borders
        const borderStyle = index === 0 ? 'border' : 'border-y border-r';
        return isSelected ? `${borderStyle} ${baseSelected}` : `${borderStyle} ${baseUnselected}`;
    };

    return (
        <div className={`${containerClass} overflow-hidden`}>
            {options.map((option, index) => {
                const isSelected = currentValue === option.value;
                const roundedClass = getButtonRoundedClass(index, options.length);
                const borderClass = getBorderClass(index, options.length, isSelected);

                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => handleChange(option.value)}
                        className={`
                            relative flex-1 flex ${layoutClasses} ${sizeClasses[size]}
                            ${roundedClass} ${borderClass}
                            transition-all duration-150 ease-in-out
                            active:scale-[0.98]
                        `}
                    >
                        {option.icon && (
                            <span className={`transition-colors ${isSelected ? 'text-sky-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                {option.icon}
                            </span>
                        )}
                        <span className={`font-medium transition-colors ${isSelected
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}>
                            {option.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export default TabOptionGroup;
