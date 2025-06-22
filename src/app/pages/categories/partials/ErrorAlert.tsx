import { FunctionComponent } from 'react';

interface ErrorAlertProps {
    error: string;
    onClose: () => void;
}

export const ErrorAlert: FunctionComponent<ErrorAlertProps> = ({ error, onClose }) => (
    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            <button
                onClick={onClose}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
            >
                ×
            </button>
        </div>
    </div>
);
