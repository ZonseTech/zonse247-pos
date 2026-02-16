import React from 'react';
import { useField } from 'formik';
import classNames from 'classnames';

interface RadioOption {
    /**
     * The value of the radio option
     */
    value: string;
    /**
     * The label to display
     */
    label: string;
    /**
     * Whether this option is disabled
     */
    disabled?: boolean;
}

interface FormRadioGroupProps {
    /**
     * Field name for Formik
     */
    name: string;
    /**
     * Group label
     */
    label?: string;
    /**
     * Radio options
     */
    options: RadioOption[];
    /**
     * Whether the entire group is disabled
     */
    disabled?: boolean;
    /**
     * Additional class name for the wrapper
     */
    className?: string;
    /**
     * Layout direction
     */
    direction?: 'horizontal' | 'vertical';
    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
}

const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
    name,
    label,
    options,
    disabled = false,
    className,
    direction = 'horizontal',
    size = 'md',
}) => {
    const [field, , helpers] = useField(name);

    const sizeClasses = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const handleChange = (value: string) => {
        if (!disabled) {
            helpers.setValue(value);
        }
    };

    return (
        <div className={classNames('space-y-2', className)}>
            {label && (
                <label className={classNames(
                    'block text-sm font-medium text-gray-700 dark:text-gray-300',
                    disabled && 'opacity-50'
                )}>
                    {label}
                </label>
            )}
            <div className={classNames(
                'flex',
                direction === 'horizontal' ? 'flex-row flex-wrap gap-6' : 'flex-col gap-3'
            )}>
                {options.map((option) => {
                    const isDisabled = disabled || option.disabled;
                    const isChecked = field.value === option.value;
                    const optionId = `${name}-${option.value}`;

                    return (
                        <div key={option.value} className="flex items-center gap-2">
                            <input
                                type="radio"
                                id={optionId}
                                name={name}
                                value={option.value}
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() => handleChange(option.value)}
                                className={classNames(
                                    'text-sky-500 border-gray-300 dark:border-gray-600',
                                    'focus:ring-sky-500 focus:ring-2 focus:ring-offset-0',
                                    'dark:bg-gray-700 dark:checked:bg-sky-500',
                                    sizeClasses[size],
                                    isDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                            />
                            <label
                                htmlFor={optionId}
                                className={classNames(
                                    'text-sm text-gray-700 dark:text-gray-300 cursor-pointer',
                                    isDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {option.label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FormRadioGroup;
