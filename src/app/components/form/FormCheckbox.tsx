import React from 'react';
import { useField } from 'formik';
import classNames from 'classnames';

interface FormCheckboxProps {
    /**
     * Field name for Formik
     */
    name: string;
    /**
     * Label text
     */
    label?: string;
    /**
     * Description text below the label
     */
    description?: string;
    /**
     * Whether the checkbox is disabled
     */
    disabled?: boolean;
    /**
     * Additional class name for the wrapper
     */
    className?: string;
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * Position of the checkbox relative to label
     */
    position?: 'left' | 'right';
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({
    name,
    label,
    description,
    disabled = false,
    className,
    size = 'md',
    position = 'left',
}) => {
    const [field] = useField({ name, type: 'checkbox' });

    const sizeClasses = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const checkbox = (
        <input
            type="checkbox"
            id={name}
            disabled={disabled}
            {...field}
            checked={field.value}
            className={classNames(
                'rounded-sm text-sky-500 border-gray-300 dark:border-gray-600',
                'focus:ring-sky-500 focus:ring-2 focus:ring-offset-0',
                'dark:bg-gray-700 dark:checked:bg-sky-500',
                sizeClasses[size],
                disabled && 'opacity-50 cursor-not-allowed'
            )}
        />
    );

    if (!label && !description) {
        return checkbox;
    }

    return (
        <div className={classNames('flex items-center gap-2', className)}>
            {position === 'left' && checkbox}
            {label && (
                <label
                    htmlFor={name}
                    className={classNames(
                        'text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                >
                    {label}
                </label>
            )}
            {description && (
                <p className={classNames(
                    'text-sm text-gray-500 dark:text-gray-400',
                    disabled && 'opacity-50'
                )}>
                    {description}
                </p>
            )}
            {position === 'right' && checkbox}
        </div>
    );
};

export default FormCheckbox;
