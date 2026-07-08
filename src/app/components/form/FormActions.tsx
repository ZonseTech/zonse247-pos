import type { FunctionComponent, ReactNode } from 'react';
import { Button } from '../index';
import type { ButtonTheme } from '../Button';

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

const FormActions: FunctionComponent<FormActionsProps> = ({
    isSubmitting,
    isLoading = false,
    submitLabel,
    submitIcon,
    cancelLabel = 'Cancel',
    onCancel,
    submitTheme = 'success',
    cancelTheme = 'danger',
    loadingLabel = 'Saving...',
    className = ''
}) => {
    const loading = isSubmitting || isLoading;

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 ${className}`}>
            <div className="space-y-3">
                <Button
                    type="submit"
                    theme={submitTheme}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>{loadingLabel}</span>
                        </>
                    ) : (
                        <>
                            {submitIcon}
                            <span>{submitLabel}</span>
                        </>
                    )}
                </Button>
                {onCancel && (<Button
                    type="button"
                    theme={cancelTheme}
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full"
                >
                    {cancelLabel}
                </Button>)}
            </div>
        </div>
    );
};

export default FormActions;
