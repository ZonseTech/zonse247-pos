import type { FunctionComponent, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface SectionCardProps {
    title: string;
    icon: LucideIcon;
    iconColor: string;
    children: ReactNode;
    className?: string;
}

const SectionCard: FunctionComponent<SectionCardProps> = ({
    title,
    icon: Icon,
    iconColor,
    children,
    className = ''
}) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${iconColor}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    {title}
                </h3>
            </div>
        </div>
        <div className="p-5">
            {children}
        </div>
    </div>
);

export default SectionCard;
