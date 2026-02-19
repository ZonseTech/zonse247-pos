import type { FunctionComponent, ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionRowProps {
    icon: ReactNode;
    label: string;
    description?: string;
    onTap: () => void;
    noBorder?: boolean;
    active?: boolean;
    showChevron?: boolean;
}

const ActionRow: FunctionComponent<ActionRowProps> = ({
    icon,
    label,
    description,
    onTap,
    noBorder = false,
    active = false,
    showChevron = false,
}) => (
    <button
        onClick={onTap}
        className={`w-full flex items-center px-4 sm:px-5 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-50 dark:active:bg-gray-700 transition-colors ${!noBorder ? 'border-b border-gray-100 dark:border-gray-700' : ''
            } ${active ? 'bg-sky-50 dark:bg-sky-900/20' : ''}`}
    >
        <div className="flex-shrink-0 mr-3 sm:mr-4">{icon}</div>
        <div className="flex-1 text-left">
            <p className={`text-sm font-medium ${active ? 'text-sky-600 dark:text-sky-400' : 'text-gray-900 dark:text-white'}`}>
                {label}
            </p>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
            )}
        </div>
        {showChevron && <ChevronRight className="w-5 h-5 text-gray-400" />}
    </button>
);

export default ActionRow;
