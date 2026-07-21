import type { FunctionComponent } from 'react';
import { ChevronRight } from 'lucide-react';

export interface ViewAllButtonProps {
    onClick: () => void;
    label?: string;
}

const ViewAllButton: FunctionComponent<ViewAllButtonProps> = ({ onClick, label = 'View All' }) => (
    <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-0.5 text-xs font-medium text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors flex-shrink-0"
    >
        {label}
        <ChevronRight className="w-3.5 h-3.5" />
    </button>
);

export default ViewAllButton;
