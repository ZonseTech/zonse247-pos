import type { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import type { ButtonTheme } from '../Button';
import { Button } from '@radix-ui/themes';

const themeColors: Record<ButtonTheme, 'blue' | 'green' | 'red' | 'amber' | 'gray'> = {
    primary: 'blue',
    success: 'green',
    danger: 'red',
    warning: 'amber',
    neutral: 'gray',
};

interface FormActionsProps {
    isSubmitting: boolean;
    isLoading?: boolean;
    submitLabel: string;
    submitIcon?: ReactNode;
    cancelLabel?: string;
    onCancel?: () => void;
    submitTheme?: ButtonTheme;
    cancelTheme?: ButtonTheme;
    loadingLabel?: string;
    className?: string;
}

const FormActions: FunctionComponent<PropsWithChildren<FormActionsProps>> = ({
    isSubmitting,
    isLoading = false,
    submitLabel,
    submitIcon,
    cancelLabel = 'Cancel',
    onCancel,
    submitTheme = 'success',
    cancelTheme = 'danger',
    loadingLabel = 'Saving...',
    className = '',
    children
}) => {
    const loading = isSubmitting || isLoading;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 ${className}`}>
            <div className="space-y-3">
                <Button
                    type="submit"
                    color={themeColors[submitTheme]}
                    loading={loading}
                    disabled={loading}
                    className="w-full"
                >
                    {submitIcon}
                    <span>{loading ? loadingLabel : submitLabel}</span>
                </Button>

                {children}

                {onCancel && (
                    <Button
                        type="button"
                        variant="soft"
                        color={themeColors[cancelTheme]}
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        {cancelLabel}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FormActions;
