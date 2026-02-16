import React from 'react';
import { useField } from 'formik';
import classNames from 'classnames';

interface FormSwitchProps {
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
     * Whether the switch is disabled
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
}

const FormSwitch: React.FC<FormSwitchProps> = ({
    name,
    label,
    description,
    disabled = false,
    className,
    size = 'md',
}) => {
    const [field, , helpers] = useField({ name, type: 'checkbox' });

    const handleToggle = () => {
        if (!disabled) {
            helpers.setValue(!field.value);
        }
    };

    const sizeClasses = {
        sm: {
            track: 'h-5 w-9',
            thumb: 'h-3 w-3',
            translate: 'translate-x-5',
        },
        md: {
            track: 'h-6 w-11',
            thumb: 'h-4 w-4',
            translate: 'translate-x-6',
        },
        lg: {
            track: 'h-7 w-14',
            thumb: 'h-5 w-5',
            translate: 'translate-x-8',
        },
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={classNames('flex items-center justify-between', className)}>
            {(label || description) && (
                <div className="flex-1 min-w-0 mr-4">
                    {label && (
                        <label
                            htmlFor={name}
                            className={classNames(
                                'text-sm font-medium text-gray-700 dark:text-gray-300',
                                disabled && 'opacity-50'
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
                </div>
            )}
            <button
                type="button"
                id={name}
                role="switch"
                aria-checked={field.value}
                disabled={disabled}
                onClick={handleToggle}
                className={classNames(
                    'relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
                    currentSize.track,
                    field.value
                        ? 'bg-sky-500'
                        : 'bg-gray-300 dark:bg-gray-600',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <span
                    className={classNames(
                        'inline-block transform rounded-full bg-white transition-transform',
                        currentSize.thumb,
                        field.value ? currentSize.translate : 'translate-x-1'
                    )}
                />
            </button>
        </div>
    );
};

export default FormSwitch;
