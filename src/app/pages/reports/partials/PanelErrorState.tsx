import type { FunctionComponent } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface PanelErrorStateProps {
    message?: string;
    onRetry: () => void;
    /** Fixed height so the panel doesn't jump when swapping between loading/error/content */
    height?: number;
}

const PanelErrorState: FunctionComponent<PanelErrorStateProps> = ({ message, onRetry, height = 180 }) => (
    <div
        style={{ height }}
        className="flex flex-col items-center justify-center gap-2 text-center px-4"
    >
        <AlertCircle className="w-6 h-6 text-rose-400 dark:text-rose-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400">{message || 'Failed to load this report.'}</p>
        <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
        >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
        </button>
    </div>
);

export default PanelErrorState;
